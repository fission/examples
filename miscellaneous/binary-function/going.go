package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("Inside Go Ola!")
	fmt.Println("Arguments:", os.Args[1:])
}
