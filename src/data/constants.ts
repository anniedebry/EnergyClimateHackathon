import type { EnergyType } from "../types/energy";
import { colors } from "../theme";

export const ENERGY_TYPES: EnergyType[] = ["coal", "natural_gas", "nuclear", "solar", "wind", "hydro", "geothermal"];

export const ENERGY_COLORS: Record<EnergyType, string> = {
  coal:        colors.coal,
  natural_gas: colors.natural_gas,
  nuclear:     colors.nuclear,
  solar:       colors.solar,
  wind:        colors.wind,
  hydro:       colors.hydro,
  geothermal:  colors.geothermal,
};

export const ENERGY_LABELS: Record<EnergyType, string> = {
  coal:        "Coal",
  natural_gas: "Nat. Gas",
  nuclear:     "Nuclear",
  solar:       "Solar",
  wind:        "Wind",
  hydro:       "Hydro",
  geothermal: "Geothermal",
};

export const OPTIMAL_COSTS: Record<EnergyType, number> = {
  coal:        42,
  natural_gas: 52,
  nuclear:     22,
  solar:       18,
  wind:        15,
  hydro:       12,
  geothermal:  88,
};

const inverseSum = ENERGY_TYPES.reduce((s, t) => s + 1 / OPTIMAL_COSTS[t], 0);
export const OPTIMAL_MIX: Record<EnergyType, number> = Object.fromEntries(
  ENERGY_TYPES.map(t => [t, Math.round((1 / OPTIMAL_COSTS[t] / inverseSum) * 1000) / 10])
) as Record<EnergyType, number>;