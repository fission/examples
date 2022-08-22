# Message Queue Trigger Demonstration - NATS Jetstream

## Create Nats Jetstream server
```
kubectl apply -f jetstream-server.yaml
```
## Create Consumer

```bash
$ cd consumer/
$ docker build . -t consumer:latest
$ kind load docker-image consumer:latest --name kind
$ kubectl apply -f deployment.yaml

```
## Create Producer

```bash
$ cd mqtrigger/
$ docker build . -t producer:latest
$ kubectl apply -f deployment.yaml

```
## Create Fission env and function
```
fission environment create --name go --image fission/go-env-1.16 --builder fission/go-builder-1.16
fission fn create --name helloworld --env go --src hello.go --entrypoint Handler
```

## Create Fission trigger

```bash
$ fission mqt create --name jetstreamtest --function helloworld --mqtype nats-jetstream --mqtkind keda --topic input.created --resptopic output.response-topic --errortopic output.error-topic --maxretries 3 --metadata stream=input --metadata fissionConsumer= fission_consumer --metadata natsServerMonitoringEndpoint=nats-jetstream.default.svc.cluster.local:8222  --metadata natsServer=nats://nats-jetstream.default.svc.cluster.local:4222

```
## Update replicas for producer
Increase the replicas in producer/publisher to one. This will create a producer pod and publishes some messgaes to stream. 

``` kubectl scale deploy jetstream-pub --replicas=1 ```

## check logs
To verify the status of trigger, we can- 
- check the logs in consumer pod. Which shows output similar to- 
```
$ kubectl  logs -f deploy/jetstream-consumer

All messages consumed
Hello Test1
Hello Test2
Hello Test3
```

- check for logs in the fission helloworld function's pod

```
$ kubectl  logs -f deploy/jetstreamtest
{"level":"info","ts":1661165707.5253487,"caller":"app/main.go:92","msg":"Done processing message","messsage":"Hello Test1"}
{"level":"info","ts":1661165707.5269604,"caller":"app/main.go:92","msg":"Done processing message","messsage":"Hello Test2"}
{"level":"info","ts":1661165707.5286136,"caller":"app/main.go:92","msg":"Done processing message","messsage":"Hello Test3"}
```


