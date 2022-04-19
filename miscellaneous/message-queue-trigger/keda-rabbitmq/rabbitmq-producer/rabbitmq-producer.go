package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/streadway/amqp"
)

// Handler posts a message to RabbitMQ Channel
func Handler(w http.ResponseWriter, r *http.Request) {
	var rabbit_host = os.Getenv("RABBIT_HOST")
	var rabbit_port = os.Getenv("RABBIT_PORT")
	var rabbit_user = os.Getenv("RABBIT_USERNAME")
	var rabbit_password = os.Getenv("RABBIT_PASSWORD")

	conn, err := amqp.Dial("amqp://" + rabbit_user + ":" + rabbit_password + "@" + rabbit_host + ":" + rabbit_port + "/")
	if err != nil {
		log.Fatalf("%s: %s", "Failed to connect to RabbitMQ", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("%s: %s", "Failed to open a channel", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"publisher", // name
		true,        // durable
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,         // arguments
	)
	if err != nil {
		log.Fatalf("%s: %s", "Failed to declare a queue", err)
	}

	if err != nil {
		log.Printf("Error reading body: %v", err)
		http.Error(w, "can't read body", http.StatusBadRequest)
		return
	}

	for msg := 1; msg <= 10; msg++ {
		ts := time.Now().Format(time.RFC3339)
		message := fmt.Sprintf("{\"message_number\": %d, \"time_stamp\": \"%s\"}", msg, ts)

		err = ch.Publish(
			"",     // exchange
			q.Name, // routing key
			false,  // mandatory
			false,  // immediate

			amqp.Publishing{
				ContentType: "text/plain",
				Body:        []byte(string(message)),
			})

		if err != nil {
			log.Fatalf("%s: %s", "Failed to publish a message in a queue", err)
		}
	}

	w.Write([]byte("Successfully sent to RabbitMQ"))
}
