import { useState, useEffect } from "react";
import type { DayData } from "./types/energy";
import { generateDayData } from "./data/generateData";
import { colors, font, spacing } from "./theme";
import Header from "./components/Header";
import DateWeatherBar from "./components/DateWeatherBar";
import DemandChart from "./components/DemandChart";
import ActualMixPie from "./components/ActualMixPie";
import CostEfficiencyChart from "./components/CostEfficiencyChart";
import OptimalMixPie from "./components/OptimalMixPie";
import { fetchWeather } from "./data/weatherApi";
import { OPTIMAL_COSTS } from "./data/constants";

export default function EnergyDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>("2025-01-01");
  const [data, setData] = useState<DayData | null>(null);
  const [realWeather, setRealWeather] = useState<DayData["weather"] | null>(
    null,
  );

  // Weather fetch via open-meteo — completely independent, unchanged
  useEffect(() => {
    fetchWeather(selectedDate)
      .then((w) => setRealWeather(w))
      .catch(() => console.log("Weather fetch failed"));
  }, [selectedDate]);

  // Energy data — tries FastAPI backend first, falls back to generateDayData
  // if the backend is unreachable so the app always works
  useEffect(() => {
    fetch(`http://localhost:8000/api/energy/${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        return res.json();
      })
      .then((backendData) => {
        // Backend returns { hours, avgMix } with no weather field.
        // We supply a stub weather object so the DayData type is satisfied;
        // it gets overwritten immediately by realWeather in the render below.
        setData({
          ...backendData,
          weather: {
            temp: 0,
            condition: "Unknown",
            dayName: new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
            }),
            solarIrradiance: 0,
          },
        });
      })
      .catch((err) => {
        console.warn(
          "Backend unavailable, falling back to generated data:",
          err.message,
        );
        setData(generateDayData(selectedDate));
      });
  }, [selectedDate]);

  if (!data)
    return (
      <div
        style={{
          background: colors.bgBase,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.textMuted,
          fontFamily: font.family,
          letterSpacing: 4,
          fontSize: font.md,
        }}
      >
        INITIALIZING GRID INTELLIGENCE...
      </div>
    );

  const hoursWithGap = data.hours.map((h) => ({
    ...h,
    gap: Math.max(0, h.demand - h.optimalDemand),
  }));
  const totalActual = Math.round(
    data.hours.reduce((a, h) => a + h.demand, 0) / 24,
  );
  const totalOptimal = Math.round(
    data.hours.reduce((a, h) => a + h.optimalDemand, 0) / 24,
  );
  const peakDemand = Math.max(...data.hours.map((h) => h.demand));
  const peakHour = data.hours.find((h) => h.demand === peakDemand)?.hour;
  const totalSavings = data.hours.reduce((a, h) => a + h.savings, 0);
  const avgSavingsPct =
    Math.round(((totalActual - totalOptimal) / totalActual) * 1000) / 10;
  const potentialSavings = Math.round(
    data.hours.reduce(
      (acc, h) => acc + h.savings * (OPTIMAL_COSTS.natural_gas / 1000),
      0,
    ),
  );

  return (
    <div
      style={{
        background: colors.bgBase,
        minHeight: "100vh",
        color: colors.textPrimary,
        fontFamily: font.family,
      }}
    >
      <Header />

      <div
        style={{ padding: `${spacing.lg}px ${spacing.xl}px ${spacing.xl}px` }}
      >
        {/* realWeather overwrites the stub weather from the backend response.
            If open-meteo hasn't responded yet, data.weather is used as fallback. */}
        <DateWeatherBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          data={{ ...data, weather: realWeather ?? data.weather }}
          totalActual={totalActual}
          totalOptimal={totalOptimal}
          peakDemand={peakDemand}
          peakHour={peakHour}
          totalSavings={totalSavings}
          avgSavingsPct={avgSavingsPct}
          potentialSavings={potentialSavings}
          totalCO2={data.totalCO2 ?? 0}
        />

        {/* Row 1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <DemandChart
            hours={hoursWithGap}
            avgSavingsPct={avgSavingsPct}
            totalSavings={totalSavings}
          />
          <ActualMixPie avgMix={data.avgMix} />
        </div>

        {/* Row 2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: spacing.md,
          }}
        >
          <CostEfficiencyChart hours={data.hours} />
          <OptimalMixPie optimalMix={data.optimalMix} />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${colors.borderDim}`,
            paddingTop: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          <div style={{ display: "flex", gap: spacing.md }}>
            {[
              {
                label: "U.S. Energy Information Administration",
                url: "https://www.eia.gov/electricity/gridmonitor/dashboard/electric_overview/balancing_authority/PACE",
              },
              {
                label: "Lazard LCOE+",
                url: "https://www.lazard.com/media/5tlbhyla/lazards-lcoeplus-june-2025-_vf.pdf",
              },
              { label: "Weather API", url: "https://open-meteo.com/" },
            ].map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: font.sm,
                  color: colors.textMuted,
                  textDecoration: "none",
                  letterSpacing: 1,
                  borderBottom: `1px solid ${colors.textMuted}40`,
                  paddingBottom: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = colors.textSecondary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = colors.textMuted)
                }
              >
                {label}
              </a>
            ))}
          </div>
          <span
            style={{
              fontSize: font.sm,
              color: colors.textMuted,
              letterSpacing: 1,
            }}
          >
            Energy Climate Hackathon 2026
          </span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        html, body, #root { width: 100%; min-height: 100vh; margin: 0; padding: 0; }
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.3) sepia(1) saturate(3) hue-rotate(40deg); cursor: pointer;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${colors.bgBase}; }
        ::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 2px; }
        button { cursor: pointer; }
        button:hover { opacity: 0.75; }
        * { outline: none; -webkit-tap-highlight-color: transparent; user-select: none; }
      `}</style>
    </div>
  );
}