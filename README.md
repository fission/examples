# Fission Examples & Samples

A place for examples of Fission functions from the community and the Fission team.
These are sample codes and applications that will help you understand Fission better.
Use them as a stepping stone to build your real-world use cases on Fission.

You can also browse these examples in the searchable catalog at [fission.io/examples](https://fission.io/examples).

The examples in this repo are categorised by language as listed below.
Each directory has its own `README.md` with the exact `fission` commands to deploy and test that example.

- [.NET](https://github.com/fission/examples/tree/main/dotnet)
- [.NET 8](https://github.com/fission/examples/tree/main/dotnet8)
- [Go](https://github.com/fission/examples/tree/main/go)
- [Java](https://github.com/fission/examples/tree/main/java)
- [NodeJS](https://github.com/fission/examples/tree/main/nodejs)
- [Perl](https://github.com/fission/examples/tree/main/perl)
- [Python](https://github.com/fission/examples/tree/main/python)
- [Python (FastAPI)](https://github.com/fission/examples/tree/main/python-fastapi)
- [PHP](https://github.com/fission/examples/tree/main/php7)
- [Ruby](https://github.com/fission/examples/tree/main/ruby)
- [Rust](https://github.com/fission/examples/tree/main/rust)
- [Miscellaneous](https://github.com/fission/examples/tree/main/miscellaneous)

The `Miscellaneous` folder holds examples for different use cases such as message-queue triggers, specs, container functions, observability, websockets, long-running functions, and more.

## Getting Started

The easiest way to get started with Fission is shown below.
This uses Python; you can refer to the examples for other languages as well.

Create a Fission Python environment with the default Python runtime image (this does not include the build environment):

```
fission environment create --name python --image ghcr.io/fission/python-env
```

Use `python/hello.py` to create a Fission Python function:

```
fission function create --name hello-py --env python --code python/hello.py
```

Test the function:

```
fission function test --name hello-py
```

For a full guide see the official documentation on [Python with Fission](https://fission.io/docs/usage/languages/python/).

## Contributing an example

Add your function under the relevant language directory with a short `README.md` showing how to deploy and test it.
To make it appear in the [catalog](https://fission.io/examples), add an entry to that directory's `examples.json` (fields: `name`, `description`, `path`, `tag`, `language`).
The catalog page is generated from these files in the [fission.io](https://github.com/fission/fission.io) repo, so no UI changes are needed here.

## Documentation

If you are new to Fission and want to know how it works, its features, and everything else, refer to the [Fission documentation](https://fission.io/docs/).

## Fission Blog

We are always working on new examples and use cases for Fission.
For the latest updates on what's going on with Fission, check out the [Fission Blog](https://fission.io/blog/).
