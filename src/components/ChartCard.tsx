import React from "react";
import { colors, font, radius, spacing } from "../theme";

interface ChartCardProps {
  label: string;
  labelColor?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}

export default function ChartCard({
  label,
  labelColor = colors.textPrimary,
  subtitle,
  badge,
  badgeColor = colors.actual,
  children,
}: ChartCardProps) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: "24px 28px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing.md,
        }}
      >
        <div>
          <div
            style={{
              fontSize: font.xl,
              color: labelColor,
              letterSpacing: 1,
              fontWeight: 500,
              marginBottom: spacing.xs / 2,
            }}
          >
            {label}
          </div>
          {subtitle && (
            <div style={{ fontSize: font.lg, color: colors.textMuted }}>
              {subtitle}
            </div>
          )}
        </div>
        {badge && (
          <div
            style={{
              background: `${badgeColor}18`,
              border: `1px solid ${badgeColor}50`,
              color: badgeColor,
              fontSize: font.xs,
              padding: `4px ${spacing.sm}px`,
              borderRadius: radius.sm,
              letterSpacing: 2,
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
          >
            {badge}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
