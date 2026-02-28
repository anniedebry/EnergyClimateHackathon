import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";
import { ENERGY_COLORS, ENERGY_LABELS, ENERGY_TYPES } from "../data/constants";
import type { HourData, TooltipProps } from "../types/energy";
import { colors, font, radius, spacing } from "../theme";

interface CostEfficiencyChartProps {
  hours: HourData[];
}

const CostTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        padding: "12px 16px",
        borderRadius: radius.md,
        minWidth: 180,
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
      {payload.map((p, i) => (
        <p
          key={i}
          style={{ color: p.color, fontSize: font.md, margin: "4px 0" }}
        >
          {p.name}:{" "}
          <span style={{ color: colors.textPrimary }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}{" "}
            $/KWh
          </span>
        </p>
      ))}
    </div>
  );
};

export default function CostEfficiencyChart({
  hours,
}: CostEfficiencyChartProps) {
  const [activeSources, setActiveSources] = useState<string[]>(ENERGY_TYPES);
  const toggle = (t: string) =>
    setActiveSources((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  return (
    <ChartCard
      label="Cost Efficiency"
      subtitle="Price per KWh by source. Click source to filter, hover for comparison details"
      badge="DAILY USAGE"
      badgeColor={colors.textSecondary}
    >
      {/* Filter buttons */}
      <div
        style={{
          display: "flex",
          gap: spacing.xs,
          flexWrap: "wrap",
          marginBottom: spacing.md,
        }}
      >
        {ENERGY_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => toggle(t)}
            style={{
              background: activeSources.includes(t)
                ? `${ENERGY_COLORS[t]}20`
                : "transparent",
              border: `1.5px solid ${activeSources.includes(t) ? ENERGY_COLORS[t] : colors.border}`,
              color: activeSources.includes(t)
                ? ENERGY_COLORS[t]
                : colors.textMuted,
              padding: `5px 14px`,
              borderRadius: radius.sm,
              fontSize: font.sm,
              fontFamily: font.family,
              cursor: "pointer",
              letterSpacing: 1,
              transition: "all 0.15s",
              fontWeight: 500,
              outline: "none",
            }}
          >
            {ENERGY_LABELS[t]}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={hours}
          margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
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
            tickFormatter={(v) => `$${v}`}
            width={52}
          />
          <Tooltip content={<CostTooltip />} />
          {ENERGY_TYPES.filter((t) => activeSources.includes(t)).map((t) => (
            <Line
              key={t}
              type="monotone"
              dataKey={`${t}_cost`}
              stroke={ENERGY_COLORS[t]}
              strokeWidth={2}
              dot={false}
              name={ENERGY_LABELS[t]}
              activeDot={{ r: 4, fill: ENERGY_COLORS[t] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
