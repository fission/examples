// A per-user counter backed by Fission's built-in function state — no external
// Redis or database, and no credentials in this code.
//
// Deploy (the --state flag opts the function into its own keyspace; requires an
// install with `statestore.enabled=true` and `functionState.enabled=true`):
//
//   fission function create --name counter --env nodejs --code stateful-counter.js --state
//   fission route create   --name counter-rt --function counter --url /counter --method GET
//   curl "$FISSION_ROUTER/counter?user=alice"   # -> 1, 2, 3, ... per user
//
// Fission injects FISSION_STATE_URL (the state API) and FISSION_STATE_TOKEN_PATH
// (a JSON file with this function's scoped {namespace, keyspace, token}). We talk
// to the API over plain HTTP — no SDK to install.

const fs = require('fs');

function stateClient() {
  const c = JSON.parse(fs.readFileSync(process.env.FISSION_STATE_TOKEN_PATH, 'utf8'));
  const base = process.env.FISSION_STATE_URL;
  const headers = {
    'Authorization': 'Bearer ' + c.token,
    'X-Fission-State-Namespace': c.namespace,
    'X-Fission-State-Keyspace': c.keyspace,
  };
  return {
    // Returns { value, version } or null when the key is absent.
    async get(key) {
      const r = await fetch(`${base}/v1/state/${key}`, { headers });
      if (r.status === 404) return null;
      return { value: await r.text(), version: Number(r.headers.get('x-fission-state-version')) };
    },
    // Compare-and-swap: the write lands only if the key is still at ifVersion
    // (use 0 for "create only"). Returns the HTTP status: 204 ok, 412 conflict.
    async set(key, value, ifVersion) {
      const h = { ...headers, 'If-Match': String(ifVersion) };
      const r = await fetch(`${base}/v1/state/${key}`, { method: 'PUT', headers: h, body: value });
      return r.status;
    },
  };
}

module.exports = async function (context) {
  const state = stateClient();
  const user = (context.request.query && context.request.query.user) || 'anon';

  // get -> increment -> compare-and-swap. If another request for the same user
  // incremented in between (412), read the fresh value and retry. No locks, no
  // lost increments.
  for (let attempt = 0; attempt < 10; attempt++) {
    const cur = await state.get(user);
    const next = (cur ? Number(cur.value) : 0) + 1;
    const status = await state.set(user, String(next), cur ? cur.version : 0);
    if (status === 204) {
      return { status: 200, body: `${user}: ${next}\n` };
    }
    // 412 -> someone else won the race; loop and try again.
  }
  return { status: 500, body: 'too much contention\n' };
};
