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
		resp, err := http.Get(url)
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
	respChan := make(chan float64, 100)
	reqChan := make(chan string, 100)

	for i := 0; i < 5; i++ {
		go makeRequest(reqChan, respChan)
	}
	for i := 0; i < 100; i++ {
		time.Sleep(4 * time.Second)
		reqChan <- fmt.Sprintf("http://xyz.com/fission-function/since?start-time=%v", time.Now().Unix())
	}
	close(reqChan)
	var avg float64

	for i := 0; i < 100; i++ {
		avg += <-respChan
	}
	fmt.Println(avg / 100)
}
