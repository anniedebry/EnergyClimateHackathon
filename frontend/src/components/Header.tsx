import { colors, font, spacing } from "../theme";

export default function Header() {
  return (
    <div
      style={{
        padding: `18px ${spacing.xl}px`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: colors.bgHeader,
        position: "relative",
      }}
    >
      {/* Animated gradient border at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${colors.coal}, ${colors.wind}, ${colors.solar}, ${colors.hydro}, ${colors.nuclear}, ${colors.actual}, ${colors.optimal}, ${colors.coal})`,
          backgroundSize: "200% 100%",
          animation: "gradientShift 6s linear infinite",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: spacing.lg }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: colors.actual,
            boxShadow: `0 0 8px ${colors.actual}, 0 0 20px ${colors.actual}60`,
            animation: "pulse 2s infinite",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontSize: font.xxl,
              color: colors.textPrimary,
              letterSpacing: 2,
              fontWeight: 500,
            }}
          >
            Utah Energy Optimization
          </div>
          <div
            style={{
              fontSize: font.lg,
              color: colors.textMuted,
              letterSpacing: 1,
              marginTop: 2,
            }}
          >
            Created by Andrew Vasquez, Annie DeBry, Cameron Kato, Ian Whatley,
            and Samantha Shiba
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </div>
  );
}
