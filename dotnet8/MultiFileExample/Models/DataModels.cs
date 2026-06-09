using System;

namespace MultiFileExample.Models
{
    public class DataRequest
    {
        public string Input { get; set; }
        public string Format { get; set; }
        public bool Validate { get; set; }
    }

    public class ProcessedData
    {
        public string Original { get; set; }
        public string Uppercase { get; set; }
        public string Lowercase { get; set; }
        public string Reversed { get; set; }
        public int Length { get; set; }
        public int WordCount { get; set; }
        public string Hash { get; set; }
        public string Base64Encoded { get; set; }
    }

    public class ProcessingStats
    {
        public int CharacterCount { get; set; }
        public int AlphaCount { get; set; }
        public int DigitCount { get; set; }
        public int SpaceCount { get; set; }
        public int SpecialCharCount { get; set; }
    }

    public class DataResponse
    {
        public bool Success { get; set; }
        public string Error { get; set; }
        public ProcessedData ProcessedData { get; set; }
        public ProcessingStats Statistics { get; set; }
        public DateTime ProcessedAt { get; set; }
        public string ProcessingTime { get; set; }
        public string Source { get; set; }
    }
}