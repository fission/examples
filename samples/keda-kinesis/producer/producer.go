package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/kinesis"
)

type message struct {
	Content string `json:"content"`
}

type connection struct {
	region                       *string
	accessKeyID, secretAccessKey string
}

func Handler(w http.ResponseWriter, r *http.Request) {
	conn, err := getConnetionDetails()
	if err != nil {
		w.Write([]byte(fmt.Sprintf("error getting the aws connection details: %v", err)))
		return
	}

	config := &aws.Config{
		Region:      conn.region,
		Credentials: credentials.NewStaticCredentials(conn.accessKeyID, conn.secretAccessKey, ""),
	}

	s, err := session.NewSession(config)
	if err != nil {
		w.Write([]byte(fmt.Sprintf("error creating a session: %v", err)))
		return
	}

	kc := kinesis.New(s)
	for i := 11; i <= 20; i++ {
		record, err := json.Marshal(&message{
			Content: fmt.Sprintf("message count %v", i+1),
		})

		if err != nil {
			w.Write([]byte(fmt.Sprintf("error marshalling the message: %v", err)))
			return
		}
		params := &kinesis.PutRecordInput{
			Data:         record,                      // required
			PartitionKey: aws.String(strconv.Itoa(i)), // required
			StreamName:   aws.String("request"),       // required
		}
		_, err = kc.PutRecord(params)
		if err != nil {
			w.Write([]byte(fmt.Sprintf("error putting a record: %v", err)))
			return
		}
	}
	w.Write([]byte("messages sent successfully"))
}

func getConnetionDetails() (connection, error) {
	const (
		rPath = "/configs/default/stream-details/AWS_REGION"
		iPath = "/secrets/default/aws-credentials/awsAccessKeyID"
		sPath = "/secrets/default/aws-credentials/awsSecretAccessKey"
	)

	region, err := ioutil.ReadFile(rPath)
	if err != nil {
		return connection{}, err
	}

	keyID, err := ioutil.ReadFile(iPath)
	if err != nil {
		return connection{}, err
	}

	secret, err := ioutil.ReadFile(sPath)
	if err != nil {
		return connection{}, err
	}
	return connection{
		region:          aws.String(string(region)),
		accessKeyID:     string(keyID),
		secretAccessKey: string(secret),
	}, nil
}
