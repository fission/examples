using System;
using System.Collections.Generic;

namespace MultiFileExample.Models
{
    public class WeatherResponse
    {
        public string City { get; set; }
        public int Temperature { get; set; }
        public string Condition { get; set; }
        public int Humidity { get; set; }
        public int WindSpeed { get; set; }
        public DateTime Timestamp { get; set; }
        public string Source { get; set; }
    }

    public class DailyForecast
    {
        public DateTime Date { get; set; }
        public int High { get; set; }
        public int Low { get; set; }
        public string Condition { get; set; }
        public int ChanceOfRain { get; set; }
    }

    public class ForecastResponse
    {
        public string City { get; set; }
        public int Days { get; set; }
        public List<DailyForecast> Forecasts { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string Source { get; set; }
    }
}