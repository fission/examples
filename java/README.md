## Java Examples

This is the repository for all Java sample codes for Fission.

## Getting Started

Create a Fission Java environment with the default JVM runtime image (this does not include the build environment):


```bash
fission environment create --name java --image ghcr.io/fission/jvm-env --builder ghcr.io/fission/jvm-builder
```

Create a package

```bash
fission package create --env java --src java-src-pkg.zip
```

Use the `HelloWorld.java` to create a Fission Java function:

```bash
fission fn create --name javatest --pkg  java-src-pkg-zip-dqo5 --env java --entrypoint io.fission.HelloWorld
```

Test the function

```bash
fission fn test --name javatest
```

To setup a Java environment on Fission and to learn more about it, check out [Java Environment in Fission](https://github.com/fission/environments/tree/master/jvm)

Fission also ships a JAX-RS variant of the JVM environment, [`jvm-jersey`](https://github.com/fission/environments/tree/master/jvm-jersey).
The `hello-world` example here works on both; the only difference is the environment image you create (`ghcr.io/fission/jvm-jersey-env` instead of `ghcr.io/fission/jvm-env`).

Find all Java related code here. Currently, we have the following examples:

- Hello World
  
If you have developed a Java code that isn't present here, please feel free submit your code to us.

> You can also find many examples using Java in our Miscellaneous directory.
