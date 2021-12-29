from flask import Flask, render_template, request, make_response, g
import os
import socket
import random
import json
import requests

option_a = os.getenv('OPTION_A', "Mountains")
option_b = os.getenv('OPTION_B', "Beaches")
hostname = socket.gethostname()

app = Flask(__name__,template_folder='/templates')

@app.route("/", methods=['POST','GET'])
def hello():
    voter_id = hex(random.getrandbits(64))[2:-1]
    vote = None
    vote_beaches= None
    vote_mountains=None

    if request.method == 'POST':
        url = 'http://127.0.0.1:8888/castvote' #URL of the fission function
        vote = request.form['vote']
        app.logger.info('Received vote for %s', vote)
        data = {'voter_id': voter_id, 'vote': vote}
        votes =  json.loads(requests.post(url,json=data).text)
        vote_mountains = votes[option_b]
        vote_beaches = votes[option_a]

    resp = make_response(render_template(
        'index.html',
        option_a=option_a,
        option_b=option_b,
        hostname=hostname,
        vote=vote,
        vote_beaches=vote_beaches,
        vote_mountains=vote_mountains
    ))
    return resp


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)