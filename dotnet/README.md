## .NET Examples

This is the repository for all .NET sample codes for Fission.

## Getting Started

Create a Fission .NET environment with the default .NET runtime image (this does not include the build environment):

```
fission env create --name dotnet --image fission/dotnet-env
```

Use the `hello.cs` to create a Fission Python function:

```
fission function create --name hello-dotnet --env dotnet --code hello.cs 
```

Test the function:
```
fission function test --name hello-dotnet
```

To setup a .NET environment on Fission and to learn more about it, check out [.NET Environment in Fission](https://github.com/fission/environments/tree/master/dotnet).

Find all .NET related code here. Currently, we have the following examples:

- Hello World
- Accessing Request Body Parameters
- Accessing Request Headers
- Accessing Context Arguments
  
If you have developed a .NET code that isn't present here, please feel free submit your code to us.

> You can also find many examples in our Miscellaneous directory.