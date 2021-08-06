# Spec commands

## Spec Generation

```sh
fission spec init
fission env create --spec --name nodejs --image fission/node-env:1.31.1
fission package create --spec --deploy nextjs-source.zip --env nodejs --name nextjs-source
fission fn create --spec --name nextjs-func --pkgname nextjs-source --entrypoint "app"
fission route create --spec --method GET --method POST --prefix "/nextapp/" --function nextjs-func --keeprefix
```

Note: You need to change buildStatus to succeded in the package spec file.

## Spec Apply

```sh
fission spec apply
```

## Spec Destroy

```sh
fission spec destroy
```