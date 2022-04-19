# AWS Kinesis with Keda

The example demonstrates the integration of Fission functions, AWS Kinesis and Keda.
A producer function puts records in a Kinesis stream and when there is a record, the next function gets triggered automatically.
Please check `specs` directory for the Fission specs.

For specs related commands, please refer [this doc](specs/README.md)

## Kinesis Setup 

In order to setup Kinesis, you can either use [localstack](https://github.com/localstack/localstack) or [AWS](https://docs.aws.amazon.com/firehose/latest/dev/before-you-begin.html).
This example uses Kinesis setup on an AWS account.

Below are the commands to create and send the message to a queue using `aws` CLI.
If you do not prefer the CLI, you can also create the queues from the AWS console.

```
$ aws kinesis create-stream --shard-count 2 --stream-name request
$ aws kinesis create-stream --shard-count 1 --stream-name response
$ aws kinesis create-stream --shard-count 1 --stream-name error
$ aws kinesis list-streams
$ aws kinesis put-record --stream-name request --partition-key 111 --data 'test message'
```

## AWS Kinesis Connection Details

For our producer function to be able to connect with the Kinesis streams, it requires AWS credentials and region.
You must edit the [aws-config.yaml](aws-config.yaml) and update the values for following keys:
 
- `awsAccessKeyID` and `awsSecretAccessKey` in the `aws-credentials` secret.
Please note that we are using string data, and not the base64 encoded data while creating the secret.
- `AWS_REGION` in the `stream-details` config map.

Once done create the secret and config map using the command:

```
kubectl apply -f aws-config.yaml
```

## Deploy

Now, we can apply the specs using the command:

```
fission spec apply
```

Please wait for the package build to be successful before you test the function.
You can check the package build status using the `fission pkg list` command .

## Use

Using fission CLI,

```
fission function test --name producer
```

After the function completes, you should see the message "messages sent successfully".
You can also watch the pods in `default` namespace to observe how Keda scales and spins up the consumer functions.

## Cleanup

```
fission spec destroy
```
