package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/nats-io/nats.go"
)

const (
	streamName     = "input"
	streamSubjects = "input.*"
	subjectName    = "input.created"
)

// Handler is the entry point for this fission function
func Handler(w http.ResponseWriter, r *http.Request) { // nolint:unused,deadcode
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body",
			http.StatusInternalServerError)
	}
	results := string(body)
	fmt.Println(results)
	// Connect to NATS
	host := "nats://nats-jetstream.default.svc.cluster.local:4222"
	if host == "" {
		log.Fatal("mqtrigger: received empty host field")
	}
	nc, err := nats.Connect(host)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("error connecting to host:  %v", err.Error())))
		return
	}
	// Creates JetStreamContext
	js, err := nc.JetStream()
	if err != nil {
		w.Write([]byte(fmt.Sprintf("error getting context:  %v", err.Error())))
		return
	}
	// Creates stream
	err = createStream(js)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("error create stream:  %v", err.Error())))
		return
	}
	// Create records by publishing messages
	err = publishdata(w, js)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("error in publishing stream:  %v", err.Error())))
		return
	}
	fmt.Println("Published all the messages")

	w.Write([]byte("Successfully sent to request-topic"))
	// select {}
}

// publishdata publishes data to input stream
func publishdata(w http.ResponseWriter, js nats.JetStreamContext) error {

	no, err := strconv.Atoi(os.Getenv("COUNT"))
	if err != nil {
		log.Println("invalid count provided. Err: ", err)
		no = 3
		return nil
	}
	for i := 1; i <= no; i++ {
		_, err := js.Publish(subjectName, []byte("Test"+strconv.Itoa(i)))
		if err != nil {
			log.Println("Error found: ", err)
			return err
		}
		w.Write([]byte(fmt.Sprintf("Order with OrderID:%d has been published\n", i)))
	}
	return nil
}

// createStream creates a stream by using JetStreamContext
func createStream(js nats.JetStreamContext) error {
	stream, err := js.StreamInfo(streamName)
	if err != nil {
		log.Println(err)
	}
	if stream == nil {
		log.Printf("creating stream %q and subjects %q", streamName, streamSubjects)
		_, err = js.AddStream(&nats.StreamConfig{
			Name:     streamName,
			Subjects: []string{streamSubjects},
		})
		if err != nil {
			return err
		}
	}
	return nil
}
