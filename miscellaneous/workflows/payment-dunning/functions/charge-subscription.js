// Attempts to charge a subscription renewal. Cards behave deterministically
// so every dunning path can be demonstrated:
//   "valid"    -> charge succeeds immediately
//   "past-due" -> always declined (typed error the workflow catches)
module.exports = async function (context) {
    const sub = context.request.body || {};
    const attempt = parseInt(context.request.headers['x-fission-workflow-attempt'] || '1', 10);

    if ((sub.payment?.card || 'valid') === 'past-due') {
        return {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                errorType: 'PaymentDeclined',
                cause: { subscriptionId: sub.subscriptionId, reason: 'card past due' },
            }),
        };
    }

    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...sub,
            receipt: { chargeId: `ch_${sub.subscriptionId}_${Date.now()}`, attempt },
        }),
    };
};
