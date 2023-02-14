
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
        # Called when Submit is clicked
        if request.form['submit'] == 'submit':
            plongurl = request.form.get('plongurl')
            data = {'plongurl': plongurl}
            url = 'http://router.fission.svc/shorturl'
            answer = json.loads(requests.post(url, json=data).text)
            shorturl = answer['shorturl']
            status = answer['status']
            return render_template('index.html', answer=shorturl, status=status)

    return render_template('index.html')