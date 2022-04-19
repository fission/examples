This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Building docker image

```sh
docker build -t next-app:dev .
```

Load image in kind,

```sh
kind load docker-image next-app:dev
```

OR push image to registry,

```sh
docker push <repository>/next-app:dev
```

## Fission specs

### Creating specs

```sh
fission spec init
fission fn run-container --name=nextapp --port=3000 --image next-app:dev --spec
fission route create --name nextapp --function nextapp --prefix /nextapp --spec --keepprefix
```

Note:

1. If you are using docker repository, you need to change image accordingly.
2. Above `route create` command uses `keepprefix` introduced in Fission 1.14 release. It ensures the router forwards request to the function without trimming prefix.

### Applying specs

```sh
fission spec apply
```

### Cleaning specs

```sh
fission spec destroy
```

### Without Fission specs

```sh
fission fn run-container --name=nextapp --port=3000 --image next-app:dev
fission route create --name nextapp --function nextapp --prefix /nextapp --keepprefix
```

## Calling function

Visit app URL, `http://<router_url>/nextapp/`

## Testing with Fission CLI

```sh
fission fn test --name nextapp --subpath /nextapp
fission fn test --name nextapp --subpath /nextapp/about
fission fn test --name nextapp --subpath /nextapp/post/first
```
