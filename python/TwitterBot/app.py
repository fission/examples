import tweepy
from slack_sdk.webhook import WebhookClient

# Secrets and Tokens
consumer_key = '<replace with your consumer_key>'
consumer_secret = '<replace with your consumer_secret>'
access_token = '<replace with your access_token>'
access_token_secret = '<replace with your access_token_secret>'
username='username'

def main():
    auth = tweepy.OAuth1UserHandler(
    consumer_key, consumer_secret, access_token, access_token_secret
    )

    api = tweepy.API(auth)
    statuses = api.user_timeline(screen_name=username) # Getting latest tweets from current user
    mentions = api.mentions_timeline(since_id=statuses[0].id) # Getting the latest mention after the latest tweet from the current user

    for s in mentions:
        sn = "@"+s.user.screen_name
        sid = s.id
        m = "Hey! "+sn+", thanks for reaching out!"
        api.update_status(status = m, in_reply_to_status_id = sid) #Replying to the Tweet
        url = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX" 
        webhook = WebhookClient(url)
        response = webhook.send(text=sn+" mentioned you on Twitter. Please check!") #Sending message to Slack webhook
