#!/bin/sh

set -e

kubectl apply -f redis.yaml

if [ -z "$FISSION_URL" ]
then
    echo "Need $FISSION_URL set to a fission controller address"
    exit 1
fi

# Create python env if it doesn't exist
fission env get --name python || fission env create --name python --image python-fastapi-env --builder python-fastapi-builder

# Create zip file
zip -jr guestbook.zip ../guestbook

# Create packages
fission package create --name guestbook --sourcearchive guestbook.zip --env python --buildcmd "./build.sh"

# Register functions and routes with fission
fission function create --name guestbook-get --env python --pkg guestbook --entrypoint "get.main" --url /guestbook --method GET
fission function create --name guestbook-add --env python --pkg guestbook --entrypoint "add.main" --url /guestbook --method POST
