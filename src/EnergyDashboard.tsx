import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
type EnergyType = "coal" | "natural_gas" | "nuclear" | "solar" | "wind" | "hydro";

interface HourData {
  hour: string;
  h: number;
  demand: number;
  optimalDemand: number;
  savings: number;
  [key: string]: number | string;
}

interface DayData {
  hours: HourData[];
  avgMix: Record<EnergyType, number>;
  weather: {
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
  };
}

interface TooltipPayloadItem {
  color?: string;
  name?: string;
  value?: number | string;
  unit?: string;
  dataKey?: string;
  payload?: HourData;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

interface ChartCardProps {
  label: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}

interface FilterButtonsProps {
  active: string[];
  onToggle: (t: string) => void;
}

interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ENERGY_TYPES: EnergyType[] = ["coal", "natural_gas", "nuclear", "solar", "wind", "hydro"];

const ENERGY_COLORS: Record<EnergyType, string> = {
  coal: "#9CA3AF",
  natural_gas: "#F59E0B",
  nuclear: "#A78BFA",
  solar: "#FB923C",
  wind: "#22D3EE",
  hydro: "#60A5FA",
};

const ENERGY_LABELS: Record<EnergyType, string> = {
  coal: "Coal",
  natural_gas: "Nat. Gas",
  nuclear: "Nuclear",
  solar: "Solar",
  wind: "Wind",
  hydro: "Hydro",
};

const OPTIMAL_COSTS: Record<EnergyType, number> = {
  coal: 42,
  natural_gas: 52,
  nuclear: 22,
  solar: 18,
  wind: 15,
  hydro: 12,
};

const inverseSum = ENERGY_TYPES.reduce((s, t) => s + 1 / OPTIMAL_COSTS[t], 0);
const OPTIMAL_MIX: Record<EnergyType, number> = Object.fromEntries(
  ENERGY_TYPES.map(t => [t, Math.round((1 / OPTIMAL_COSTS[t] / inverseSum) * 1000) / 10])
) as Record<EnergyType, number>;

// ── Data generation ───────────────────────────────────────────────────────────
function getOptimalDemandMultiplier(actualMix: Record<string, number>): number {
  const actualWeightedCost = ENERGY_TYPES.reduce(
    (s, t) => s + (actualMix[`${t}_pct`] / 100) * OPTIMAL_COSTS[t], 0
  );
  const optimalWeightedCost = ENERGY_TYPES.reduce(
    (s, t) => s + (OPTIMAL_MIX[t] / 100) * OPTIMAL_COSTS[t], 0
  );
  return optimalWeightedCost / actualWeightedCost;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

function generateDayData(dateStr: string): DayData {
  const seed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);
  const month = parseInt(dateStr.split("-")[1]);
  const isSummer = month >= 5 && month <= 9;
  const isWinter = month === 12 || month <= 2;

  const hours: HourData[] = Array.from({ length: 24 }, (_, h) => {
    const isMorningPeak = h >= 7 && h <= 9;
    const isEveningPeak = h >= 17 && h <= 21;
    const isNight = h < 5 || h > 22;

    let base = 2200;
    if (isSummer) base = 2800;
    if (isWinter) base = 2600;
    let demand = base;
    if (isMorningPeak) demand += 600 + rng() * 400;
    else if (isEveningPeak) demand += 900 + rng() * 500;
    else if (isNight) demand -= 600 + rng() * 200;
    else demand += rng() * 300 - 100;
    demand = Math.round(demand);

    const solarAvail = h >= 6 && h <= 20 ? Math.sin(((h - 6) / 14) * Math.PI) : 0;
    const windVar = 0.3 + rng() * 0.4;

    const mix: Record<EnergyType, number> = {
      coal: 0.25 + rng() * 0.1,
      natural_gas: 0.3 + rng() * 0.1,
      nuclear: 0.18 + rng() * 0.04,
      solar: solarAvail * (0.08 + rng() * 0.06),
      wind: windVar * 0.1,
      hydro: 0.05 + rng() * 0.03,
    };
    const total = Object.values(mix).reduce((a, b) => a + b, 0);
    (Object.keys(mix) as EnergyType[]).forEach(k => (mix[k] = mix[k] / total));

    const mixPct: Record<string, number> = Object.fromEntries(
      ENERGY_TYPES.map(t => [`${t}_pct`, Math.round(mix[t] * 100 * 10) / 10])
    );

    const peakMult = (isMorningPeak || isEveningPeak) ? 1.35 + rng() * 0.45 : 1.0 + rng() * 0.18;
    const costs: Record<string, number> = Object.fromEntries(
      ENERGY_TYPES.map(t => [
        `${t}_cost`,
        Math.round((OPTIMAL_COSTS[t] * peakMult + rng() * 9) * 10) / 10,
      ])
    );

    const optMult = getOptimalDemandMultiplier(mixPct);
    const optimalDemand = Math.round(demand * optMult);
    const savings = demand - optimalDemand;

    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      h,
      demand,
      optimalDemand,
      savings,
      ...mixPct,
      ...costs,
    };
  });

