// Weather API example for Node.js 22 ESM
// Uses Node.js 22's built-in fetch API (no external dependencies needed!)

export default async (context) => {
    const { request } = context;
    // Support both body and query parameters
    const location = request.body?.location || request.query?.location;
    
    if (!location) {
        return {
            status: 400,
            body: JSON.stringify({
                error: 'Location is required',
                usage: {
                    post: 'POST with {"location": "City, Country"}',
                    get: 'GET with ?location=City,Country',
                    example: '{"location": "San Francisco, CA"}'
                }
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
    
    try {
        // Note: This example uses mock weather data
        // In production, replace with a real weather API like OpenWeatherMap
        const mockWeatherData = {
            location,
            temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Thunderstorms'][Math.floor(Math.random() * 5)],
            humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
            windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
            uvIndex: Math.floor(Math.random() * 11), // 0-10
            visibility: Math.floor(Math.random() * 15) + 5, // 5-20 km
            timestamp: new Date().toISOString(),
            coordinates: {
                lat: (Math.random() * 180 - 90).toFixed(4),
                lon: (Math.random() * 360 - 180).toFixed(4)
            }
        };
        
        // Simulate weather severity
        const severity = mockWeatherData.condition === 'Thunderstorms' ? 'high' :
                        mockWeatherData.condition === 'Rainy' ? 'medium' : 'low';
        
        return {
            status: 200,
            body: JSON.stringify({
                success: true,
                data: {
                    ...mockWeatherData,
                    severity,
                    recommendation: severity === 'high' ? 'Stay indoors' :
                                  severity === 'medium' ? 'Bring an umbrella' : 'Great weather for outdoor activities'
                },
                message: `Current weather in ${location}: ${mockWeatherData.temperature}°C and ${mockWeatherData.condition}`,
                nodeVersion: process.version,
                builtInFetch: 'Node.js 22 native fetch API ready for real weather services!',
                requestMethod: request.method || 'GET'
            }, null, 2),
            headers: {
                'Content-Type': 'application/json',
                'X-Weather-Source': 'mock-data',
                'X-Node-Version': process.version
            }
        };
    } catch (error) {
        return {
            status: 500,
            body: JSON.stringify({
                error: 'Failed to fetch weather data',
                details: error.message,
                nodeVersion: process.version
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};