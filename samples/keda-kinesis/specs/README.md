# Spec commands

Before you create the specs, please follow the setup steps in the [README](../README.md).

## Spec Generation

```sh
fission spec init

fission env create --name go --image fission/go-env-1.14 --builder fission/go-builder-1.14 --spec
fission fn create --name consumer --env go --src "consumer/*" --entrypoint Handler --spec
fission fn create --name producer --env go --src "producer/*" --entrypoint Handler --secret aws-credentials --configmap stream-details --spec

fission mqt create  --name mqt-kinesis --function consumer \
 --mqtype aws-kinesis-stream --mqtkind keda --maxretries 3 \
 --topic request --resptopic response --errortopic error --metadata streamName=request \
 --metadata shardCount=2 --metadata awsRegion=us-east-2 --secret aws-credentials --spec
```

## Spec Apply

```sh
fission spec apply
```

## Spec Destroy

```sh
fission spec destroy
```

