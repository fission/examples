#!/bin/bash

set -euo pipefail

echo "Starting Eksctl cluster setup"
# eksctl create cluster -f cluster.yaml # Till --asg-access is supported in YAML file, we need to use CLI
eksctl create cluster --name scale-test --version 1.17 --managed --asg-access --region ap-south-1 --node-type=c4.4xlarge --nodes-min 3 --nodes-max 20 --ssh-access 

echo "Getting nodes"
kubectl get nodes

echo "Installing Autoscaler, Metric Server"
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.3.6/components.yaml
kubectl apply -f cluster-as.yaml

echo "Installing Prometheus"
helm install fission-metrics --namespace monitoring prometheus-community/kube-prometheus-stack \
  --set kubelet.serviceMonitor.https=true \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues=false

# helm install --namespace fission --name-template fission --set prometheus.enabled=false https://github.com/fission/fission/releases/download/1.10.0/fission-all-1.10.0.tgz
# kubectl annotate svc/router -nfission service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout: "3600"
# kubectl apply -f servicemonitors.yaml --namespace fission 
# kubectl --namespace monitoring port-forward svc/fission-metrics-grafana 3000:80