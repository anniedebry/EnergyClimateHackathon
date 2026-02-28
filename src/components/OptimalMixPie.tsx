import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard";
import { ENERGY_COLORS, ENERGY_LABELS, ENERGY_TYPES, OPTIMAL_MIX } from "../data/constants";
import type { EnergyType, PieLabelProps } from "../types/energy";

const PieLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, value = 0 }: PieLabelProps) => {
  if (value < 5) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="rgba(255,255,255,0.9)" textAnchor="middle" dominantBaseline="central" fontSize={9} fontFamily="monospace">
      {value}%
    </text>
  );
};

export default function OptimalMixPie() {
  const pieData = ENERGY_TYPES.map(t => ({ name: ENERGY_LABELS[t], value: OPTIMAL_MIX[t], key: t }));

  return (
    <ChartCard label="Optimal Mix Distribution" subtitle="Ideal % by Source — Lowest Cost Weighting" badge="★  OPTIMAL" badgeColor="#A78BFA">
      <ResponsiveContainer width="100%" height={134}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" innerRadius={34} outerRadius={62} dataKey="value" labelLine={false} label={PieLabel}>
            {pieData.map((e, i) => <Cell key={i} fill={ENERGY_COLORS[e.key as EnergyType]} fillOpacity={0.85} />)}
          </Pie>
          <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: "#0A0F1E", border: "1px solid #1E3A5F", fontFamily: "monospace", fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", marginTop: 10 }}>
        {ENERGY_TYPES.map(t => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: 1, background: ENERGY_COLORS[t], flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: "#334155" }}>{ENERGY_LABELS[t]}</span>
            <span style={{ fontSize: 8, color: "#A78BFA", marginLeft: "auto" }}>{OPTIMAL_MIX[t]}%</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "7px 12px", background: "#A78BFA08", border: "1px solid #A78BFA20", borderRadius: 4 }}>
        <span style={{ fontSize: 8, color: "#7C6FAA", letterSpacing: 1 }}>
          Weighted by inverse cost — cheapest sources get highest ideal share
        </span>
      </div>
    </ChartCard>
  );
}
