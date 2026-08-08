// Consumer 1, mqtrigger "orders-to-inventory". Decrements stock for each
// line item on an order event.
//
// An unknown SKU is a permanent inventory-service error (500). The
// statestore mqtrigger delivery path has no typed-error distinction and no
// attempt-number header, so every attempt fails identically. --maxretries
// exhausts and the event is routed to the ErrorTopic (RFC-0027 poison
// isolation, invariant E5) instead of stalling the topic.
//
// CATALOG resets on every cold start. This is a demo, not a real inventory
// store.
const CATALOG = { 'WIDGET-1': 50, 'GIZMO-2': 30, 'GADGET-3': 12 };

// unwrapOrder handles both shapes an event on this topic can arrive in:
//
//  - published by the create-order destination: an RFC-0024 result envelope
//    ({requestContext, responseContext, responsePayload: base64(body)}).
//  - published directly with `fission topic publish`: the raw order JSON.
//
// requestContext/responseContext only exist on the envelope shape (unlike
// responsePayload, which is omitted when the producer's response body is
// empty), so they are the reliable discriminator.
function unwrapOrder(body) {
    if (body && typeof body === 'object' && body.requestContext && body.responseContext) {
        const json = Buffer.from(body.responsePayload || '', 'base64').toString('utf8');
        return JSON.parse(json);
    }
    return body;
}

module.exports = async function (context) {
    const order = unwrapOrder(context.request.body) || {};
    const updates = [];

    for (const item of order.items || []) {
        if (!(item.sku in CATALOG)) {
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `unknown sku ${item.sku}` }),
            };
        }
        CATALOG[item.sku] -= item.qty;
        updates.push({ sku: item.sku, remaining: CATALOG[item.sku] });
    }

    console.log(`inventory updated for order ${order.orderId}:`, JSON.stringify(updates));
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, updates }),
    };
};
