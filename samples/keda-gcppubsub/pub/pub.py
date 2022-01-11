from google.cloud import pubsub_v1
import os

path = os.path.dirname(os.path.realpath(__file__))

# GCP Credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=path+"/fissiongcppubsub-a20c7e064897.json"

# Project and Topic Ids
project_id = "fissiongcppubsub"
topic_id = "request-topic"

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_id)

def main():

    for n in range(1, 100):
        data = f"Message number {n}"
        # Data must be a bytestring
        data = data.encode("utf-8")
        # When you publish a message, the client returns a future.
        future = publisher.publish(topic_path, data)
        print(future.result())

    print(f"Published messages to {topic_path}.")

    return "Messages Published!"