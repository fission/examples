# Keda Kafka Example

*Note: Please ensure that you are using Kafka Keda Connector version 0.9 or higher.*

We have used [Confluent Cloud](https://www.confluent.io/) based Kafka cluster in this example.
You can create a Kafka cluster in Confluent Cloud and use it for this example.

## Usage

- Update [kafka-producer/kafka-producer.go](./kafka-producer/kafka_producer.go) with your kafka configuration.
- Update [specs](./specs/) if any changes needed.
- Update [kafka-config.yaml](./kafka-config.yaml) with your kafka configuration.
- Build source zips,

    ```console
    cd samples/kafka-keda

    # Create Zip of all files in kafka-producer
    pushd kafka-producer/
    zip producer.zip *
    popd

    # Create Zip of all files kafka-consumer
    pushd ./kafka-consumer/
    zip consumer.zip *
    popd


    mv kafka-producer/producer.zip .
    mv kafka-consumer/consumer.zip .
    ```

- Apply Fission spec to your cluster.
  Please create `keda-kafka-configmap` and `keda-kafka-secret` before apply specs.

    ```console
    kubectl apply -f kafka-config.yaml
    fission spec apply
    ```

- Verify fission package build.

    ```console
    $ fission pkg list
    NAME           BUILD_STATUS ENV LASTUPDATEDAT
    kafka-producer succeeded    go  25 Oct 21 18:36 IST
    kafka-consumer succeeded    go  25 Oct 21 18:36 IST
    ```

- Invoke producer and watch over consumer logs.

    ```console
    fission fn test --name kafka-producer
    ```

## Spec Generation

```sh
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
