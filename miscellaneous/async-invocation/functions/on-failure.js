// The --async-on-failure destination. The async dispatcher POSTs the same
// result envelope shape here when an invocation is dead-lettered (retries
// exhausted, max age, or a permanent 4xx) -- stand-in for paging on-call;
// a real deployment would call PagerDuty, Slack, or similar.
module.exports = async function (context) {
    const result = context.request.body || {};
    const decode = (b64) => (b64 ? Buffer.from(b64, 'base64').toString('utf8') : '');

    console.error(
        `ALERT: order booking dead-lettered: invocation=${result.requestContext?.invocationId} ` +
            `condition=${result.requestContext?.condition} attempts=${result.requestContext?.attempts} ` +
            `response=${decode(result.responsePayload)}`
    );
    return { status: 200, body: 'alerted' };
};
