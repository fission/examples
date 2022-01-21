# Fission Rabbitmq Sample

## Requirements

- [Keda](https://artifacthub.io/packages/helm/kedacore/keda)
- [Fission with Keda Enabled](https://artifacthub.io/packages/helm/fission-charts/fission-all)
- [Rabbimq](https://artifacthub.io/packages/helm/bitnami/rabbitmq)

## Usage

Visit Rabbitmq dashboard at [http://localhost:15672](http://localhost:15672).

```shell
kubectl port-forward --namespace default svc/my-release-rabbitmq 15672:15672
```

Ensure you have three queues declared,

1. request-topic
2. response-topic
3. error-topic

Apply Fission manifests with the following command:

```shell
zip -j producer.zip producer/*
zip -j consumer.zip consumer/*
kubectl apply -f secret.yaml
fission spec apply
```

Check package build status,

```shell
fission pkg list
NAME              BUILD_STATUS ENV LASTUPDATEDAT
rabbitmq-consumer succeeded    go  20 Jan 22 15:27 IST
rabbitmq-producer succeeded    go  20 Jan 22 15:22 IST
```

Trigger producer function,

```shell
fission fn test --name rabbitmq-producer
```

Check consumer function logs and messages count for the queue `response-topic` or `error-topic`.

## Specs

```shell
fission spec init
fission env create --spec --name go --image fission/go-env-1.16 --builder fission/go-builder-1.16
fission package create --spec --src producer.zip --env go --name rabbitmq-producer
fission package create --spec --src consumer.zip --env go --name rabbitmq-consumer
fission fn create --spec --name rabbitmq-producer --env go --pkg rabbitmq-producer \
    --entrypoint Handler --secret keda-rabbitmq-secret
fission fn create --spec --name rabbitmq-consumer --env go --pkg rabbitmq-consumer --entrypoint Handler
fission mqt create --spec --name rabbitmq-test --function rabbitmq-consumer --mqtype rabbitmq --mqtkind keda \
    --topic request-topic --resptopic response-topic --errortopic error-topic --maxretries 3 \
    --metadata queueName=request-topic --metadata topic=request-topic  --cooldownperiod=30 \
    --pollinginterval=5 --secret keda-rabbitmq-secret
```
