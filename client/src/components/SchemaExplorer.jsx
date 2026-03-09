const COLLECTION_ICONS = {
  users: "👤",
  orders: "📦",
  products: "🛍️",
  transactions: "💳",
  logs: "📋",
  events: "📅",
};

const EXAMPLE_QUERIES = [
  "Show all active users",
  "Find delivered orders above $500",
  "Count orders by status",
  "Top 5 most expensive products",
  "Users older than 30",
  "List electronics with rating above 4.5",
];

export default function SchemaExplorer({ schema, loading, activeCollection, onSelect }) {
  return (
    <div>
      {/* Schema */}
      <p style={{ fontSize: 10, color: "var(--green)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
        ◈ Schema Explorer
      </p>

      {loading ? (
        <div style={{ color: "var(--text-dim)", fontSize: 12, padding: "8px 4px" }}>Loading schema...</div>
      ) : schema && Object.keys(schema).length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
          {Object.entries(schema).map(([col, fields]) => {
            const isActive = activeCollection === col;
            return (
              <div
                key={col}
                style={{
                  borderRadius: "var(--radius)", overflow: "hidden",
                  border: `1px solid ${isActive ? "rgba(0,255,136,0.3)" : "var(--border-dim)"}`,
                  background: isActive ? "var(--green-dim)" : "transparent",
                  transition: "all 0.18s",
                }}
              >
                <div
                  onClick={() => onSelect(col)}
                  style={{
                    padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                    cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12,
                    color: isActive ? "var(--green)" : "var(--text-muted)",
                  }}
                >
                  <span>{COLLECTION_ICONS[col] || "🗄️"}</span>
                  <span style={{ fontWeight: 700 }}>{col}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-dim)" }}>
                    {fields.length} fields
                  </span>
                </div>

                {isActive && (
                  <div style={{ padding: "0 12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                    {fields.map((f) => (
                      <div key={f} style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "rgba(0,255,136,0.35)", fontSize: 8 }}>▸</span>
                        <span style={{ fontFamily: "var(--font-mono)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ color: "var(--text-dim)", fontSize: 12, padding: "8px 4px", marginBottom: 24 }}>
          No schema available. Make sure MongoDB is connected.
        </div>
      )}

      {/* Example Queries */}
      <p style={{ fontSize: 10, color: "var(--green)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
        ◈ Try These
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {EXAMPLE_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              // Dispatch custom event to fill QueryInput
              window.dispatchEvent(new CustomEvent("nlmongo:fill", { detail: q }));
            }}
            style={{
              padding: "7px 10px", borderRadius: "var(--radius)",
              border: "1px solid var(--border-dim)", background: "transparent",
              color: "var(--text-dim)", cursor: "pointer", textAlign: "left",
              fontSize: 11, lineHeight: 1.4, fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--green)";
              e.currentTarget.style.color = "var(--green)";
              e.currentTarget.style.background = "var(--green-dim)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border-dim)";
              e.currentTarget.style.color = "var(--text-dim)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
