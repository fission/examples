#!/bin/sh
apk update && apk add gcc python3-dev

if [ -f ${SRC_PKG}/requirements.txt ]
then 
    pip3 install -r ${SRC_PKG}/requirements.txt -t ${SRC_PKG}
fi
cp -r ${SRC_PKG} ${DEPLOY_PKG}