// v1: books an order from a webhook payload.
//
// BUG: this version assumes `amount` always arrives as a number. A legacy
// sender in this scenario sends it as a quoted string ("49.99") instead, and
// `order.amount.toFixed()` throws on a string. The catch below turns that
// into a 500 -- a failure the async dispatcher treats as retryable, since it
// looks exactly like a downstream call that timed out.
module.exports = async function (context) {
    const order = context.request.body || {};
    try {
        const cents = Math.round(order.amount.toFixed(2) * 100);
        console.log(`booked order ${order.orderId} for ${cents} cents`);
        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.orderId, cents }),
        };
    } catch (err) {
        console.error(`failed to book order ${order.orderId}: ${err.message}`);
        return { status: 500, body: `internal error booking order: ${err.message}` };
    }
};
