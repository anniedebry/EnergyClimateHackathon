import type { DayData } from "../types/energy";

interface DateWeatherBarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  data: DayData;
  totalActual: number;
  totalOptimal: number;
  peakDemand: number;
  peakHour: string | undefined;
  totalSavings: number;
  avgSavingsPct: number;
}

export default function DateWeatherBar({
  selectedDate,
  onDateChange,
  data,
  totalActual,
  totalOptimal,
  peakDemand,
  peakHour,
  totalSavings,
  avgSavingsPct,
}: DateWeatherBarProps) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "stretch" }}>

      {/* Date picker */}
      <div style={{ background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 6, padding: "13px 18px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 3, marginBottom: 7 }}>ANALYSIS DATE</div>
          <input
            type="date" min="2022-01-01" max="2025-12-31" value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            style={{ background: "#060B18", border: "1px solid #1E3A5F", color: "#00FF88", padding: "6px 11px", borderRadius: 3, fontSize: 12, fontFamily: "monospace", outline: "none", cursor: "pointer", letterSpacing: 1 }}
          />
        </div>
        <div style={{ borderLeft: "1px solid #1E3A5F", paddingLeft: 14 }}>
          <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 2, marginBottom: 4 }}>RANGE</div>
          <div style={{ fontSize: 9, color: "#334155" }}>2022 – 2025</div>
        </div>
      </div>

      {/* Weather */}
      <div style={{ background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 6, padding: "13px 18px", display: "flex", gap: 18, alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 3, marginBottom: 5 }}>SLC WEATHER</div>
          <div style={{ fontSize: 24, color: "#F1F5F9", fontWeight: 100 }}>{data.weather.temp}°F</div>
          <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>{data.weather.condition}</div>
        </div>
        <div style={{ borderLeft: "1px solid #1E3A5F", paddingLeft: 18, display: "flex", gap: 16 }}>
          {([["HUMIDITY", `${data.weather.humidity}%`], ["WIND", `${data.weather.wind} mph`]] as [string, string][]).map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 2, marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 14, color: "#22D3EE" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 10, flex: 1 }}>
        {[
          { label: "PEAK DEMAND",        val: peakDemand.toLocaleString(),   unit: `MW @ ${peakHour}`,                         color: "#F97316", highlight: false },
          { label: "AVG ACTUAL DEMAND",  val: totalActual.toLocaleString(),  unit: "MW",                                       color: "#00FF88", highlight: false },
          { label: "AVG OPTIMAL DEMAND", val: totalOptimal.toLocaleString(), unit: "MW at ideal mix",                          color: "#A78BFA", highlight: false },
          { label: "OPTIMIZATION GAP",   val: `${avgSavingsPct}%`,           unit: `${totalSavings.toLocaleString()} MW·h reducible`, color: "#34D399", highlight: true },
        ].map((k, i) => (
          <div key={i} style={{
            flex: 1,
            background: k.highlight ? "#34D39908" : "#0A0F1E",
            border: `1px solid ${k.highlight ? "#34D39940" : "#1E3A5F"}`,
            borderRadius: 6,
            padding: "13px 16px",
          }}>
            <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 3, marginBottom: 7 }}>{k.label}</div>
            <div style={{ fontSize: 20, color: k.color, fontWeight: 100 }}>{k.val}</div>
            <div style={{ fontSize: 8, color: "#334155", marginTop: 3 }}>{k.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
