apiVersion: v1
kind: Secret
metadata:
  name: keda-kafka-secrets
  namespace: default
stringData:
  sasl: "plaintext"
  username: "<username>"
  password: "<password>"
  tls: "enable"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: keda-kafka-configmap
  namespace: default
data:
  brokers: "<bootstrap server>"
  request-topic: "request-topic"
  response-topic: "response-topic"
  error-topic: "error-topic"
