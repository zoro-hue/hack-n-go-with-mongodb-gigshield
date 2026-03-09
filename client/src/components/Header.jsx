export default function Header() {
  return (
    <header style={{
      position: "relative", zIndex: 10,
      padding: "14px 24px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(10,12,16,0.92)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Logo mark */}
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #00ff88 0%, #00b4d8 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, boxShadow: "0 0 16px rgba(0,255,136,0.3)",
        }}>🍃</div>

        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>
            NL<span style={{ color: "var(--green)" }}>Mongo</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Natural Language → MongoDB
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 10px", borderRadius: 6,
          background: "rgba(0,255,136,0.06)",
          border: "1px solid var(--border)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "block" }} className="animate-pulse" />
          <span style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)" }}>CONNECTED</span>
        </div>
      </div>
    </header>
  );
}
