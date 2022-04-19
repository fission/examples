# RabbitMQ Functions demo

This is a example in which one function produces messages to  RabbitMQ and when there is a message, the next function gets trigerred automatically!

## Fission
First of all install Fission, a few parameters modified in values file:

```
$ helm install --namespace fission --name-template fission --set mqt_keda.enabled=true --set prometheus.enabled=false https://github.com/fission/fission/releases/download/1.12.0/fission-core-1.12.0.tgz
```

## Keda
Then let's install Keda:

```
$ helm repo add kedacore https://kedacore.github.io/charts
$ helm repo update
$ kubectl create namespace keda
```

## RabbitMQ

Installing RabbitMQ with the krew plugin for RabbitMQ

>  Please install Krew before using the following commands

```
$ kubectl krew install rabbitmq
$ kubectl create ns rabbitmq 
$ kubectl rabbitmq install-cluster-operator
$ kubectl rabbitmq -n rabbitmq create rabbitmq --replicas 1
```

Let's verify the cluster is ready

```
$ kubectl rabbitmq -n rabbitmq list
NAME       AGE
rabbitmq   2m16s
```

Finally let's get credentials and open UI for later use

```
$ kubectl rabbitmq -n rabbitmq secrets rabbitmq
username: J5J75hlcSflR-GN5_YWCekJY3JRX11Tj
password: uqtv1ioEDU6ztRkKLXVw134CGmiH81hK

$ kubectl rabbitmq -n rabbitmq manage rabbitmq
```


## Functions, Environments and Triggers

We will create spec for all resources and apply in end. You can directly apply them with `fission spec apply`  as they are already generated! In following sections we explain all the functions and triggers and finally call the end to end pipeline.


### Environment

Environment are runtimes for functions. We only have a Go runtime and a NodeJS runtime. All functions are based on either of them

```
$ fission environment create --name go --image fission/go-env-1.12:1.10.0 --builder fission/go-builder-1.12:1.10.0 --spec

$ fission env create --name nodeenv --image fission/node-env --spec
```

### Functions & Triggers

#### (1) RabbitMQ Producer Function

The `rabbit-p` produces a body and puts in a RabbitMQ queue.

```
$  fission fn create --name rabbit-p --env go --src "rabbitmq-producer/*" --entrypoint Handler --spec
```
#### (2) Trigger for RabbitMQ

The next trigger attached to RabbitMQ will get invoke and create a `rabbitmq-http-connector` which will call r-consumer function.

```
$  fission mqt create --name r2f --spec --function r-consumer --mqtype rabbitmq --mqtkind keda --topic publisher --metadata queueName=publisher --metadata host="amqp://J5J75hlcSflR-GN5_YWCekJY3JRX11Tj:uqtv1ioEDU6ztRkKLXVw134CGmiH81hK@rabbitmq.rabbitmq.svc.cluster.local:5672/"
```
#### (3) Consumer function from RabbitMQ

Finally `r-consumer` gets the message from RabbitMQ.

```
$ fission fn create --name r-consumer --env nodeenv --code r-consumer.js --spec
```