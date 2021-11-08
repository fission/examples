package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	sarama "github.com/Shopify/sarama"
)

const (
	kafkaAuthModeNone            string = ""
	kafkaAuthModeSaslPlaintext   string = "plaintext"
	kafkaAuthModeSaslScramSha256 string = "scram_sha256"
	kafkaAuthModeSaslScramSha512 string = "scram_sha512"
	kedaSecret                          = "keda-kafka-secrets"
	kedaSecretNs                        = "default"
	kedaConfig                          = "keda-kafka-configmap"
	kedaConfigNs                        = "default"
	SaslKey                             = "sasl"
	UsernameKey                         = "username"
	PasswordKey                         = "password"
	TlsKey                              = "tls"
	BrokersKey                          = "brokers"
	RequestTopicKey                     = "request-topic"
)

func getConfigMapValue(name string, namespace string, key string) ([]byte, error) {
	return os.ReadFile(fmt.Sprintf("/configs/%s/%s/%s", namespace, name, key))
}

func getSecretValue(name string, namespace string, key string) ([]byte, error) {
	return os.ReadFile(fmt.Sprintf("/secrets/%s/%s/%s", namespace, name, key))
}

func getKafkaConfig() (*sarama.Config, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 100
	config.Producer.Retry.Backoff = 100
	config.Producer.Return.Successes = true
	config.Version = sarama.V2_0_0_0

	sasl, err := getSecretValue(kedaSecret, kedaSecretNs, SaslKey)
	if err != nil {
		return nil, err
	}
	saslConfig := string(sasl)
	if saslConfig == kafkaAuthModeSaslPlaintext {
		config.Net.SASL.Enable = true
		user, err := getSecretValue(kedaSecret, kedaSecretNs, UsernameKey)
		if err != nil {
			return nil, err
		}
		config.Net.SASL.User = string(user)
		password, err := getSecretValue(kedaSecret, kedaSecretNs, PasswordKey)
		if err != nil {
			return nil, err
		}
		config.Net.SASL.Password = string(password)
		config.Net.SASL.Handshake = true
	} else if saslConfig == kafkaAuthModeSaslScramSha256 || saslConfig == kafkaAuthModeSaslScramSha512 {
		return nil, fmt.Errorf("scram authentication is not supported yet")
	} else if saslConfig == kafkaAuthModeNone {
		fmt.Println("Kafka authentication is disabled")
	} else {
		return nil, fmt.Errorf("unknown authentication mode: %s", saslConfig)
	}
	tls, err := getSecretValue(kedaSecret, kedaSecretNs, TlsKey)
	if err != nil {
		return nil, err
	}
	tlsConfig := string(tls)
	if tlsConfig == "enable" {
		config.Net.TLS.Enable = true
	}
	return config, nil
}

func Handler(w http.ResponseWriter, r *http.Request) {
	saramaConfig, err := getKafkaConfig()
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Error getting kafka config: %s", err)))
		return
	}
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
	log.Println("Created a new producer ", producer)
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
			w.Write([]byte(fmt.Sprintf("Failed to publish message to topic %s: %v", requestTopic, err)))
			return
		}
	}
	w.Write([]byte(fmt.Sprintf("Published %d messages to topic %s", count, requestTopic)))
}
