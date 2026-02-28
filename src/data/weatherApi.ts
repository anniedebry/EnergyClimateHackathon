export async function fetchWeather() {
  // Salt Lake City coordinates
  const res = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=40.7608&longitude=-111.8910&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph"
  );
  const data = await res.json();
  const current = data.current;

  const conditionMap: Record<number, string> = {
    0: "Clear", 1: "Mostly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Foggy", 51: "Light Drizzle", 53: "Drizzle",
    61: "Light Rain", 63: "Rain", 71: "Light Snow", 73: "Snow",
    80: "Showers", 81: "Showers", 95: "Thunderstorm",
  };

  return {
    temp: Math.round(current.temperature_2m),
    condition: conditionMap[current.weather_code] ?? "Unknown",
    humidity: current.relative_humidity_2m,
    wind: Math.round(current.wind_speed_10m),
  };
}