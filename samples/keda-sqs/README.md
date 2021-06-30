# AWS SQS with Keda

The example demonstrates the integration of Fission functions, AWS SQS and Keda.
A producer function produces messages to an SQS queue and when there is a message, the next function gets triggered automatically.
Please check `specs` directory for the Fission specs.

For specs related commands, please refer [this doc](specs/README.md)

## SQS Setup 

In order to setup SQS, you can either use [localstack](https://github.com/localstack/localstack) or [AWS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-setting-up.html).
This example uses SQS setup on an AWS account.

Below are the commands to create and send the message to a queue using `aws` CLI.
If you do not the CLI, you can also create the queues from the AWS console.

```
$ aws sqs create-queue --queue-name input
$ aws sqs create-queue --queue-name output
$ aws sqs create-queue --queue-name error
$ aws sqs list-queues
$ aws sqs send-message --queue-url https://sqs.ap-south-1.amazonaws.com/xxxxxxxx/input --message-body 'test message'
```

## AWS SQS Connection Details

For our producer function to be able to connect with the SQS queue, it requires AWS credentials and queue details.
You must edit the [aws-config.yaml](aws-config.yaml) and update the values for following keys:
 
- `awsAccessKeyID` and `awsSecretAccessKey` in the `aws-credentials` secret.
Please note that we are using string data, and not the base64 encoded data while creating the secret.
- `AWS_REGION` and `QUEUE_URL` in the `queue-details` config map.

Once done create the secret and config map using the command:

```
kubectl apply -f aws-config.yaml
```

## Deploy

Let's first create an archive for the producer.

```
cd producer && zip -r producer.zip * && cd ..
```

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

After the function completes, you should see the message "successfully sent message to input queue".
You can also watch the pods in `default` namespace to observe how Keda scales and spins up the consumer functions.

## Cleanup

```
fission spec destroy
```
