import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import ChartCard from "./ChartCard";
import { ENERGY_COLORS, ENERGY_LABELS, ENERGY_TYPES } from "../data/constants";
import type { HourData, TooltipProps } from "../types/energy";
import { colors, font, radius, spacing } from "../theme";

interface DemandChartProps {
  hours: HourData[];
  avgSavingsPct: number;
  totalSavings: number;
}

const MixTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        padding: "12px 16px",
        borderRadius: radius.md,
        minWidth: 200,
      }}
    >
      <p
        style={{
          color: colors.textMuted,
          fontSize: font.sm,
          marginBottom: 10,
          letterSpacing: 1,
        }}
      >
        {label}
      </p>
      {[...payload].reverse().map((p, i) => (
        <p
          key={i}
          style={{ color: p.color, fontSize: font.md, margin: "3px 0" }}
        >
          {p.name}:{" "}
          <span style={{ color: colors.textPrimary }}>
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}%
          </span>
        </p>
      ))}
    </div>
  );
};

export default function DemandChart({
  hours,
  avgSavingsPct,
  totalSavings,
}: DemandChartProps) {
  return (
    <ChartCard
      label="Hourly Energy Source Distribution"
      subtitle="Percentage share of each source throughout the day. Hover for breakdown details"
      badge="SOURCE MIX"
      badgeColor={colors.optimal}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={hours}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid
            strokeDasharray="3 6"
            stroke={colors.borderDim}
            vertical={false}
          />
          <XAxis
            dataKey="hour"
            tick={{
              fill: colors.textMuted,
              fontSize: font.sm,
              fontFamily: font.family,
              dy: 10,
            }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            interval={2}
          />
          <YAxis
            tick={{
              fill: colors.textMuted,
              fontSize: font.sm,
              fontFamily: font.family,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            width={52}   // ← was 48, needs a bit more room for "100%"
          />
          <Tooltip content={<MixTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: font.sm,
              fontFamily: font.family,
              color: colors.textMuted,
              paddingTop: spacing.md,
            }}
            formatter={(value) => (
              <span style={{ color: colors.textMuted }}>{value}</span>
            )}
          />
          {ENERGY_TYPES.map((t) => (
            <Bar
              key={t}
              dataKey={`${t}_pct`}
              name={ENERGY_LABELS[t]}
              stackId="mix"
              fill={ENERGY_COLORS[t]}
              fillOpacity={0.9}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Savings bar */}
      <div
        style={{
          marginTop: spacing.md,
          padding: `${spacing.sm}px 18px`,
          background: `${colors.bgCard}08`,
          border: `2px solid ${colors.optimal}30`,
          borderRadius: radius.md,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: font.sm,
            color: colors.optimal,
            letterSpacing: 1,
          }}
        >
          DAILY OPTIMIZATION POTENTIAL
        </span>
        <span style={{ fontSize: font.sm, color: colors.optimal }}>
          ↓ <strong>{avgSavingsPct}%</strong> avg reduction ·{" "}
          <strong>{totalSavings.toLocaleString()}</strong> MW·h reducible today
        </span>
      </div>
    </ChartCard>
  );
}