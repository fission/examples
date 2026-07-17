// Terminal happy-path step: hand the order to fulfilment. By this point the
// document has accumulated validation output, screening results (at
// $.screening) and the charge receipt (at $.charge) via resultPath.
module.exports = async function (context) {
    const order = context.request.body || {};
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: order.orderId,
            status: 'FULFILLED',
            chargeId: order.charge?.chargeId,
            amount: order.charge?.amount,
        }),
    };
};
