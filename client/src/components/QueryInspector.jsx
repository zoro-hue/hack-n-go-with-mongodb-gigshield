import { useState } from "react";

export default function QueryInspector({ query }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <pre style={{
          background: "var(--surface)", border: "1px solid var(--border-dim)",
          borderRadius: "var(--radius-lg)", padding: "18px 20px",
          fontFamily: "var(--font-mono)", fontSize: 13, color: "#7ee787",
          whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.7,
          margin: 0, maxHeight: 420, overflowY: "auto",
        }}>
          {query}
        </pre>

        <button
          onClick={handleCopy}
          style={{
            position: "absolute", top: 12, right: 12,
            padding: "4px 10px", borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: copied ? "rgba(0,255,136,0.15)" : "rgba(13,17,23,0.9)",
            color: copied ? "var(--green)" : "var(--text-dim)",
            fontFamily: "var(--font-mono)", fontSize: 10, cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>

      <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-dim)" }}>
        ↑ Paste directly into MongoDB Shell, Compass, or your application code.
      </p>
    </div>
  );
}
