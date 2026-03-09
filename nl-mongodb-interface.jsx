import { useState, useRef, useEffect } from "react";

// ── Sample DB Schema & Mock Data ──────────────────────────────────────────────
const SCHEMA = {
  users: {
    icon: "👤",
    fields: ["_id", "name", "email", "age", "city", "createdAt", "isActive"],
    sample: [
      { _id: "u1", name: "Aria Patel", email: "aria@example.com", age: 29, city: "Mumbai", createdAt: "2023-03-12", isActive: true },
      { _id: "u2", name: "Liam Chen", email: "liam@example.com", age: 34, city: "Shanghai", createdAt: "2022-11-05", isActive: true },
      { _id: "u3", name: "Sofia Russo", email: "sofia@example.com", age: 22, city: "Milan", createdAt: "2024-01-20", isActive: false },
      { _id: "u4", name: "Noah Kim", email: "noah@example.com", age: 41, city: "Seoul", createdAt: "2021-07-18", isActive: true },
      { _id: "u5", name: "Zara Ahmed", email: "zara@example.com", age: 27, city: "Dubai", createdAt: "2023-09-01", isActive: true },
    ],
  },
  orders: {
    icon: "📦",
    fields: ["_id", "userId", "product", "amount", "status", "category", "orderDate"],
    sample: [
      { _id: "o1", userId: "u1", product: "MacBook Pro", amount: 2499, status: "delivered", category: "electronics", orderDate: "2024-02-10" },
      { _id: "o2", userId: "u2", product: "Nike Shoes", amount: 120, status: "shipped", category: "apparel", orderDate: "2024-03-01" },
      { _id: "o3", userId: "u1", product: "Sony Headphones", amount: 350, status: "delivered", category: "electronics", orderDate: "2024-01-15" },
      { _id: "o4", userId: "u3", product: "Coffee Maker", amount: 89, status: "pending", category: "appliances", orderDate: "2024-03-05" },
      { _id: "o5", userId: "u4", product: "Running Watch", amount: 420, status: "delivered", category: "electronics", orderDate: "2023-12-20" },
      { _id: "o6", userId: "u5", product: "Leather Bag", amount: 210, status: "shipped", category: "apparel", orderDate: "2024-02-28" },
    ],
  },
  products: {
    icon: "🛍️",
    fields: ["_id", "name", "price", "category", "stock", "rating", "brand"],
    sample: [
      { _id: "p1", name: "MacBook Pro", price: 2499, category: "electronics", stock: 45, rating: 4.8, brand: "Apple" },
      { _id: "p2", name: "Nike Air Max", price: 120, category: "apparel", stock: 200, rating: 4.5, brand: "Nike" },
      { _id: "p3", name: "Sony WH-1000XM5", price: 350, category: "electronics", stock: 78, rating: 4.7, brand: "Sony" },
      { _id: "p4", name: "Breville Coffee Maker", price: 89, category: "appliances", stock: 32, rating: 4.3, brand: "Breville" },
      { _id: "p5", name: "Garmin Forerunner", price: 420, category: "electronics", stock: 15, rating: 4.6, brand: "Garmin" },
    ],
  },
};

const EXAMPLE_QUERIES = [
  "Show all active users from Mumbai",
  "Find orders with amount greater than 300 that were delivered",
  "List all electronics products with rating above 4.5",
  "Count orders by status",
  "Find users who are older than 30",
  "Show top 3 most expensive products",
];

const SYSTEM_PROMPT = `You are a MongoDB query expert. Convert natural language questions into MongoDB queries.

Available collections and their fields:
- users: _id, name, email, age, city, createdAt, isActive
- orders: _id, userId, product, amount, status, category, orderDate  
- products: _id, name, price, category, stock, rating, brand

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "collection": "collection_name",
  "operation": "find" | "aggregate" | "countDocuments",
  "query": { /* MongoDB filter or pipeline */ },
  "options": { "limit": number, "sort": {}, "projection": {} },
  "explanation": "Brief human-readable explanation of what this query does",
  "pipeline": [ /* Only for aggregate operations */ ]
}

For aggregate operations, use the "pipeline" array instead of "query".
Always include a helpful "explanation" field.`;

