from flask import current_app, render_template, request, make_response, g
import os
import socket
import random
import json
import requests

option_a = os.getenv('OPTION_A', "Mountains")
option_b = os.getenv('OPTION_B', "Beaches")
hostname = socket.gethostname()

APP_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(APP_DIR, 'templates')


def main():
    current_app.template_folder = TEMPLATE_DIR

    voter_id = hex(random.getrandbits(64))[2:-1]
    vote = None
    vote_beaches = None
    vote_mountains = None

    if request.method == 'POST':
        url = 'http://router.fission.svc/castvote'  # URL of the fission function
        vote = request.form['vote']
        current_app.logger.info('Received vote for %s', vote)
        data = {'voter_id': voter_id, 'vote': vote}
        votes = json.loads(requests.post(url, json=data).text)
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
