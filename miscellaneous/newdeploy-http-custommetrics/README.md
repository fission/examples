# Adding custom metrics to newdeploy functions

In this example, we are going to add custom metrics to the HPA defined in the `function-consumer.yaml` spec file.

You can also find the configuration files in the [strimzi repository](https://github.com/strimzi/strimzi-kafka-operator/tree/main/examples/metrics).
We have made some slight changes to the files according to our example.

## Installing fission

Open the `kafka-fission-config.yaml` file and replace the kafka broker with an appropriate value.

Then run the following commands

```bash
cd kafka-config
kubectl create ns fission
helm install fission fission-charts/fission-all --namespace fission -f kafka-fission-config.yaml --version 1.16.0-rc2
```

## Setting up Apache Kafka

Install strimzi kafka in the `kafka` namespace.

```bash
kubectl create ns kafka
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
```

Wait until the `strimzi-cluster-operator` starts running.

```bash
cd kafka-config
kubectl apply -f kafka-config.yaml
```

Now we'll create the following kafka topics

- request-topic
- response-topic
- error-topic

```bash
cd kafka-config
kubectl apply -f kafka-topic.yaml -n kafka
```

## Setting up Prometheus monitoring

Install prometheus using helm

```bash
kubectl create ns monitoring
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false,prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

## Setting up the fission fn

Run the command `kubectl get pods -n kafka` and copy the pod name of the kafka-exporter.
Go to the `function-consumer.yaml` file in the specs folder. Under HPAMetrics, you'll find a field `name`. Replace the value with the copied value.

Run the `fission spec apply` command.


## Setting up Prometheus adapter

We'll be using the `http_requests_total` metric to determine if the HPA should scale or not.

```bash
cd prometheus_adapter
helm install my-release prometheus-community/prometheus-adapter -f prometheus-adapter.yaml --namespace monitoring
```

apply service monitoring manifest to get the metrics from fission pods into Prometheus

```bash
cd prometheus
kubectl apply -f service-monitoring.yaml
```

If this installed correctly, you should see the metric and its value.

```bash
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1/namespaces/monitoring/pods/*/http_requests_total