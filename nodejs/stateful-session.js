// A login-session store backed by Fission's built-in function state. Sessions
// self-expire via a TTL, so you never write a cleanup job — no external Redis
// or database, no credentials in this code.
//
// Deploy with a default TTL so idle sessions clean themselves up after 30 min:
//
//   fission function create --name sessions --env nodejs --code stateful-session.js \
//     --state --state-keyspace user-sessions --state-ttl 30m
//   fission route create --name sessions-rt --function sessions --url /session --method GET
//
//   # start a session:   curl "$FISSION_ROUTER/session?login=alice"    -> a session id
//   # check a session:   curl "$FISSION_ROUTER/session?sid=<id>"       -> the user, or 401
//
// Requires an install with `statestore.enabled=true` and
// `functionState.enabled=true`. Fission injects FISSION_STATE_URL and
// FISSION_STATE_TOKEN_PATH into the pod.

const fs = require('fs');
const crypto = require('crypto');

function stateClient() {
  const c = JSON.parse(fs.readFileSync(process.env.FISSION_STATE_TOKEN_PATH, 'utf8'));
  const base = process.env.FISSION_STATE_URL;
  const headers = {
    'Authorization': 'Bearer ' + c.token,
    'X-Fission-State-Namespace': c.namespace,
    'X-Fission-State-Keyspace': c.keyspace,
  };
  return {
    async get(key) {
      const r = await fetch(`${base}/v1/state/${key}`, { headers });
      return r.status === 404 ? null : await r.text();
    },
    // The keyspace default TTL (--state-ttl) applies; pass an explicit ttl
    // (a Go duration like "10m") to override it for one key.
    async set(key, value, ttl) {
      const h = { ...headers };
      if (ttl) h['X-Fission-State-TTL'] = ttl;
      await fetch(`${base}/v1/state/${key}`, { method: 'PUT', headers: h, body: value });
    },
  };
}

module.exports = async function (context) {
  const state = stateClient();
  const q = context.request.query || {};

  // ?login=<user> -> mint a session id, store the session document (expires per
  // the function's --state-ttl), return the id.
  if (q.login) {
    const sid = crypto.randomUUID();
    await state.set(sid, JSON.stringify({ user: q.login, since: Date.now() }));
    return { status: 200, body: sid + '\n' };
  }

  // ?sid=<id> -> look the session up; a missing/expired session is a 401.
  if (q.sid) {
    const doc = await state.get(q.sid);
    if (!doc) return { status: 401, body: 'session expired or invalid\n' };
    return { status: 200, body: doc + '\n' };
  }

  return { status: 400, body: 'pass ?login=<user> to start a session or ?sid=<id> to check one\n' };
};
