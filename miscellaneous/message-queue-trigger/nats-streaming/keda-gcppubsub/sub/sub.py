from concurrent.futures import TimeoutError
from google.cloud import pubsub_v1
import os

path = os.path.dirname(os.path.realpath(__file__))

# GCP Credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=path+"/fissiongcppubsub-a20c7e064897.json"

# Project and Topic Ids
project_id = "fissiongcppubsub"
topic_id = "request-topic"
subscription_id = "request-topic-sub"

# Number of seconds the subscriber should listen for messages
timeout = 5.0

subscriber = pubsub_v1.SubscriberClient()
# The `subscription_path` method creates a fully qualified identifier
# in the form `projects/{project_id}/subscriptions/{subscription_id}`
subscription_path = subscriber.subscription_path(project_id, subscription_id)

def callback(message: pubsub_v1.subscriber.message.Message) -> None:
    print(f"Received {message}.")
    message.ack()

def main():
    streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
    print(f"Listening for messages on {subscription_path}..\n")

    # Wrap subscriber in a 'with' block to automatically call close() when done.
    with subscriber:
        try:
            # When `timeout` is not set, result() will block indefinitely,
            # unless an exception is encountered first.
            streaming_pull_future.result(timeout=timeout)
        except TimeoutError:
            streaming_pull_future.cancel()  # Trigger the shutdown.
            streaming_pull_future.result()  # Block until the shutdown is complete.
    return "done"