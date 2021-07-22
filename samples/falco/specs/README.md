## Specs

```sh
fission env create --name go --image fission/go-env-1.14 --builder fission/go-builder-1.14 --spec
fission fn create --name falco-pod-delete --env go --src "falco-pod-delete/*" --entrypoint Handler --spec
fission route create --name falco-pod-delete --url "/falco-pod-delete"  --function falco-pod-delete --spec
```

## Adding podspec to environment

- Edit the `env-go.yaml`
- Add the following `podspec` under `runtime`:

```sh
    podspec:
      serviceAccountName: falco-pod-delete
      containers:
      - name: go
```

Note: Please ensure that you have created the `falco-pod-delete` service account defined in [sa-falco-pod-delete.yaml](../sa-falco-pod-delete.yaml).
