1. ```eksctl create cluster --name scale-test --version 1.17 --managed --asg-access --region ap-south-1 --node-type=c5.xlarge --ssh-access```

2. ```kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml```

3. ```kubectl -n kube-system annotate deployment.apps/cluster-autoscaler cluster-autoscaler.kubernetes.io/safe-to-evict="false"```

4. ```EDITOR="code --wait" kubectl -n kube-system edit deployment.apps/cluster-autoscaler```

Edit the cluster-autoscaler container command to replace <YOUR CLUSTER NAME> with your cluster's name, and add the following options and following

--balance-similar-node-groups

--skip-nodes-with-system-pods=false

5. ```kubectl -n kube-system set image deployment.apps/cluster-autoscaler cluster-autoscaler=asia.gcr.io/k8s-artifacts-prod/autoscaling/cluster-autoscaler:v1.17.3```

6. ```kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.3.6/components.yaml```


###In Load balancer:
service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout: "900"


vegeta attack -duration=300s -timeout=300s -rate=360/m -max-workers=2000 -targets=vegeta.conf > Iter-n.txt