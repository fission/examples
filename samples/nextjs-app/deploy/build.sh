#!/bin/bash
set -euo pipefail

doit() {
  echo "@@@@ $@"
  "$@"
}

# BUILDER=nodejs-nextjs-builder:latest
# ENVIRONMENT=nodejs-nextjs-env:latest
# doit docker build -t $BUILDER deploy/builder/ -f deploy/builder/Dockerfile-12.16
# doit docker build -t $ENVIRONMENT deploy/environment/ -f deploy/environment/Dockerfile-12.16

# doit kind load docker-image $BUILDER
# doit kind load docker-image $ENVIRONMENT

# doit docker push $BUILDER
# doit docker push $ENVIRONMENT

doit yarn install
doit npm run build
doit zip -r nextjs-source.zip app.js next.config.js package.json package.lock.json data/ pages/ public/ styles/ node_modules/ yarn.lock .next/

doit fission spec apply --specdir='./deploy/specs'
