#!/usr/bin/env python
import pika
import sys
import os


""" def main():
    credentials = pika.PlainCredentials('user', 'BAP2v54VY9')
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='my-release-rabbitmq.default.svc', port=5672, credentials=credentials))
    channel = connection.channel()
    channel.exchange_declare(exchange='topic_logs', exchange_type='topic')

    result = channel.queue_declare('hello', exclusive=True)
    queue_name = result.method.queue

    binding_keys = sys.argv[1:]
    if not binding_keys:
        sys.stderr.write("Usage: %s [binding_key]...\n" % sys.argv[0])
        sys.exit(1)

    for binding_key in binding_keys:
        channel.queue_bind(
            exchange='topic_logs', queue=queue_name, routing_key=binding_key)

    print(' [*] Waiting for logs. To exit press CTRL+C')

    def callback(ch, method, properties, body):
        print(" [x] %r:%r" % (method.routing_key, body))

    channel.basic_consume(
        queue=queue_name, on_message_callback=callback, auto_ack=True)

    channel.start_consuming()
    return "Received" """


def main():
    credentials = pika.PlainCredentials('user', 'BAP2v54VY9')
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='my-release-rabbitmq.default.svc', port=5672, credentials=credentials))
    channel = connection.channel()
    channel.queue_declare(queue='hello')

    print("****starting receive....")
 
    def callback(ch, method, properties, body):
        print(" [x] Received %r" % body)

    channel.basic_consume(queue='hello', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
