import { useState, useEffect } from "react";
import type { DayData } from "./types/energy";
import { generateDayData } from "./data/generateData";
import Header from "./components/Header";
import DateWeatherBar from "./components/DateWeatherBar";
import DemandChart from "./components/DemandChart";
import ActualMixPie from "./components/ActualMixPie";
import CostEfficiencyChart from "./components/CostEfficiencyChart";
import OptimalMixPie from "./components/OptimalMixPie";

export default function EnergyDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-07-15");
  const [data, setData] = useState<DayData | null>(null);

  // ─── Swap this useEffect to connect real API data ────────────────────────
  // When your data scientists have the FastAPI endpoint ready, replace with:
  //
  //   useEffect(() => {
  //     fetch(`http://localhost:8000/api/energy/${selectedDate}`)
  //       .then(res => res.json())
  //       .then(data => setData(data))
  //       .catch(() => setData(generateDayData(selectedDate)));
  //   }, [selectedDate]);
  //
  useEffect(() => {
    setData(generateDayData(selectedDate));
  }, [selectedDate]);
  // ────────────────────────────────────────────────────────────────────────

  if (!data) return (
    <div style={{ background: "#060B18", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontFamily: "monospace", letterSpacing: 4, fontSize: 11 }}>
      INITIALIZING GRID INTELLIGENCE...
    </div>
  );

  // Computed values passed down to components
  const totalActual   = Math.round(data.hours.reduce((a, h) => a + h.demand, 0) / 24);
  const totalOptimal  = Math.round(data.hours.reduce((a, h) => a + h.optimalDemand, 0) / 24);
  const peakDemand    = Math.max(...data.hours.map(h => h.demand));
  const peakHour      = data.hours.find(h => h.demand === peakDemand)?.hour;
  const totalSavings  = data.hours.reduce((a, h) => a + h.savings, 0);
  const avgSavingsPct = Math.round(((totalActual - totalOptimal) / totalActual) * 1000) / 10;

  return (
    <div style={{ background: "#060B18", minHeight: "100vh", color: "#E2E8F0", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>

      <Header />

      <div style={{ padding: "18px 28px 28px" }}>

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

        {/* Row 1: Demand chart + Actual mix pie */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 12, marginBottom: 12 }}>
          <DemandChart hours={data.hours} avgSavingsPct={avgSavingsPct} totalSavings={totalSavings} />
          <ActualMixPie avgMix={data.avgMix} />
        </div>

        {/* Row 2: Cost efficiency + Optimal mix pie */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 12 }}>
          <CostEfficiencyChart hours={data.hours} />
          <OptimalMixPie />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #0D1C30", paddingTop: 12, marginTop: 16 }}>
          <span style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 2 }}>DATA: EIA · ROCKY MOUNTAIN POWER · DOE LEAD TOOL · NOAA WEATHER</span>
          <span style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 2 }}>SALT LAKE CITY GRID INTELLIGENCE — v2.0</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
      `}</style>
    </div>
  );
}
