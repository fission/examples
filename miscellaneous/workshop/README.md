# Fission User Workshop

The deck can be found here: https://docs.google.com/presentation/d/e/2PACX-1vSuCYXWjr1QH9klwVXJBm8zMQrTdv540d_J-LXP7OUplse-WdaWNHK4zbVCo4BUQ5gl5_MoReLE3aM0/pub?start=false&loop=false&delayms=3000

Installing Fission

```
$ kubectl create ns fission

$ helm install --namespace fission --name-template fission --set mqt_keda.enabled=true --set prometheus.enabaled=false https://github.com/fission/fission/releases/download/1.13.1/fission-core-1.13.1.tgz

```

Installing Keda

```
$ helm repo add kedacore https://kedacore.github.io/charts
$ helm repo add kedacore https://kedacore.github.io/charts

$ kubectl create namespace keda
$ helm install keda kedacore/keda --namespace keda
```

Fission Specs basic example

```
$ fission spec init

Creating fission spec directory 'specs'

$ fission env create --name node --image fission/node-env --version 3 --poolsize 1 --spec

Saving Environment 'default/node' to 'specs/env-node.yaml'

$ fission pkg create --name hellojs --env node --code https://raw.githubusercontent.com/fission/fission/master/examples/nodejs/hello.js --spec

Downloading file to generate SHA256 checksum. To skip this step, please use --srcchecksum / --deploychecksum / --insecure
Saving Package 'default/hellojs' to 'specs/package-hellojs.yaml'

$ fission fn create --name hellojs --env node --pkg hellojs --spec

Saving Function 'default/hellojs' to 'specs/function-hellojs.yaml'

$ fission spec apply
DeployUID: ae0048b8-e94b-4a97-b93f-a434c566a4fc
Resources:
 * 1 Functions
 * 1 Environments
 * 1 Packages
 * 0 Http Triggers
 * 0 MessageQueue Triggers
 * 0 Time Triggers
 * 0 Kube Watchers
 * 0 ArchiveUploadSpec
Validation Successful
1 environment created: node
1 package created: hellojs
1 function created: hellojs
```