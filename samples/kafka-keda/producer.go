package main

import (
	"fmt"
	"net/http"
	"time"

	sarama "github.com/Shopify/sarama"
)

// Handler posts a message to Kafka Topic
func Handler(w http.ResponseWriter, r *http.Request) {
	brokers := []string{"my-cluster-kafka-brokers.my-kafka-project.svc:9092"}
	producerConfig := sarama.NewConfig()
	producerConfig.Producer.RequiredAcks = sarama.WaitForAll
	producerConfig.Producer.Retry.Max = 100
	producerConfig.Producer.Retry.Backoff = 100
	producerConfig.Producer.Return.Successes = true
	producerConfig.Version = sarama.V1_0_0_0
	producer, err := sarama.NewSyncProducer(brokers, producerConfig)
	fmt.Println("Created a new producer ", producer)
	if err != nil {
		panic(err)
	}
	for msg := 1; msg <= 1000; msg++ {
		ts := time.Now().Format(time.RFC3339)
		message := fmt.Sprintf("{\"message_number\": %d, \"time_stamp\": \"%s\"}", msg, ts)
		_, _, err = producer.SendMessage(&sarama.ProducerMessage{
			Topic: "request-topic",
			Value: sarama.StringEncoder(message),
		})

		if err != nil {
			w.Write([]byte(fmt.Sprintf("Failed to publish message to topic %s: %v", "request-topic", err)))
			return
		}
	}
	w.Write([]byte("Successfully sent to request-topic"))
}
