// Validates the incoming order document. A malformed order is a business
// error that retrying can never fix, so it is reported as a *typed* error
// ({errorType, cause} with a 4xx status) that the workflow's catch route
// sends straight to the reject path.
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
            body: JSON.stringify({ errorType: 'InvalidOrder', cause: { problems } }),
        };
    }

    const total = order.items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.qty, 0);
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, total, validatedAt: new Date().toISOString() }),
    };
};
