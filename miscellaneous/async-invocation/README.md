# Asynchronous Invocation

A webhook processor that books orders in the background, with retries, a dead-letter queue, and result destinations.

A normal Fission invocation is synchronous.
The caller holds the connection open until the function returns.
An asynchronous invocation is different.
The router accepts the request, enqueues it on the statestore queue, and returns a durable invocation id right away.
A background dispatcher delivers the request later.
It retries a failing delivery with backoff, dead-letters the delivery if it cannot succeed, and can invoke another function with the result.

This example is one business process — a webhook that books an order — and it shows every part of the feature:

| Feature | Where shown |
|---|---|
| Async invocation through an HTTP trigger | `--invocation-mode async` on the trigger, so a third-party webhook sender gets async delivery without setting a header |
| Retries with a per-function attempt budget | `--async-retry-max-attempts` on a function whose first version has a bug |
| Dead-letter queue | The buggy delivery exhausts its retries and lands in the DLQ |
| Result destinations | `--async-on-success` / `--async-on-failure` invoke a logging function with the delivery result |
| DLQ inspection and redrive | `dlq list`, `dlq show`, fix the bug, `dlq redrive` |

## Prerequisites

Asynchronous invocation is off by default.
It needs the statestore for its durable queue:

```bash
helm upgrade --install fission fission-charts/fission-all \
  --namespace fission \
  --set statestore.enabled=true \
  --set statestore.mode=embedded \
  --set asyncInvocation.enabled=true
```

Embedded statestore mode is enough for this example.

A Node.js environment for the example functions:

```bash
fission environment create --name nodejs --image ghcr.io/fission/node-env-22
```

## The 10-minute tour

### 1. Create the destination functions

These are the functions the async dispatcher invokes with the result of a delivery — one for a success, one for a dead-letter.

```bash
fission function create --name order-booked --env nodejs --code functions/on-success.js
fission function create --name order-alert --env nodejs --code functions/on-failure.js
```

### 2. Create the webhook processor (buggy v1) and wire it for async delivery

`functions/process-order-webhook.js` books an order, but it has a bug: it assumes `amount` always arrives as a number.
A legacy sender in this scenario sends it as a quoted string, and the function throws.

```bash
fission function create --name process-order-webhook --env nodejs \
  --code functions/process-order-webhook.js \
  --async-retry-max-attempts 2 \
  --async-max-age 5m \
  --async-on-success order-booked \
  --async-on-failure order-alert
```

`--async-retry-max-attempts` caps out at 3 — the platform's shared queue enforces that ceiling on every function, so a request for more than 3 is rejected.

### 3. Create an HTTP trigger that forces async mode

A webhook sender from a third party cannot set the `X-Fission-Invoke-Mode: async` header, so the trigger sets it for them:

```bash
fission httptrigger create --name webhook --method POST --url /webhook \
  --function process-order-webhook --invocation-mode async
```

### 4. Send a well-formed webhook

```bash
curl -s -D - -o /dev/null -X POST http://$FISSION_ROUTER/webhook \
  -H "Content-Type: application/json" \
  -d @payloads/order-ok.json
```

```
HTTP/1.1 202 Accepted
X-Fission-Invocation-Id: asyncinv/1f9c2a7e4b3d4f0a9c8e6d5f7a8b9c0d
Content-Type: application/json
```

The router accepted the request and returned a durable invocation id.
It never waited for the function to run.
Check the function's own log, then the success destination's log:

```bash
fission function log --name process-order-webhook
# booked order ord-1001 for 4999 cents

fission function log --name order-booked
# order booked: invocation=asyncinv/1f9c2a7e4b3d4f0a9c8e6d5f7a8b9c0d attempts=1 response={"orderId":"ord-1001","cents":4999}
```

### 5. Send a webhook that triggers the bug

```bash
curl -s -D - -o /dev/null -X POST http://$FISSION_ROUTER/webhook \
  -H "Content-Type: application/json" \
  -d @payloads/order-bad-amount.json
```

The router still returns `202 Accepted` with an invocation id — acceptance and delivery are separate steps.
`order.amount` is a quoted string in this payload, so the function throws and returns a 500.
A 500 is a retryable failure, so the dispatcher retries it with backoff until the 2-attempt budget is spent, then dead-letters it:

```bash
fission function log --name order-alert
# ALERT: order booking dead-lettered: invocation=asyncinv/... condition=RetriesExhausted attempts=2 response=internal error booking order: order.amount.toFixed is not a function
```

### 6. Inspect the dead-letter queue

```bash
fission function dlq list
```

```
ID                                          NAMESPACE   FUNCTION                REASON              ATTEMPTS   DIED
asyncinv/7c3d9e1a2b4f5061829a3b4c5d6e7f80   default     process-order-webhook   retries exhausted   2          9s
```

```bash
fission function dlq show --id asyncinv/7c3d9e1a2b4f5061829a3b4c5d6e7f80
```

The full envelope includes the original request body, the response status and body from the last attempt, and the attempt count — everything needed to diagnose the failure without reproducing it by hand.

### 7. Fix the bug and redeploy

`functions/process-order-webhook-fixed.js` coerces `amount` with `Number()` instead of assuming it is already a number:

```bash
fission function update --name process-order-webhook \
  --code functions/process-order-webhook-fixed.js
```

### 8. Redrive the dead-lettered invocation

```bash
fission function dlq redrive --id asyncinv/7c3d9e1a2b4f5061829a3b4c5d6e7f80
```

```
redrove 1 dead-lettered invocation(s)
```

Redrive re-enqueues the **original** request — the same webhook body that failed before — for one more delivery attempt against the now-fixed function:

```bash
fission function log --name process-order-webhook
# booked order ord-1002 for 4999 cents

fission function log --name order-booked
# order booked: invocation=asyncinv/7c3d9e1a2b4f5061829a3b4c5d6e7f80 attempts=1 response={"orderId":"ord-1002","cents":4999}
```

The same payload that used to crash now books cleanly, because it goes through the fixed code, not the old one.

## Concepts you'll see

- **`--invocation-mode async`** on a trigger — every request through it is async, with no header from the caller.
  Direct callers that *can* set headers use `fission function test --name <fn> --async` instead.
- **Retry budget** — `--async-retry-max-attempts` bounds delivery attempts before a 5xx/timeout failure is dead-lettered.
  It is clamped to 3, the platform's shared queue ceiling.
- **Max age** — `--async-max-age` bounds how long an invocation may wait for a successful delivery, independent of the attempt count.
- **4xx is never retried** — a function that rejects a payload with a 4xx (as the fixed version does for a missing `orderId`) is dead-lettered immediately, with reason `http_4xx`, instead of burning the retry budget on something a retry can never fix.
- **Destinations** — `--async-on-success` / `--async-on-failure` invoke another function with a result envelope (invocation id, condition, attempt count, request and response payloads) after a delivery settles.
  `--async-on-success-topic` / `--async-on-failure-topic` publish that same envelope to a topic instead, for more than one subscriber.
- **DLQ redrive** — resets the attempt count and re-enqueues the original request; it does not change the function's code, so a redrive only succeeds once the underlying bug is fixed.
- **`dlq redrive --all`** re-enqueues every dead-lettered invocation, and **`dlq purge`** discards them all — both take a `--queue` flag to target a broker egress DLQ instead of the async invocation queue, and `dlq purge` does not take `--all` (it always purges the whole queue).
