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
  potentialSavings: number;
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      <div style={{ display: "flex", gap: spacing.md, alignItems: "stretch" }}>
        {/* Date */}
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            padding: `${spacing.md}px ${spacing.lg}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: spacing.xs,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: font.md,
              color: colors.textSecondary,
              letterSpacing: 2,
            }}
          >
            ANALYSIS DATE
          </div>
          <input
            type="date"
            min="2025-01-01"
            max="2025-12-31"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            style={{
              background: colors.bgBase,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              padding: "8px 14px",
              borderRadius: radius.sm,
              fontSize: font.lg,
              fontFamily: font.family,
              outline: "none",
              cursor: "pointer",
              letterSpacing: 1,
            }}
          />
          <div style={{ fontSize: font.md, color: colors.textMuted }}>2025</div>
        </div>

        {/* Weather */}
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            padding: `${spacing.md}px ${spacing.lg}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: font.md,
              color: colors.textSecondary,
              letterSpacing: 2,
            }}
          >
            SLC WEATHER
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontSize: font.xxl,
                color: colors.textPrimary,
                fontWeight: 400,
              }}
            >
              {data.weather.temp}°F
            </span>
            <span style={{ fontSize: font.md, color: colors.textMuted }}>
              {data.weather.condition}
            </span>
          </div>
          <div>
              <span style={{ fontSize: font.md, color: colors.textMuted }}>
                Solar Irradiance:{" "}
              </span>
              <span style={{ fontSize: font.md, color: colors.textPrimary }}>
                {data.weather.solarIrradiance} MJ/m²
              </span>
            </div>
        </div>

        {/* optimization gap */}
        <div
          style={{
            background: `${colors.textPrimary}10`,
            border: `2px solid ${colors.textPrimary}40`,
            borderRadius: radius.lg,
            padding: `${spacing.md}px 32px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: font.md,
              color: colors.textPrimary,
              letterSpacing: 2,
              marginBottom: 6,
            }}
          >
            OPTIMIZATION GAP
          </div>
          <div
            style={{
              fontSize: font.hero,
              color: colors.actual,
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            {avgSavingsPct}%
          </div>
          <div
            style={{
              fontSize: font.md,
              color: colors.textSecondary,
              marginTop: spacing.xs,
              textAlign: "center",
            }}
          >
            {totalSavings.toLocaleString()} MW·h reducible today
          </div>
        </div>

        {/* KPI cards */}
        <div
          style={{
            display: "flex",
            gap: spacing.sm,
            flex: 1,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "PEAK DEMAND",
              val: peakDemand.toLocaleString(),
              unit: "MW",
              sub: `Peak Hour: ${peakHour}`,
              color: colors.textPrimary,
            },
            {
              label: "GRID AVERAGE",
              val: totalActual.toLocaleString(),
              unit: "MW",
              sub: "Today's Hourly Avg",
              color: colors.textPrimary,
            },
            {
              label: "SAVINGS",
              val: totalOptimal.toLocaleString(),
              unit: "$",
              sub: "Using Optimal Mix",
              color: colors.textPrimary,
            },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 140px",
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                padding: `${spacing.md}px 22px`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: font.md,
                  color: colors.textSecondary,
                  letterSpacing: 2,
                  marginBottom: 10,
                }}
              >
                {k.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontSize: font.xxl,
                    color: k.color,
                    fontWeight: 500,
                  }}
                >
                  {k.val}
                </span>
                <span style={{ fontSize: font.md, color: colors.textDim }}>
                  {k.unit}
                </span>
              </div>
              <div
                style={{
                  fontSize: font.md,
                  color: colors.textMuted,
                  marginTop: 6,
                }}
              >
                {k.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}