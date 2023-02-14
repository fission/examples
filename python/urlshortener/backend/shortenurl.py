from flask import request
import pyshorteners
import pymongo

def main():
    client = pymongo.MongoClient("mongodb+srv://<username>:<password>@<db-url>.mongodb.net/?retryWrites=true&w=majority")
    data = request.json
    plongurl = data['plongurl']    
    long_url = plongurl

    ## Check in DB if short URL already exists
    urlexists = checkIfURLExists(client,long_url)

    if urlexists == 0:

        ## Shortened URL doesn't exists, creating new one
        status='This is a newly generated short URL.'
        type_tiny = pyshorteners.Shortener()
        short_url = type_tiny.tinyurl.short(long_url)
        storeToDB(client,long_url,short_url)

    else:

        ## Shortened URL already exists
        status='This short URL has been retrieved from the database.'
        short_url=urlexists

    print("The Shortened URL is: " + short_url)
    answer = {"shorturl": short_url, "status": status}
    return answer

## Store shortened URL to DB
def storeToDB(client,plongurl,short_url):
    db = client.test
    db.URLShortener.insert_one({'longURL': plongurl,'shortURL': short_url})
    
## Check if a long URL already exists
def checkIfURLExists(client,plongurl):
    db = client.test
    urlexists = db.URLShortener.find_one({'longURL':plongurl})
    if not urlexists:
        return 0
    else:
        return urlexists['shortURL']

