export const entry1 = async (context) => {
    const { request } = context;
    const name = request.query?.name || 'World';
    
    return {
        status: 200,
        body: JSON.stringify({
            message: `Hello from Entry Point 1, ${name}! 🚀`,
            entryPoint: 'entry1',
            nodeVersion: process.version,
            timestamp: new Date().toISOString(),
            features: ['Named Exports', 'ESM Modules', 'Multiple Endpoints']
        }, null, 2),
        headers: {
            'Content-Type': 'application/json',
            'X-Entry-Point': 'entry1'
        }
    };
};

export const entry2 = async (context) => {
    const { request } = context;
    const data = request.body || {};
    
    return {
        status: 200,
        body: JSON.stringify({
            message: `Greetings from Entry Point 2! 🎯`,
            entryPoint: 'entry2',
            nodeVersion: process.version,
            timestamp: new Date().toISOString(),
            receivedData: data,
            capabilities: ['Data Processing', 'JSON Handling', 'Modern ESM']
        }, null, 2),
        headers: {
            'Content-Type': 'application/json',
            'X-Entry-Point': 'entry2'
        }
    };
};