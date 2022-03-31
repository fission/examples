# Twitter Bot

This sample application shows how you can create a Twitter bot to interact with users on Twitter. This is a basic application to showcase the use case, you can build on top of this and automate your Twitter interactions using Fission functions.

## Application

The sample application is a simple Twitter bot to help you interact with users on Twitter. The app uses **Twitter API** to interact with Twitter. It looks for tweets that mention you and replies to every tweet with a predefined message. After responding to each tweet, the app sends a message to a **Slack Workspace** using a webhook url.

The application is written in Python, uses **Tweepy** and **Slack SDK** along with standard Python libraries.

## Pre-Requisites

Since the application is about creating a Twitter bot and using Slack, you need to create an app on Twitter and on Slack.

### Setting Up Twitter App

1. Head to [Twitter Developer portal](https://developer.twitter.com), if you don't have an account create one.
2. Create an a New Project and provide details like Project Name, Use Case and Project Description.
3. On the next page, choose Create New App.
4. Choose an App Environment as Development and provide an App Name.
5. Save the API Keys and Secrets generated.
6. From the Project Page, choose OAuth from User Authentication Settings.
7. Turn on OAuth 1.0a option and choose Read and Write.
8. Provide a random callback url and website url.
9. Back on the Project Page, navigate to Keys and Tokens.
10. Under Authentication Tokens, generate Access Token and Secret. *Make sure it says "Created with Read and Write Permissions*

At this point, your Twitter App is ready to be used. Make sure to save `consumer_key`,`consumer_secret`,`access_token`,`access_token_secret`, you need to update this in `app.py`.

Next we'll setup the Slack Bot with webhook access.

### Setting Up Slack WebHook

1. Head to [Slack API portal](https://api.slack.com/), if you don't have an account create one.
2. Click on Create A New App and create it from Scratch.
3. Provide a unique App Name.
4. Choose a Slack Workspace.
5. On the basic information page, select Incoming Webhooks and activate it.
6. Click on Add New Webhook to workspace
7. In a new window, select/enter a new channel name. This is the channel to which your slack app will send notifications.
8. At this point, you'll have the Slack webhook url with you.

We have successfully created a Twitter App and a Slack App. Let's now create the application.

## Creating Twitter Bot

You can clone this repository to create this application.

`app.py` is the file which does all the work. Before you execute the application, below are the few things that you must update in the file:

- `consumer_key` - Consumer Key
- `consumer_secret` - Consumer Secret
- `access_token` - OAuth Access Token
- `access_token_secret` - OAuth Access Token Secret
- `username` - Twitter handle of the current user

Update these details and save the file.

## Steps to Execute

Create a Python environment

```bash
fission environment create --name python --image fission/python-env --builder fission/python-builder:latest
```

Create a zip archive as `sample.zip` archive by executing `package.sh` script

```bash
./package.sh
```

Create a Package

```bash
fission package create --name fissiontwitter-pkg --sourcearchive sample.zip --env python --buildcmd "./build.sh"
```

Create the `tweetbot` fission function

```bash
fission fn create --name tweetbot --pkg fissiontwitter-pkg --entrypoint "app.main"
```

## Test and Execute

Before you run the application, send a tweet to the user whom you're tracking. Test the function by executing the following command:

```bash
fission fn test --name tweetbot
```

You should see that your bot has replied to the latest tweet that mentioned you. It has also sent a note in your slack workspace.

There are multiple ways to automate this, in this case we are using Fission Time Trigger to execute the function every 1m. You can change this according to your needs.

```bash
fission timer create --name minute --function tweetbot --cron "@every 1m"
```

## Fission Spec

```bash
fission spec init
fission environment create --name python --image fission/python-env --builder fission/python-builder:latest
fission package create --name fissiontwitter-pkg --sourcearchive sample.zip --env python --buildcmd "./build.sh"
fission fn create --name tweetbot --pkg fissiontwitter-pkg --entrypoint "app.main"
fission timer create --name minute --function tweetbot --cron "@every 1m"
```
