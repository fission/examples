#!/bin/bash

set -euo pipefail

echo "Starting Eksctl cluster setup"
eksctl create cluster -f cluster.yaml

echo "Getting nodes"
kubectl get nodes

echo "Installing Autoscaler"
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.3.6/components.yaml
kubectl apply -f cluster-as.yaml

echo "Installing Prometheus"
helm install fission-metrics --namespace monitoring prometheus-community/kube-prometheus-stack \
  --set kubelet.serviceMonitor.https=true \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues=false

# kubectl annotate svc/router -nfission service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout: "3600"
# kubectl apply -f servicemonitors.yaml --namespace fission 
# kubectl --namespace monitoring port-forward svc/fission-metrics-grafana 3000:80