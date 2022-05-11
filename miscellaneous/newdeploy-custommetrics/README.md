# Adding custom metrics to newdeploy functions

In this example, we are going to add custom metrics to the HPA defined in the `function-consumer.yaml` spec file.
For that, we will setup a strimzi kafka exporter which is going to provide the metrics that we feed to the newdeploy HPA.
Then we will use a pod monitor to scrape the metrics from the pods and finally a prometheus adapter which will expose the metrics to our HPA.
The HPA will then scale up and down according to that metric value.

We'll be using the kafka mqtrigger type fission for this example so you'll have to enable the kafka mqtrigger and provide it with appropriate broker url while installing fission.

You can also find the configuration files in the [strimzi repository](https://github.com/strimzi/strimzi-kafka-operator/tree/main/examples/metrics).
We have made some slight changes to those files according to our example.

## Setting up Apache Kafka

Create the kafka namespace. Then we'll install strimzi in the same namespace.

```bash
kubectl create ns kafka
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
```

Wait until the `strimzi-cluster-operator` starts running.

Then apply the `kafka-config.yaml` file.

```bash
cd kafka-config
kubectl apply -f kafka-config.yaml
```

## Creating kafka topics

We'll create the following topics

- request-topic
- response-topic
- error-topic

```bash
cd kafka-config
kubectl apply -f kafka-topic.yaml -n kafka
```

## Setting up Prometheus monitoring

Create the monitoring namespace.

```bash
kubectl create ns monitoring
```

We now have to install prometheus using helm

```bash
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false,prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

Next we have to create a pod monitor which will scrape the metrics from the kafka pods.

```bash
cd prometheus
kubectl apply -f strimzi-pod-monitor.yaml -n monitoring
```

## Setting up the fission fn

Run the `fission spec apply` command to apply the specs.
It will create an environment, a package, a newdeploy function and a kafka mqtrigger.

We'll need to make a small change. We have mentioned the pod name of kafka-exporter in the HPA of the new deploy function. So we'll need to change it accordingly.

To do that run the command `kubectl get pods -n kafka` and copy the pod name of the kafka-exporter.
Then go to the `function-consumer.yaml` file in the specs folder. Under HPAMetrics, you'll find a field `name`.Replace the value with the copied value.

We need to get the uid of the mqtrigger which is also the name of the `consumergroup`.

Run the command `kubectl get messagequeuetriggers.fission.io -oyaml` and copy the the field `uid` value which is under `metadata`.

## Setting up Prometheus adapter

We have kafka and prometheus both up and running but we need an adapter to expose the custom metrics to the HPA in our newdeploy function.
So we'll install the prometheus adapter using helm with the provide configuration file.

We'll be using the `kafka_consumergroup_lag` metric to determine if the HPA should scale or not.

Before installing, you'll need to change the `consumergroup` in the `prometheus_adapter.yaml` file with the uid you copied earlier.
You'll find the filter in the `metricsQuery` field.

```bash
cd prometheus_adapter
helm install my-release prometheus-community/prometheus-adapter -f prometheus-adapter.yaml --namespace monitoring
```

If this installed correctly, you should see the metric and its value.

```bash
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1/namespaces/kafka/pods/*/kafka_consumergroup_lag
{"kind":"MetricValueList","apiVersion":"custom.metrics.k8s.io/v1beta1","metadata":{"selfLink":"/apis/custom.metrics.k8s.io/v1beta1/namespaces/kafka/pods/%2A/kafka_consumergroup_lag"},"items":[{"describedObject":{"kind":"Pod","namespace":"kafka","name":"my-cluster-kafka-exporter-55867498c9-pnqhz","apiVersion":"/v1"},"metricName":"kafka_consumergroup_lag","timestamp":"2022-05-09T12:35:58Z","value":"0","selector":null}]}
```

Note: If you are using a shell different from bash(eg. zsh), then this might not work. Try using the following command in that scenario.

```bash
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1/namespaces/kafka/pods/%2A/kafka_consumergroup_lag
```

Note: If you are not getting any value, it maybe because the metric has not been defined yet. So you'll have to send some messages to the queue.

## Testing

Run a producer function to send 10000 messages to the topic `request-topic` and check the namespace `fission-function` where the new deploy pods will be created or destroyed according to the metric value.
