// ─────────────────────────────────────────────────────────────────────────────
// generateData.ts
//
// This file generates fake data for development and demo purposes.
// When your data scientists have the real CSV/API ready, replace the
// generateDayData function with a fetch call to your FastAPI endpoint.
//
// To connect real data, swap out the useEffect in EnergyDashboard.tsx:
//
//   useEffect(() => {
//     fetch(`http://localhost:8000/api/energy/${selectedDate}`)
//       .then(res => res.json())
//       .then(data => setData(data))
//       .catch(() => setData(generateDayData(selectedDate))); // fallback
//   }, [selectedDate]);
//
// ─────────────────────────────────────────────────────────────────────────────

import type { DayData, EnergyType, HourData } from "../types/energy";
import { ENERGY_TYPES, OPTIMAL_COSTS, OPTIMAL_MIX } from "./constants";

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

export function generateDayData(dateStr: string): DayData {
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

    return { hour: `${String(h).padStart(2, "0")}:00`, h, demand, optimalDemand, savings, ...mixPct, ...costs };
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
