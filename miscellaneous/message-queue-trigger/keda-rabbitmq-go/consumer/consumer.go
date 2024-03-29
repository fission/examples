package main

import (
	"io"
	"log"
	"net/http"
	"strings"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	b, _ := io.ReadAll(r.Body)
	defer r.Body.Close()

	log.Println("Received message", string(b))
	s := string(b)

	w.Write([]byte(strings.ToUpper(s)))
}
