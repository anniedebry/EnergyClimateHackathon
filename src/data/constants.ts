import type { EnergyType } from "../types/energy";

export const ENERGY_TYPES: EnergyType[] = ["coal", "natural_gas", "nuclear", "solar", "wind", "hydro"];

export const ENERGY_COLORS: Record<EnergyType, string> = {
  coal: "#9CA3AF",
  natural_gas: "#F59E0B",
  nuclear: "#A78BFA",
  solar: "#FB923C",
  wind: "#22D3EE",
  hydro: "#60A5FA",
};

export const ENERGY_LABELS: Record<EnergyType, string> = {
  coal: "Coal",
  natural_gas: "Nat. Gas",
  nuclear: "Nuclear",
  solar: "Solar",
  wind: "Wind",
  hydro: "Hydro",
};

export const OPTIMAL_COSTS: Record<EnergyType, number> = {
  coal: 42,
  natural_gas: 52,
  nuclear: 22,
  solar: 18,
  wind: 15,
  hydro: 12,
};

const inverseSum = ENERGY_TYPES.reduce((s, t) => s + 1 / OPTIMAL_COSTS[t], 0);
export const OPTIMAL_MIX: Record<EnergyType, number> = Object.fromEntries(
  ENERGY_TYPES.map(t => [t, Math.round((1 / OPTIMAL_COSTS[t] / inverseSum) * 1000) / 10])
) as Record<EnergyType, number>;
