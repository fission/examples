package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/nats-io/nats.go"
)

var (
	streamName          = "output"
	streamSubjects      = "output.response-topic"
	errStreamName       = "errorstream"
	errorstreamSubjects = "errorstream.error-topic"
)

func main() {
	// Connect to NATS

	host := os.Getenv("NATS_SERVER")
	if host == "" {
		log.Fatal("consumer: received empty host field")
	}
	nc, _ := nats.Connect(host)
	js, err := nc.JetStream()
	if err != nil {
		log.Fatal(err)
	}

	// handle error condition
	createStream(js, streamName, streamSubjects)
	go consumerMessage(js, streamSubjects, streamName, "response_consumer")

	// handle error
	createStream(js, errStreamName, errorstreamSubjects)
	consumerMessage(js, errorstreamSubjects, errStreamName, "err_consumer")

	fmt.Println("All messages consumed")

}

func consumerMessage(js nats.JetStreamContext, topic, stream, consumer string) {
	sub, err := js.PullSubscribe(topic, consumer, nats.PullMaxWaiting(512))
	if err != nil {
		fmt.Printf("error occurred while consuming message:  %v", err.Error())
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt)

	for {
		select {
		case <-signalChan:
			ctx.Done()
			err = sub.Unsubscribe()
			if err != nil {
				log.Println("error in unsubscribing: ", err)
			}
			err = js.DeleteConsumer(stream, consumer)
			if err != nil {
				fmt.Errorf("error occurred while closing connection %s", err.Error())
			}
			return
		default:
		}
		msgs, _ := sub.Fetch(10, nats.Context(ctx))
		for _, msg := range msgs {
			fmt.Println(string(msg.Data))
			msg.Ack()

		}
	}

}

// createStream creates a stream by using JetStreamContext
func createStream(js nats.JetStreamContext, streamName string, streamSubjects string) error {
	stream, _ := js.StreamInfo(streamName)

	if stream == nil {

		_, err := js.AddStream(&nats.StreamConfig{
			Name:     streamName,
			Subjects: []string{streamSubjects},
		})
		if err != nil {
			log.Println("Error: ", err)
			return err
		}
	}
	return nil
}
