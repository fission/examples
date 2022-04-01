import tweepy
from slack_sdk.webhook import WebhookClient

# Username
username='username'

# Path to Kubernetes Secrects
ck_path = "/secrets/default/twitter-secret/consumer_key"
cs_path = "/secrets/default/twitter-secret/consumer_secret"
at_path = "/secrets/default/twitter-secret/access_token"
ats_path = "/secrets/default/twitter-secret/access_token_secret"

# Opening files and storing secrets in variables
with open(ck_path, 'r') as a, open(cs_path, 'r') as b, open(at_path, 'r') as c, open(ats_path, 'r') as d:
    consumer_key = a.read()
    consumer_secret = b.read()
    access_token = c.read()
    access_token_secret = d.read()
    a.close()
    b.close()
    c.close()
    d.close()

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
    
    return response