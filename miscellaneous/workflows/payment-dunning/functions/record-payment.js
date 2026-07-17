// Terminal happy-path step: persist the successful renewal.
module.exports = async function (context) {
    const sub = context.request.body || {};
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subscriptionId: sub.subscriptionId,
            status: 'RENEWED',
            chargeId: sub.receipt?.chargeId,
        }),
    };
};
