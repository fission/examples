# Testing PodSpec on Kind with a sample function

kind create cluster  ## TO create a Kind cluster
kubectl create ns fission 
helm install --namespace fission --name-template fission https://github.com/fission/fission/releases/download/1.11.1/fission-core-1.11.1.tgz ## Installs specific version
kubectl taint node kind-control-plane reservation=fission:NoSchedule ## Taints the node - so we can apply tolerations on function
fission spec apply ## Apply Function Spec in this example and 
kubectl get environments -ndefault -oyaml nodejs #Verifies podspec has tolerations
kubectl get pods -nfission-function # The pod should be running and not in PENDING