# .NET 8 examples on Fission

Functions for the Fission .NET 8 environment.
A function is a class with a `public object Execute(FissionContext context)` method; the entrypoint is the fully-qualified `Namespace.Class` (e.g. `MyFunction` or `MultiFileExample.MyFunction`).

- `HelloWorld/` — minimal function returning a string.
- `HttpTriggerExample/` — reads the HTTP method and URL from the request context.
- `AsyncFunctionExample/` — runs asynchronous work and returns the result.
- `MultiFileExample/` — a multi-file project with controllers, services, and models (see its own README).

## Deploy

Create the .NET 8 environment with its builder:

```bash
fission env create --name dotnet8 \
  --image ghcr.io/fission/dotnet8-env \
  --builder ghcr.io/fission/dotnet8-builder \
  --poolsize 1
```

Build and deploy a single example (HelloWorld shown):

```bash
fission package create --name hello-pkg --env dotnet8 \
  --src "dotnet8/HelloWorld/*" --buildcmd "/usr/local/bin/build"
fission fn create --name hello-dotnet --env dotnet8 \
  --pkg hello-pkg --entrypoint "MyFunction"
fission fn test --name hello-dotnet
```

For the multi-file project, see [`MultiFileExample/README.md`](MultiFileExample/README.md).
