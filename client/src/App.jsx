import { useState } from "react";
import Header from "./components/Header";
import SchemaExplorer from "./components/SchemaExplorer";
import QueryInput from "./components/QueryInput";
import ResultsTable from "./components/ResultsTable";
import QueryInspector from "./components/QueryInspector";
import { useSchema } from "./hooks/useSchema";

const TABS = ["results", "query", "json"];

export default function App() {
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState("results");
  const [history, setHistory]         = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);

  const { schema, schemaLoading } = useSchema();

  const handleResult = (data) => {
    setResult(data);
    setError(null);
    setActiveTab("results");
    setActiveCollection(data.collection);
    setHistory((h) => [{ ...data, timestamp: new Date().toLocaleTimeString() }, ...h.slice(0, 9)]);
  };

  const handleError = (msg) => {
    setError(msg);
    setResult(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <Header />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: 260, flexShrink: 0, borderRight: "1px solid var(--border-dim)",
          background: "rgba(13,17,23,0.85)", overflowY: "auto", padding: "20px 16px",
        }}>
          <SchemaExplorer
            schema={schema}
            loading={schemaLoading}
            activeCollection={activeCollection}
            onSelect={setActiveCollection}
          />
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <QueryInput
            onResult={handleResult}
            onError={handleError}
            onLoadingChange={setLoading}
          />

          {/* Error */}
          {error && (
            <div className="animate-fade-up" style={{
              background: "rgba(252,129,129,0.06)", border: "1px solid rgba(252,129,129,0.25)",
              borderRadius: "var(--radius-lg)", padding: "14px 18px",
              color: "var(--red)", fontFamily: "var(--font-sans)", fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Result Area */}
          {result && !loading && (
            <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Explanation */}
              <div style={{
                background: "var(--blue-dim)", border: "1px solid rgba(0,180,216,0.2)",
                borderRadius: "var(--radius-lg)", padding: "14px 18px",
              }}>
                <p style={{ fontSize: 11, color: "var(--blue)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                  ◈ Explanation
                </p>
                <p style={{ color: "#a0aec0", fontSize: 14, lineHeight: 1.6 }}>{result.explanation}</p>
              </div>

              {/* Tab Bar */}
              <div style={{ borderBottom: "1px solid var(--border-dim)" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: "8px 18px", border: "none", cursor: "pointer",
                        fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase",
                        letterSpacing: "0.08em", background: "transparent",
                        color: activeTab === tab ? "var(--green)" : "var(--text-dim)",
                        borderBottom: `2px solid ${activeTab === tab ? "var(--green)" : "transparent"}`,
                        marginBottom: -1,
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-dim)", paddingRight: 4 }}>
                    {result.count} document{result.count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "results" && (
                <ResultsTable data={result.results} count={result.count} />
              )}
              {activeTab === "query" && (
                <QueryInspector query={result.generatedQuery} />
              )}
              {activeTab === "json" && (
                <QueryInspector
                  query={JSON.stringify(
                    { collection: result.collection, operation: result.operation, query: result.query, pipeline: result.pipeline, options: result.options },
                    null, 2
                  )}
                />
              )}
            </div>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>🍃</div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--surface-2)", letterSpacing: "0.05em", marginBottom: 10 }}>
                Ask in plain English
              </p>
              <p style={{ fontSize: 13, color: "var(--text-dim)", maxWidth: 340, lineHeight: 1.7 }}>
                Type any question about your data above — NLMongo will translate it into a MongoDB query and run it for you.
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 1 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
                ◈ Recent Queries
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {history.slice(1, 5).map((h, i) => (
                  <div
                    key={i}
                    onClick={() => { setResult(h); setActiveTab("results"); }}
                    style={{
                      padding: "8px 14px", borderRadius: "var(--radius)", cursor: "pointer",
                      border: "1px solid var(--border-dim)", background: "rgba(13,17,23,0.5)",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "var(--text-dim)", whiteSpace: "nowrap" }}>{h.timestamp}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {h.nl || h.explanation}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                      {h.count} docs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
