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

	s := string(b)
	log.Println("Consumer", s)

	w.Write([]byte(strings.ToUpper(s)))
}
