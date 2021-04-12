
https://docs.google.com/document/d/1C3KahggHtTUWE963Sfs6YXeKkUrI0dh_TVIMqWj9EUw/edit

http://highscalability.com/blog/2013/5/13/the-secret-to-10-million-concurrent-connections-the-kernel-i.html
https://redhat-developer-demos.github.io/knative-tutorial/knative-tutorial/index.html
https://aws.amazon.com/blogs/opensource/how-our-aws-rust-team-will-contribute-to-rusts-future-successes/
https://dev.to/aspittel/the-case-for-low-code-4nki
https://writing.kemitchell.com/2021/03/18/You-Can-Still-Use-the-Software.html
https://www.fastly.com/blog/how-lucet-wasmtime-make-stronger-compiler-together
https://hackernoon.com/kubernetes-crds-explained-what-are-they-and-how-to-use-them-to-extend-your-kubernetes-apis-ro5333z7

$ kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-server/single-server-nats.yml
configmap/nats-config created
service/nats created
statefulset.apps/nats created

$ kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-streaming-server/single-server-stan.yml
configmap/stan-config created
service/stan created
statefulset.apps/stan created

$ fission env create --name goenv --image fission/go-env-1.14 --builder fission/go-builder-1.14 --poolsize 1

$ fission fn create --name producerfunc --env goenv --entrypoint Handler --src "producer_go/*"

## Producer function 

$ fission env create --name nodejs --image fission/node-env-12.16:1.11.0 --builder fission/node-builder-12.16:1.11.0

$ fission fn create --name producer --env nodejs --src package.json --src producer.js --entrypoint producer

## Consumer function 

$ fission fn create --name consumerfunc --env nodejs --code consumer.js

## Trigger 

fission mqt create  --name natstest --function consumerfunc --mqtype stan --topic request --resptopic response --mqtkind keda --errortopic error --maxretries 3 --metadata subject=request --metadata queueGroup=grp1 --metadata durableName=due --metadata natsServerMonitoringEndpoint=nats.fission:8222 --metadata clusterId=test-cluster --metadata clientId=stan-sub --metadata natsServer=nats://nats.fission:4222


helm install --namespace fission --name-template fission https://github.com/fission/fission/releases/download/1.12.0/fission-core-1.12.0.tgz




## Kafka

fission environment create --name go --image fission/go-env-1.12:1.10.0 --builder fission/go-builder-1.12:1.10.0

fission fn create --name producer --env go --src producer.go --src go.mod --entrypoint Handler


fission env create --name nodeenv --image fission/node-env

fission fn create --name consumer --env nodeenv --code consumer.js

fission mqt create --name kafkatest --function consumer --mqtype kafka --mqtkind keda --topic request-topic --resptopic response-topic --errortopic error-topic --maxretries 3 --metadata bootstrapServers=my-cluster-kafka-brokers.my-kafka-project.svc:9092 --metadata consumerGroup=my-group --metadata topic=request-topic  --cooldownperiod=30 --pollinginterval=5

fission mqt create --name kafkatest --function consumer --mqtype kafka --mqtkind keda --topic request-topic --resptopic response-topic --errortopic error-topic --maxretries 3 --metadata bootstrapServers=my-cluster-kafka-brokers.my-kafka-project.svc:9092 --metadata consumerGroup=my-group --metadata topic=request-topic  --cooldownperiod=30 --pollinginterval=5





## Hello world

fission env create --name node --image fission/node-env

fission fn create --name hellojs --env node --code https://raw.githubusercontent.com/fission/fission/master/examples/nodejs/hello.js

curl https://raw.githubusercontent.com/fission/fission/master/examples/nodejs/hello.js

fission function test --name hellojs

