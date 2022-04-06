from flask import Flask, render_template, request, current_app
import os
import requests, json

app = Flask(__name__)

APP_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(APP_DIR, 'templates')
STATIC_DIR = os.path.join(APP_DIR,'static')
current_app.template_folder = TEMPLATE_DIR
current_app.static_folder = STATIC_DIR

@app.route('/pawesome',methods=['GET', 'POST'])
def main():

    current_app.template_folder = TEMPLATE_DIR
    current_app.static_folder = STATIC_DIR

    if request.method == "POST":
        if request.form['submit'] == 'placeOrder':
            skus = request.form.getlist('products')
            return render_template("index.html",product=json.dumps(skus))

        if request.form['submit'] == 'submitDetails':
            name = request.form.get('inputName')
            email = request.form.get('inputEmail')
            itemOrdered = request.form.get('itemOrdered')
            data = {"name": name,"email": email, "itemsOrdered": itemOrdered}
            webhook_url = "https://hooks.zapier.com/hooks/catch/123456789/abcdefghijk/"
            response = requests.post(
                webhook_url, data=json.dumps(data),
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code != 200:
                raise ValueError(
                    'Request to slack returned an error %s, the response is:\n%s'
                    % (response.status_code, response.text)
            )
            return render_template("index.html", status = response.status_code)          
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
