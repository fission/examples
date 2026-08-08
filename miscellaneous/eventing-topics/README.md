# Statestore eventing — order events fan-out

RFC-0027 statestore-backed eventing.
A `messageQueueType: statestore` trigger reads a durable topic on the Fission statestore.
No external broker is present.
No Kafka, no NATS, no RabbitMQ.

The scenario is an order-events fan-out.
A producer function creates an order.
Two consumer functions subscribe to the same `orders` topic through separate `MessageQueueTrigger` objects.
One consumer updates inventory.
The other consumer sends a customer notification.
Each consumer owns its own durable cursor over the topic.
A failure in one consumer does not block the other.

| Feature | Where it shows up |
| --- | --- |
| `messageQueueType: statestore` MQ trigger, zero external broker | `orders-to-inventory`, `orders-to-notify` |
| A function publishing to a topic, via an async-invocation destination (`--async-on-success-topic`) | `create-order` |
| `fission topic publish` — manual event injection | Injecting the poison event |
| `fission topic peek` — inspect a topic's tail | Every step below |
| `ResponseTopic` | `orders-to-notify` publishes its confirmation to `notifications-sent` |
| `ErrorTopic` + poison isolation (RFC-0027 invariant E5) | `orders-to-inventory` publishes an exhausted event to `orders-errors` |
| Per-trigger durable cursor, independent fan-out | The inventory failure does not block the notification consumer |

## Prerequisites

Statestore eventing needs the statestore, async invocation, and (by default) the eventing consumer head:

```bash
helm upgrade --install fission fission-charts/fission-all --namespace fission \
  --set statestore.enabled=true \
  --set statestore.mode=embedded \
  --set asyncInvocation.enabled=true
```

- `statestore.enabled` turns on the durable store that backs every RFC-0027 topic.
- `asyncInvocation.enabled` is required for two separate reasons, not one: it lets `create-order` be invoked asynchronously (destinations only fire on async delivery), and it also wires the router's topic admin API — `fission topic publish` and `fission topic peek` return `501 Not Implemented` without it, even though the mqtrigger consumer side is unaffected.
- `eventing.enabled` defaults to `true` whenever `statestore.enabled` is `true`.
It deploys the `mqtrigger-statestore` head, the process that actually reads topics and delivers events to `orders-to-inventory` and `orders-to-notify`.
You do not need to set it explicitly.

A Node.js environment for the example functions:

```bash
fission environment create --name nodejs --image ghcr.io/fission/node-env-22
```

## Deploy

```bash
fission function create --name create-order --env nodejs --code functions/create-order.js \
  --async-on-success-topic orders

fission function create --name update-inventory --env nodejs --code functions/update-inventory.js
fission function create --name notify-customer --env nodejs --code functions/notify-customer.js

# --mqtkind fission is required. The CLI's --mqtkind default is "keda", and
# statestore is a classic-head ("fission" kind) provider — "keda" is rejected.
# --pollinginterval overrides the CLI's own 30s default with a snappier value
# for this demo (the provider's own idle-poll default is 1s).
fission mqtrigger create --name orders-to-inventory \
  --function update-inventory \
  --mqtype statestore --mqtkind fission \
  --topic orders --errortopic orders-errors \
  --maxretries 2 --pollinginterval 2

fission mqtrigger create --name orders-to-notify \
  --function notify-customer \
  --mqtype statestore --mqtkind fission \
  --topic orders --resptopic notifications-sent \
  --maxretries 2 --pollinginterval 2
```

Each `mqtrigger create` prints:

```
trigger 'orders-to-inventory' created
```

`fission mqtrigger create` returning does not mean the subscription loop is running yet.
The `mqtrigger-statestore` head still has to reconcile the new trigger.
A new subscription starts reading at the topic's current head, so an event published before the subscription is live is never delivered to it.
Confirm both subscriptions are up before publishing anything:

```bash
kubectl -n fission logs deploy/mqtrigger-statestore -f | grep "topic subscription started"
# ... msg="topic subscription started" ... stream=topic/default/orders ...   (once per trigger)
```

Wait for two lines, one per trigger, then move on.

## Run: publish through the pipeline

### 1. Invoke the producer asynchronously

A synchronous call to `create-order` returns the order and publishes nothing.
Only an asynchronous call fires the `--async-on-success-topic` destination:

