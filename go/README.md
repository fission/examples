## Go Examples

This is the repository for all Go sample codes for Fission.

## Getting Started

Create a Fission Go environment with the default Go runtime image (this does not include the build environment):

```
fission environment create --name go --image fission/go-env-1.16 --builder fission/go-builder-1.16
```

Use the `hello.go` to create a Fission Go function:

```
fission fn create --name helloworld --env go --src hello.go --entrypoint Handler
```

Test the function:
```
fission fn test --name helloworld
```

To setup a Fo environment on Fission and to learn more about it, check out [Go Environment in Fission](https://github.com/fission/environments/tree/master/go)

Find all Go related code here. Currently, we have the following examples:

- Hello World
  
If you have developed a Go code that isn't present here, please feel free submit your code to us.

> You can also find many examples using Go in our Miscellaneous directory.
