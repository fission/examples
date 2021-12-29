# Voting App

The votingapp demostrates how you can create a Fission function to connect to a relational database like Postgres and perform SQL operations.
This is a basic app to help you understand how you can leverage Fission functions for working with databases.

## Pre Requisites

### Installing PostgreSQL

Before you start working on this demo, you need to ensure that you have Fission installed and running on your system.
You can refer to our [Fission Installation](https://fission.io/docs/installation/) guide for more.
Further, this example uses PostgreSQL hence you must also have a PostgreSQL instance in place.
You can either run it on your system locally, in a docker container or your Kubernetes cluster.

Below are few guides you can refer to for installing PostgreSQL:

- Installing Postgres SQL on your local system - <a href="https://www.postgresql.org/download/" target="_blank">Postgresql.org</a>
- Postgres Docker container - <a href="https://hub.docker.com/_/postgres" target="_blank">Docker Hub</a>
- Postgres HELM charts - <a href="https://bitnami.com/stack/postgresql/helm" target="_blank">Bitnami</a>
  
<br>

> *Note: If you have installed it using Helm Charts, please ensure to note down the service url and port number. 
> This will be used to connect to the database from the function. You can get it by running  `helm status postgresql` in your terminal.*

<br>

#### Database and Table Setup

For this example, we have created a database named `votedb` and a table named `votebank`. You can use the following `sql` query to create the table

``` sql
 CREATE TABLE votebank (
     id serial PRIMARY KEY,
     voter_id VARCHAR ( 50 )  NOT NULL,
     vote VARCHAR ( 50 ) NOT NULL
    );
```

### Environment Setup

<br>

#### Python Environment setup

Using PostgreSQL with Fission requires certain non-standard libraries and Python modules that require c extension to be present in the Python environment.
For that you need to create a custom Python image.
To do this you can refer to [Fisson Python Environment](https://github.com/fission/environments/tree/master/python) and follow the steps to create a custom image.

In this case we need extra libraries like *postgresql-dev and libpq*. For this you need to update the `Dockerfile` and append these two libraries  in the `RUN` command.
It should look like this: `RUN apk add --update --no-cache gcc python3-dev build-base libev-dev libffi-dev bash musl-dev postgresql-dev libpq`.
After this create a docker image and push it to your Docker hub repository.

<br>

Building the docker image for our custom Python environment. *(Replace the username with your actual username on Docker Hub.)*

``` dockerfile
docker build -t username/python-postgres:latest --build-arg PY_BASE_IMG=3.7-alpine -f Dockerfile .
```

Pushing the docker image to Docker Hub registry:

``` dockerfile
docker push username/python-postgres:latest
```

#### Source Package Setup

Since we require external libraries for this example, we need to create a source package of our code.
In order to do that, you need to create a folder `Worker` and create the following files:

- `build.sh` - contains commands to setup the environment by installing required libraries
- `requirements.txt` - contains the Python modules that are required to run the code
- `db-worker.py` - Fission function
- `___init__.py` - standard Python init file

> *Make sure that build.sh file is executable. Update the permissions using `chmod +x build.sh`*
  
Create a `.zip` file of all the above files and name it `dbworker.zip`.

<br>

## Steps

We start by creating a new fission environment using the custom Python image we created in the earler step.

```bash
fission env create --name pythonsrc --image username/python-postgres --builder fission/python-builder:latest
```

Once the environment is ready, we create a new Fission source package that will be used to deploy our Fission function.

```bash
fission package create --sourcearchive dbworker.zip --env pythonsrc --buildcmd "./build.sh"
```

Note down the name of the Fission package being created.
It will be something like `dbworker-zip-xjax`

Creating our Fission function by using the source package created in the above step.

```bash
fission fn create --name dbworkernew --pkg dbworker-zip-xjax --entrypoint "db-worker.main"
```

Now that our function is deployed, we need a route to allow it to be executed.
Since we are going to use`HTTP POST` we need to create a `[POST]` route.
To do that we execute the following command:

```bash
fission route create --method POST --url /castvote --function dbworkernew
```

With this our custom Python environment is ready along with our Fission function.
Run `index.py` and cast your vote. When you cast your vote, the request will be handled by the `dbworkernew` fission function which will connect with the PostgreSQL database, update the table and return the values.

You can also use `CURL` to test the function.
In order to do that, you'll first need to forward the route to a port on your localhost.
To do that, you need to run `kubectl port-forward svc/router 8888:80 -nfission` in your terminal.
This will allow you to access port 8888 from your local system.

Send the following CURL request to check whether the function is working as expected or not:

```bash
curl -XPOST "localhost:8888/castvote" -H 'Content-Type: application/json' -d '{"vote":"a";"voter_id":"afdad"}'
```

> You can also use Postman to check the function by sending a POST request.

<br>

That was a short tutorial on how to use Fission function with a database. So what side are you on Mountains or Beaches? ;)