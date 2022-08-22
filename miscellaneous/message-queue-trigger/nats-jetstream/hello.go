package main

import (
	"fmt"
	"io"
	"net/http"
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
	_, err = w.Write([]byte("Hello " + results))
	if err != nil {
		http.Error(w, "Error writing response", http.StatusInternalServerError)
	}
}

// ErrorHandler is the entry point for this fission function
func ErrorHandler(w http.ResponseWriter, r *http.Request) { // nolint:unused,deadcode

	http.Error(w, "Error reading request body", http.StatusBadRequest)
}
