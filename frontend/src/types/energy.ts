export type EnergyType =
  | "coal"
  | "natural_gas"
  | "nuclear"
  | "solar"
  | "wind"
  | "hydro"
  | "geothermal";

export type HourData = {
  hour: string;
  h: number;
  demand: number;
  optimalDemand: number;
  savings: number;
  [key: string]: number | string;
};

export type DayData = {
  hours: HourData[];
  avgMix: Record<EnergyType, number>;
  weather: {
    temp: number;
    condition: string;
    dayName: string;
    solarIrradiance: number;
  };
};

export type TooltipPayloadItem = {
  color?: string;
  name?: string;
  value?: number | string;
  unit?: string;
  dataKey?: string;
  payload?: HourData;
};

export type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

export type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
};
