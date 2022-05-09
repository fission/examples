# Adding custom metrics to newdeploy functions

In this example, we are going to setup a strimzi kafka exporter which is going to provide the metrics that we feed to the newdeploy hpa.
The hpa will then scale up and down according to that metric.

We'll be using the kafka mqtrigger type fission for this example.

I would recommend cloning this repository because there are quite a few files that we need to apply.

You can also find the files in the [strimzi repository](https://github.com/strimzi/strimzi-kafka-operator/tree/main/examples/metrics). We have made some slight changes to those files according to our example.

## Setting up strimzi

Create the kafka namespace. Then we'll install strimzi in the same namespace.

```
kubectl create ns kafka
curl -L http://strimzi.io/install/latest | sed 's/namespace: .*/namespace: kafka/' | kubectl create -f - -n kafka
```

Wait until the `strimzi-cluster-operator` starts running.

Then apply the `kafka-config.yaml` file.

```
kubectl apply -f kafka-config.yaml
```

## Setting up Prometheus monitoring

Create the monitoring namespace.

```
kubectl create ns monitoring
```

Then we'll apply the crd to deploy the prometheus operator.

```
cd crd
kubectl create -f bundle.yaml -n monitoring
```

You should be able to see this.

```
kubectl get pods -n monitoring
NAME                                             READY   STATUS    RESTARTS   AGE
prometheus-operator-7c5d6769d-jmmp5              1/1     Running   0          4d1h
```

We need to create a secret `additional-scrape-configs` from the file `prometheus_additional.yaml`. The secret will contain the configuration to setup a cadvisor.

```
cd prometheus_additional
kubectl create secret generic additional-scrape-configs --from-file=prometheus-additional.yaml -n monitoring
```

Now we have to apply 3 files.

- `strimzi-pod-monitor.yaml` which will scrape data directly from the kafka pods. This file will create the kafka exporter.
- `prometheus-rules.yaml` which specifies the alerting rules for prometheus.
- `prometheus.yaml` which will install and run prometheus. It also uses the secret we defined earlier.

```
cd prometheus_install
kubectl apply -f strimzi-pod-monitor.yaml
kubectl apply -f prometheus-rules.yaml
kubectl apply -f prometheus.yaml
```

If all the steps are performed correctly, you should see something like this.

```
kubectl get pods -n monitoring
NAME                                             READY   STATUS    RESTARTS   AGE
grafana-f5797fcc9-7csp2                          1/1     Running   1          4d1h
prometheus-operator-7c5d6769d-jmmp5              1/1     Running   0          4d1h
prometheus-prometheus-0                          2/2     Running   0          4d

kubectl get svc -n monitoring
NAME                            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
grafana                         ClusterIP   10.96.51.54     <none>        3000/TCP   4d1h
prometheus-operated             ClusterIP   None            <none>        9090/TCP   4d
prometheus-operator             ClusterIP   None            <none>        8080/TCP   4d1h
```

## Creating kafka topics

You'll need to create the following topics.

```
cat << EOF | kubectl create -n kafka -f -
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
    name: request-topic
    labels:
        strimzi.io/cluster: "my-cluster"
spec:
    partitions: 3
    replicas: 1
EOF
```

```
cat << EOF | kubectl create -n kafka -f -
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
    name: response-topic
    labels:
        strimzi.io/cluster: "my-cluster"
spec:
    partitions: 3
    replicas: 1
EOF
```

```
cat << EOF | kubectl create -n kafka -f -
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
    name: error-topic
    labels:
        strimzi.io/cluster: "my-cluster"
spec:
    partitions: 3
    replicas: 1
EOF
```

## Setting up the fission fn

Run the `fission spec apply` command to apply the specs. It will create an environment, a package, a newdeploy function and a kafka mqtrigger.

We need to get the uid of the mqtrigger which is also the name of the `consumergroup`.

Run the command `kubectl get messagequeuetriggers.fission.io -oyaml` and copy the the field `uid` value which is under `metadata`.

## Setting up Prometheus adapter

We have kafka and prometheus both up and running but we need an adapter to expose the custom metrics to the hpa in our newdeploy function. So we'll install the prometheus adapter using helm with the provide configuration file.

We'll be using the `kafka_consumergroup_lag` metric to determine if the hpa should scale or not.

Before installing, you'll need to change the `consumergroup` in the `prometheus_adapter.yaml` file with the uid you copied earlier. You'll find the filter in the `metricsQuery` field.

```
cd prometheus_adapter
helm install my-release prometheus-community/prometheus-adapter -f prometheus-adapter.yaml --namespace monitoring
```

If this installed correctly, you should see the metric and its value.

```
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1/namespaces/kafka/pods/*/kafka_consumergroup_lag
{"kind":"MetricValueList","apiVersion":"custom.metrics.k8s.io/v1beta1","metadata":{"selfLink":"/apis/custom.metrics.k8s.io/v1beta1/namespaces/kafka/pods/%2A/kafka_consumergroup_lag"},"items":[{"describedObject":{"kind":"Pod","namespace":"kafka","name":"my-cluster-kafka-exporter-55867498c9-pnqhz","apiVersion":"/v1"},"metricName":"kafka_consumergroup_lag","timestamp":"2022-05-09T12:35:58Z","value":"0","selector":null}]}
```

Note: If you are using a shell different from bash(eg. zsh), then this might not work. Try using the following command in that scenario.

```
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1/namespaces/kafka/pods/%2A/kafka_consumergroup_lag
```

## Testing

Run a producer function to send 10000 messages to the topic `request-topic` and check the namespace `fission-function` where the new deploy pods will be created or destroyed according to the metric.
