package main

import (
	"fmt"
	"net/http"
	"strconv"
	"time"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	t := r.URL.Query().Get("start-time")
	sec, err := strconv.ParseInt(t, 10, 64)
	if err != nil {
		w.Write([]byte(fmt.Sprint("failed to parse start-time", t, err)))
		return
	}
	w.Write([]byte(fmt.Sprint(start.Sub(time.Unix(sec, 0)).Seconds())))
}
