# URL Shortener

URL shortener is a simple app built using Fission open-source serverless framework using MongoDB as the database. The application is built using Python.

## Application

This is a URL shotener application built using Python and Flask using Fission serverless framework. The app makes use of pyshorteners library for shortening of URLs.

### Flow

1. The user enters the url to be shortened from a web form.
2. This URL is sent to a fission function `shortenurl` which first checks in Mongo DB whether the long URL has already been shortened or not.
3. If it is already shortened, the function returns the URL from Mongo DB.
4. It the URL is not shortened, the function creates a new shortURL, adds it to MongoDB and returns the short URL.

## Folder Structure

This repo contains the following files and folders:

1. Backend: *backend code with `shortenurl.py`. Also contains `build.sh` which is required to create a Fission package.*
2. Frontend: *frontend code with `app.py`. Also contains `build.sh` which is required to create a Fission package.*
3. Package.sh: *bash script to create zip files required for creating Fission package.*

## Pre-requisites

1. Configure a Kubernetes cluster on any environment - *minikube, microk8s, AKS, GKE, EKS etc.*
2. [Install Fission](https://fission.io/docs/installation/) on the cluster and configure the Fission CLI.
3. Create a [Mongo DB account](https://www.mongodb.com) and configure a cluster. You can follow Mongo DB documentation to [create a new cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster/).
4. Configure the connection to Mongo DB for your application to get a connection string. Refer to Mongo DB documentation to [get connection string](https://www.mongodb.com/docs/atlas/troubleshoot-connection) for your application.

## Steps To Run This Example

Clone this repo and perform the following steps.

> Note: Make sure to update the MongoDB connection string in `shortenurl.py` with your MongoDB crednetials.

Create a Python environment

```bash
fission environment create --name python --image fission/python-env --builder fission/python-builder:latest
```

Create zip archives for backend and frontend by executing package.sh script

```bash
./package.sh
```

> Note: Make sure that the build.sh file is executable. You can do so by running `chmod +x build.sh`

Create Fission Packages

```bash
fission package create --name frontend-pkg --sourcearchive frontend.zip --env python --buildcmd "./build.sh"
fission package create --name backend-pkg --sourcearchive backend.zip --env python --buildcmd "./build.sh"
```

Create Fission Functions

```bash
fission fn create --name frontend --pkg frontend-pkg --entrypoint "app.main"
fission fn create --name backend --pkg backend-pkg --entrypoint "shortenurl.main"
```

Create Routes for Fission functions

```bash
fission route create --name frontend --method POST --method GET --url /main --function frontend
fission route create --name backend --method POST --url /shorturl --function backend
```

With this our custom Python environment is ready along with our Fission function. If you're running it on a Minikube cluster, you can run `kubectl port-forward svc/router 8888:80 -nfission` to access your app from your browser. Visit `http://localhost:8888/main` to access the application.
