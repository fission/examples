# Hello World in JVM/Kotlin on Fission

The `io.fission.HelloWorld` class is a very simple fission function that implements `io.fission.Function` and says "Hello, World!".

## Building locally and deploying with Fission

You can build the jar file in one of the two ways below based on your setup:

- You can use docker without the need to install JDK and Maven to build the jar file from source code:

```shell script
$ bash ./build.sh

```
- If you have JDK and Maven installed, you can directly (and much faster) build the JAR file using command:

```shell script
$ mvn clean package
```

Both of above steps will generate a target subdirectory which has the archive `target/hello-world-1.0-SNAPSHOT-jar-with-dependencies.jar` which will be used for creating function.

- The archive created above will be used as a deploy package when creating the function.

**Note:** The archive contains a Java 9 file, and the Fission environment currently only supports Java 8. To fix this,
run the following command every time after building the archive:

```shell script
$ zip -d target/hello-world-1.0-SNAPSHOT-jar-with-dependencies.jar 'META-INF/versions/*'
```

```shell script
$ fission env create --name jvm --image fission/jvm-env --version 2 --keeparchive=true
$ fission fn create --name hello --deploy target/hello-world-1.0-SNAPSHOT-jar-with-dependencies.jar --env jvm --entrypoint io.fission.HelloWorld
$ fission route create --function hello --url /hellop --method GET
$ fission fn test --name hello
Hello World! Greetings from function 'hello' delivered by Kotlin!
```

If you use Minikube for this, alternatively run the function using

```shell script
$ export FISSION=$(minikube ip):$(kubectl -n fission get svc router -o jsonpath='{...nodePort}')
$ curl http://$FISSION/hellop
Hello, World! Greetings from function 'hello' delivered by Kotlin!
```
