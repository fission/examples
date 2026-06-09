using Fission.DotNet.Common;
using System.Threading.Tasks;
using MultiFileExample.Controllers;

namespace MultiFileExample
{

    public class MyFunction
    {
        private readonly ApiController _controller;

        public MyFunction()
        {
            _controller = new ApiController();
        }

        public async Task<object> Execute(FissionContext context)
        {
            // Delegate all routing and business logic to the controller
            return await _controller.RouteRequest(context);
        }
    }
}