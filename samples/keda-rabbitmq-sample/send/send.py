#!/usr/bin/env python
import pika

def main():

    credentials = pika.PlainCredentials('user', 'BAP2v54VY9')
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='my-release-rabbitmq.default.svc', port=5672, credentials=credentials))
    channel = connection.channel()

    channel.queue_declare(queue='hello')

    for n in range(1, 200):
        data = f"Message number {n}"
        channel.basic_publish(exchange='', routing_key='hello', body=data)
        print(" [x] Sent: "+data)

    connection.close()
    return "Messages Sent!"
