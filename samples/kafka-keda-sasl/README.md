# Keda Kafka Example

## Usage

- Update kafka-producer/kafka-producer.go with your kafka configuration.
- Update specs if any changes needed.
- Deploy producer and consumer functions.

    ```console
    cd samples/kafka-keda
    ./deploy.sh
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

## Generarting Specs

```console
fission spec init
fission env create --spec --name go --image fission/go-env-1.16:1.32.1 --builder fission/go-builder-1.16:1.32.1
fission package create --spec --src producer.zip --env go --name kafka-producer
fission package create --spec --src consumer.zip --env go --name kafka-consumer
fission fn create --spec --name kafka-producer --env go --pkg kafka-producer --entrypoint Handler
fission fn create --spec --name kafka-consumer --env go --pkg kafka-consumer --entrypoint Handler
fission mqt create --spec --name kafkatest --function kafka-consumer --mqtype kafka --mqtkind keda --topic request-topic --resptopic response-topic --errortopic error-topic --maxretries 3 --metadata bootstrapServers=my-cluster-kafka-bootstrap.kafka.svc:9092 --metadata consumerGroup=my-group --metadata topic=request-topic  --cooldownperiod=30 --pollinginterval=5
```
