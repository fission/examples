// v2: the fix.
//
// `Number(order.amount)` coerces a quoted amount ("49.99") the same as a
// numeric one, so the redelivered payload that used to crash now books
// cleanly. A structurally invalid payload (no orderId) is now a proper 4xx
// instead of an uncaught exception: the async dispatcher never retries a
// 4xx, so it dead-letters immediately (reason `http_4xx`) instead of
// spending the retry budget on something retrying can never fix.
module.exports = async function (context) {
    const order = context.request.body || {};

    if (!order.orderId || !order.customerEmail) {
        return {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                errorType: 'InvalidOrder',
                cause: { orderId: order.orderId, customerEmail: order.customerEmail },
            }),
        };
    }

    const amount = Number(order.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        return {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ errorType: 'InvalidOrder', cause: { amount: order.amount } }),
        };
    }

    const cents = Math.round(amount * 100);
    console.log(`booked order ${order.orderId} for ${cents} cents`);
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, cents }),
    };
};
