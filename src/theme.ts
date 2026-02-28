export const colors = {
  // Backgrounds
  bgBase: "#0D1A0F",
  bgCard: "#1F3524",
  bgHeader: "#0A1510",

  // Borders
  border: "#31694E",
  borderDim: "#1E3D28",

  // Text
  textPrimary: "#D4E8C2",
  textSecondary: "#D4E84A",
  textMuted: "#8FB840",
  textDim: "#4A7A3A",

  // Accents
  actual: "#FF6B6B",
  optimal: "#00FF87",
  orange: "#F0E491",
  cyan: "#658C58",
  optimalGap: "#FF7A00",

  coal: "#A0704A", 
  natural_gas: "#FF8C00", 
  nuclear: "#B060E0", 
  solar: "#FFE600", 
  wind: "#30D878",
  hydro: "#0077CC",
} as const;

export const font = {
  family: "'DM Sans', sans-serif",
  weight: {
    light: 500,
    regular: 700,
    medium: 800,
    bold: 1000,
  },
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 44,
  hero: 80,
} as const;

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 40,
} as const;
