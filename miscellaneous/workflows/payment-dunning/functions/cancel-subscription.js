// Terminal dunning outcome: both charge attempts failed across the grace
// period, so the subscription is cancelled (and in a real system the
// customer notified / the account downgraded).
module.exports = async function (context) {
    const sub = context.request.body || {};
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subscriptionId: sub.subscriptionId,
            status: 'CANCELLED',
            reason: 'payment failed after grace period',
        }),
    };
};
