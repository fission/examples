#!/bin/bash
set -euo pipefail

doit() {
  echo "@@@@ $@"
  "$@"
}

doit npm install
doit npm run build
doit zip -r nextjs-source.zip app.js next.config.js package.json \
  package.lock.json data/ pages/ public/ \
  styles/ node_modules/ yarn.lock .next/

doit fission spec apply --specdir='./deploy/specs'
