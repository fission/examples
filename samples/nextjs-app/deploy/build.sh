#!/bin/bash
set -euo pipefail

doit() {
  echo "@@@@ $@"
  "$@"
}

ENVIRONMENT=nodejs-nextjs-env:latest
doit docker build -t $ENVIRONMENT deploy/environment/ -f deploy/environment/Dockerfile-12.16
doit kind load docker-image $ENVIRONMENT

# doit docker push $ENVIRONMENT

doit npm install
doit npm run build
doit zip -r nextjs-source.zip app.js next.config.js package.json package.lock.json data/ pages/ public/ styles/ node_modules/ yarn.lock .next/

doit fission spec apply --specdir='./deploy/specs'
