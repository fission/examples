# Spec commands

Before you create the specs, please follow the setup steps in the [README](../README.md).

## Spec Generation

```sh
fission spec init
fission env create --name go --image fission/go-env-1.14 --builder fission/go-builder-1.14 --spec
fission pkg create --name producer --env go --src producer/producer.zip --spec
fission fn create --name producer --env go --pkg producer --entrypoint Handler --secret aws-credentials --configmap queue-details --spec

fission env create --name nodejs --image fission/node-env:latest --spec
fission fn create --name consumer --env nodejs --code consumer/consumer.js --spec

fission mqt create --name sqstest --function consumer --mqtype aws-sqs-queue \
 --topic input --resptopic output --mqtkind keda --errortopic error \
 --metadata queueURL=https://sqs.us-east-2.amazonaws.com/xxxxxxxxxx/input \
 --metadata awsRegion=us-east-2 --secret aws-credentials --spec
```

## Spec Apply

```sh
fission spec apply
```

## Spec Destroy

```sh
fission spec destroy
```
