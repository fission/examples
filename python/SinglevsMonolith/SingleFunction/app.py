
import string
from flask import current_app, Flask, request, render_template
import json
import os
import requests

app = Flask(__name__)
APP_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(APP_DIR, 'templates')


def main():
    current_app.template_folder = TEMPLATE_DIR
    
    if request.method == "POST":
        # Called when getStock is requested
        if request.form['submit'] == 'submit':
            sku = request.form.get('sku')
            data = {'sku': sku}
            answer = 0
            currentStock = -1
            url = 'http://router.fission.svc/getstock'
            answer = json.loads(requests.post(url, json=data).text)
            currentStock = answer['currentStock']
            return render_template('index.html', answer=currentStock)

        # Called when restock is requested
        if request.form['submit']=='reorder':
            current_app.template_folder = TEMPLATE_DIR
            reorderquant =request.form.get('reorderquant')
            data = {'reorderquant': reorderquant}
            deldate=0
            url = 'http://router.fission.svc/reorder'
            deldate = json.loads(requests.post(url, json=data).text)['deldate']   
            return render_template('reorder.html', deldate=deldate)

    return render_template('index.html')