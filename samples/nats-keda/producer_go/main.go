package main

import (
	"log"
	"net/http"
	"strconv"

	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	nc, err := nats.Connect("nats://nats.fission:4222")
	if err != nil {
		log.Fatal(err)
	}
	sc, err := stan.Connect("test-cluster", "stan-sub", stan.NatsConn(nc))
	if err != nil {
		log.Fatal(err)
	}
	for i := 100; i < 200; i++ {
		sc.Publish("request", []byte("Test"+strconv.Itoa(i)))
	}

	select {}
}
