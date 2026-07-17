// Scores the order for fraud risk. Runs inside a Parallel branch, so it
// executes concurrently with the inventory check. Deterministic rules keep
// the demo reproducible: high totals and gift cards raise the score.
module.exports = async function (context) {
    const order = context.request.body || {};
    let score = 10;
    const signals = [];

    if ((order.total || 0) >= 5000) {
        score += 60;
        signals.push('order total >= 5000');
    }
    if ((order.items || []).some((i) => (i.sku || '').includes('giftcard'))) {
        score += 40;
        signals.push('contains gift cards');
    }
    if ((order.customer?.email || '').endsWith('@example.invalid')) {
        score += 30;
        signals.push('disposable email domain');
    }

    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskScore: Math.min(score, 100), signals }),
    };
};
