# Multi-File Example for Fission .NET 8

This example demonstrates how to organize a Fission function across multiple files using proper .NET project structure with services, models, and separation of concerns.

## Project Structure

```
MultiFileExample/
├── MyFunction.cs            # Thin Fission entry point (delegates to controller)
├── MultiFileExample.csproj  # Project file
├── Controllers/             # MVC Controllers
│   └── ApiController.cs     # Main controller handling routing and orchestration
├── Services/                # Business logic layer
│   ├── WeatherService.cs    # Weather-related operations
│   ├── UserService.cs       # User management
│   └── DataProcessor.cs     # Data processing utilities
└── Models/                  # Data models
    ├── User.cs             # User models
    ├── Weather.cs          # Weather models
    └── DataModels.cs       # Data processing models
```


## Deploy to Fission

```bash
# Create environment (if not already created)
fission env create --name dotnet8 \
  --image ghcr.io/fission/dotnet8-env \
  --builder ghcr.io/fission/dotnet8-builder \
  --poolsize 1

# Create package with all source files
cd dotnet8/MultiFileExample
fission pkg create --name multifile-pkg \
  --env dotnet8 \
  --src . \
  --buildcmd "/usr/local/bin/build"

# Wait for build to complete
fission pkg list

# Create function
fission fn create --name multifile-fn \
  --pkg multifile-pkg \
  --env dotnet8 \
  --entrypoint "MultiFileExample.MyFunction"

# Create HTTP route
fission route create --name multifile-route \
  --function multifile-fn \
  --url "/multifile/*" \
  --method GET POST

# Test the function
fission fn test --name multifile-fn
```

## Available Endpoints

```bash
# Port forward to access locally
kubectl port-forward -n fission service/router 8080:80 &

# API Information
curl http://localhost:8080/fission-function/multifile-fn/

# Weather Service endpoints
curl http://localhost:8080/fission-function/multifile-fn/weather
curl http://localhost:8080/fission-function/multifile-fn/weather/forecast

# User Service endpoints  
curl http://localhost:8080/fission-function/multifile-fn/users
curl http://localhost:8080/fission-function/multifile-fn/users/active

# Data Processing endpoint
curl http://localhost:8080/fission-function/multifile-fn/process

# Health check
curl http://localhost:8080/fission-function/multifile-fn/health
```

## How It Works

1. **Entry Point**: `MyFunction.cs` implements the Fission function interface (thin wrapper)
2. **Controller**: `ApiController.cs` handles all routing and orchestration
3. **Dependency Injection**: Services are instantiated in the controller's constructor
4. **Routing**: Controller routes requests to appropriate services based on path
5. **Services**: Each service encapsulates related business logic
6. **Models**: Shared data structures used across services


## Adding New Features

To add a new service:

1. Create a new service file in `Services/` directory
2. Create models in `Models/` directory
3. Add routing in `MyFunction.cs`
4. Rebuild and redeploy the package

Example:
```csharp
// Services/OrderService.cs
namespace MultiFileExample.Services
{
    public class OrderService
    {
        public object GetOrders() { /* ... */ }
    }
}

// In MyFunction.cs
private readonly OrderService _orderService = new OrderService();
// Add to switch: "orders" => _orderService.GetOrders()
```