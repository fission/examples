# Voting App

The Voting App demostrates how you can create a Fission function to connect to a relational database like Postgres and perform SQL operations.

## Pre Requisites

### Fission

You can refer to our [Fission Installation](https://fission.io/docs/installation/) guide for installing Fission.

### PostgreSQL

You must also have a PostgreSQL instance in place.

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

#### Building Custom Python Environment

Using PostgreSQL with Fission requires certain non-standard libraries and Python modules that require c extension to be present in the Python environment.
Please refer to [Fisson Python Environment](https://github.com/fission/environments/tree/master/python) and follow the steps to create a custom image.

In this case we need extra libraries like *postgresql-dev and libpq*.
For this you need to update the `Dockerfile` and append these two libraries in the `RUN` command.
It should look like this: `RUN apk add --update --no-cache gcc python3-dev build-base libev-dev libffi-dev bash musl-dev postgresql-dev libpq`.

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

To create a source package you need to zip `backend` and `frontend` folders. Excecute the below command to generate the zips

```bash
./package.sh
```

> *Make sure that build.sh file is executable before you create the zip. Update the permissions using `chmod +x build.sh`*
  
<br>

## Steps

Create Fission environment:

```bash
fission env create --name pythonsrc --image username/python-postgres --builder fission/python-builder:latest
```

Create source packages:

```bash
fission package create --name backend-pkg --sourcearchive backend.zip --env pythonsrc --buildcmd "./build.sh"
fission package create --name frontend-pkg --sourcearchive frontend.zip --env pythonsrc
```

Create Fission function using the packages created above:

```bash
fission fn create --name backend --pkg backend-pkg --entrypoint "backend.main"
fission fn create --name frontend --pkg frontend-pkg --entrypoint "frontend.main"
```

Create Route for the functions:

```bash
fission route create --name backend --method POST --url /castvote --function backend
fission route create --name frontend --method POST --method GET --url /voteapp --function frontend
```

With this our custom Python environment is ready along with our Fission function.
You can run `kubectl port-forward svc/router 8888:80 -nfission` to access your app from your browser.

Visit `http://localhost:8888/voteapp` to see the result.

<br>

That was a short tutorial on how to use Fission function with a database.

<br>
<br>

Tip: You can also create a [Fission Spec](https://fission.io/docs/usage/spec/) of all the commands.

### Spec Generation Commands

```bash
fission spec init
fission env create --name pythonsrc --image python-postgres --builder fission/python-builder:latest --spec
fission package create --name backend-pkg --sourcearchive backend.zip --env pythonsrc --buildcmd "./build.sh" --spec
fission fn create --name backend --pkg backend-pkg --entrypoint "backend.main" --spec
fission route create --name backend --method POST --url /castvote --function backend --spec
fission package create --name frontend-pkg --sourcearchive frontend.zip --env pythonsrc --spec
fission fn create --name frontend --pkg frontend-pkg --entrypoint "frontend.main" --spec
fission route create --name frontend --method POST --method GET --url /voteapp --function frontend --spec
```

### Applying Specs

```bash
fission spec apply # Ensure you run package.sh first
```

Once the specs are applied, all the resources for the voting app will be created.