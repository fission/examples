# Keda Kafka Example

This examples assumes that you have a running Kafka cluster locally on Kubernetes.
If you want to establish a connection with username/password, please refer [kafka-keda-sasl example](../kafka-keda-sasl).

## Strimzi Kafka and Topics

You can setup a Kafka cluster with [Strimzi Guide](https://strimzi.io/quickstarts/) if needed.

```console
$ kubectl get kafka -n kafka
NAME         DESIRED KAFKA REPLICAS   DESIRED ZK REPLICAS   READY   WARNINGS
my-cluster   1                        1                     True
```

If you are using Strimzi, if you dont have topics created yet, please create them.

```console
$ kubectl create -f kafka-topics.yaml -n kafka
kafkatopic.kafka.strimzi.io/request-topic created
kafkatopic.kafka.strimzi.io/response-topic created
kafkatopic.kafka.strimzi.io/error-topic created
```

Please ensure that topic is READY.

```console
kubectl get kafkatopic -n kafka
NAME            CLUSTER      PARTITIONS   REPLICATION FACTOR   READY
error-topic     my-cluster   3            1                    True
request-topic   my-cluster   3            1                    True
response-topic  my-cluster   3            1                    True
```

## Usage

### Configuration of Kafka Connnect

- Make copy of [kafka-config.yaml.tpl](./kafka-config.yaml.tpl) and rename it to `kafka-config.yaml`.
- Update following values
  - `brokers` in ConfigMap `keda-kafka-configmap`.
- Update `bootstrapServers` in [specs/mqtrigger-kafkatest.yaml](./specs/mqtrigger-kafkatest.yaml) with value same as `brokers` in `keda-kafka-configmap`.

### Deployment

- Create sources zip for producer and consumer functions.

    ```console
    zip -j producer.zip kafka-producer/*
    zip -j consumer.zip kafka-consumer/*
    ```

- Create `keda-kafka-configmap` in `default` namespace.

    ```console
    kubectl apply -f kafka-config.yaml
    ```

- Create Fission function with `producer.zip` and `consumer.zip` as sources and mqtrigger required configs.

    ```console
    fission spec apply
    ```

- Please wait till package build is successful.

    ```console
    fission pkg list
    NAME           BUILD_STATUS ENV LASTUPDATEDAT
    kafka-producer succeeded    go  08 Nov 21 18:21 IST
    kafka-consumer succeeded    go  08 Nov 21 18:21 IST
    ```

- Invoke producer and watch over consumer logs.

    ```console
    fission fn test --name kafka-producer
    ```

## Generarting Specs

If you want to generate spec on your own, please refer following commands.

```console
fission spec init
fission env create --spec --name go --image fission/go-env-1.16:1.32.1 --builder fission/go-builder-1.16:1.32.1
fission package create --spec --src producer.zip --env go --name kafka-producer
fission package create --spec --src consumer.zip --env go --name kafka-consumer
fission fn create --spec --name kafka-producer --env go --pkg kafka-producer --entrypoint Handler --configmap keda-kafka-configmap
fission fn create --spec --name kafka-consumer --env go --pkg kafka-consumer --entrypoint Handler
fission mqt create --spec --name kafkatest --function kafka-consumer --mqtype kafka --mqtkind keda --topic request-topic --resptopic response-topic --errortopic error-topic --maxretries 3 --metadata bootstrapServers=my-cluster-kafka-bootstrap.kafka.svc:9092 --metadata consumerGroup=my-group --metadata topic=request-topic  --cooldownperiod=30 --pollinginterval=5
```
