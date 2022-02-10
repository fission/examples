from flask import request
from datetime import datetime, timedelta  

def main():
    data = request.json
    reorderQuantity = data['reorderquant']
    if reorderQuantity<10:
        # Returning a fictious date, in reality you can call another function that will actually place an order.
        deldate = datetime.now() + timedelta(days=5)
    else:
        deldate = datetime.now() + timedelta(days=10)
    answer = {"deldate": deldate}
    return answer
   
