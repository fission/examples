# Tracing with Datadog using Fission & OpenTelemetry

Fission moved from OpenTracing Jaeger-formatted trace collection endpoint to OpenTelemetry since version 1.14.1.
OpenTelemetry provides a new tracing system that is powerful and flexible at the same time.
This sample application shows how you can send traces from Fission function to `Datadog` using `OpenTelemetry`.

<br>

## Pre Requisites

### Fission

You can refer to our [Fission Installation](https://fission.io/docs/installation/) guide for installing Fission.

You also need to configure `Fission` with `OpenTelemetry` to enable OpenTelemetry Collector that is reuqired to collect the trace.

```yaml
export FISSION_NAMESPACE=fission
helm install --namespace $FISSION_NAMESPACE \
fission fission-charts/fission-all \
--set openTelemetry.otlpCollectorEndpoint="otel-collector.opentelemetry-operator-system.svc:4317" \
--set openTelemetry.otlpInsecure=true \
--set openTelemetry.tracesSampler="parentbased_traceidratio" \
--set openTelemetry.tracesSamplingRate="1"

```

### OpenTelemetry Configuration

The OpenTelemetry Collector is a vendor agnostic agent that can send and receive metrics, traces to different tools in different formats.
In order to use it with Fission functions, we need to modify the `OpenTelemtry Collector` configuration as follows.

Make sure to update your `API KEY` in the following yaml configuration.

```yaml
...
...
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-conf
  labels:
    app: opentelemetry
    component: otel-collector-conf
data:
  otel-collector-config: |
    receivers:
      otlp:
        protocols:
          grpc:
          http:
    processors:
      batch:
        timeout: 10s
      k8sattributes:
    extensions:
      health_check: {}
      zpages: {}
    exporters:
      datadog:
        api:
          key: <YOUR_API_KEY>
    service:
      telemetry:
        logs:
          level: "DEBUG"
      extensions: [health_check, zpages]
      pipelines:
        metrics/2:
          receivers: [otlp]
          processors: [batch, k8sattributes]
          exporters: [datadog]
        traces/2:
          receivers: [otlp]
          processors: [batch, k8sattributes]
          exporters: [datadog]```
...
...
```

> Note: The complete yaml configuration that you need to apply for `OpenTelemetry` to work correctly can be found in the `optel-config.yaml` file.
> Use the command `kubectl apply -f optel-config.yaml` to apply the configuration.

<br>

### Datadog

You should have an active Datadog account. If you don't have one, you can register for a trial account [here](https://www.datadoghq.com/).

Once you have the account, you need to generate the `API KEY` to share trace data with Datadog.
To get that, navigate to `Personal Settings -> Security -> Application Keys`.
Click on `New Key` and generate a Key.
Note down the `API KEY` that will be used later.
<br>

### Environment Setup


#### Building Custom Python Environment

Using `Opentelemetry` SDK for Python requires certain C libraries and external linux kernel headers to be present in the Python environment for the `opentelemetry.exporter` to work correctly.
Please refer to [Fisson Python Environment](https://github.com/fission/environments/tree/master/python) and follow the steps to create a custom image.

In this case we need *linux-headers*.
For this you need to update the `Dockerfile` and append these two libraries in the `RUN` command.
It should look like this: `RUN apk add --update --no-cache gcc python3-dev build-base libev-dev libffi-dev bash linux-headers`.

Building the docker image for our custom Python environment. *(Replace the username with your actual username on Docker Hub.)*

``` dockerfile
docker build -t username/python-opentelemetry:latest --build-arg PY_BASE_IMG=3.7-alpine -f Dockerfile .
```

Pushing the docker image to Docker Hub registry:

``` dockerfile
docker push username/python-opentelemetry:latest
```

#### Source Package Setup

To create a source package you need to zip the source folder. Excecute the below command to generate the zips

```bash
./package.sh
```

> *Make sure that build.sh file is executable before you create the zip. Update the permissions using `chmod +x build.sh`*
  
<br>

## Steps

Create Fission environment:

```bash
fission env create --name pythonoptel --image username/python-opentelemetry --builder fission/python-builder:latest
```

Create source packages:

```bash
fission package create --name fissionoptel-pkg --sourcearchive sample.zip --env pythonoptel --buildcmd "./build.sh"
```
> Note: The package creation process can take a long time especially while building `grpcio`, so plesae be patient.
> You can check the progress of this using `stern`.
> In a new terminal window, execute `stern '.*' -n fission-builder` to see the status of package creation.

Create Fission function using the packages created above:

```bash
fission fn create --name optel --pkg fissionoptel-pkg --entrypoint "sample.main"
```

With this our custom Python environment is ready along with our Fission function.
Execute the function using `fission fn test --name optel` command
<br>

## Viewing The Traces on Datadog

To view the traces on Datadog, login to your **Datadog** dashboard and navigate to `APM -> Services` page.

The default view will show you service.
It will include `fission-router`, `fission-executor`, `fissin-sample-service`, `fission-fetcher` and our `fission-sample-service` service too.

Click on `Traces` option on the top of the page to view the traces.
If the function executed correctly, you will see the traces `fission-router`, `fission-executor`, `fissin-sample-service`, `fission-fetcher` in the list.
This means that we have correctly configured our fission function to send custom traces to `Datadog` using `Opentelemetry`.

That was a short tutorial on how to send traces from Fission function to Datadog using Datadog.
Similarly, you can use `Opentelemetry` with your Fission functions and send traces to other tools.

Tip: You can also create a [Fission Spec](https://fission.io/docs/usage/spec/) of all the commands.
<br>

### Spec Generation Commands

```bash
fission spec init
fission env create --name pythonoptel --image atulinfracloud/python-opentelemetry  --builder fission/python-builder:latest --spec
fission package create --name fissionoptel-pkg --sourcearchive sample.zip --env pythonoptel --buildcmd "./build.sh" --spec
fission fn create --name optel --pkg fissionoptel-pkg --entrypoint "sample.main" --spec
```

### Applying Specs

```bash
fission spec apply # Ensure you run package.sh first
```

Once the specs are applied, all the resources for the voting app will be created.