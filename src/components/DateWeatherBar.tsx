import type { DayData } from "../types/energy";
import { colors, font, radius, spacing } from "../theme";

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
  selectedDate, onDateChange, data,
  totalActual, totalOptimal, peakDemand, peakHour, totalSavings, avgSavingsPct,
}: DateWeatherBarProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.md, marginBottom: spacing.lg }}>
      <div style={{ display: "flex", gap: spacing.md, alignItems: "stretch" }}>

        {/* Date */}
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: radius.lg, padding: `${spacing.md}px ${spacing.lg}px`,
          display: "flex", flexDirection: "column", justifyContent: "center", gap: spacing.xs, flexShrink: 0,
        }}>
          <div style={{ fontSize: font.sm, color: colors.textMuted, letterSpacing: 2 }}>ANALYSIS DATE</div>
          <input
            type="date" min="2022-01-01" max="2025-12-31" value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            style={{
              background: colors.bgBase, border: `1px solid ${colors.border}`,
              color: colors.green, padding: "8px 14px", borderRadius: radius.sm,
              fontSize: font.lg, fontFamily: font.family, outline: "none",
              cursor: "pointer", letterSpacing: 1,
            }}
          />
          <div style={{ fontSize: font.sm, color: colors.textDim }}>2022 – 2025</div>
        </div>

        {/* Weather */}
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: radius.lg, padding: `${spacing.md}px ${spacing.lg}px`,
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, flexShrink: 0,
        }}>
          <div style={{ fontSize: font.sm, color: colors.textMuted, letterSpacing: 2 }}>SLC WEATHER</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 36, color: colors.textPrimary, fontWeight: 300 }}>{data.weather.temp}°F</span>
            <span style={{ fontSize: font.md, color: colors.textMuted }}>{data.weather.condition}</span>
          </div>
          <div style={{ display: "flex", gap: spacing.lg }}>
            {([["Humidity", `${data.weather.humidity}%`], ["Wind", `${data.weather.wind} mph`]] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <span style={{ fontSize: font.sm, color: colors.textDim }}>{k}: </span>
                <span style={{ fontSize: font.sm, color: colors.cyan }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero optimization gap */}
        <div style={{
          background: `${colors.teal}10`, border: `2px solid ${colors.teal}50`,
          borderRadius: radius.lg, padding: `${spacing.md}px 32px`,
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", flexShrink: 0,
        }}>
          <div style={{ fontSize: font.sm, color: colors.teal, letterSpacing: 2, marginBottom: 6 }}>OPTIMIZATION GAP</div>
          <div style={{ fontSize: font.hero, color: colors.teal, fontWeight: 300, lineHeight: 1 }}>{avgSavingsPct}%</div>
          <div style={{ fontSize: font.md, color: `${colors.teal}80`, marginTop: spacing.xs, textAlign: "center" }}>
            {totalSavings.toLocaleString()} MW·h reducible today
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "flex", gap: spacing.sm, flex: 1, flexWrap: "wrap" }}>
          {[
            { label: "PEAK DEMAND", val: peakDemand.toLocaleString(),  unit: "MW", sub: `@ ${peakHour}`,    color: colors.orange  },
            { label: "AVG ACTUAL",  val: totalActual.toLocaleString(),  unit: "MW", sub: "avg per hour",     color: colors.green   },
            { label: "AVG OPTIMAL", val: totalOptimal.toLocaleString(), unit: "MW", sub: "ideal source mix", color: colors.purple  },
          ].map((k, i) => (
            <div key={i} style={{
              flex: "1 1 140px",
              background: colors.bgCard, border: `1px solid ${colors.border}`,
              borderRadius: radius.lg, padding: `${spacing.md}px 22px`,
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <div style={{ fontSize: font.sm, color: colors.textSecondary, letterSpacing: 2, marginBottom: 10 }}>{k.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: font.xxl, color: k.color, fontWeight: 300 }}>{k.val}</span>
                <span style={{ fontSize: font.md, color: colors.textDim }}>{k.unit}</span>
              </div>
              <div style={{ fontSize: font.sm, color: colors.textSecondary, marginTop: 6 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
