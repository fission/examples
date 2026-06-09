using System;
using System.Threading.Tasks;
using MultiFileExample.Services;
using MultiFileExample.Models;
using Fission.DotNet.Common;

namespace MultiFileExample.Controllers
{
    public class ApiController
    {
        private readonly WeatherService _weatherService;
        private readonly UserService _userService;
        private readonly DataProcessor _dataProcessor;

        public ApiController()
        {
            // In production, use dependency injection
            _weatherService = new WeatherService();
            _userService = new UserService();
            _dataProcessor = new DataProcessor();
        }

        public async Task<object> RouteRequest(FissionContext context)
        {
            var path = ExtractPath(context);
            var method = ExtractMethod(context);
            
            // Route to appropriate handler based on path
            return path.ToLower() switch
            {
                "" or "multifile" => GetApiInfo(),
                "weather" => await _weatherService.GetWeatherAsync(),
                "weather/forecast" => await _weatherService.GetForecastAsync(),
                "users" => _userService.GetAllUsers(),
                "users/active" => _userService.GetActiveUsers(),
                "process" => _dataProcessor.ProcessData(new DataRequest { Input = "test-data" }),
                "health" => GetHealthStatus(),
                _ => GetNotFoundResponse(path)
            };
        }

        private string ExtractPath(FissionContext context)
        {
            // Try to get path from HTTP context
            if (context is FissionHttpContext httpContext)
            {
                return httpContext.Url?.TrimStart('/') ?? "";
            }
            
            // Fallback to subpath argument for testing
            if (context?.Arguments?.ContainsKey("subpath") == true)
            {
                return context.Arguments["subpath"]?.ToString() ?? "";
            }
            
            return "";
        }

        private string ExtractMethod(FissionContext context)
        {
            if (context is FissionHttpContext httpContext)
            {
                return httpContext.Method?.ToUpper() ?? "GET";
            }
            return "GET";
        }

        private object GetApiInfo()
        {
            return new
            {
                name = "Multi-File Example API",
                description = "MVC-pattern Fission function with controller-based routing",
                version = "2.0.0",
                architecture = new
                {
                    pattern = "MVC",
                    entryPoint = "MyFunction.cs",
                    controller = "ApiController.cs",
                    services = new[] { "WeatherService.cs", "UserService.cs", "DataProcessor.cs" },
                    models = new[] { "User.cs", "Weather.cs", "DataModels.cs" }
                },
                endpoints = GetAvailableEndpoints()
            };
        }

        private object GetHealthStatus()
        {
            return new
            {
                status = "healthy",
                service = "MultiFileExample",
                version = "2.0.0",
                timestamp = DateTime.UtcNow,
                components = new
                {
                    weatherService = "operational",
                    userService = "operational",
                    dataProcessor = "operational"
                }
            };
        }

        private object GetNotFoundResponse(string path)
        {
            return new
            {
                error = "Endpoint not found",
                path = path,
                statusCode = 404,
                availableEndpoints = GetAvailableEndpoints()
            };
        }

        private string[] GetAvailableEndpoints()
        {
            return new[]
            {
                "/ - API information",
                "/weather - Current weather",
                "/weather/forecast - 5-day forecast",
                "/users - List all users",
                "/users/active - List active users",
                "/process - Data processing demo",
                "/health - Health check"
            };
        }
    }
}