```bash
fission fn test --name create-order --method POST \
  --body "$(cat events/order-placed.json)" --async
```

```
Accepted (202)
invocationId: inv-xxxxxxxx
```

The dispatcher delivers `create-order`, wraps its response in a result envelope, and publishes that envelope to the `orders` topic.
Give the two subscriptions a moment (up to `--pollinginterval`) to pick it up, then peek both destinations:

```bash
fission topic peek --topic orders --limit 5
fission topic peek --topic notifications-sent --limit 5
```

```
head: 1
SEQ  TYPE              AGE  PAYLOAD
1    application/json  3s   {"version":"1.0","requestContext":{...
```

The payload on `orders` is the full result envelope, not the raw order.
This is why `update-inventory.js` and `notify-customer.js` unwrap it: they base64-decode `responsePayload` to get the order JSON `create-order` returned.

### 2. Publish an event by hand

`fission topic publish` is a dev convenience: it appends directly to the topic, bypassing `create-order` entirely.
Use it to test the consumers without invoking the producer, or to backfill an event:

```bash
fission topic publish --topic orders \
  --data "$(cat events/order-placed.json)" --content-type application/json
```

```
published to topic "orders" in namespace "default" (statestore)
```

A directly published event is raw JSON, not a result envelope — `unwrapOrder()` in the consumer functions passes it through unchanged because it has no `requestContext`/`responseContext`.

### 3. Poison event, retries, and the error topic

`events/unknown-sku.json` references a SKU that is not in `update-inventory.js`'s catalog.
Publish it directly:

```bash
fission topic publish --topic orders \
  --data "$(cat events/unknown-sku.json)" --content-type application/json
```

`orders-to-notify` has no catalog to check.
It succeeds and publishes a confirmation to `notifications-sent`, same as any other event.

`orders-to-inventory` returns `500` on every attempt — there is no per-attempt state on the mqtrigger delivery path, so retrying cannot change the outcome.
The subscription retries up to `--maxretries` (3 attempts total, spaced a fixed ~500ms apart — not exponential, not configurable per trigger), then publishes the *original* event, unmodified, to `orders-errors` and advances its cursor.
This is poison isolation: one bad event cannot wedge the topic for other events or other consumers.

```bash
fission topic peek --topic orders-errors --limit 5
```

```
head: 1
SEQ  TYPE              AGE  PAYLOAD
1    application/json  2s   {"orderId":"ord-9999","customer":{"email":"ghost@example.com"}...
```

Compare that against `notifications-sent`, which now has one more entry than before — the poison order's confirmation went through even though inventory rejected it.

## Concepts you'll see here

- **`messageQueueType: statestore`** — an `MqtKind: fission` (classic-head) provider.
It needs no broker connection config: it reuses whatever statestore the cluster already has.
- **Success is any 2xx.**
  A `201` or `204` from a consumer counts as delivered, same as `200`.
- **`ErrorTopic` carries the original event**, byte-for-byte, with its original content type — not an error report, not a stack trace.
- **`ResponseTopic` carries the consumer's response body**, with the response's own `Content-Type` header.
- **At-least-once, no attempt header.**
  Unlike an async-invocation destination chain, a statestore mqtrigger delivery carries no attempt-number header.
Write consumers that are safe to run twice.
- **Independent cursors, shared stream.**
  `orders-to-inventory` and `orders-to-notify` each track their own position on the same `orders` stream.
One falling behind, or exhausting retries on a poison event, does not slow or block the other.
- **A background reaper trims each subscribed topic to its slowest consumer's cursor.**
  Two backstops can trim past a stalled consumer's cursor anyway: a 7-day age limit and a 100,000-event size limit, both fixed in this version.
A subscriber that hits either backstop sees a logged gap, not a hang.
`orders-errors` and `notifications-sent` have no `MessageQueueTrigger` subscribed to them in this example, so the reaper does not trim them at all — only topics with at least one registered subscriber are reaped.

## What to look at

- **`functions/create-order.js`** — the producer.
Nothing in it is topic-aware; the publish happens entirely through the function's `--async-on-success-topic` destination config.
- **`functions/update-inventory.js`** — the permanent-failure path: an unknown SKU fails identically on every attempt, so retries exist only to absorb *transient* failures, not this class of bug.
- **`functions/notify-customer.js`** — the `ResponseTopic` path, and proof that one trigger's failure is invisible to a sibling trigger on the same topic.
