import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { ENERGY_COLORS, ENERGY_LABELS, ENERGY_TYPES } from "../data/constants";
import type { HourData, TooltipProps } from "../types/energy";

interface CostEfficiencyChartProps {
  hours: HourData[];
}

const CostTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#080D1A", border: "1px solid #1E3A5F", padding: "10px 14px", borderRadius: 4, minWidth: 180 }}>
      <p style={{ color: "#64748B", fontSize: 10, marginBottom: 8, fontFamily: "monospace", letterSpacing: 1 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 11, margin: "3px 0", fontFamily: "monospace" }}>
          <span style={{ color: "#475569" }}>{p.name}: </span>
          <span style={{ color: "#E2E8F0" }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}{p.unit ?? ""}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function CostEfficiencyChart({ hours }: CostEfficiencyChartProps) {
  const [activeSources, setActiveSources] = useState<string[]>(ENERGY_TYPES);

  const toggle = (t: string) =>
    setActiveSources(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <ChartCard label="Cost Efficiency" subtitle="$/MWh by Energy Source — 24-Hour Rate Curve" badge="DAILY USAGE" badgeColor="#F97316">

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {ENERGY_TYPES.map(t => (
          <button key={t} onClick={() => toggle(t)} style={{
            background: activeSources.includes(t) ? `${ENERGY_COLORS[t]}18` : "transparent",
            border: `1px solid ${activeSources.includes(t) ? ENERGY_COLORS[t] : "#1E3A5F"}`,
            color: activeSources.includes(t) ? ENERGY_COLORS[t] : "#334155",
            padding: "2px 9px", borderRadius: 3, fontSize: 8,
            fontFamily: "monospace", cursor: "pointer", letterSpacing: 1, transition: "all 0.15s",
          }}>
            {ENERGY_LABELS[t].toUpperCase()}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={hours} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 6" stroke="#0D1C30" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: "#334155", fontSize: 8, fontFamily: "monospace" }} tickLine={false} axisLine={{ stroke: "#1E3A5F" }} interval={2} />
          <YAxis tick={{ fill: "#334155", fontSize: 8, fontFamily: "monospace" }} tickLine={false} axisLine={false} unit=" $" width={44} />
          <Tooltip content={<CostTooltip />} />
          {ENERGY_TYPES.filter(t => activeSources.includes(t)).map(t => (
            <Line key={t} type="monotone" dataKey={`${t}_cost`} stroke={ENERGY_COLORS[t]} strokeWidth={1.5} dot={false} name={ENERGY_LABELS[t]} unit=" $/MWh" activeDot={{ r: 3, fill: ENERGY_COLORS[t] }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
