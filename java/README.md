## Java Examples

This is the repository for all Java sample codes for Fission.

## Getting Started

Create a Fission Java environment with the default JVM runtime image (this does not include the build environment):

```bash
fission environment create --name java --image fission/jvm-env --builder fission/jvm-builder
```

Create a package

```bash
fission package create --env java --src java-src-pkg.zip
```

Use the `HelloWorld.java` to create a Fission Python function:

```bash
fission fn create --name javatest --pkg  java-src-pkg-zip-dqo5 --env java --entrypoint io.fission.HelloWorld
```

Test the function

```bash
fission fn test --name javatest
```

To setup a Java environment on Fission and to learn more about it, check out [Java Environment in Fission](https://github.com/fission/environments/tree/master/jvm)

Find all Java related code here. Currently, we have the following examples:

- Hello World
  
If you have developed a Java code that isn't present here, please feel free submit your code to us.

> You can also find many examples using Java in our Miscellaneous directory.
