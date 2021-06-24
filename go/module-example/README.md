# Go module usage

1. Initialize your project

```bash
$ go mod init "<module>"
```

For example,

```bash
$ go mod init "github.com/fission/fission/examples/go/go-module-example"
```

2. Add dependencies

 * See [here](https://github.com/golang/go/wiki/Modules#daily-workflow)

3. Verify

```bash
$ go mod verify
```

4. Create a Go Env with builder

```
fission env create --name go --image fission/go-env-1.14 --builder fission/go-builder-1.14 --poolsize 1 --version 3
```

Create function with all source files

```
fission fn create --name gomod --env go --entrypoint Handler --src go.mod --src go.sum --src main.go
```

```
$ fission fn test --name gomod
Vendor Example Test
```