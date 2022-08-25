package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/nats-io/nats.go"
)

var (
	streamName          = "output"
	streamSubjects      = "output.response-topic"
	errStreamName       = "errorstream"
	errorstreamSubjects = "errorstream.error-topic"
)

// Handler is the entry point for this fission function
func Handler(w http.ResponseWriter, r *http.Request) { // nolint:unused,deadcode
	host := "nats://nats-jetstream.default.svc.cluster.local:4222"
	if host == "" {
		w.Write([]byte(string("consumer: received empty host field")))
		return
	}
	nc, err := nats.Connect(host)
	if err != nil {
		w.Write([]byte(string(err.Error())))
		return

	}

	js, err := nc.JetStream()
	if err != nil {
		w.Write([]byte(string(err.Error())))
		return
	}

	// handle error condition
	err = createStream(js, streamName, streamSubjects)
	if err != nil {
		w.Write([]byte(string(err.Error())))
		return
	}
	go consumerMessage(w, js, streamSubjects, streamName, "response_consumer")

	// handle error
	err = createStream(js, errStreamName, errorstreamSubjects)
	if err != nil {
		w.Write([]byte(string(err.Error())))
		return
	}
	go consumerMessage(w, js, errorstreamSubjects, errStreamName, "err_consumer")

	fmt.Println("All messages consumed")

}

func consumerMessage(w http.ResponseWriter, js nats.JetStreamContext, topic, stream, consumer string) (err error) {
	sub, err := js.PullSubscribe(topic, consumer, nats.PullMaxWaiting(512))
	if err != nil {
		w.Write([]byte(fmt.Sprintf("error occurred while consuming message:  %v", err.Error())))
		return
	}
	context.WithTimeout(context.Background(), time.Duration(15*time.Second))
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
				return fmt.Errorf("error occurred while closing connection %s", err.Error())
			}
			return
		default:
		}
		msgs, _ := sub.Fetch(10, nats.Context(ctx))
		for _, msg := range msgs {
			w.Write([]byte(fmt.Sprintf("Hello: %s", msg.Data)))
			msg.Ack()

		}
	}
	return nil
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
