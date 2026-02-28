export const colors = {
  // Backgrounds
  bgBase:       "#060B18",
  bgCard:       "#0A0F1E",
  bgHeader:     "#070C18",

  // Borders
  border:       "#1E3A5F",
  borderDim:    "#0D1C30",

  // Text
  textPrimary:  "#F1F5F9",
  textSecondary:"#94A3B8",
  textMuted:    "#64748B",
  textDim:      "#475569",

  // Accents
  green:        "#00FF88",
  purple:       "#A78BFA",
  orange:       "#F97316",
  cyan:         "#22D3EE",
  teal:         "#34D399",

  // Energy sources
  coal:         "#9CA3AF",
  natural_gas:  "#F59E0B",
  nuclear:      "#A78BFA",
  solar:        "#FB923C",
  wind:         "#22D3EE",
  hydro:        "#60A5FA",
} as const;

export const font = {
  family:   "'IBM Plex Mono', 'Courier New', monospace",
  xs:       10,
  sm:       11,
  md:       13,
  lg:       15,
  xl:       20,
  xxl:      34,
  hero:     64,
} as const;

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

export const spacing = {
  xs:  8,
  sm:  12,
  md:  16,
  lg:  24,
  xl:  40,
} as const;