import { useState } from "react";

const PAGE_SIZE = 20;

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span style={{ color: value ? "#48bb78" : "var(--red)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        {value ? "✓ true" : "✗ false"}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span style={{ color: "var(--yellow)", fontFamily: "var(--font-mono)" }}>{value.toLocaleString()}</span>;
  }
  if (typeof value === "object") {
    const str = JSON.stringify(value);
    return (
      <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        {str.length > 40 ? str.slice(0, 40) + "…" : str}
      </span>
    );
  }
  const str = String(value);
  return str.length > 50 ? (
    <span title={str}>{str.slice(0, 50)}…</span>
  ) : (
    str
  );
};

export default function ResultsTable({ data, count }) {
  const [page, setPage] = useState(0);

  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: 40, textAlign: "center", color: "var(--text-dim)",
        border: "1px dashed var(--border-dim)", borderRadius: "var(--radius-lg)",
      }}>
        No documents match this query.
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pageData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-dim)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)" }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "10px 16px", textAlign: "left",
                    color: "var(--green)", fontSize: 10, letterSpacing: "0.12em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                    fontFamily: "var(--font-mono)", fontWeight: 700,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid var(--border-dim)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,255,136,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{ padding: "10px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}
                  >
                    {formatValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: "4px 10px", borderRadius: "var(--radius)",
              border: "1px solid var(--border-dim)", background: "transparent",
              color: page === 0 ? "var(--text-dim)" : "var(--text-muted)",
              cursor: page === 0 ? "not-allowed" : "pointer",
              fontFamily: "var(--font-mono)", fontSize: 11,
            }}
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              padding: "4px 10px", borderRadius: "var(--radius)",
              border: "1px solid var(--border-dim)", background: "transparent",
              color: page === totalPages - 1 ? "var(--text-dim)" : "var(--text-muted)",
              cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
              fontFamily: "var(--font-mono)", fontSize: 11,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
