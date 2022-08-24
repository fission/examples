package main

import (
	"io/ioutil"
	"net/http"
)

// Handler posts a message to Kafka Topic
func Handler(w http.ResponseWriter, r *http.Request) {

	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.Write([]byte("error while reading body"))
		return
	}
	w.Write([]byte(data))
}
