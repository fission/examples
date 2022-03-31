import tweepy
from slack_sdk.webhook import WebhookClient

# Secrets and Tokens
consumer_key = 'Gb1bYedXipZ93hV7I1Os1Zm0r'
consumer_secret = 'F6qbQq4KNZTG6Zc8V78Etl7WMfAeSx1HUhgNm1JVH0JjWTDsCo'
access_token = '1444005416950648832-lx0w5eKp4IvpjjmnCBM5Ss0LTP9DLt'
access_token_secret = 'ZC7o8jwT88MmfrBTUEs2EI1uxyIlEpwMY3xSuUNi8c4WI'
username='thetechmaharaj'

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
        url = "https://hooks.slack.com/services/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" 
        webhook = WebhookClient(url)
        response = webhook.send(text=sn+" mentioned you on Twitter. Please check!") #Sending message to Slack webhook
