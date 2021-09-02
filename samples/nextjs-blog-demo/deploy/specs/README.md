# Spec commands

## Spec Generation

```sh
fission spec init
fission env create --spec --name nodejs --image fission/node-env-12.16:1.31.1
fission package create --spec --deploy nextjs-source.zip --env nodejs --name nextjs-source
fission fn create --spec --name nextjs-func --pkgname nextjs-source --entrypoint "app"
fission route create --spec --name next-blog --method GET --method POST --prefix /nextapp --function nextjs-func --keepprefix
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
