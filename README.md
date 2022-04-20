# Fission Examples & Samples

A place for examples of Fission functions from community and Fission team. These are sample codes and application that will help you understand Fission better. You can use these as stepping stone to build your real world use cases on Fission.

Currently, the examples in this repo are categorised based on the languages as mentioned below:

- [.NET](https://github.com/fission/examples/tree/main/dotnet)
- [Go](https://github.com/fission/examples/tree/main/go)
- [Java](https://github.com/fission/examples/tree/main/java)
- [NodeJS](https://github.com/fission/examples/tree/main/nodejs)
- [Perl](https://github.com/fission/examples/tree/main/perl)
- [Python](https://github.com/fission/examples/tree/main/python)
- [PHP](https://github.com/fission/examples/tree/main/php7)
- [Ruby](https://github.com/fission/examples/tree/main/ruby)
- [Miscellaneous](https://github.com/fission/examples/tree/main/miscellaneous)

There are other examples with respect to different use cases that are present under the `Miscellaneous` folder. You can find examples related to message triggers, specifications, using Fission for testing and much more.

## Getting Started

The easiest way to getting started with Fission is shown below. This one is using Python, however, you can refer to the examples present for other langugages as well.

Create a Fission Python environment with the default Python runtime image (this does not include the build environment):

```
fission environment create --name python --image fission/python-env
```

Use the `hello.py` to create a Fission Python function:
```
fission function create --name hello-py --env python --code hello.py 
```

Test the function:
```
fission function test --name hello-py
```

For a full guide see the official documentation on [Python with Fission](https://fission.io/docs/usage/languages/python/).

## Documentation

If you are new to Fission and want to know how it works, features and everything else, refer to the [Fission Documents](https://fission.io/docs/)

## Fission Blog

We are always working on getting new examples and use cases using Fission for you. For the latest updates on what's goind on with Fission, check out our [Fission Blog](https://fission.io/blog/).