  const avgMix = Object.fromEntries(
    ENERGY_TYPES.map(t => [
      t,
      Math.round((hours.reduce((a, h) => a + (h[`${t}_pct`] as number), 0) / 24) * 10) / 10,
    ])
  ) as Record<EnergyType, number>;

  const temp = Math.round(rng() * 40 + (isSummer ? 72 : isWinter ? 28 : 52));
  const conditions = ["Clear", "Partly Cloudy", "Overcast", "Light Snow/Rain"];
  return {
    hours, avgMix,
    weather: {
      temp,
      condition: conditions[Math.floor(rng() * 4)],
      humidity: Math.round(30 + rng() * 40),
      wind: Math.round(5 + rng() * 20),
    },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
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

const PIE_LABEL = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, value = 0 }: PieLabelProps) => {
  if (value < 5) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text
      x={cx + r * Math.cos(-midAngle * R)}
      y={cy + r * Math.sin(-midAngle * R)}
      fill="rgba(255,255,255,0.9)" textAnchor="middle" dominantBaseline="central"
      fontSize={9} fontFamily="monospace"
    >
      {value}%
    </text>
  );
};

const ChartCard = ({ label, subtitle, badge, badgeColor = "#00FF88", children }: ChartCardProps) => (
  <div style={{ background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 6, padding: "20px 22px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 8, color: "#334155", letterSpacing: 3, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#475569" }}>{subtitle}</div>
      </div>
      {badge && (
        <div style={{
          background: `${badgeColor}15`, border: `1px solid ${badgeColor}40`,
          color: badgeColor, fontSize: 8, padding: "3px 10px", borderRadius: 3,
          letterSpacing: 2, whiteSpace: "nowrap",
        }}>
          {badge}
        </div>
      )}
    </div>
    {children}
  </div>
);

const FilterButtons = ({ active, onToggle }: FilterButtonsProps) => (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
    {ENERGY_TYPES.map(t => (
      <button key={t} onClick={() => onToggle(t)} style={{
        background: active.includes(t) ? `${ENERGY_COLORS[t]}18` : "transparent",
        border: `1px solid ${active.includes(t) ? ENERGY_COLORS[t] : "#1E3A5F"}`,
        color: active.includes(t) ? ENERGY_COLORS[t] : "#334155",
        padding: "2px 9px", borderRadius: 3, fontSize: 8,
        fontFamily: "monospace", cursor: "pointer", letterSpacing: 1, transition: "all 0.15s",
      }}>
        {ENERGY_LABELS[t].toUpperCase()}
      </button>
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function EnergyDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-07-15");
  const [data, setData] = useState<DayData | null>(null);
  const [activeCost, setActiveCost] = useState<string[]>(ENERGY_TYPES);

  useEffect(() => { setData(generateDayData(selectedDate)); }, [selectedDate]);

  if (!data) return (
    <div style={{ background: "#060B18", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontFamily: "monospace", letterSpacing: 4, fontSize: 11 }}>
      INITIALIZING GRID INTELLIGENCE...
    </div>
  );

  const actualPieData  = ENERGY_TYPES.map(t => ({ name: ENERGY_LABELS[t], value: data.avgMix[t], key: t }));
  const optimalPieData = ENERGY_TYPES.map(t => ({ name: ENERGY_LABELS[t], value: OPTIMAL_MIX[t], key: t }));

  const totalActual   = Math.round(data.hours.reduce((a, h) => a + h.demand, 0) / 24);
  const totalOptimal  = Math.round(data.hours.reduce((a, h) => a + h.optimalDemand, 0) / 24);
  const peakDemand    = Math.max(...data.hours.map(h => h.demand));
  const peakHour      = data.hours.find(h => h.demand === peakDemand)?.hour;
  const totalSavings  = data.hours.reduce((a, h) => a + h.savings, 0);
  const avgSavingsPct = Math.round(((totalActual - totalOptimal) / totalActual) * 1000) / 10;

  const toggleCost = (t: string) =>
    setActiveCost(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div style={{ background: "#060B18", minHeight: "100vh", color: "#E2E8F0", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #0D1C30", padding: "13px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#070C18" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 10px #00FF88", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, color: "#00FF88", letterSpacing: 3 }}>SALT LAKE CITY  ·  GRID INTELLIGENCE PLATFORM</span>
          <span style={{ color: "#0D1C30" }}>|</span>
          <span style={{ fontSize: 9, color: "#1E3A5F", letterSpacing: 2 }}>Utah Energy Analytics</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ fontSize: 8, color: "#1E3A5F", letterSpacing: 2 }}>ROCKY MOUNTAIN POWER TERRITORY</span>
          <span style={{ fontSize: 8, color: "#1E3A5F", letterSpacing: 2 }}>GOVERNMENT & UTILITY USE</span>
        </div>
      </div>

      <div style={{ padding: "18px 28px 28px" }}>

        {/* DATE / WEATHER / KPIS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "stretch" }}>

          <div style={{ background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 6, padding: "13px 18px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 3, marginBottom: 7 }}>ANALYSIS DATE</div>
              <input
                type="date" min="2022-01-01" max="2025-12-31" value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ background: "#060B18", border: "1px solid #1E3A5F", color: "#00FF88", padding: "6px 11px", borderRadius: 3, fontSize: 12, fontFamily: "monospace", outline: "none", cursor: "pointer", letterSpacing: 1 }}
              />
            </div>
            <div style={{ borderLeft: "1px solid #1E3A5F", paddingLeft: 14 }}>
              <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 2, marginBottom: 4 }}>RANGE</div>
              <div style={{ fontSize: 9, color: "#334155" }}>2022 – 2025</div>
            </div>
          </div>

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

          <div style={{ display: "flex", gap: 10, flex: 1 }}>
            {[
              { label: "PEAK DEMAND",        val: peakDemand.toLocaleString(),  unit: `MW @ ${peakHour}`,        color: "#F97316" },
              { label: "AVG ACTUAL DEMAND",  val: totalActual.toLocaleString(), unit: "MW",                      color: "#00FF88" },
              { label: "AVG OPTIMAL DEMAND", val: totalOptimal.toLocaleString(),unit: "MW at ideal mix",         color: "#A78BFA" },
              { label: "OPTIMIZATION GAP",   val: `${avgSavingsPct}%`,          unit: `${totalSavings.toLocaleString()} MW·h reducible`, color: "#34D399" },
            ].map((k, i) => (
              <div key={i} style={{ flex: 1, background: i === 3 ? "#34D39908" : "#0A0F1E", border: `1px solid ${i === 3 ? "#34D39940" : "#1E3A5F"}`, borderRadius: 6, padding: "13px 16px" }}>
                <div style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 3, marginBottom: 7 }}>{k.label}</div>
                <div style={{ fontSize: 20, color: k.color, fontWeight: 100 }}>{k.val}</div>
                <div style={{ fontSize: 8, color: "#334155", marginTop: 3 }}>{k.unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 1: Demand overlay + Actual Mix Pie */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 12, marginBottom: 12 }}>

          <ChartCard
            label="Grid Demand — Actual vs Optimal Mix"
            subtitle="MW over 24hrs  ·  Green = actual load  ·  Purple = demand at optimal source ratio"
            badge="OPTIMIZATION VIEW"
            badgeColor="#34D399"
          >
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
              <AreaChart data={data.hours} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
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

            <div style={{ marginTop: 12, padding: "8px 14px", background: "#34D39908", border: "1px solid #34D39925", borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 8, color: "#34D399", letterSpacing: 1 }}>DAILY OPTIMIZATION POTENTIAL</span>
              <span style={{ fontSize: 8, color: "#34D399", letterSpacing: 1 }}>↓ {avgSavingsPct}% avg demand reduction  ·  {totalSavings.toLocaleString()} total MW·h reducible</span>
            </div>
          </ChartCard>

          <ChartCard label="Daily Energy Mix" subtitle="Actual Average Distribution">
            <ResponsiveContainer width="100%" height={134}>
              <PieChart>
                <Pie data={actualPieData} cx="50%" cy="50%" innerRadius={34} outerRadius={62} dataKey="value" labelLine={false} label={PIE_LABEL}>
                  {actualPieData.map((e, i) => <Cell key={i} fill={ENERGY_COLORS[e.key as EnergyType]} fillOpacity={0.85} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: "#0A0F1E", border: "1px solid #1E3A5F", fontFamily: "monospace", fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", marginTop: 10 }}>
              {ENERGY_TYPES.map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 1, background: ENERGY_COLORS[t], flexShrink: 0 }} />
                  <span style={{ fontSize: 8, color: "#334155" }}>{ENERGY_LABELS[t]}</span>
                  <span style={{ fontSize: 8, color: "#64748B", marginLeft: "auto" }}>{data.avgMix[t]}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* ROW 2: Cost efficiency line + Optimal mix pie */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 12 }}>

          <ChartCard label="Cost Efficiency" subtitle="$/MWh by Energy Source — 24-Hour Rate Curve" badge="DAILY USAGE" badgeColor="#F97316">
            <FilterButtons active={activeCost} onToggle={toggleCost} />
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.hours} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="#0D1C30" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: "#334155", fontSize: 8, fontFamily: "monospace" }} tickLine={false} axisLine={{ stroke: "#1E3A5F" }} interval={2} />
                <YAxis tick={{ fill: "#334155", fontSize: 8, fontFamily: "monospace" }} tickLine={false} axisLine={false} unit=" $" width={44} />
                <Tooltip content={<CustomTooltip />} />
                {ENERGY_TYPES.filter(t => activeCost.includes(t)).map(t => (
                  <Line key={t} type="monotone" dataKey={`${t}_cost`} stroke={ENERGY_COLORS[t]} strokeWidth={1.5} dot={false} name={ENERGY_LABELS[t]} unit=" $/MWh" activeDot={{ r: 3, fill: ENERGY_COLORS[t] }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard label="Optimal Mix Distribution" subtitle="Ideal % by Source — Lowest Cost Weighting" badge="★  OPTIMAL" badgeColor="#A78BFA">
            <ResponsiveContainer width="100%" height={134}>
              <PieChart>
                <Pie data={optimalPieData} cx="50%" cy="50%" innerRadius={34} outerRadius={62} dataKey="value" labelLine={false} label={PIE_LABEL}>
                  {optimalPieData.map((e, i) => <Cell key={i} fill={ENERGY_COLORS[e.key as EnergyType]} fillOpacity={0.85} />)}
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
        </div>

        {/* FOOTER */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #0D1C30", paddingTop: 12, marginTop: 16 }}>
          <span style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 2 }}>DATA: EIA · ROCKY MOUNTAIN POWER · DOE LEAD TOOL · NOAA WEATHER</span>
          <span style={{ fontSize: 7, color: "#1E3A5F", letterSpacing: 2 }}>SALT LAKE CITY GRID INTELLIGENCE — v2.0</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.2) sepia(1) saturate(6) hue-rotate(100deg); cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #060B18; } ::-webkit-scrollbar-thumb { background: #1E3A5F; }
        button:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}
