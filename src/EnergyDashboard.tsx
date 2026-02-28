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
    <div style={{ background: "#060B18", minHeight: "100vh", color: "#E2E8F0", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", width: "100%"}}>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #0D1C30", padding: "13px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#070C18" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 10px #00FF88", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, color: "#00FF88", letterSpacing: 3 }}>SALT LAKE CITY  ·  GRID INTELLIGENCE PLATFORM</span>
          <span style={{ color: "#0D1C30" }}>|</span>
          <span style={{ fontSize: 9, color: "#1E3A5F", letterSpacing: 2 }}>Utah Energy Analytics</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ fontSize: 8, color: "#1E3A5F", letterSpacing: 2 }}>ROCKY MOUNTAIN POWER TERRITORY</span>
          <span style={{ fontSize: 8, color: "#1E3A5F", letterSpacing: 2 }}>GOVERNMENT & UTILITY USE</span>
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
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; }
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