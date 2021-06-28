# Spec commands

## Spec Generation

```sh
fission spec init
fission env create --name=nodejs --image=fission/node-env:latest --spec
fission fn create --name=broadcast --env=nodejs --rpp=5 --deploy=broadcast.js --spec
fission httptrigger create --name=broadcast --url=/broadcast --function=broadcast --spec

fission env create --name=python --image=fission/python-env:latest --spec
fission package create --name=web-pkg --env=python --deploy="web/*" --spec
fission fn create --name=web --env=python --pkg=web-pkg --entrypoint=app.main --spec
fission httptrigger create --name=web --url='/chat/{html:[a-zA-Z0-9\.\/]+}' --function=web --spec
```

## Spec Apply

```sh
fission spec apply
```

## Spec Destroy

```sh
fission spec destroy
```
