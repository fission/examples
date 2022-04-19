# Chrome Headless in a Fission function

Running chrome headless is useful for various test automation tasks but running a headless Chrome in Docker can be tricky ([More details here](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker)). Also the [this Github issue](https://github.com/puppeteer/puppeteer/issues/3994#issuecomment-524396092) has some good insights on the issues you might face

This examples shows running headless chrome in a fission function.

## Running

If you simply want to get a sense of running function run `fission spec apply` and then then test the function

```
$ fission spec apply
DeployUID: 0e8b177b-19bd-4e97-80b7-42f1f3801ed8
Resources:
 * 1 Functions
 * 1 Environments
 * 1 Packages
 * 0 Http Triggers
 * 0 MessageQueue Triggers
 * 0 Time Triggers
 * 0 Kube Watchers
 * 1 ArchiveUploadSpec
Validation Successful
1 environment updated: node-chrome
1 function updated: chrome
```

The test gives out Google homepage content as a response:

```
$ fission fn test --name chrome

<!DOCTYPE html><html itemscope="" itemtype="http://schema.org/WebPage" lang="en-IN"><head><meta charset="UTF-8"><meta content="/images/branding/googleg/1x/googleg_standard_color_128dp.png" itemprop="image"><title>Google</title><script src="https://apis.google.com/_/scs/abc-static/_/js/k=gapi.gapi.en.lqqPe8Y-aUs.O/m=gapi_iframes,googleapis_client/rt=j/sv=1/d=1/ed=1/rs=AHpOoo_7ZBgzLryveB2qtYoSqeBQ4P-TYA/cb=gapi.loaded_0" nonce="GSIA5d0Gka6XrtwFCPVCrg==" async=""></script><script nonce="GSIA5d0Gka6XrtwFCPVCrg==">(function(){window.google={kEI:'lmY2X4L-AoOW4-EPxPiykAY',kEXPI:'31',kBL:'tCe1'};google.sn='webhp';google.kHL='en-IN';})();(function(){google.lc=[];google.li=0;google.getEI=function(a)
```

## Working

### Building a custom image

The stock Fission image does not have Chromium built in and we use a modified base image. Change to `headless-chrome-env` directory and build the custom image.

```
 $ docker build -t vishalbiyani/node-chrome:1 .

 $ docker push vishalbiyani/node-chrome:1
 
```
Or simply add this section to Dockerfile of [NodeJS](https://github.com/fission/environments/tree/master/nodejs) environment, build a new image and keep it ready. We will use this custom image to create environments later.

```
# Needed for chromium
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN yarn add puppeteer@1.19.0
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

USER pptruser
```

### Creating env & function with source code

Initialize the specs

```
$ fission spec init
```

Creating the env and function specs & apply. Note that we are using a custom image `--image vishalbiyani/node-chrome:1` for headless chromium.

```
$ fission env create --name node-chrome --image --image vishalbiyani/node-chrome:1 --builder fission/node-builder --spec

$ fission fn create --name chrome --env node-chrome --src hello.js --src package.json --entrypoint hello --spec

$ fission spec apply 
```

We have to wait for package building to be successful, and if fails, please rebuild once again:

```
$ fission package rebuild --name chrome-76a831d5-107c-4d09-a4fa-a1d2fab770e8

$ fission package list
NAME                                        BUILD_STATUS ENV         LASTUPDATEDAT
chrome-76a831d5-107c-4d09-a4fa-a1d2fab770e8 succeeded    node-chrome 14 Aug 20 15:52 IST

```

Finally the test:

```
$ fission fn test --name chrome

<!DOCTYPE html><html itemscope="" itemtype="http://schema.org/WebPage" lang="en-IN"><head><meta charset="UTF-8"><meta content="/images/branding/googleg/1x/googleg_standard_color_128dp.png" itemprop="image"><title>Google</title><script src="https://apis.google.com/_/scs/abc-static/_/js/k=gapi.gapi.en.
```