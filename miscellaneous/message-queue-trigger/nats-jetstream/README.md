# Message Queue Trigger Demonstration - NATS Jetstream

## Create Nats Jetstream server
```
kubectl apply -f jetstream-server.yaml
```
## Create Producer

```
fission environment create --name go --image fission/go-env-1.16 --builder fission/go-builder-1.16
fission fn create --name producer --env go --src "producer/*" --entrypoint Handler 
```

## Create Fission env and function
```
fission fn create --name helloworld --env go --src hello.go --entrypoint Handler
```

## Create Fission trigger

```
fission mqt create --name jetstreamtest --function helloworld --mqtype nats-jetstream --mqtkind keda --topic input.created --resptopic output.response-topic --errortopic erroutput.error-topic --maxretries 3 --metadata stream=input --metadata fissionConsumer=fission_consumer --metadata natsServerMonitoringEndpoint=nats-jetstream.default.svc.cluster.local:8222  --metadata natsServer=nats://nats-jetstream.default.svc.cluster.local:4222  --metadata responseStream=output --metadata errorStream=erroutput --metadata consumer=fission_consumer
```
## Run the producer
```
fission fn test --name=producer
```
### Sample Output
```
Order with OrderID:1 has been published
Order with OrderID:2 has been published
Order with OrderID:3 has been published
Successfully sent to request-topic
```

## Check logs
To verify the status of trigger, we can- 

- check for logs in the fission helloworld function's pod

```
$ fission fn pod --name=helloworld
NAME                                         NAMESPACE         READY  STATUS   IP            EXECUTORTYPE  MANAGED  
poolmgr-go-default-6312601-6d6b85ff4f-b8m7g  fission-function  2/2    Running  10.244.0.188  poolmgr       false 
```
or

```
$ kubectl -n fission-function get pod -l functionName=helloworld
NAME                                          READY   STATUS        RESTARTS   AGE
poolmgr-go-default-6312601-6d6b85ff4f-b8m7g   2/2     Terminating   0          30m
```
### sample output

```
$ kubectl -n fission-function logs -f -c go poolmgr-go-default-6312601-6d6b85ff4f-b8m7g 
2022/08/24 06:16:17 listening on 8888 ...
2022/08/24 06:42:23 specializing ...
2022/08/24 06:42:23 loading plugin from /userfunc/deployarchive/helloworld-eb3f240a-d6bb-4728-b806-f426ce0e255a-vyh8tf-oa1sgs
2022/08/24 06:42:23 done
Test1
Test2
Test3
```

- check jetstream pods logs-

```
$ kubectl logs deploy/jetstreamtest
{"level":"info","ts":1661322333.8198879,"caller":"app/main.go:90","msg":"Done processing message","messsage":"Hello Test1"}
{"level":"info","ts":1661322333.8208282,"caller":"app/main.go:90","msg":"Done processing message","messsage":"Hello Test2"}
{"level":"info","ts":1661322333.8217056,"caller":"app/main.go:90","msg":"Done processing message","messsage":"Hello Test3"}
```
