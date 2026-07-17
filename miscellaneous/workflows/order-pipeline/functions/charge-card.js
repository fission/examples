// Charges the customer's card. Demonstrates the two failure classes a
// payment step really has:
//
//  - "declined" card  -> 402 with a typed {errorType: "PaymentDeclined"}
//    error. Retrying a decline is pointless, so the workflow catches this
//    class and routes to the reject path instead of burning attempts.
//  - "flaky-gateway" card -> 500 on the first attempt, success afterwards.
//    A 5xx is a retryable infrastructure error (Fission.FunctionError); the
//    state's retry policy re-invokes with backoff and the SECOND attempt
//    succeeds. The engine passes the attempt number in the
//    X-Fission-Workflow-Attempt header, which also serves as the
//    idempotency key a real payment gateway would want.
module.exports = async function (context) {
    const order = context.request.body || {};
    const card = order.payment?.card || 'valid';
    const attempt = parseInt(context.request.headers['x-fission-workflow-attempt'] || '1', 10);

    if (card === 'declined') {
        return {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                errorType: 'PaymentDeclined',
                cause: { reason: 'insufficient funds', card: 'declined' },
            }),
        };
    }

    if (card === 'flaky-gateway' && attempt < 2) {
        return {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'payment gateway timeout (transient)' }),
        };
    }

    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chargeId: `ch_${order.orderId}_${attempt}`,
            amount: order.total,
            attempt,
        }),
    };
};
