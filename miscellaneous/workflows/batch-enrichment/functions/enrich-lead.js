// Enriches ONE lead. The Map state invokes this function once per element
// of $.leads, up to maxConcurrency at a time, so the function only ever
// thinks about a single record — the workflow owns the fan-out, ordering
// and retry story.
module.exports = async function (context) {
    const lead = context.request.body || {};

    // Firmographic score: bigger companies and work emails score higher.
    let score = 0;
    const employees = lead.employees || 0;
    if (employees >= 1000) score += 50;
    else if (employees >= 100) score += 30;
    else if (employees >= 10) score += 15;

    const email = lead.email || '';
    const freeMail = /@(gmail|yahoo|outlook|hotmail)\./.test(email);
    if (!freeMail && email.includes('@')) score += 30;
    if ((lead.title || '').match(/vp|chief|head|director/i)) score += 20;

    const segment = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, score, segment }),
    };
};
