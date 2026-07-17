# Fission Workflows

Durable, multi-step orchestration of Fission functions, declared as a `Workflow` custom resource.
A `Workflow` is a state machine: each state invokes a function (or routes, fans out, or waits), and the engine records every step in a durable event log — so a run survives controller restarts, retries transient failures with backoff, and routes business errors along the paths you declare.

These examples are real business processes, each highlighting a different part of the feature:

| Example | Business case | Features shown |
|---|---|---|
| [`order-pipeline/`](order-pipeline/) | E-commerce checkout orchestration | Task chaining, **Parallel** screening, **Choice** routing, **retry** with backoff, **catch** on typed errors, `resultPath` document merging |
| [`batch-enrichment/`](batch-enrichment/) | CRM lead scoring over a batch | **Map** fan-out over an array with `maxConcurrency`, ordered join feeding an aggregation step |
| [`payment-dunning/`](payment-dunning/) | Subscription payment recovery | Durable **Wait** timers, catch-driven business routing, run history |

## Prerequisites

- Fission installed with workflows enabled (they are off by default):

  ```bash
  helm upgrade fission fission-charts/fission-all --namespace fission \
    --set workflows.enabled=true \
    --set statestore.enabled=true --set statestore.mode=embedded
  ```

  The workflow engine keeps run state in the Fission statestore, so `statestore.enabled` is required.

- A `fission` CLI with the `workflow` command group (`fission workflow --help` works).

- A Node.js environment for the example functions (all examples share it):

  ```bash
  fission environment create --name nodejs --image ghcr.io/fission/node-env-22
  ```

## The 5-minute tour

```bash
cd order-pipeline

# Functions are plain Fission functions — nothing workflow-specific in them.
for fn in validate-order fraud-score inventory-check charge-card fulfil-order reject-order; do
  fission function create --name wf-$fn --env nodejs --code functions/$fn.js
done

# The workflow is one YAML document.
fission workflow create -f workflow.yaml

# Render the state machine as a Mermaid diagram (stdout), or draw it in a
# browser with --open (served locally — the graph never leaves your machine).
fission workflow graph --name order-pipeline
fission workflow graph --name order-pipeline --open

# Start a run and watch it.
fission workflow run --name order-pipeline --input @inputs/happy.json
fission workflow runs list --workflow order-pipeline
fission workflow runs describe --name <run-name>
fission workflow runs history --name <run-name>

# "Where did this run stop?" — the same diagram, with every state colored by
# what THIS run did: succeeded, active, failed, or never reached.
fission workflow runs graph --name <run-name> --open
```

## Concepts you'll see in the YAML

- **Task** — invoke a function; `retry` re-runs transient failures (5xx / network) with exponential backoff, `catch` routes typed business errors to another state. A catch route's `resultPath` merges the error object into the document (so the target keeps the business data); without it the error object *replaces* the document (Step Functions parity).
- **Typed errors** — a function signals a business error by returning non-2xx with `{"errorType": "PaymentDeclined", "cause": {...}}`; catch routes match on `errorType`. 4xx without a type is `Fission.PermanentError` (never retried), 5xx is `Fission.FunctionError` (retryable).
- **Choice** — data-driven routing on the run document, evaluated by the engine (no function call).
- **Parallel / Map** — fan out branches (fixed set / one per array element); the join is an ordered array of branch results.
- **Wait** — a durable timer; the run sleeps in the statestore, not in a pod.
- **`inputPath` / `resultPath` / `outputPath`** — JSONPath shaping of what a state sees and where its output lands, so the run document accumulates results instead of being overwritten.
- **`historyRetention`** — how many finished runs (and how old) to keep before the engine garbage-collects them.

## Idempotency

The engine guarantees each state executes **at most once per attempt**, and passes `X-Fission-Workflow-Run` + `X-Fission-Workflow-Attempt` headers on every invocation — use them as idempotency keys when a step calls an external system (see `charge-card.js`).
