// Receives the Map join output — the ordered array of enriched leads — and
// produces the campaign summary a marketing tool would consume.
module.exports = async function (context) {
    const leads = Array.isArray(context.request.body) ? context.request.body : [];
    const bySegment = { hot: 0, warm: 0, cold: 0 };
    for (const lead of leads) bySegment[lead.segment] = (bySegment[lead.segment] || 0) + 1;

    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            total: leads.length,
            bySegment,
            hotLeads: leads.filter((l) => l.segment === 'hot').map((l) => l.email),
        }),
    };
};
