#!/bin/sh
pip3 install ${SRC_PKG}/libloguru-0.7.2.tar.gz -t ${SRC_PKG}
pip3 install -r ${SRC_PKG}/requirements.txt -t ${SRC_PKG} && cp -r ${SRC_PKG} ${DEPLOY_PKG}