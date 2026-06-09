using Fission.DotNet.Common;

public class MyFunction
{
    public object Execute(FissionContext context)
    {
        var httpContext = context as FissionHttpContext;
        if (httpContext != null)
        {
            return $"Hello from HTTP trigger! Method: {httpContext.Method}, URL: {httpContext.Url}";
        }
        return "Hello from non-HTTP trigger!";
    }
}
