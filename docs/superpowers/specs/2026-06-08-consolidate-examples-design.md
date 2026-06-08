# Consolidate Fission examples into `fission/examples`

Date: 2026-06-08
Status: Approved (pending spec review)

## Problem

Runnable Fission examples are duplicated across repositories.
The `fission/examples` repo holds the curated, user-facing catalog (rendered at `fission.io/examples`).
The `fission/environments` repo independently keeps an `examples/` directory inside every environment, which serves double duty as runtime documentation and as CI test fixtures.
These two sets overlap and have drifted: the environments copies are newer for several runtimes (ESM Node.js, .NET 8, Python FastAPI), and Rust exists only in environments.
The `fission/fission` repo was checked and contains no user examples, so it is out of scope.

## Goals

- Make `fission/examples` the single canonical home for runnable examples.
- Add the missing runtimes: Rust, Python FastAPI, .NET 8.
- Improve the existing set: modernize commands/images, give every example a consistent README, fill coverage gaps, fix catalog metadata bugs.
- Remove the duplicated `examples/` directories from `fission/environments` without breaking its CI.
- Refresh the `fission.io` catalog so the new content appears.

## Non-goals

- No changes to environment runtime/builder images themselves.
- No restructuring of the curated `miscellaneous/` apps that exist only in this repo.

## Precedence model

Examples fall into two classes:

- **Overlapping basics** (hello, requestdata/statuscode, multifile, guestbook, weather, etc.) exist in both repos.
  The environments version is canonical and wins on conflict.
  Recon: the Python basics are byte-identical, so they need no change; several Node.js files (`hello.js`, `weather.js`, `multi-entry.js`) differ and get refreshed from environments.
- **Curated/unique examples** (this repo's `miscellaneous/*` tree and the richer Python apps such as votingapp, TwitterBot, urlshortener, SinglevsMonolith) exist only here and are left untouched.

"Environments wins" therefore only refreshes basic per-language samples; it never deletes the curated apps.

## Directory mapping (environments → this repo)

| environments source | destination in this repo | notes |
|---|---|---|
| `rust/examples` | `rust/` | new: `hello.rs` single-file + `project-example` Cargo crate |
| `python-fastapi/examples` | `python-fastapi/` | new runtime |
| `dotnet8/examples` | `dotnet8/` | new top-level dir; legacy `dotnet/` kept as-is |
| `nodejs/examples` | `nodejs/` | adds ESM variants, `echo.js`, `broadcast.js`; refreshes drifted files |
| `python/examples` | `python/` | identical basics; no-op for those files |
| `go/examples` | `go/` | maps to `hello-world` + `module-example` |
| `perl/examples` | `perl/` | |
| `php7/examples` | `php7/` | |
| `ruby/examples` | `ruby/` | |
| `jvm/examples/java` + `jvm-jersey/examples/java` | `java/` | consolidate near-identical Java hello-worlds to one; note the Jersey variant in the README |
| `binary/examples` | `miscellaneous/binary` | stays in the Misc catalog group |
| `tensorflow-serving/examples` | `miscellaneous/tensorflow-serving` | stays in the Misc catalog group |

## Phases

The work is decomposed into three phases, executed in this order so no content is lost before the source of truth moves.

### Phase A — `fission/examples` (make canonical + improve)

1. Add new runtimes: `rust/`, `python-fastapi/`, `dotnet8/`.
2. Refresh overlapping basics from environments where they differ (per precedence model).
3. Fill coverage gaps (ESM Node variants, `.NET 8` async/multifile, binary `echo`/`headers`, etc.).
4. Give every example directory a consistent README with deploy + test steps.
5. Modernize commands to `ghcr.io/fission/*` images and current `fission` CLI syntax.
6. Fix `examples.json` metadata bugs: wrong `language` fields, the TensorFlow card, the "Kakfa" typo; add entries for the new runtimes.

End state: this repo is canonical and complete.

### Phase B — `fission.io` (catalog)

1. Add Rust and FastAPI groups (logos + group tags) to the `GROUPS` list in `tools/examples.py`.
   `rust-logo.svg` exists in environments (`rust/logo/rust-logo.svg`); copy it to `static/images/lang-logo/` if not already present.
2. Rerun `python3 tools/examples.py <examples-checkout>` and commit the regenerated `static/data/examples.json`.

### Phase C — `fission/environments` (remove duplication, keep CI green)

1. For each test script that references `examples/...`, vendor a minimal self-contained fixture under that environment's test dir (e.g. `python/tests/fixtures/hello.py`) and repoint the script.
   Affected scripts (8): `binary/test/local_test.sh`, `jvm/tests/test_java_env.sh`, `python/tests/{local_test,test_python_env,websocket_test}.sh`, `python-fastapi/tests/{local_test,test_python_fastapi_env}.sh`, `rust/test/local_test.sh`, `tensorflow-serving/tests/test_tensorflow_serving_env.sh`.
   The Rust fixture is heavier: its test builds `examples/project-example`, so the fixture must be a buildable crate under the test dir.
2. After fixtures are in place and verified, delete the `examples/` directory from each environment.
3. Update any environment README that links to its local `examples/` to point at the canonical location in `fission/examples`.

## Verification

- This repo: `examples.json` files parse; new runtimes have working deploy commands; spot-check a sample of READMEs.
- fission.io: regenerated `static/data/examples.json` validates and contains Rust + FastAPI groups; `hugo` build of the examples page succeeds.
- environments: run (or dry-run) each rewired `tests/*.sh` / `test/*.sh` to confirm fixtures resolve and no path still points at a deleted `examples/`.

## Risks

- Cross-repo blast radius (three repos changed together).
  Mitigated by phase ordering: content is canonical in this repo before it is removed from environments.
- Env CI breakage if a fixture is missed.
  Mitigated by grepping for residual `examples/` references after the move and running the test scripts.
- Rust crate fixture duplication (the project crate lives both here and as an env test fixture).
  Accepted: the env fixture is a minimal build target, the canonical copy lives here.
