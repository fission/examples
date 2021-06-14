#!/bin/sh
cd ${SRC_PKG}
npm install 
npm run build
echo ${SRC_PKG} ${DEPLOY_PKG}
cp -r -v ${SRC_PKG} ${DEPLOY_PKG}
