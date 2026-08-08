// Consumer 2, mqtrigger "orders-to-notify". Sends a simulated order
// confirmation.
//
// This trigger's ResponseTopic ("notifications-sent") publishes this
// function's response on every success. This is a SEPARATE, independent
// cursor from update-inventory's — each MessageQueueTrigger owns its own
// durable cursor over the same "orders" stream, so a poison event that
// exhausts update-inventory's retries never blocks this consumer.
function unwrapOrder(body) {
    if (body && typeof body === 'object' && body.requestContext && body.responseContext) {
        const json = Buffer.from(body.responsePayload || '', 'base64').toString('utf8');
        return JSON.parse(json);
    }
    return body;
}

module.exports = async function (context) {
    const order = unwrapOrder(context.request.body) || {};
    const confirmation = {
        orderId: order.orderId,
        email: order.customer?.email,
        message: `Your order ${order.orderId} for $${order.total} is confirmed.`,
        sentAt: new Date().toISOString(),
    };

    console.log('notification sent:', JSON.stringify(confirmation));
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmation),
    };
};