export default function NLMongoInterface() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeCollection, setActiveCollection] = useState("users");
  const [activeTab, setActiveTab] = useState("query"); // query | schema | history
  const inputRef = useRef(null);

  // Simulate query execution against mock data
  const executeQuery = (parsedQuery) => {
    const { collection, operation, query, options, pipeline } = parsedQuery;
    const col = SCHEMA[collection];
    if (!col) return { data: [], count: 0, error: "Collection not found" };

    let data = [...col.sample];

    if (operation === "countDocuments") {
      // Apply filters
      if (query && Object.keys(query).length > 0) {
        data = data.filter(doc => matchFilter(doc, query));
      }
      return { data: [{ count: data.length }], count: 1 };
    }

    if (operation === "aggregate" && pipeline) {
      // Simple pipeline simulation
      for (const stage of pipeline) {
        if (stage.$match) data = data.filter(doc => matchFilter(doc, stage.$match));
        if (stage.$sort) {
          const [field, order] = Object.entries(stage.$sort)[0];
          data.sort((a, b) => order === 1 ? (a[field] > b[field] ? 1 : -1) : (a[field] < b[field] ? 1 : -1));
        }
        if (stage.$limit) data = data.slice(0, stage.$limit);
        if (stage.$group) {
          const grouped = {};
          data.forEach(doc => {
            const key = doc[stage.$group._id?.replace("$", "")] || "unknown";
            if (!grouped[key]) grouped[key] = { _id: key, count: 0, total: 0 };
            grouped[key].count++;
            if (stage.$group.total?.$sum) {
              const field = stage.$group.total.$sum.replace("$", "");
              grouped[key].total += doc[field] || 0;
            }
          });
          data = Object.values(grouped);
        }
      }
      return { data, count: data.length };
    }

    // find operation
    if (query && Object.keys(query).length > 0) {
      data = data.filter(doc => matchFilter(doc, query));
    }
    if (options?.sort) {
      const [field, order] = Object.entries(options.sort)[0];
      data.sort((a, b) => order === 1 ? (a[field] > b[field] ? 1 : -1) : (a[field] < b[field] ? 1 : -1));
    }
    if (options?.limit) data = data.slice(0, options.limit);

    return { data, count: data.length };
  };

  const matchFilter = (doc, filter) => {
    for (const [key, value] of Object.entries(filter)) {
      if (key === "$and") return value.every(f => matchFilter(doc, f));
      if (key === "$or") return value.some(f => matchFilter(doc, f));
      if (typeof value === "object" && value !== null) {
        if (value.$gt !== undefined && !(doc[key] > value.$gt)) return false;
        if (value.$gte !== undefined && !(doc[key] >= value.$gte)) return false;
        if (value.$lt !== undefined && !(doc[key] < value.$lt)) return false;
        if (value.$lte !== undefined && !(doc[key] <= value.$lte)) return false;
        if (value.$in !== undefined && !value.$in.includes(doc[key])) return false;
        if (value.$regex !== undefined) {
          const rx = new RegExp(value.$regex, value.$options || "i");
          if (!rx.test(doc[key])) return false;
        }
      } else {
        if (doc[key] !== value) return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const queryResult = executeQuery(parsed);

      const entry = {
        id: Date.now(),
        nl: input,
        parsed,
        result: queryResult,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResult(entry);
      setHistory(h => [entry, ...h.slice(0, 9)]);
      setActiveCollection(parsed.collection || "users");
    } catch (e) {
      setError("Failed to process query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const buildQueryString = (parsed) => {
    if (!parsed) return "";
    if (parsed.operation === "aggregate") {
      return `db.${parsed.collection}.aggregate(${JSON.stringify(parsed.pipeline, null, 2)})`;
    }
    const opts = [];
    if (parsed.options?.sort) opts.push(`.sort(${JSON.stringify(parsed.options.sort)})`);
    if (parsed.options?.limit) opts.push(`.limit(${parsed.options.limit})`);
    return `db.${parsed.collection}.${parsed.operation}(${JSON.stringify(parsed.query || {}, null, 2)})${opts.join("")}`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0c10",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Animated grid background */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        * { box-sizing: border-box; }
        
        .grid-bg {
          position: fixed; inset: 0; z-index: 0;
          background-image: 
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        .glow-pulse {
          animation: glowPulse 3s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,136,0.1); }
          50% { box-shadow: 0 0 40px rgba(0,255,136,0.25); }
        }

        .cursor-blink::after {
          content: '|';
          animation: blink 1s step-end infinite;
          color: #00ff88;
          margin-left: 2px;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .slide-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tab-active {
          background: rgba(0,255,136,0.1);
          color: #00ff88;
          border-bottom: 2px solid #00ff88;
        }

        .row-hover:hover {
          background: rgba(0,255,136,0.05);
        }

        .example-chip:hover {
          background: rgba(0,255,136,0.15);
          border-color: #00ff88;
          color: #00ff88;
          cursor: pointer;
        }

        .query-box {
          background: #0d1117;
          border: 1px solid rgba(0,255,136,0.2);
          border-radius: 8px;
          padding: 16px;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          color: #7ee787;
          white-space: pre-wrap;
          word-break: break-all;
          line-height: 1.6;
        }

        textarea:focus { outline: none; }
        textarea::placeholder { color: #4a5568; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0a0c10; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 2px; }
      `}</style>

      <div className="grid-bg" />

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10,
        padding: "16px 28px",
        borderBottom: "1px solid rgba(0,255,136,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,12,16,0.9)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "linear-gradient(135deg, #00ff88, #00b4d8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🍃</div>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700, letterSpacing: "0.05em", color: "#fff" }}>
              NL<span style={{ color: "#00ff88" }}>Mongo</span>
            </div>
            <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Natural Language → MongoDB
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(SCHEMA).map(([col, { icon }]) => (
            <button key={col} onClick={() => setActiveCollection(col)} style={{
              padding: "4px 12px", borderRadius: 6, border: "1px solid",
              borderColor: activeCollection === col ? "#00ff88" : "rgba(255,255,255,0.1)",
              background: activeCollection === col ? "rgba(0,255,136,0.1)" : "transparent",
              color: activeCollection === col ? "#00ff88" : "#718096",
              fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer",
              transition: "all 0.2s",
            }}>{icon} {col}</button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        position: "relative", zIndex: 10, flex: 1,
        display: "grid", gridTemplateColumns: "280px 1fr",
        gap: 0, maxHeight: "calc(100vh - 65px)", overflow: "hidden",
      }}>
        {/* Sidebar */}
        <aside style={{
          borderRight: "1px solid rgba(0,255,136,0.1)",
          background: "rgba(13,17,23,0.8)",
          overflowY: "auto", padding: 20,
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
              ◈ Schema Explorer
            </div>
            {Object.entries(SCHEMA).map(([col, { icon, fields }]) => (
              <div key={col} style={{
                marginBottom: 12, borderRadius: 8, overflow: "hidden",
                border: `1px solid ${activeCollection === col ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.05)"}`,
                background: activeCollection === col ? "rgba(0,255,136,0.04)" : "transparent",
                transition: "all 0.2s",
              }}>
                <div onClick={() => setActiveCollection(col)} style={{
                  padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12,
                  color: activeCollection === col ? "#00ff88" : "#a0aec0",
                }}>
                  <span>{icon}</span>
                  <span style={{ fontWeight: 700 }}>{col}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#4a5568" }}>
                    {SCHEMA[col].sample.length} docs
                  </span>
                </div>
                {activeCollection === col && (
                  <div style={{ padding: "4px 12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                    {fields.map(f => (
                      <div key={f} style={{ fontSize: 11, color: "#718096", paddingLeft: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "rgba(0,255,136,0.4)", fontSize: 8 }}>▸</span>
                        <span style={{ fontFamily: "'Space Mono', monospace" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
              ◈ Try These
            </div>
            {EXAMPLE_QUERIES.map((q, i) => (
              <div key={i} className="example-chip" onClick={() => setInput(q)} style={{
                padding: "7px 10px", marginBottom: 6, borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.07)",
                fontSize: 11, color: "#718096", cursor: "pointer",
                transition: "all 0.2s", lineHeight: 1.4,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {q}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Panel */}
        <main style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Input Area */}
          <div className="glow-pulse" style={{
            background: "rgba(13,17,23,0.9)",
            border: "1px solid rgba(0,255,136,0.25)",
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
              ◈ Natural Language Query
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: 14,
                  color: "#00ff88", fontFamily: "'Space Mono', monospace", fontSize: 14,
                }}>›</span>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... e.g. 'Show all delivered orders above $200'"
                  rows={3}
                  style={{
                    width: "100%", padding: "12px 14px 12px 30px",
                    background: "#0a0c10", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "#e2e8f0", fontSize: 14, resize: "none",
                    fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                  }}
                />
              </div>
              <button onClick={handleSubmit} disabled={loading || !input.trim()} style={{
                padding: "12px 24px", borderRadius: 8, border: "none",
                background: loading ? "rgba(0,255,136,0.1)" : "linear-gradient(135deg, #00ff88, #00c96e)",
                color: loading ? "#00ff88" : "#0a0c10", fontWeight: 700,
                fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em",
                transition: "all 0.2s", whiteSpace: "nowrap",
                minWidth: 100,
              }}>
                {loading ? "⏳ Running" : "⚡ Execute"}
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#4a5568", fontFamily: "'DM Sans', sans-serif" }}>
              Press Enter to execute · Shift+Enter for new line
            </div>
          </div>

          {error && (
            <div className="slide-in" style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: 16, color: "#fc8181", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              ⚠ {error}
            </div>
          )}

          {result && (
            <div className="slide-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Explanation */}
              <div style={{
                background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.2)",
                borderRadius: 10, padding: 16,
              }}>
                <div style={{ fontSize: 10, color: "#00b4d8", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
                  ◈ Query Explanation
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "#a0aec0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                  {result.parsed.explanation}
                </p>
              </div>

              {/* Tabs */}
              <div>
                <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
                  {["results", "query", "json"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "tab-active" : ""} style={{
                      padding: "8px 18px", border: "none", borderBottom: "2px solid transparent",
                      background: "transparent", cursor: "pointer", fontSize: 12,
                      fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
                      letterSpacing: "0.08em", color: activeTab === tab ? "#00ff88" : "#4a5568",
                      borderBottomColor: activeTab === tab ? "#00ff88" : "transparent",
                      background: activeTab === tab ? "rgba(0,255,136,0.05)" : "transparent",
                      transition: "all 0.2s",
                    }}>{tab}</button>
                  ))}
                  <div style={{ marginLeft: "auto", padding: "8px 12px", fontSize: 11, color: "#4a5568", fontFamily: "'DM Sans', sans-serif" }}>
                    {result.result.count} document{result.result.count !== 1 ? "s" : ""} returned · {result.timestamp}
                  </div>
                </div>

                {activeTab === "results" && (
                  <div style={{ overflowX: "auto" }}>
                    {result.result.data.length === 0 ? (
                      <div style={{ padding: 40, textAlign: "center", color: "#4a5568", fontFamily: "'DM Sans', sans-serif" }}>
                        No documents match this query
                      </div>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(0,255,136,0.2)" }}>
                            {Object.keys(result.result.data[0]).map(k => (
                              <th key={k} style={{
                                padding: "8px 16px", textAlign: "left",
                                color: "#00ff88", fontSize: 11, letterSpacing: "0.1em",
                                textTransform: "uppercase", whiteSpace: "nowrap",
                              }}>{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.result.data.map((row, i) => (
                            <tr key={i} className="row-hover" style={{
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              transition: "background 0.15s",
                            }}>
                              {Object.values(row).map((v, j) => (
                                <td key={j} style={{
                                  padding: "10px 16px", color: "#a0aec0",
                                  whiteSpace: "nowrap",
                                }}>
                                  {typeof v === "boolean"
                                    ? <span style={{ color: v ? "#48bb78" : "#fc8181", fontSize: 11 }}>{v ? "✓ true" : "✗ false"}</span>
                                    : typeof v === "number"
                                    ? <span style={{ color: "#f6ad55" }}>{v}</span>
                                    : String(v)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "query" && (
                  <div>
                    <div className="query-box">
                      {buildQueryString(result.parsed)}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: "#4a5568", fontFamily: "'DM Sans', sans-serif" }}>
                      ↑ Copy and paste this into your MongoDB shell or Compass
                    </div>
                  </div>
                )}

                {activeTab === "json" && (
                  <div className="query-box">
                    {JSON.stringify(result.parsed, null, 2)}
                  </div>
                )}
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 60, textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🍃</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, color: "#2d3748", letterSpacing: "0.05em", marginBottom: 10 }}>
                Ask in plain English
              </div>
              <div style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Sans', sans-serif", maxWidth: 340, lineHeight: 1.6 }}>
                Type any question about your data and NLMongo will translate it into a MongoDB query automatically.
              </div>
            </div>
          )}

          {/* Query History */}
          {history.length > 1 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                ◈ Recent Queries
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.slice(1, 5).map(h => (
                  <div key={h.id} onClick={() => { setResult(h); setInput(h.nl); }} style={{
                    padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(13,17,23,0.5)",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "border-color 0.2s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    <span style={{ fontSize: 11, color: "#4a5568" }}>{h.timestamp}</span>
                    <span style={{ fontSize: 13, color: "#718096", flex: 1 }}>{h.nl}</span>
                    <span style={{ fontSize: 11, color: "#00ff88", fontFamily: "'Space Mono', monospace" }}>
                      {h.result.count} docs
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
