import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import type { HourData, TooltipProps } from "../types/energy";

interface DemandChartProps {
  hours: HourData[];
  avgSavingsPct: number;
  totalSavings: number;
}

const DemandTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const actual  = payload.find(p => p.dataKey === "demand");
  const optimal = payload.find(p => p.dataKey === "optimalDemand");
  const gap = actual?.value != null && optimal?.value != null
    ? (actual.value as number) - (optimal.value as number)
    : null;
  return (
    <div style={{ background: "#080D1A", border: "1px solid #1E3A5F", padding: "10px 14px", borderRadius: 4, minWidth: 200 }}>
      <p style={{ color: "#64748B", fontSize: 10, marginBottom: 8, fontFamily: "monospace", letterSpacing: 1 }}>{label}</p>
      {actual && (
        <p style={{ color: "#00FF88", fontSize: 11, margin: "3px 0", fontFamily: "monospace" }}>
          Actual: <span style={{ color: "#E2E8F0" }}>{(actual.value as number).toLocaleString()} MW</span>
        </p>
      )}
      {optimal && (
        <p style={{ color: "#A78BFA", fontSize: 11, margin: "3px 0", fontFamily: "monospace" }}>
          Optimal Mix: <span style={{ color: "#E2E8F0" }}>{(optimal.value as number).toLocaleString()} MW</span>
        </p>
      )}
      {gap !== null && gap > 0 && (
        <p style={{ color: "#34D399", fontSize: 10, marginTop: 6, fontFamily: "monospace", borderTop: "1px solid #1E3A5F", paddingTop: 6 }}>
          ↓ {gap.toLocaleString()} MW reducible
        </p>
      )}
    </div>
  );
};

export default function DemandChart({ hours, avgSavingsPct, totalSavings }: DemandChartProps) {
  return (
    <ChartCard
      label="Grid Demand — Actual vs Optimal Mix"
      subtitle="MW over 24hrs  ·  Green = actual load  ·  Purple = demand at optimal source ratio"
      badge="OPTIMIZATION VIEW"
      badgeColor="#34D399"
    >
      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 20, height: 2, background: "#00FF88", borderRadius: 1 }} />
          <span style={{ fontSize: 8, color: "#64748B", letterSpacing: 1 }}>ACTUAL DEMAND</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <svg width="22" height="8">
            <line x1="0" y1="4" x2="22" y2="4" stroke="#A78BFA" strokeWidth="2" strokeDasharray="5 3" />
          </svg>
          <span style={{ fontSize: 8, color: "#64748B", letterSpacing: 1 }}>OPTIMAL MIX DEMAND</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 14, height: 10, background: "#34D39915", border: "1px solid #34D39930", borderRadius: 2 }} />
          <span style={{ fontSize: 8, color: "#64748B", letterSpacing: 1 }}>REDUCIBLE GAP</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={hours} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF88" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 6" stroke="#0D1C30" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: "#334155", fontSize: 8, fontFamily: "monospace" }} tickLine={false} axisLine={{ stroke: "#1E3A5F" }} interval={2} />
          <YAxis tick={{ fill: "#334155", fontSize: 8, fontFamily: "monospace" }} tickLine={false} axisLine={false} unit=" MW" width={60} />
          <Tooltip content={<DemandTooltip />} />
          <Area type="monotone" dataKey="optimalDemand" stroke="#A78BFA" strokeWidth={2} strokeDasharray="6 3" fill="url(#optGrad)" dot={false} name="Optimal Mix" />
          <Area type="monotone" dataKey="demand" stroke="#00FF88" strokeWidth={2} fill="url(#actualGrad)" dot={false} name="Actual Demand" activeDot={{ r: 4, fill: "#00FF88", stroke: "#060B18", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Savings bar */}
      <div style={{ marginTop: 12, padding: "8px 14px", background: "#34D39908", border: "1px solid #34D39925", borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8, color: "#34D399", letterSpacing: 1 }}>DAILY OPTIMIZATION POTENTIAL</span>
        <span style={{ fontSize: 8, color: "#34D399", letterSpacing: 1 }}>↓ {avgSavingsPct}% avg demand reduction  ·  {totalSavings.toLocaleString()} total MW·h reducible</span>
      </div>
    </ChartCard>
  );
}
