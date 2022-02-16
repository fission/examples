from flask import request
import random

def main():
    data = request.json
    sku = data['sku']
    if sku=='abc123':
        # Getting a random number, in reality you can have a function that fetches the data from a database
        currentStock =  random.randint(0,10)
    elif sku=='xyz123':
        currentStock =  random.randint(5,10)
    else:
        currentStock = 0
    answer = {"currentStock": currentStock}
    return answer
   
