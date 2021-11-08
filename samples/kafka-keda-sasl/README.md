# Keda Kafka Example

*Note: Please ensure that you are using Kafka Keda Connector version 0.9 or higher.*

We have used [Confluent Cloud](https://www.confluent.io/) based Kafka cluster in this example.
You can create a Kafka cluster in Confluent Cloud and use it for this example.

## Usage

### Configuration of Kafka Connect

- Make sure you have a Kafka cluster running in Confluent Cloud.
- Create following topics in your Kafka cluster:
  - `request-topic`
  - `response-topic`
  - `error-topic`
- Make copy of [kafka-config.yaml.tpl](./kafka-config.yaml.tpl) and rename it to `kafka-config.yaml`.
- Update following values
  - `username` and `password` in Secret `keda-kafka-secrets`
  - `brokers` in ConfigMap `keda-kafka-configmap`. You would get this from Confluent Cloud cluster setting(Bootstrap Servers).
- Update `bootstrapServers` in [specs/mqtrigger-kafkatest.yaml](./specs/mqtrigger-kafkatest.yaml) with value same as `brokers` in `keda-kafka-configmap`.

### Deployment

- Create sources zip for producer and consumer functions.

    ```console
    zip -j producer.zip kafka-producer/*
    zip -j consumer.zip kafka-consumer/*
    ```

- Create `keda-kafka-secrets` and `keda-kafka-configmap` in `default` namespace.

    ```console
    kubectl apply -f kafka-config.yaml
    ```

- Create Fission function with `producer.zip` and `consumer.zip` as sources and mqtrigger required configs.

    ```console
    fission spec apply
    ```

- Please wait till package build is successful.

    ```console
    fission package list
    NAME           BUILD_STATUS ENV LASTUPDATEDAT
    kafka-producer succeeded    go  08 Nov 21 14:45 IST
    kafka-consumer succeeded    go  08 Nov 21 14:45 IST
    ```

- Invoke producer and watch over consumer logs.

    ```console
    fission fn test --name kafka-producer
    ```

## Spec Generation

If you want to generate spec on your own, please refer following commands.

```console
fission spec init
fission env create --spec --name go --image fission/go-env-1.16 --builder fission/go-builder-1.16
fission package create --spec --src producer.zip --env go --name kafka-producer
fission package create --spec --src consumer.zip --env go --name kafka-consumer
fission fn create --spec --name kafka-producer --env go --pkg kafka-producer \
    --entrypoint Handler --secret keda-kafka-secrets --configmap keda-kafka-configmap
fission fn create --spec --name kafka-consumer --env go --pkg kafka-consumer --entrypoint Handler
fission mqt create --spec --name kafkatest --function kafka-consumer --mqtype kafka --mqtkind keda \
    --topic request-topic --resptopic response-topic --errortopic error-topic --maxretries 3 \
    --metadata bootstrapServers=kafka-test.asia-south1.gcp.confluent.cloud:9092 \
    --metadata consumerGroup=my-group --metadata topic=request-topic  --cooldownperiod=30 \
    --pollinginterval=5 --secret keda-kafka-secrets
```
