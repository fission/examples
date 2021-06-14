# Spec commands

## Spec Generation

```sh
fission spec init
fission env create --spec --name nodejs --image nodejs-nextjs-env --builder nodejs-nextjs-builder
fission package create --spec --src nextjs-source.zip --env nodejs --name nextjs-source
fission fn create --spec --name nextjs-func --pkgname nextjs-source --entrypoint "app"
# fission route create --spec --method GET,POST,PUT,DELETE --url "/nextapp/*" --function nextjs-func
fission route create --spec --method GET --method POST --prefix "/nextapp/" --function nextjs-func
```

## Spec Apply

```sh
fission spec apply
```

## Spec Destroy

```sh
fission spec destroy
```
