using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MultiFileExample.Models;

namespace MultiFileExample.Services
{
    public class WeatherService
    {
        private readonly Random _random = new Random();
        private readonly string[] _conditions = { "Sunny", "Cloudy", "Rainy", "Stormy", "Snowy", "Foggy", "Clear" };
        private readonly string[] _cities = { "New York", "London", "Tokyo", "Paris", "Sydney", "Toronto", "Berlin" };

        public async Task<WeatherResponse> GetWeatherAsync()
        {
            // Simulate async operation
            await Task.Delay(10);

            var city = _cities[_random.Next(_cities.Length)];
            
            return new WeatherResponse
            {
                City = city,
                Temperature = _random.Next(-10, 35),
                Condition = _conditions[_random.Next(_conditions.Length)],
                Humidity = _random.Next(30, 95),
                WindSpeed = _random.Next(0, 50),
                Timestamp = DateTime.UtcNow,
                Source = "WeatherService.cs"
            };
        }

        public async Task<ForecastResponse> GetForecastAsync()
        {
            // Simulate async operation
            await Task.Delay(10);

            var city = _cities[_random.Next(_cities.Length)];
            var forecasts = new List<DailyForecast>();

            for (int i = 0; i < 5; i++)
            {
                forecasts.Add(new DailyForecast
                {
                    Date = DateTime.UtcNow.AddDays(i),
                    High = _random.Next(10, 35),
                    Low = _random.Next(-5, 15),
                    Condition = _conditions[_random.Next(_conditions.Length)],
                    ChanceOfRain = _random.Next(0, 100)
                });
            }

            return new ForecastResponse
            {
                City = city,
                Days = 5,
                Forecasts = forecasts,
                GeneratedAt = DateTime.UtcNow,
                Source = "WeatherService.cs"
            };
        }
    }
}