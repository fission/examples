# Rust function examples

## hello.rs — single-file mode

A function is one `.rs` file with a `pub async fn handler` using any axum handler signature.

```sh
fission env create --name rust --image ghcr.io/fission/rust-env --builder ghcr.io/fission/rust-builder
fission package create --name hello --src hello.rs --env rust
fission fn create --name hello --env rust --pkg hello
fission fn test --name hello
```

## project-example — Cargo project mode

A full Cargo binary crate; the binary serves HTTP on `127.0.0.1:$FISSION_RUNTIME_PORT`.
This example uses plain axum to echo the request body as JSON, demonstrating that any framework satisfying the port contract works.

```sh
cd project-example && zip -r /tmp/project.zip Cargo.toml src
fission package create --name echo --src /tmp/project.zip --env rust
fission fn create --name echo --env rust --pkg echo
fission route create --name echo --function echo --url /echo --method POST
curl -X POST "http://$FISSION_ROUTER/echo" -d '{"lang":"rust"}'
```
