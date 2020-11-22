package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
)

func makeRequest(reqChan chan string, respChan chan float64) {
	for url := range reqChan {
		resp, err := http.Get(url + fmt.Sprint(time.Now().Unix()))
		if err != nil {
			panic(err)
		}
		defer resp.Body.Close()

		fmt.Println("Response status:", resp.Status)
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			panic(err)
		}
		val, err := strconv.ParseFloat(string(body), 64)
		if err != nil {
			panic(err)
		}
		fmt.Println(val)
		respChan <- val
	}
}

func main() {
	respChan := make(chan float64, 10)
	reqChan := make(chan string, 10)

	for i := 0; i < 10; i++ {
		go makeRequest(reqChan, respChan)
	}
	for i := 0; i < 10; i++ {
		time.Sleep(4 * time.Second)
		reqChan <- "http://localhost:8888/fission-function/since?start-time="
	}
	close(reqChan)
	var avg float64

	for i := 0; i < 10; i++ {
		avg += <-respChan
	}
	fmt.Println(avg / 10)
}
