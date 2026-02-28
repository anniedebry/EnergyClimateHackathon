import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard";
import {
  ENERGY_COLORS,
  ENERGY_LABELS,
  ENERGY_TYPES,
} from "../data/constants";
import type { EnergyType, PieLabelProps } from "../types/energy";
import { colors, font, radius, spacing } from "../theme";

interface OptimalMixPieProps {
  optimalMix: Record<string, number>;
}

const PieLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  value = 0,
}: PieLabelProps) => {
  if (value < 6) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text
      x={cx + r * Math.cos(-midAngle * R)}
      y={cy + r * Math.sin(-midAngle * R)}
      fill="rgba(255,255,255,0.95)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={font.sm}
      fontFamily={font.family}
      fontWeight="500"
    >
      {value}%
    </text>
  );
};

export default function OptimalMixPie({ optimalMix }: OptimalMixPieProps) {
  const pieData = ENERGY_TYPES.map((t) => ({
    name: ENERGY_LABELS[t],
    value: optimalMix[t] ?? 0,
    key: t,
  }));

  return (
    <ChartCard
      label="Optimal Mix"
      labelColor={colors.optimal}
      subtitle="Ideal energy blend based on lowest cost per KWh"
    >
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={95}
            dataKey="value"
            labelLine={false}
            label={PieLabel}
          >
            {pieData.map((e, i) => (
              <Cell
                key={i}
                fill={ENERGY_COLORS[e.key as EnergyType]}
                fillOpacity={0.9}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`${v}%`]}
            contentStyle={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              fontFamily: font.family,
              fontSize: font.md,
              borderRadius: radius.md,
            }}
            itemStyle={{ color: colors.textSecondary }}
            labelStyle={{ color: colors.textPrimary }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: `6px ${spacing.md}px`,
          marginTop: spacing.sm,
        }}
      >
        {ENERGY_TYPES.map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.xs,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: radius.sm / 2,
                background: ENERGY_COLORS[t],
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: font.md, color: colors.textMuted }}>
              {ENERGY_LABELS[t]}
            </span>
            <span
              style={{
                fontSize: font.sm,
                color: colors.optimal,
                fontWeight: 500,
              }}
            >
              {optimalMix[t] ?? 0}%
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: spacing.sm,
          padding: `${spacing.xs}px 14px`,
          background: `${colors.optimal}0A`,
          border: `1px solid ${colors.optimal}25`,
          borderRadius: radius.md,
        }}
      >
        <span style={{ fontSize: font.md, color: `${colors.optimal}AA` }}>
          Lowest-cost source blend that meets demand while maintaining grid stability
        </span>
      </div>
    </ChartCard>
  );
}