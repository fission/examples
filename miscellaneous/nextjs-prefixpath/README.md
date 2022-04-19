
# NextJs app on Fission

This sample demos a Fission function handling multiple URLs with prefix path mentioned in route.
We also handle multiple HTTP verbs from same route in this example.
Please check `deploy/spec` directory for the Fission specs.

For Specs related commands, please refer [this doc](deploy/specs/README.md)

This examples uses [entrypoint](app.js) which loads NextJs app as Fission function with routing capabilities.

## Deploy

- Fission builder
- Fission environment
- Build NodeJS app and create Fission package
- Fission function and HTTP route

Note:

- build.sh assumes you are using `kind` cluster. Please make necessary changes according to Kubernetes cluster type.
- This example uses modified NodeJS environment and builder. These would be available in Fission default NodeJS environment soon.

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
