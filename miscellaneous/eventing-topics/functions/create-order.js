// Producer. Validates a new order and returns the order event as its
// response body.
//
// Invoke this function ASYNCHRONOUSLY (X-Fission-Invoke-Mode: async, or
// `fission fn test --async`). Only an async delivery fires the
// --async-on-success-topic destination that publishes this response to the
// "orders" topic (RFC-0027). A plain synchronous call returns the same body
// to the caller, but nothing gets published.
module.exports = async function (context) {
    const order = context.request.body || {};
    const problems = [];

    if (!order.orderId) problems.push('orderId is required');
    if (!order.customer || !order.customer.email) problems.push('customer.email is required');
    if (!Array.isArray(order.items) || order.items.length === 0) problems.push('items must be a non-empty array');
    for (const item of order.items || []) {
        if (!item.sku || !Number.isInteger(item.qty) || item.qty < 1) {
            problems.push(`item ${JSON.stringify(item)} needs a sku and a positive integer qty`);
        }
    }

    if (problems.length > 0) {
        return {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'invalid order', problems }),
        };
    }

    const total = order.items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.qty, 0);
    const event = { ...order, total, placedAt: new Date().toISOString() };

    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    };
};
