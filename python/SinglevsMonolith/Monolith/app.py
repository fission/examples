
import random
from flask import current_app, Flask, request, render_template
import os
from datetime import datetime, timedelta  

app = Flask(__name__)
APP_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(APP_DIR, 'templates')

@app.route('/monolith',methods=['GET', 'POST'])
def main():
    current_app.template_folder = TEMPLATE_DIR
    
    if request.method == "POST":
        # Called when getStock is requested
        if request.form['submit'] == 'submit':
            sku = request.form.get('sku')
            answer = 0
            currentStock = -1
            if sku=='abc123':
                # Getting a random number, in reality you can have a function that fetches the data from a database
                currentStock =  random.randint(0,10)
            elif sku=='xyz123':
                currentStock =  random.randint(5,10)
            else:
                currentStock = 0
            return render_template('index.html', answer=currentStock)

        # Called when reorder is requested
        if request.form['submit']=='reorder':
            current_app.template_folder = TEMPLATE_DIR
            reorderquant =request.form.get('reorderquant')
            deldate=0
            reorderQuantity = int(reorderquant)
            if reorderQuantity < 10:
                # Returning a fictious date, in reality you can call another function that will actually place an order.
                deldate = datetime.now() + timedelta(days=5)
            else:
                deldate = datetime.now() + timedelta(days=10)
            return render_template('reorder.html', deldate=deldate)

    return render_template('index.html')