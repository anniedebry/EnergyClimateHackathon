export default function Header() {
  return (
    <div style={{ borderBottom: "1px solid #0D1C30", padding: "13px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#070C18" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 10px #00FF88", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 10, color: "#00FF88", letterSpacing: 3 }}>SALT LAKE CITY  ·  GRID INTELLIGENCE PLATFORM</span>
        <span style={{ color: "#0D1C30" }}>|</span>
        <span style={{ fontSize: 9, color: "#1E3A5F", letterSpacing: 2 }}>Utah Energy Analytics</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <span style={{ fontSize: 8, color: "#1E3A5F", letterSpacing: 2 }}>ROCKY MOUNTAIN POWER TERRITORY</span>
        <span style={{ fontSize: 8, color: "#1E3A5F", letterSpacing: 2 }}>GOVERNMENT & UTILITY USE</span>
      </div>
    </div>
  );
}
