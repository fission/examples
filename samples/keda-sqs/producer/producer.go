package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

type connection struct {
	region, queueURL             *string
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

	sess, err := session.NewSession(config)
	if err != nil {
		log.Panic("Error while creating session")
	}
	svc := sqs.New(sess)

	for i := 1; i <= 100; i++ {
		msg := fmt.Sprintf("message count %v", i+1)
		_, err := svc.SendMessage(&sqs.SendMessageInput{
			MessageBody: &msg,
			QueueUrl:    conn.queueURL,
		})
		if err != nil {
			w.Write([]byte(fmt.Sprintf("failed to send message to input queue: %v", err)))
			return
		}
	}
	w.Write([]byte("successfully sent message to input queue"))
}

func getConnetionDetails() (connection, error) {
	const (
		rPath = "/configs/default/queue-details/AWS_REGION"
		qPath = "/configs/default/queue-details/QUEUE_URL"
		iPath = "/secrets/default/aws-credentials/awsAccessKeyID"
		sPath = "/secrets/default/aws-credentials/awsSecretAccessKey"
	)

	region, err := ioutil.ReadFile(rPath)
	if err != nil {
		return connection{}, err
	}

	url, err := ioutil.ReadFile(qPath)
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
		queueURL:        aws.String(string(url)),
		accessKeyID:     string(keyID),
		secretAccessKey: string(secret),
	}, nil
}
