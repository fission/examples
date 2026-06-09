export default async (context) => {
  return {
    status: 200,
    body: JSON.stringify({
      message: "Hello from Node.js 22 Pure ESM! 🚀",
      nodeVersion: process.version,
      moduleType: "ESM",
      timestamp: new Date().toISOString()
    }, null, 2),
    headers: {
      "Content-Type": "application/json"
    }
  };
}; 