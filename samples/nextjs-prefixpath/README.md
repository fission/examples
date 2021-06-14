
# NextJs app on Fission

This sample demos a Fission function handling multiple URLs with prefix path mentioned in route.
We also handle multiple HTTP verbs from same route in this example.
Please check `deploy/spec` directory for the Fission specs.

## Deploy

- Fission builder
- Fission environment
- Build NodeJS app and create Fission package
- Fission function and HTTP route

Note: build.sh assumes you are using `kind` cluster.

```bash
./deploy/build.sh
```

## Use

Using fission CLI,

```bash
fission function test --name nextjs-func
fission function test --name nextjs-func --subpath '/api/hello'
fission function test --name nextjs-func --subpath '/api/hello' --method POST
```

Using curl,

```bash
kubectl port-forward svc/router 8888:80 -nfission
curl localhost:8888/nextapp/
curl localhost:8888/nextapp/api/hello
```

## Cleanup

```bash
./deploy/destroy.sh
```
