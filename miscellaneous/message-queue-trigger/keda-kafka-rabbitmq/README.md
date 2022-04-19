##### Kafka and Rabbit MQ with Keda

This example shows a multi hop message processing using Kafka, RabbitMQ & Fission functions.

![](keda-kafka-rabbitmq.png)

# Installation 

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

## Kafka
We will use Strimzi Kafka for installing kafka and then create the topics we need:

Install Kafka from: https://strimzi.io/docs/operators/latest/quickstart.html#proc-install-product-str 

```
$ kubectl apply -f kafka-topics.yaml

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

#### (1) Kafka Producer Function to request-topic

This is a Go function which writes messages to `request-topic` in Kafka

```
$ fission fn create --name producer --env go --src "kafka-producer/*" --entrypoint Handler --spec
```
#### (2) Trigger for Kafka request-topic 

As messages arrive in Kafka's `request-topic` - the trigger scales up the `kafka-http-connector` which reads messages from topic and calls the configured function which is `k-consumer` here.

```
$ fission mqt create --name k2k --spec --function k-consumer --mqtype kafka --mqtkind keda --topic request-topic --resptopic response-topic --errortopic error-topic --maxretries 3 --metadata bootstrapServers=my-cluster-kafka-brokers.my-kafka-project.svc:9092 --metadata consumerGroup=my-group --metadata topic=request-topic  --cooldownperiod=30 --pollinginterval=5
```

#### (3) Kafka Consumer Function from request-topic & producer to response-topic

The `k-consumer` is a NodeJS functions which reads body of HTTP request and appends one field to JSON and returns it. 

- If Fission gets a 200 response from the function then the response received is put in `response-topic`

- If Fission gets a NON 200 response from the function then the response received is put in `error-topic`

```
$ fission fn create --name k-consumer --env nodeenv --code k-consumer.js --spec
```

#### (4) Trigger for Kafka response-topic 

If the function (3) was successful then the message is put in `response-topic` which has another trigger below attached. This will trigger the `kafka-http-connector` and call the `rabbit-p` function

```
$  fission mqt create --name k2r --spec --function rabbit-p --mqtype kafka --mqtkind keda --topic response-topic --errortopic error-topic --maxretries 3 --metadata bootstrapServers=my-cluster-kafka-brokers.my-kafka-project.svc:9092 --metadata consumerGroup=my-group --metadata topic=response-topic  --cooldownperiod=30 --pollinginterval=5
```

#### (5) RabbitMQ Producer Function

The `rabbit-p` function gets body of message, appends with another field and then puts in a RabbitMQ queue.

```
$  fission fn create --name rabbit-p --env go --src "rabbitmq-producer/*" --entrypoint Handler --spec
```
#### (5) Trigger for RabbitMQ

The next trigger attached to RabbitMQ will get invoke and create a `rabbitmq-http-connector` which will call r-consumer function.

```
$  fission mqt create --name r2f --spec --function r-consumer --mqtype rabbitmq --mqtkind keda --topic publisher --metadata queueName=publisher --metadata host="amqp://J5J75hlcSflR-GN5_YWCekJY3JRX11Tj:uqtv1ioEDU6ztRkKLXVw134CGmiH81hK@rabbitmq.rabbitmq.svc.cluster.local:5672/"
```
#### (5) Consumer function from RabbitMQ

Finally `r-consumer` gets the message from RabbitMQ.

```
$ fission fn create --name r-consumer --env nodeenv --code r-consumer.js --spec
```

### Invoking 

```
$  fission spec apply
DeployUID: f961fbff-a12a-411c-9166-569a165717e6
Resources:
 * 4 Functions
 * 2 Environments
 * 4 Packages
 * 0 Http Triggers
 * 3 MessageQueue Triggers
 * 0 Time Triggers
 * 0 Kube Watchers
 * 4 ArchiveUploadSpec
Validation Successful
3 packages updated: k-consumer-c34f7910-4226-4217-b2b9-29204abd5d0d, producer-28afb578-6fed-48d1-89bf-7590dc662414, r-consumer-5ae51a36-15d4-4297-96c0-74a77534dc4e
4 functions updated: k-consumer, producer, r-consumer, rabbit-p
```

> After you have applied the function - the go functions will be built and you will have to wait for build to go to status `succeeded` and wait if it  is in `building`.

```
$ fission package list
NAME                                            BUILD_STATUS ENV     LASTUPDATEDAT
producer-28afb578-6fed-48d1-89bf-7590dc662414   succeeded    go      11 Jun 21 12:02 IST
rabbit-p-e71e95ed-723f-4c83-b37d-b5a7a0d791a3   succeeded    go      11 Jun 21 09:21 IST
k-consumer-c34f7910-4226-4217-b2b9-29204abd5d0d none         nodeenv 11 Jun 21 09:17 IST
r-consumer-5ae51a36-15d4-4297-96c0-74a77534dc4e none         nodeenv 11 Jun 21 09:17 IST
```

```
$ fission fn test --name producer
```