using System;
using System.Linq;
using System.Text;
using MultiFileExample.Models;

namespace MultiFileExample.Services
{
    public class DataProcessor
    {
        public DataResponse ProcessData(DataRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Input))
            {
                return new DataResponse
                {
                    Success = false,
                    Error = "Input data is required",
                    ProcessedAt = DateTime.UtcNow
                };
            }

            // Simulate various data processing operations
            var processed = new ProcessedData
            {
                Original = request.Input,
                Uppercase = request.Input.ToUpper(),
                Lowercase = request.Input.ToLower(),
                Reversed = new string(request.Input.Reverse().ToArray()),
                Length = request.Input.Length,
                WordCount = request.Input.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                Hash = ComputeSimpleHash(request.Input),
                Base64Encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(request.Input))
            };

            // Calculate some statistics
            var stats = new ProcessingStats
            {
                CharacterCount = request.Input.Length,
                AlphaCount = request.Input.Count(char.IsLetter),
                DigitCount = request.Input.Count(char.IsDigit),
                SpaceCount = request.Input.Count(char.IsWhiteSpace),
                SpecialCharCount = request.Input.Count(c => !char.IsLetterOrDigit(c) && !char.IsWhiteSpace(c))
            };

            return new DataResponse
            {
                Success = true,
                ProcessedData = processed,
                Statistics = stats,
                ProcessedAt = DateTime.UtcNow,
                ProcessingTime = "< 1ms",
                Source = "DataProcessor.cs"
            };
        }

        private string ComputeSimpleHash(string input)
        {
            // Simple hash for demonstration
            int hash = 0;
            foreach (char c in input)
            {
                hash = ((hash << 5) - hash) + c;
            }
            return Math.Abs(hash).ToString("X8");
        }

        public object AnalyzeData(string data)
        {
            if (string.IsNullOrEmpty(data))
                return new { error = "No data provided" };

            return new
            {
                analysis = "Complete",
                dataPoints = data.Length,
                checksum = ComputeSimpleHash(data),
                timestamp = DateTime.UtcNow
            };
        }
    }
}