apiVersion: v1
kind: ConfigMap
metadata:
  name: keda-kafka-configmap
  namespace: default
data:
  brokers: "my-cluster-kafka-bootstrap.kafka.svc:9092"
  request-topic: "request-topic"
  response-topic: "response-topic"
  error-topic: "error-topic"
