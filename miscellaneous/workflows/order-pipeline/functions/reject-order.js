// Terminal rejection step. Every failure route (invalid order, high fraud
// score, out of stock, declined card) converges here, so it inspects the
// accumulated document to say WHY the order was rejected.
module.exports = async function (context) {
    const order = context.request.body || {};
    let reason = 'order could not be processed';

    // Catch routes merge the error object at $.error (see workflow.yaml).
    if (order.error?.errorType) {
        reason = `${order.error.errorType}: ${JSON.stringify(order.error.cause)}`;
    }
    // Choice routes arrive with the screening results but no error object.
    const screening = order.screening;
    if (Array.isArray(screening)) {
        if ((screening[0]?.riskScore || 0) > 70) reason = `fraud risk score ${screening[0].riskScore}`;
        if (screening[1]?.status === 'OUT_OF_STOCK') reason = `out of stock: ${screening[1].missing.join(', ')}`;
    }

    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId || null, status: 'REJECTED', reason }),
    };
};
