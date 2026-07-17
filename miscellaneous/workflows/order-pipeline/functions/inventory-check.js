// Checks stock for every line item. Runs inside a Parallel branch alongside
// the fraud score. SKUs prefixed "oos-" are treated as out of stock so both
// outcomes can be demonstrated deterministically.
module.exports = async function (context) {
    const order = context.request.body || {};
    const missing = (order.items || [])
        .filter((i) => (i.sku || '').startsWith('oos-'))
        .map((i) => i.sku);

    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: missing.length > 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
            missing,
        }),
    };
};
