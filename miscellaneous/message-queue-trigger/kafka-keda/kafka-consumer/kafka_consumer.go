package main

import (
	"io"
	"log"
	"net/http"
	"strings"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	b, err := io.ReadAll(r.Body)
	defer r.Body.Close()

	if err != nil {
		log.Println("Error reading request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}

	s := string(b)
	log.Println("Consumer", s)

	w.Write([]byte(strings.ToUpper(s)))
}
