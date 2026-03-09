import { useState, useRef, useEffect } from "react";
import { useQuery } from "../hooks/useQuery";

export default function QueryInput({ onResult, onError, onLoadingChange }) {
  const [input, setInput] = useState("");
  const { execute, loading } = useQuery();
  const textareaRef = useRef(null);

  // Listen for example query fill events from SchemaExplorer
  useEffect(() => {
    const handler = (e) => {
      setInput(e.detail);
      textareaRef.current?.focus();
    };
    window.addEventListener("nlmongo:fill", handler);
    return () => window.removeEventListener("nlmongo:fill", handler);
  }, []);

  useEffect(() => {
    onLoadingChange(loading);
  }, [loading]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const result = await execute(input.trim());
    if (result?.error) {
      onError(result.error);
    } else if (result) {
      onResult({ ...result, nl: input.trim() });
    } else {
      onError("Something went wrong. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{
      background: "rgba(13,17,23,0.9)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: 20,
      boxShadow: loading ? "0 0 30px rgba(0,255,136,0.12)" : "0 0 20px rgba(0,255,136,0.05)",
      transition: "box-shadow 0.3s",
    }}>
      <p style={{ fontSize: 10, color: "var(--green)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
        ◈ Natural Language Query
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        <div style={{ flex: 1, position: "relative" }}>
          {/* Prompt symbol */}
          <span style={{
            position: "absolute", left: 14, top: 13,
            color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: 16,
            pointerEvents: "none", userSelect: "none",
          }}>›</span>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask anything... e.g. 'Show all delivered orders above $200'"
            rows={3}
            style={{
              width: "100%", padding: "12px 14px 12px 32px",
              background: "var(--bg)", border: "1px solid var(--border-dim)",
              borderRadius: "var(--radius)", color: "var(--text)",
              fontSize: 14, resize: "none", fontFamily: "var(--font-sans)",
              lineHeight: 1.6, outline: "none",
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-dim)")}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 22px", borderRadius: "var(--radius)", border: "none",
            background: loading || !input.trim()
              ? "rgba(0,255,136,0.08)"
              : "linear-gradient(135deg, #00ff88, #00c96e)",
            color: loading || !input.trim() ? "var(--green)" : "#0a0c10",
            fontWeight: 700, fontSize: 13, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
            whiteSpace: "nowrap", minWidth: 110,
            display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 12, height: 12, border: "2px solid var(--green)",
                borderTopColor: "transparent", borderRadius: "50%", display: "inline-block",
              }} className="animate-spin" />
              Running
            </>
          ) : (
            "⚡ Execute"
          )}
        </button>
      </div>

      <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-dim)" }}>
        Press <kbd style={{ padding: "1px 5px", background: "var(--surface-2)", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10 }}>Enter</kbd> to execute ·{" "}
        <kbd style={{ padding: "1px 5px", background: "var(--surface-2)", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10 }}>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
