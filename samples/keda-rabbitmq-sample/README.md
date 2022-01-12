# Fission RabbitMQ Keda Sample - Python

## Steps :

1. Install RabbitMQ on K8s using HELM
`helm install my-release bitnami/rabbitmq`

2. Get the username and password to connect to RabbitMQ - *refer to details presented after helm install*

3. Note the service uri to connect to from code, default port: 5672 (*Eg.: my-release-rabbitmq.default.svc*)

4. Connect to UI portal on localhost, forward the port to localhost and connect using the credentials obtained above (*http://localhost:15672*)

5. Create the sender and receiver code basis the documentation present [here](https://www.rabbitmq.com/tutorials/tutorial-one-python.html)
*Create zip file for `send` & `receive`, make sure build.sh is executable (`chmod +x build.sh`)*

6. Check the individual fission functions by sending and receiving the messages, validate the same on the web portal.

7. Create the trigger with the metadata params (*refer to [Keda RabbitMQ docs](https://keda.sh/docs/2.5/scalers/rabbitmq-queue/) for various metadata params*)

```bash
fission mqt create --name rabbitmqtest --function receive --mqtype rabbitmq --mqtkind keda --topic hello --resptopic response-topic --errortopic error-topic --maxretries 3 --metadata host="amqp://dXNlcg==:YW1xcDovL3VzZXI6QkFQMnY1NFZZOUBteS1yZWxlYXNlLXJhYmJpdG1xLmRlZmF1bHQuc3ZjOjU2NzIvdmhvc3QK@my-release-rabbitmq.default.svc:5672/" --metadata queueName="hello" --metadata protocol="amqp" --metadata mode="QueueLength" --metadata value="3" --secret keda-rabbitmq-secret
```

> The `host URI` needs to be encoded using base64 and needs to be in the format `amqp://[username]:[password]@[host]:[port]`

## References:

- [Keda-Rabbitmq Sample](https://github.com/fission/examples/tree/master/samples/keda-rabbitmq) - by Vishal

- [Understanding Kubernetes HPA](https://medium.com/geekculture/understanding-kubernetes-hpa-with-keda-and-rabbitmq-4bf87216606b)