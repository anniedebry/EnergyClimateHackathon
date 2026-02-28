export async function fetchWeather(date: string) {
  const res = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=40.7608&longitude=-111.8910&start_date=${date}&end_date=${date}&daily=temperature_2m_max,weather_code,shortwave_radiation_sum&temperature_unit=fahrenheit`
  );
  const data = await res.json();
  const daily = data.daily;

  const conditionMap: Record<number, string> = {
    0: "Clear", 1: "Mostly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Foggy", 51: "Light Drizzle", 53: "Drizzle",
    61: "Light Rain", 63: "Rain", 71: "Light Snow", 73: "Snow",
    80: "Showers", 81: "Showers", 95: "Thunderstorm",
  };

  const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  return {
    temp: Math.round(daily.temperature_2m_max[0]),
    condition: conditionMap[daily.weather_code[0]] ?? "Unknown",
    dayName,
    solarIrradiance: Math.round(daily.shortwave_radiation_sum[0]),
  };
}