package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	sarama "github.com/IBM/sarama"
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

func produceMessage(ctx context.Context, count int) error {
	saramaConfig := getKafkaConfig()
	brokers, err := getConfigMapValue(kedaConfig, kedaConfigNs, BrokersKey)
	if err != nil {
		return fmt.Errorf("getting kafka brokers: %w", err)
	}
	requestTopic, err := getConfigMapValue(kedaConfig, kedaConfigNs, RequestTopicKey)
	if err != nil {
		return fmt.Errorf("getting kafka request topic: %w", err)
	}
	producer, err := sarama.NewSyncProducer([]string{string(brokers)}, saramaConfig)
	if err != nil {
		return fmt.Errorf("creating kafka producer: %w", err)
	}
	defer producer.Close()
	fmt.Println("Created a new producer ", producer)
	for msg := 1; msg <= count; msg++ {
		if ctx.Err() != nil {
			return ctx.Err()
		}
		ts := time.Now().Format(time.RFC3339)
		message := fmt.Sprintf("{\"message_number\": %d, \"time_stamp\": \"%s\"}", msg, ts)
		_, _, err = producer.SendMessage(&sarama.ProducerMessage{
			Topic: string(requestTopic),
			Value: sarama.StringEncoder(message),
		})

		if err != nil {
			return fmt.Errorf("publishing message to topic %s: %w", string(requestTopic), err)
		}
		time.Sleep(time.Second)
	}
	return nil
}

type RequestBody struct {
	Count int `json:"count"`
}

// Handler posts a message to Kafka Topic
func Handler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Read request body for messages to be produced
	body, err := io.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		fmt.Println("Error reading request body: ", err)
		http.Error(w, fmt.Sprintf("Error reading request body: %s", err), http.StatusInternalServerError)
		return
	}
	payload := RequestBody{}
	err = json.Unmarshal(body, &payload)
	if err != nil {
		fmt.Println("Error unmarshalling request body: ", err)
		http.Error(w, fmt.Sprintf("Error unmarshalling request body: %s", err), http.StatusBadRequest)
		return
	}
	err = produceMessage(ctx, payload.Count)
	if err != nil {
		fmt.Println("Error producing message: ", err)
		w.Write([]byte(fmt.Sprintf("Error producing message: %s", err)))
		return
	}
	msg := fmt.Sprintf("Produced %d messages successfully", payload.Count)
	fmt.Println(msg)
	w.Write([]byte(msg))
}
