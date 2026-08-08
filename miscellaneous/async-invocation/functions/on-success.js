// The --async-on-success destination. The async dispatcher POSTs the
// Lambda-shaped result envelope here after a successful delivery
// (Content-Type: application/json, so `context.request.body` is already the
// parsed envelope). requestPayload/responsePayload ride the wire as base64.
module.exports = async function (context) {
    const result = context.request.body || {};
    const decode = (b64) => (b64 ? Buffer.from(b64, 'base64').toString('utf8') : '');

    console.log(
        `order booked: invocation=${result.requestContext?.invocationId} ` +
            `attempts=${result.requestContext?.attempts} response=${decode(result.responsePayload)}`
    );
    return { status: 200, body: 'ok' };
};
