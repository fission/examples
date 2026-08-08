# A per-user counter backed by Fission's built-in function state — no external
# Redis or database, and no credentials in this code.
#
# Deploy (the --state flag opts the function into its own keyspace; requires an
# install with `statestore.enabled=true` and `functionState.enabled=true`):
#
#   fission function create --name counter-py --env python --code stateful_counter.py --state
#   fission route create   --name counter-py-rt --function counter-py --url /counter-py --method GET
#   curl "$FISSION_ROUTER/counter-py?user=alice"   # -> 1, 2, 3, ... per user
#
# Fission injects FISSION_STATE_URL (the state API) and FISSION_STATE_TOKEN_PATH
# (a JSON file with this function's scoped {namespace, keyspace, token}). We talk
# to the API over plain HTTP from the standard library — no SDK to install.

import json
import os
import urllib.error
import urllib.request

from flask import request


def _client():
    with open(os.environ["FISSION_STATE_TOKEN_PATH"]) as f:
        creds = json.load(f)
    base = os.environ["FISSION_STATE_URL"]
    headers = {
        "Authorization": "Bearer " + creds["token"],
        "X-Fission-State-Namespace": creds["namespace"],
        "X-Fission-State-Keyspace": creds["keyspace"],
    }

    def _req(method, path, body=None, extra=None):
        h = dict(headers, **(extra or {}))
        req = urllib.request.Request(base + path, data=body, method=method, headers=h)
        try:
            resp = urllib.request.urlopen(req)
            return resp.status, resp.read(), resp.headers
        except urllib.error.HTTPError as e:
            return e.code, e.read(), e.headers

    class Client:
        # Returns (value, version) or (None, 0) when the key is absent.
        def get(self, key):
            status, body, hdr = _req("GET", f"/v1/state/{key}")
            if status == 404:
                return None, 0
            return body.decode(), int(hdr.get("X-Fission-State-Version", 0))

        # Compare-and-swap: the write lands only if the key is still at
        # if_version (use 0 for "create only"). Returns the HTTP status:
        # 204 ok, 412 conflict.
        def set(self, key, value, if_version):
            status, _, _ = _req(
                "PUT", f"/v1/state/{key}", value.encode(), {"If-Match": str(if_version)}
            )
            return status

    return Client()


def main():
    state = _client()
    user = request.args.get("user", "anon")

    # get -> increment -> compare-and-swap. If another request for the same user
    # incremented in between (412), read the fresh value and retry. No locks, no
    # lost increments.
    for _ in range(10):
        value, version = state.get(user)
        nxt = (int(value) if value is not None else 0) + 1
        if state.set(user, str(nxt), version) == 204:
            return f"{user}: {nxt}\n"
        # 412 -> someone else won the race; loop and try again.
    return "too much contention\n", 500
