# KEDA GCP PubSub Example

## Steps

1. Create a Fission `Python` environment.
2. For the `pub` & `sub` functions, add dependencies in requirements.txt file for `google-cloud-pubsub` *the code for `sub` showcases a generic subscriber implementation, not used in this example*
3. Zip all the files unders `pub` and name it `pub.zip`. (*make sure build.sh is executable*)
4. Create a package using the zip file -> `fission package create --name pub-pkg --sourcearchive pub.zip --env python --buildcmd "./build.sh"`
5. Create a fission publisher function -> `fission fn create --name pub --pkg pub-pkg --entrypoint "pub.main"`
6. Create a new fission consumer function -> `fission fn create --name consumer --env nodeenv --code consumer.js ` *make sure to have nodejs environment in place*
7. Create a `secret.yaml` with the Google Cloud credentials, *you'll get a file.json from GCP*, create a yaml file with a key `GoogleApplicationCredentials` and value as the content of the json file.
8. Create a `secret` -> `kubectl create secret generic pubsub-secret --from-file=GoogleApplicationCredentials=/home/ankitchawla/gcpTest/filename.json --from-literal=PROJECT_ID=project_id` *make sure this is in the default namespace*
9. Create the `mqtrigger` of `mqtype` as gcp-pubsub and `mqtkind` as keda along with the secret created above:

``` bash
fission mqt create --name gcptest --function consumer --mqtype gcp-pubsub --mqtkind keda --topic request-topic-sub --resptopic response-topic --errortopic error-topic --maxretries 3 --cooldownperiod=30 --pollinginterval=5 --metadata subscriptionName=request-topic-sub --metadata credentialsFromEnv=GoogleApplicationCredentials --secret pubsub-secret
```

## Expected Ouput

When you trigger the publisher function `pub` using `fission fn test --name pub` it will create and send 100 messages to our GCP Pubsub topic.
You can validate the same on the GCP console under subscription and messages.
If the `mqtrigger` is configured correctly, you should see the consumer function execute and show the output along with increase in the consumer pods due to Keda's event drive auto scaling functionality.

## Spec generation

```console
fission spec init
fission env create --name python-gcp --image fission/python-env --builder fission/python-builder --spec
fission fn create --name producer --env python-gcp --src pub/pub.py  --entrypoint main --src pub/requirements.txt --spec
fission env create --name nodeenv --image fission/node-env --spec
fission fn create --name consumer --env nodeenv --code consumer.js --spec
fission mqt create --name gcptest --function consumer --mqtype gcp-pubsub --mqtkind keda --topic request-topic-sub --resptopic response-topic --errortopic error-topic --maxretries 3 --cooldownperiod=30 --pollinginterval=5 --metadata subscriptionName=request-topic-sub --metadata credentialsFromEnv=GoogleApplicationCredentials --secret pubsub-secret --spec
```
