using Fission.DotNet.Common;
using System.Threading.Tasks;

public class MyFunction
{
    public object Execute(FissionContext context)
    {
        // Call the async method and wait for it to complete
        return ExecuteAsync(context).GetAwaiter().GetResult();
    }

    public async Task<object> ExecuteAsync(FissionContext context)
    {
        await Task.Delay(1000); // Simulate an asynchronous operation
        return "Hello from async function!";
    }
}
