import React from "react";

interface ChartCardProps {
  label: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}

export default function ChartCard({ label, subtitle, badge, badgeColor = "#00FF88", children }: ChartCardProps) {
  return (
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
}
