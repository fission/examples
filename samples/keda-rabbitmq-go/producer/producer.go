package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	kedaSecret   = "keda-rabbitmq-secret"
	kedaSecretNs = "default"
	hostKey      = "host"
	queueNameKey = "queueName"
)

func getConfigMapValue(name string, namespace string, key string) ([]byte, error) {
	return os.ReadFile(fmt.Sprintf("/configs/%s/%s/%s", namespace, name, key))
}

func getSecretValue(name string, namespace string, key string) ([]byte, error) {
	return os.ReadFile(fmt.Sprintf("/secrets/%s/%s/%s", namespace, name, key))
}

func Handler(w http.ResponseWriter, r *http.Request) {
	host, err := getSecretValue(kedaSecret, kedaSecretNs, hostKey)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("%s", err)))
		return
	}

	conn, err := amqp.Dial(string(host))
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Failed to connecto rabbitmq %s", err)))
		return
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Failed to open a channel %s", err)))
		return
	}
	defer ch.Close()
	queueName, err := getSecretValue(kedaSecret, kedaSecretNs, queueNameKey)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Error getting queueName %s", err)))
		return
	}

	q, err := ch.QueueDeclare(
		string(queueName), // name
		false,             // durable
		false,             // delete when unused
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("Failed to declare a queue %s", err)))
		return
	}

	count := 10
	for msg := 1; msg <= count; msg++ {
		ts := time.Now().Format(time.RFC3339)
		message := fmt.Sprintf("{\"message_number\": %d, \"time_stamp\": \"%s\"}", msg, ts)
		err = ch.Publish(
			"",     // exchange
			q.Name, // routing key
			false,  // mandatory
			false,  // immediate
			amqp.Publishing{
				ContentType: "text/plain",
				Body:        []byte(message),
			})
		if err != nil {
			w.Write([]byte(fmt.Sprintf("Failed to publish message to topic %s: %v", queueName, err)))
			return
		}
	}
	w.Write([]byte(fmt.Sprintf("Published %d messages to topic %s", count, queueName)))
}
