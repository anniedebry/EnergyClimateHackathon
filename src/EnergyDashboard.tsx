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

export default function EnergyDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-07-15");
  const [data, setData] = useState<DayData | null>(null);

  useEffect(() => {
    setData(generateDayData(selectedDate));
  }, [selectedDate]);

  if (!data) return (
    <div style={{
      background: colors.bgBase, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: colors.textMuted, fontFamily: font.family, letterSpacing: 4, fontSize: font.md,
    }}>
      INITIALIZING GRID INTELLIGENCE...
    </div>
  );

  const totalActual   = Math.round(data.hours.reduce((a, h) => a + h.demand, 0) / 24);
  const totalOptimal  = Math.round(data.hours.reduce((a, h) => a + h.optimalDemand, 0) / 24);
  const peakDemand    = Math.max(...data.hours.map(h => h.demand));
  const peakHour      = data.hours.find(h => h.demand === peakDemand)?.hour;
  const totalSavings  = data.hours.reduce((a, h) => a + h.savings, 0);
  const avgSavingsPct = Math.round(((totalActual - totalOptimal) / totalActual) * 1000) / 10;

  return (
    <div style={{
      background: colors.bgBase,
      minHeight: "100vh",
      color: colors.textPrimary,
      fontFamily: font.family,
    }}>
      <Header />

      <div style={{ padding: `${spacing.lg}px ${spacing.xl}px ${spacing.xl}px` }}>
        <DateWeatherBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          data={data}
          totalActual={totalActual}
          totalOptimal={totalOptimal}
          peakDemand={peakDemand}
          peakHour={peakHour}
          totalSavings={totalSavings}
          avgSavingsPct={avgSavingsPct}
        />

        {/* Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: spacing.md, marginBottom: spacing.md }}>
          <DemandChart hours={data.hours} avgSavingsPct={avgSavingsPct} totalSavings={totalSavings} />
          <ActualMixPie avgMix={data.avgMix} />
        </div>

        {/* Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: spacing.md }}>
          <CostEfficiencyChart hours={data.hours} />
          <OptimalMixPie />
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          borderTop: `1px solid ${colors.borderDim}`,
          paddingTop: spacing.md, marginTop: spacing.lg,
        }}>
          <span style={{ fontSize: font.sm, color: colors.textMuted, letterSpacing: 1 }}>
            DATA: EIA · ROCKY MOUNTAIN POWER · DOE LEAD TOOL · NOAA WEATHER
          </span>
          <span style={{ fontSize: font.sm, color: colors.textMuted, letterSpacing: 1 }}>
            SALT LAKE CITY GRID INTELLIGENCE — v2.0
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
      `}</style>
    </div>
  );
}