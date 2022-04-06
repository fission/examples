# Fission Zapier Webhook Integration

Application to show how to integrate Fission function with Zapier Webhook. It takes a few details from the user, passes it to a zapier Webhook url which triggers a Zap to dump the data into Google Sheets.

The application is written in Python & uses along with standard Python libraries.

## Pre-Requisites

You will need a valid Zapier Account (*paid or trial version as Webhooks are NOT supported in free version*) and a Google Account

### Setting Up A Zap
  
1. Create an account on Zapier.com
2. Follow [these steps](https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks#add-a-webhook-trigger) to create a **Zapier Webhook Trigger**
3. Send some dummy data to the webhook url that you get to check if it is receiving data or not
4. Create an **Action** using **Google Sheets** It will ask you to provide access to Zapier which you must approve
5. Create a new Google Sheet and name three columns - `name`, `email` and `itemOrdered` - in the top row
6. It will auto detect the columns from the sheet and ask you to map the arguments from webhook to these
7. Choose the correct fields and turn on the Zap. Your zap is ready.

## Deploying The Application

You can clone this repository to create this application.

`main.py` is the file which does all the work. Make sure to update the `webhook_url` with the actual Zapier webhook url that you get

## Steps to Execute

Create a Python environment

```bash
fission environment create --name python --image fission/python-env --builder fission/python-builder:latest
```

Create a zip archive as sample.zip archive by executing package.sh script

```bash
./package.sh
```

Create a Package

```bash
fission package create --name fissionzapier-pkg --sourcearchive sample.zip --env python
```

Create the fission function

```bash
fission fn create --name pawesome --pkg fissionzapier-pkg --entrypoint "main.main" 
```

Create a Route

```bash
fission route create --name pawesome --method POST --method GET --prefix /pawesome --function pawesome
```

## Test and Execute

Port forward the service to access it from browser

```bash
kubectl port-forward svc/router 8888:80 -nfissionouter 8888:80 -nfission
```

Navigate to `http://127.0.0.1:8888/pawesome` to access the application.
Choose any product and click on Place Order.
In the dialog box, enter your `name` and `email id` *rest can be ignored* and click on Submit.
You should see `Order Placed Successfully` dialog box.
Open the Google Sheet that you had created, you should see a new row added with the name, email id and itemOrdered.

## Fission Spec

```bash
fission spec init
fission environment create --name python --image fission/python-env --builder fission/python-builder:latest --spec
fission package create --name fissionzapier-pkg --sourcearchive sample.zip --env python--spec
fission fn create --name pawesome --pkg fissionzapier-pkg --entrypoint "main.main"  --spec
fission route create --name pawesome --method POST --method GET --prefix /pawesome --function pawesome --spec
```
