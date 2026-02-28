import { colors, font, spacing } from "../theme";

export default function Header() {
  return (
    <div style={{
      borderBottom: `1px solid ${colors.border}`,
      padding: `18px ${spacing.xl}px`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: colors.bgHeader,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: spacing.lg }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: colors.actual,
          boxShadow: `0 0 8px ${colors.actual}, 0 0 20px ${colors.actual}60`,
          animation: "pulse 2s infinite", flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: font.lg, color: colors.textPrimary, letterSpacing: 2, fontWeight: 500 }}>
            Utah Energy Optimization
          </div>
          <div style={{ fontSize: font.sm, color: colors.textMuted, letterSpacing: 1, marginTop: 2 }}>
            Created by Andrew Vasquez, Annie DeBry, Cameron Kato, Ian Whatley, and Samantha Shiba
          </div>
        </div>
      </div>
    </div>
  );
}