# Message Queue Trigger Demonstration - NATS Jetstream

## Create Nats Jetstream server
```
kubectl apply -f jetstream-server.yaml
```
## Create Consumer

```
fission fn create --name consumer --env go --src "consumer/*" --entrypoint Handler 
```
## Create Producer

```
fission fn create --name producer --env go --src "producer/*" --entrypoint Handler 
```

## Create Fission env and function
```
fission environment create --name go --image fission/go-env-1.16 --builder fission/go-builder-1.16
fission fn create --name helloworld --env go --src hello.go --entrypoint Handler
```

## Create Fission trigger

```
fission mqt create --name jetstreamtest --function helloworld --mqtype nats-jetstream --mqtkind keda --topic input.created --resptopic output.response-topic --errortopic erroutput.error-topic --maxretries 3 --metadata stream=input --metadata fissionConsumer= fission_consumer --metadata natsServerMonitoringEndpoint=nats-jetstream.default.svc.cluster.local:8222  --metadata natsServer=nats://nats-jetstream.default.svc.cluster.local:4222  --metadata responsestream output --metadata errorstream erroutput
```

## check logs
To verify the status of trigger, we can- 

- check for logs in the fission helloworld function's pod

```
$ kubectl -n fission-function get pod -l functionName=helloworld
NAME                                          READY   STATUS        RESTARTS   AGE
poolmgr-go-default-6312601-594c76c9cd-kjwxl   2/2     Terminating   0          30m

$ kubectl -n fission-function logs -f -c go poolmgr-go-default-6312601-594c76c9cd-kjwxl
2022/08/23 10:46:50 listening on 8888 ...
2022/08/23 11:14:01 specializing ...
2022/08/23 11:14:01 loading plugin from /userfunc/deployarchive/helloworld-70029964-7618-493b-bdae-ea2c89e794ef-fyskij-nqfabj
2022/08/23 11:14:01 done
Test1
Test2
Test3
```


