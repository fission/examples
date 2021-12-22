package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	sarama "github.com/Shopify/sarama"
)

const (
	BrokersKey      = "brokers"
	kedaConfig      = "keda-kafka-configmap"
	kedaConfigNs    = "default"
	RequestTopicKey = "request-topic"
)

func getConfigMapValue(name string, namespace string, key string) ([]byte, error) {
	return os.ReadFile(fmt.Sprintf("/configs/%s/%s/%s", namespace, name, key))
}

func getKafkaConfig() *sarama.Config {
	producerConfig := sarama.NewConfig()
	producerConfig.Producer.RequiredAcks = sarama.WaitForAll
	producerConfig.Producer.Retry.Max = 100
	producerConfig.Producer.Retry.Backoff = 100
	producerConfig.Producer.Return.Successes = true
	producerConfig.Version = sarama.V2_0_0_0
	return producerConfig
}

// Handler posts a message to Kafka Topic
func Handler(w http.ResponseWriter, r *http.Request) {
	saramaConfig := getKafkaConfig()

	brokers, err := getConfigMapValue(kedaConfig, kedaConfigNs, BrokersKey)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Error getting kafka brokers: %s", err)))
		return
	}
	requestTopic, err := getConfigMapValue(kedaConfig, kedaConfigNs, RequestTopicKey)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Error getting kafka request topic: %s", err)))
		return
	}
	producer, err := sarama.NewSyncProducer([]string{string(brokers)}, saramaConfig)
	fmt.Println("Created a new producer ", producer)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Error creating kafka producer: %s", err)))
		return
	}
	count := 10
	for msg := 1; msg <= count; msg++ {
		ts := time.Now().Format(time.RFC3339)
		message := fmt.Sprintf("{\"message_number\": %d, \"time_stamp\": \"%s\"}", msg, ts)
		_, _, err = producer.SendMessage(&sarama.ProducerMessage{
			Topic: string(requestTopic),
			Value: sarama.StringEncoder(message),
		})

		if err != nil {
			w.Write([]byte(fmt.Sprintf("Failed to publish message to topic %s: %v", "request-topic", err)))
			return
		}
		time.Sleep(time.Second)
	}
	w.Write([]byte(fmt.Sprintf("Published %d messages to topic %s", count, requestTopic)))
}
