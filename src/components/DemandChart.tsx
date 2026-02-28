import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";
import type { HourData, TooltipProps } from "../types/energy";
import { colors, font, radius, spacing } from "../theme";

interface DemandChartProps {
  hours: HourData[];
  avgSavingsPct: number;
  totalSavings: number;
}

const DemandTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === "demand");
  const optimal = payload.find((p) => p.dataKey === "optimalDemand");
  const gap =
    actual?.value != null && optimal?.value != null
      ? (actual.value as number) - (optimal.value as number)
      : null;
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
      {actual && (
        <p style={{ color: colors.actual, fontSize: font.lg, margin: "4px 0" }}>
          Actual:{" "}
          <span style={{ color: colors.textPrimary }}>
            {(actual.value as number).toLocaleString()} KW
          </span>
        </p>
      )}
      {optimal && (
        <p
          style={{ color: colors.optimal, fontSize: font.md, margin: "4px 0" }}
        >
          Optimal:{" "}
          <span style={{ color: colors.textPrimary }}>
            {(optimal.value as number).toLocaleString()} KW
          </span>
        </p>
      )}
      {gap !== null && gap > 0 && (
        <p
          style={{
            color: colors.optimalGap,
            fontSize: font.md,
            marginTop: spacing.xs,
            borderTop: `1px solid ${colors.border}`,
            paddingTop: spacing.xs,
          }}
        >
          ↓ {gap.toLocaleString()} KW reducible
        </p>
      )}
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
      label="Grid Demand: Actual vs Optimal Mix"
      subtitle="Current usage vs lowest-cost alternative. Hover for comparison details"
      badge="OPTIMIZATION VIEW"
      badgeColor={colors.optimal}
    >
      {/* Legend */}
      <div
        style={{ display: "flex", gap: spacing.lg, marginBottom: spacing.md }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <div
            style={{
              width: 24,
              height: 3,
              background: colors.actual,
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: font.sm, color: colors.textSecondary }}>
            Actual Demand
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <svg width="24" height="8">
            <line
              x1="0"
              y1="4"
              x2="24"
              y2="4"
              stroke={colors.optimal}
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />
          </svg>
          <span style={{ fontSize: font.sm, color: colors.textSecondary }}>
            Optimal Mix Demand
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <div
            style={{
              width: 16,
              height: 12,
              background: `${colors.optimalGap}18`,
              border: `1px solid ${colors.optimalGap}40`,
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: font.sm, color: colors.textSecondary }}>
            Reducible Gap
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <AreaChart
          data={hours}
          margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={colors.optimalGap}
                stopOpacity={0.7}
              />
              <stop
                offset="100%"
                stopColor={colors.optimalGap}
                stopOpacity={0.2}
              />
            </linearGradient>
          </defs>
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
            unit=" KW"
            width={70}
          />
          <Tooltip content={<DemandTooltip />} />
          <Area
            type="monotone"
            dataKey="optimalDemand"
            stroke={colors.optimal}
            strokeWidth={2.5}
            strokeDasharray="7 3"
            fill="transparent"
            dot={false}
            name="Optimal Mix"
            stackId="stack"
          />
          <Area
            type="monotone"
            dataKey="gap"
            stroke="none"
            fill="url(#gapGrad)"
            fillOpacity={0.5}
            dot={false}
            name="Reducible Gap"
            stackId="stack"
          />
          <Area
            type="monotone"
            dataKey="demand"
            stroke={colors.actual}
            strokeWidth={3}
            fill="transparent"
            dot={false}
            name="Actual Demand"
            activeDot={{
              r: 5,
              fill: colors.actual,
              stroke: colors.bgBase,
              strokeWidth: 2,
            }}
          />
        </AreaChart>
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
          <strong>{totalSavings.toLocaleString()}</strong> KW·h reducible today
        </span>
      </div>
    </ChartCard>
  );
}
