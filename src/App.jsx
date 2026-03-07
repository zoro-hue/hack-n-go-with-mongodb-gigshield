import { useState, useEffect, useRef } from "react";
import {
  Shield, CloudRain, Thermometer, Wind, AlertTriangle,
  CheckCircle, XCircle, Clock, TrendingUp, IndianRupee,
  Bell, User, BarChart2, ChevronRight, Zap, Eye,
  MapPin, Phone, Bike, RefreshCw, ArrowUpRight,
  Activity, Lock, Star, Wifi, AlertCircle, LogOut,
  Menu, X, ChevronDown, Droplets, Sun, Flame,
  CreditCard, Wallet, Search, Filter, Download,
  LayoutDashboard, FileText, DollarSign, Settings
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, LineChart, Line, Legend
} from "recharts";

// ─── PALETTE & CONSTANTS ──────────────────────────────────────
const C = {
  navy: "#0F2744", navyLight: "#1A3A5C",
  orange: "#FF6B2C", orangeLight: "#FF8C5A",
  teal: "#00C2A8", tealDark: "#009E88",
  emerald: "#10B981", red: "#EF4444",
  amber: "#F59E0B", sky: "#38BDF8",
  bg: "#F0F4F8", card: "#FFFFFF",
  text: "#1E293B", muted: "#64748B",
  border: "#E2E8F0"
};

// ─── MOCK DATA ────────────────────────────────────────────────
const CITIES = {
  Mumbai: { risk: 1.25, zones: ["Andheri West", "Bandra", "Dadar", "Kurla", "Borivali"] },
  Delhi: { risk: 1.30, zones: ["Saket", "Connaught Place", "Lajpat Nagar", "Rohini", "Dwarka"] },
  Bangalore: { risk: 1.10, zones: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar"] },
  Hyderabad: { risk: 1.15, zones: ["Banjara Hills", "Hitech City", "Ameerpet", "Secunderabad", "Gachibowli"] },
  Chennai: { risk: 1.20, zones: ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "Mylapore"] },
  Pune: { risk: 1.05, zones: ["Koregaon Park", "Kothrud", "Hadapsar", "Baner", "Viman Nagar"] },
};

const ZONE_RISK = {
  "Flood-prone": 1.35, "High-traffic": 1.15, "Industrial": 1.10,
  "Residential": 0.90, "Commercial": 1.05, "Mixed": 1.00
};

const initialDisruptions = [
  {
    id: "d1", type: "Heavy Rain", icon: "rain", threshold: 50, unit: "mm/hr",
    value: 12, triggered: false, severity: "low",
    description: "Rainfall > 50mm/hr halts food deliveries",
    color: "#38BDF8", triggerPayout: 0.6
  },
  {
    id: "d2", type: "Extreme Heat", icon: "heat", threshold: 42, unit: "°C",
    value: 38, triggered: false, severity: "low",
    description: "Temperature > 42°C outdoor work restriction",
    color: "#F97316", triggerPayout: 0.4
  },
  {
    id: "d3", type: "Severe Pollution", icon: "wind", threshold: 300, unit: "AQI",
    value: 210, triggered: false, severity: "moderate",
    description: "AQI > 300 health hazard for outdoor workers",
    color: "#A78BFA", triggerPayout: 0.5
  },
  {
    id: "d4", type: "Flash Flood", icon: "flood", threshold: 1, unit: "alert",
    value: 0, triggered: false, severity: "low",
    description: "District flood alert blocks zone access",
    color: "#0EA5E9", triggerPayout: 0.8
  },
  {
    id: "d5", type: "Local Strike", icon: "strike", threshold: 1, unit: "active",
    value: 0, triggered: false, severity: "low",
    description: "Transport/market strike prevents pickups",
    color: "#F59E0B", triggerPayout: 0.7
  }
];

const sampleClaims = [
  { id: "CLM-2026-001", type: "Heavy Rain", date: "2026-03-01", amount: 840, status: "paid", fraudScore: 12, autoTriggered: true, policyId: "POL-4421" },
  { id: "CLM-2026-002", type: "Extreme Heat", date: "2026-02-21", amount: 620, status: "paid", fraudScore: 8, autoTriggered: true, policyId: "POL-4421" },
  { id: "CLM-2026-003", type: "Severe Pollution", date: "2026-02-14", amount: 710, status: "processing", fraudScore: 31, autoTriggered: true, policyId: "POL-4421" },
  { id: "CLM-2026-004", type: "Local Strike", date: "2026-02-07", amount: 890, status: "paid", fraudScore: 5, autoTriggered: true, policyId: "POL-4421" },
];

const weeklyEarningsData = [
  { week: "W1", earned: 5200, protected: 4100 },
  { week: "W2", earned: 6100, protected: 4100 },
  { week: "W3", earned: 2100, protected: 4100, disruption: true },
  { week: "W4", earned: 5800, protected: 4100 },
  { week: "W5", earned: 6200, protected: 4100 },
  { week: "W6", earned: 1900, protected: 4100, disruption: true },
  { week: "W7", earned: 5900, protected: 4100 },
  { week: "W8", earned: 6400, protected: 4100 },
];

const adminAnalyticsData = [
  { month: "Oct", premiums: 182000, claims: 74000, ratio: 0.41 },
  { month: "Nov", premiums: 195000, claims: 88000, ratio: 0.45 },
  { month: "Dec", premiums: 241000, claims: 131000, ratio: 0.54 },
  { month: "Jan", premiums: 268000, claims: 109000, ratio: 0.41 },
  { month: "Feb", premiums: 312000, claims: 124000, ratio: 0.40 },
  { month: "Mar", premiums: 349000, claims: 138000, ratio: 0.40 },
];

const fraudCases = [
  { id: "FRD-001", worker: "Rajesh K.", claim: "CLM-2026-087", score: 78, flags: ["GPS mismatch", "Zone not affected"], status: "flagged" },
  { id: "FRD-002", worker: "Amit S.", claim: "CLM-2026-091", score: 62, flags: ["Duplicate claim pattern"], status: "reviewing" },
  { id: "FRD-003", worker: "Priya M.", claim: "CLM-2026-094", score: 15, flags: [], status: "cleared" },
  { id: "FRD-004", worker: "Suresh P.", claim: "CLM-2026-101", score: 89, flags: ["GPS spoofing detected", "No platform activity"], status: "rejected" },
];

const cityRiskData = [
  { city: "Mumbai", workers: 2840, claims: 134, ratio: 4.7 },
  { city: "Delhi", workers: 3210, claims: 198, ratio: 6.2 },
  { city: "Bangalore", workers: 2190, claims: 88, ratio: 4.0 },
  { city: "Hyderabad", workers: 1820, claims: 79, ratio: 4.3 },
  { city: "Chennai", workers: 1540, claims: 91, ratio: 5.9 },
  { city: "Pune", workers: 1120, claims: 38, ratio: 3.4 },
];

// ─── HELPERS ──────────────────────────────────────────────────
function calcPremium(worker) {
  if (!worker) return 49;
  const cityR = CITIES[worker.city]?.risk || 1.0;
  const zoneR = worker.zoneType === "Flood-prone" ? 1.35 :
    worker.zoneType === "High-traffic" ? 1.15 :
    worker.zoneType === "Residential" ? 0.90 : 1.05;
  const expDisc = worker.yearsActive >= 3 ? 0.88 :
    worker.yearsActive >= 1 ? 0.95 : 1.0;
  const hoursAdj = worker.hoursPerWeek > 60 ? 1.12 :
    worker.hoursPerWeek > 45 ? 1.05 : 1.0;
  return Math.round(49 * cityR * zoneR * expDisc * hoursAdj);
}

function calcCoverage(worker) {
  if (!worker) return 2000;
  return Math.min(Math.round(worker.avgWeeklyEarnings * 0.75), 3500);
}

function calcRiskScore(worker) {
  if (!worker) return 50;
  const cityR = (CITIES[worker.city]?.risk || 1.0) * 30;
  const zoneR = worker.zoneType === "Flood-prone" ? 25 :
    worker.zoneType === "High-traffic" ? 15 : 10;
  const expR = Math.max(0, 20 - worker.yearsActive * 4);
  const hoursR = Math.min(25, worker.hoursPerWeek * 0.35);
  return Math.min(99, Math.round(cityR + zoneR + expR + hoursR));
}

function riskLevel(score) {
  if (score >= 70) return { label: "High", color: C.red };
  if (score >= 45) return { label: "Medium", color: C.amber };
  return { label: "Low", color: C.emerald };
}

function Badge({ color, children, small }) {
  return (
    <span style={{
      background: color + "22", color: color,
      border: `1px solid ${color}44`,
      borderRadius: 20, padding: small ? "2px 8px" : "4px 12px",
      fontSize: small ? 11 : 12, fontWeight: 600, letterSpacing: 0.3,
      display: "inline-flex", alignItems: "center", gap: 4
    }}>{children}</span>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      padding: 20, ...style,
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s",
    }}>{children}</div>
  );
}

function StatCard({ icon, label, value, sub, color, delta }) {
  return (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sub}</div>}
          {delta && (
            <div style={{ fontSize: 12, color: delta > 0 ? C.emerald : C.red, marginTop: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              <ArrowUpRight size={12} />{Math.abs(delta)}% vs last month
            </div>
          )}
        </div>
        <div style={{ background: (color || C.teal) + "18", borderRadius: 12, padding: 10, color: color || C.teal }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ value, max, color, height = 8 }) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = pct >= 90 ? C.red : pct >= 70 ? C.amber : color || C.teal;
  return (
    <div style={{ background: "#E2E8F0", borderRadius: height, height, overflow: "hidden", position: "relative" }}>
      <div style={{
        width: `${pct}%`, height: "100%", borderRadius: height,
        background: barColor,
        transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative"
      }} />
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────
function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", phone: "", city: "Mumbai", zone: "",
    zoneType: "Mixed", platform: "Zomato",
    vehicleType: "Two-Wheeler", avgWeeklyEarnings: 5500,
    hoursPerWeek: 50, yearsActive: 2
  });
  const [selectedTier, setSelectedTier] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const premium = calcPremium(form);
  const coverage = calcCoverage(form);
  const riskScore = calcRiskScore(form);
  const rl = riskLevel(riskScore);

  const tiers = [
    { id: "basic", name: "Basic Shield", multiplier: 1.0, coveragePct: 0.6, features: ["Rain trigger", "Extreme heat", "1 claim/week"] },
    { id: "standard", name: "Standard Guard", multiplier: 1.4, coveragePct: 0.8, features: ["All 5 triggers", "2 claims/week", "Instant UPI payout"] },
    { id: "premium", name: "Premium Armor", multiplier: 1.85, coveragePct: 1.0, features: ["All triggers + social", "Unlimited claims", "Priority payout", "Advance weather alerts"] },
  ];

  const radarData = [
    { subject: "City Risk", A: (CITIES[form.city]?.risk || 1) * 55 },
    { subject: "Zone Risk", A: form.zoneType === "Flood-prone" ? 90 : form.zoneType === "High-traffic" ? 65 : 40 },
    { subject: "Hours/Wk", A: Math.min(100, form.hoursPerWeek * 1.5) },
    { subject: "Experience", A: Math.max(10, 80 - form.yearsActive * 15) },
    { subject: "Platform", A: form.platform === "Zomato" ? 55 : 50 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 50%, #0D3561 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{ width: "100%", maxWidth: 620 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: C.orange, borderRadius: 12, padding: "8px 10px", display: "flex" }}>
              <Shield size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>GigShield</div>
              <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1.5, textTransform: "uppercase" }}>Parametric Income Protection</div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: s < step ? C.teal : s === step ? C.orange : "rgba(255,255,255,0.15)",
                color: s <= step ? "white" : "#94A3B8", fontWeight: 700, fontSize: 13, transition: "all 0.3s"
              }}>
                {s < step ? <CheckCircle size={16} /> : s}
              </div>
              {s < 4 && <div style={{ width: 40, height: 2, background: s < step ? C.teal : "rgba(255,255,255,0.15)", transition: "all 0.3s" }} />}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, marginBottom: 24 }}>
          {["Basic Info", "Work Profile", "Risk Assessment", "Choose Plan"][step - 1]}
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, backdropFilter: "blur(10px)" }}>

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>Welcome, Delivery Partner 👋</h2>
              <p style={{ color: "#94A3B8", marginBottom: 24, fontSize: 14 }}>Set up your income protection in 2 minutes</p>
              {[
                { label: "Full Name", key: "name", placeholder: "Ravi Kumar", type: "text" },
                { label: "Phone Number", key: "phone", placeholder: "98765 43210", type: "tel" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} type={f.type}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>City</label>
                <select value={form.city} onChange={e => { set("city", e.target.value); set("zone", CITIES[e.target.value].zones[0]); }}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "#1A3A5C", color: "white", fontSize: 14, outline: "none" }}>
                  {Object.keys(CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Zone / Area</label>
                <select value={form.zone} onChange={e => set("zone", e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "#1A3A5C", color: "white", fontSize: 14, outline: "none" }}>
                  {(CITIES[form.city]?.zones || []).map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <button onClick={() => form.name && form.phone ? setStep(2) : null}
                style={{ width: "100%", padding: "14px", borderRadius: 12, background: C.orange, color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>Your Work Profile</h2>
              <p style={{ color: "#94A3B8", marginBottom: 24, fontSize: 14 }}>This helps us calculate your accurate weekly premium</p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Delivery Platform</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {["Zomato", "Swiggy", "Amazon", "Flipkart", "Zepto", "Blinkit"].map(p => (
                    <div key={p} onClick={() => set("platform", p)}
                      style={{ padding: "10px 14px", borderRadius: 10, border: `2px solid ${form.platform === p ? C.orange : "rgba(255,255,255,0.12)"}`, background: form.platform === p ? C.orange + "22" : "rgba(255,255,255,0.05)", color: form.platform === p ? C.orange : "#CBD5E1", cursor: "pointer", fontWeight: 600, fontSize: 13, textAlign: "center", transition: "all 0.2s" }}>
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Zone Type</label>
                <select value={form.zoneType} onChange={e => set("zoneType", e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "#1A3A5C", color: "white", fontSize: 14, outline: "none" }}>
                  {Object.keys(ZONE_RISK).map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>

              {[
                { label: "Average Weekly Earnings (₹)", key: "avgWeeklyEarnings", min: 2000, max: 12000, step: 100 },
                { label: "Hours Active Per Week", key: "hoursPerWeek", min: 20, max: 84, step: 1 },
                { label: "Years as Delivery Partner", key: "yearsActive", min: 0, max: 15, step: 1 },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600 }}>{f.label}</label>
                    <span style={{ color: C.orange, fontWeight: 700, fontSize: 14 }}>
                      {f.key === "avgWeeklyEarnings" ? `₹${form[f.key].toLocaleString("en-IN")}` : form[f.key]}
                    </span>
                  </div>
                  <input type="range" min={f.min} max={f.max} step={f.step} value={form[f.key]} onChange={e => set(f.key, Number(e.target.value))}
                    style={{ width: "100%", accentColor: C.orange }} />
                </div>
              ))}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: "12px", borderRadius: 12, background: C.orange, color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Analyse Risk <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>AI Risk Assessment</h2>
              <p style={{ color: "#94A3B8", marginBottom: 20, fontSize: 14 }}>Our ML model evaluated 12 risk factors for your profile</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Risk Score</div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: rl.color }}>{riskScore}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: rl.color }}>{rl.label} Risk</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Weekly Premium</div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: C.teal }}>₹{premium}</div>
                  <div style={{ fontSize: 13, color: "#94A3B8" }}>per week</div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Risk Factor Breakdown</div>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Radar name="Risk" dataKey="A" stroke={C.orange} fill={C.orange} fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "rgba(0,194,168,0.12)", border: "1px solid rgba(0,194,168,0.3)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: C.teal, fontWeight: 700, marginBottom: 4 }}>💡 AI Recommendation</div>
                <div style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.6 }}>
                  Based on your {form.city} ({form.zoneType}) profile with {form.yearsActive}+ years experience, 
                  we recommend <strong style={{ color: "white" }}>Standard Guard</strong> for optimal coverage-to-cost ratio.
                  Your estimated annual saving from disruption protection: <strong style={{ color: C.teal }}>₹{Math.round(coverage * 8.2).toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>Back</button>
                <button onClick={() => setStep(4)} style={{ flex: 2, padding: "12px", borderRadius: 12, background: C.orange, color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Choose Plan <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>Choose Your Shield</h2>
              <p style={{ color: "#94A3B8", marginBottom: 20, fontSize: 14 }}>Weekly coverage — cancel anytime, paid every Sunday</p>

              {tiers.map(tier => {
                const tierPremium = Math.round(premium * tier.multiplier);
                const tierCoverage = Math.round(coverage * tier.coveragePct);
                const isSelected = selectedTier === tier.id;
                const isRecommended = tier.id === "standard";
                return (
                  <div key={tier.id} onClick={() => setSelectedTier(tier.id)}
                    style={{
                      borderRadius: 14, padding: 16, marginBottom: 12, cursor: "pointer", transition: "all 0.2s",
                      border: `2px solid ${isSelected ? C.orange : isRecommended ? "rgba(0,194,168,0.5)" : "rgba(255,255,255,0.1)"}`,
                      background: isSelected ? C.orange + "15" : isRecommended ? "rgba(0,194,168,0.08)" : "rgba(255,255,255,0.05)",
                      position: "relative"
                    }}>
                    {isRecommended && <div style={{ position: "absolute", top: -10, right: 16, background: C.teal, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "white", fontWeight: 700 }}>RECOMMENDED</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "white", fontSize: 16 }}>{tier.name}</div>
                        <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 3 }}>Up to ₹{tierCoverage.toLocaleString("en-IN")} / week coverage</div>
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {tier.features.map(f => (
                            <span key={f} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "3px 9px", fontSize: 11, color: "#CBD5E1" }}>✓ {f}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 80 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: isSelected ? C.orange : "white" }}>₹{tierPremium}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>per week</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>Back</button>
                <button
                  onClick={() => selectedTier && onComplete({ ...form, tier: selectedTier, premium: Math.round(premium * tiers.find(t => t.id === selectedTier).multiplier), coverage: Math.round(coverage * tiers.find(t => t.id === selectedTier).coveragePct), riskScore })}
                  style={{ flex: 2, padding: "12px", borderRadius: 12, background: selectedTier ? C.teal : "#334155", color: "white", fontWeight: 700, border: "none", cursor: selectedTier ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
                  <Zap size={16} /> Activate Coverage
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", color: "#475569", fontSize: 11, marginTop: 16 }}>
          🔒 Regulated under IRDAI Sandbox Guidelines · Data encrypted with AES-256
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR NAV ───────────────────────────────────────────────
function Sidebar({ active, setActive, worker, isAdmin, setIsAdmin }) {
  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "monitor", icon: <Activity size={18} />, label: "Live Monitor" },
    { id: "claims", icon: <FileText size={18} />, label: "Claims" },
    { id: "payouts", icon: <Wallet size={18} />, label: "Payouts" },
    { id: "admin", icon: <BarChart2 size={18} />, label: "Admin View" },
  ];
  const rl = riskLevel(worker?.riskScore || 50);
  return (
    <div style={{ width: 220, background: C.navy, height: "100vh", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: C.orange, borderRadius: 8, padding: "5px 6px", display: "flex" }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>GigShield</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>INCOME PROTECTION</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 8px", flex: 1 }}>
        {navItems.map(item => (
          <div key={item.id} onClick={() => setActive(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 10, marginBottom: 2, cursor: "pointer", transition: "all 0.15s",
              background: active === item.id ? `${C.orange}25` : "transparent",
              color: active === item.id ? C.orange : "#94A3B8",
              fontWeight: active === item.id ? 700 : 500, fontSize: 14,
              borderLeft: active === item.id ? `3px solid ${C.orange}` : "3px solid transparent"
            }}>
            {item.icon}
            {item.label}
            {item.id === "monitor" && <span style={{ marginLeft: "auto", background: C.red, borderRadius: 10, width: 8, height: 8, display: "inline-block", animation: "pulse 1.5s infinite" }} />}
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 2 }}>{worker?.name || "Worker"}</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>{worker?.platform} · {worker?.city}</div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge color={rl.color} small>{rl.label} Risk</Badge>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>Active ✓</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard({ worker, policy, claims, disruptions }) {
  const rl = riskLevel(worker.riskScore);
  const activeDis = disruptions.filter(d => d.triggered);
  const totalProtected = claims.filter(c => c.status === "paid").reduce((a, c) => a + c.amount, 0);

  return (
    <div style={{ padding: 24 }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, borderRadius: 20, padding: "24px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Good Morning,</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginBottom: 4 }}>{worker.name} 👋</div>
          <div style={{ fontSize: 14, color: "#94A3B8" }}>
            <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />{worker.zone}, {worker.city} · {worker.platform}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {activeDis.length > 0 ? (
            <div style={{ background: `${C.red}22`, border: `1px solid ${C.red}44`, borderRadius: 12, padding: "10px 16px" }}>
              <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>⚠ ACTIVE DISRUPTION</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{activeDis[0].type}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Claim auto-processing</div>
            </div>
          ) : (
            <div style={{ background: `${C.emerald}18`, border: `1px solid ${C.emerald}33`, borderRadius: 12, padding: "10px 16px" }}>
              <div style={{ fontSize: 12, color: C.emerald, fontWeight: 700 }}>✓ ALL CLEAR</div>
              <div style={{ fontSize: 14, color: "#94A3B8" }}>No active disruptions</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={<Shield size={20} />} label="Weekly Premium" value={`₹${policy.premium}`} sub={`Coverage: ₹${policy.coverage.toLocaleString("en-IN")}`} color={C.teal} />
        <StatCard icon={<IndianRupee size={20} />} label="Income Protected" value={`₹${totalProtected.toLocaleString("en-IN")}`} sub="Total this year" color={C.emerald} delta={12} />
        <StatCard icon={<FileText size={20} />} label="Claims Filed" value={claims.length} sub={`${claims.filter(c => c.status === "paid").length} paid out`} color={C.orange} />
        <StatCard icon={<Activity size={20} />} label="Risk Score" value={worker.riskScore} sub={rl.label + " Risk"} color={rl.color} />
      </div>

      {/* Policy Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Active Policy</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginTop: 2 }}>GigShield {policy.tier === "standard" ? "Standard Guard" : policy.tier === "premium" ? "Premium Armor" : "Basic Shield"}</div>
            </div>
            <Badge color={C.emerald}>● ACTIVE</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { l: "Weekly Premium", v: `₹${policy.premium}` },
              { l: "Max Coverage", v: `₹${policy.coverage.toLocaleString("en-IN")}` },
              { l: "Policy ID", v: "POL-4421" },
              { l: "Renewal", v: "Every Sunday" },
            ].map(item => (
              <div key={item.l} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: C.muted }}>{item.l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 2 }}>{item.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            <strong style={{ color: C.text }}>Covered triggers:</strong> Heavy Rain · Extreme Heat · Severe Pollution · Flash Flood · Local Strike
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Earnings vs Protection (Last 8 Weeks)</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyEarningsData}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="protGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.orange} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.orange} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="protected" stroke={C.orange} fill="url(#protGrad)" strokeWidth={2} name="Coverage Floor" />
              <Area type="monotone" dataKey="earned" stroke={C.teal} fill="url(#earnGrad)" strokeWidth={2} name="Actual Earned" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: "center" }}>Orange floor = your guaranteed minimum with insurance</div>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Recent Claims</div>
          <Badge color={C.teal} small>Auto-triggered</Badge>
        </div>
        {claims.slice(0, 3).map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: C.bg, borderRadius: 8, padding: 8 }}>
                {c.type.includes("Rain") ? <CloudRain size={16} color={C.sky} /> :
                  c.type.includes("Heat") ? <Thermometer size={16} color={C.orange} /> :
                    <Wind size={16} color={C.amber} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{c.type}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{c.id} · {c.date}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>₹{c.amount.toLocaleString("en-IN")}</div>
              <Badge color={c.status === "paid" ? C.emerald : c.status === "processing" ? C.amber : C.sky} small>
                {c.status === "paid" ? "✓ Paid" : "Processing"}
              </Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── LIVE DISRUPTION MONITOR ──────────────────────────────────
function DisruptionMonitor({ disruptions, setDisruptions, addClaim }) {
  const [simulating, setSimulating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef(null);

  const simulateDisruption = (id) => {
    setDisruptions(prev => prev.map(d => {
      if (d.id !== id) return d;
      const newVal = d.type === "Heavy Rain" ? 65 :
        d.type === "Extreme Heat" ? 44 :
          d.type === "Severe Pollution" ? 340 : 1;
      const triggered = newVal >= d.threshold;
      if (triggered && !d.triggered) addClaim(d);
      return { ...d, value: newVal, triggered, severity: triggered ? "critical" : "high" };
    }));
  };

  const resetAll = () => {
    setDisruptions(prev => prev.map(d => ({ ...d, value: initialDisruptions.find(id => id.id === d.id)?.value || d.value, triggered: false, severity: "low" })));
    setSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (simulating) {
      intervalRef.current = setInterval(() => {
        setDisruptions(prev => prev.map(d => {
          const variance = (Math.random() - 0.5) * (d.threshold * 0.08);
          const newVal = Math.max(0, +(d.value + variance).toFixed(1));
          setLastUpdated(new Date());
          return { ...d, value: newVal };
        }));
      }, 2000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [simulating]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Live Disruption Monitor</h2>
          <div style={{ fontSize: 13, color: C.muted }}>
            <Wifi size={13} style={{ display: "inline", marginRight: 4, color: simulating ? C.emerald : C.muted }} />
            Updated: {lastUpdated.toLocaleTimeString()} · Real-time parametric triggers
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setSimulating(!simulating)}
            style={{ padding: "9px 16px", borderRadius: 10, background: simulating ? C.amber + "22" : C.teal + "22", color: simulating ? C.amber : C.teal, border: `1px solid ${simulating ? C.amber : C.teal}44`, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={14} style={{ animation: simulating ? "spin 1s linear infinite" : "none" }} />
            {simulating ? "Live ●" : "Start Live Feed"}
          </button>
          <button onClick={resetAll}
            style={{ padding: "9px 16px", borderRadius: 10, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Reset</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        {disruptions.map(d => {
          const pct = d.unit === "alert" || d.unit === "active" ? (d.value * 100) : (d.value / d.threshold) * 100;
          const isClose = pct >= 80;
          const borderColor = d.triggered ? C.red : isClose ? C.amber : d.color;
          return (
            <Card key={d.id} style={{ border: `2px solid ${d.triggered ? C.red + "60" : isClose ? C.amber + "40" : C.border}`, background: d.triggered ? `${C.red}06` : isClose ? `${C.amber}06` : C.card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ background: (d.triggered ? C.red : d.color) + "20", borderRadius: 10, padding: 9, color: d.triggered ? C.red : d.color }}>
                    {d.icon === "rain" ? <CloudRain size={20} /> : d.icon === "heat" ? <Thermometer size={20} /> : d.icon === "wind" ? <Wind size={20} /> : d.icon === "flood" ? <Droplets size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{d.type}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Threshold: {d.threshold} {d.unit}</div>
                  </div>
                </div>
                {d.triggered ? (
                  <Badge color={C.red}>⚡ TRIGGERED</Badge>
                ) : isClose ? (
                  <Badge color={C.amber}>Near Trigger</Badge>
                ) : (
                  <Badge color={C.emerald} small>Normal</Badge>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: d.triggered ? C.red : isClose ? C.amber : C.text }}>
                  {d.unit === "alert" || d.unit === "active" ? (d.value > 0 ? "YES" : "NO") : d.value.toFixed(d.unit === "AQI" ? 0 : 1)}
                </span>
                {d.unit !== "alert" && d.unit !== "active" && <span style={{ fontSize: 14, color: C.muted }}>{d.unit}</span>}
              </div>

              <ProgressBar value={d.value} max={d.threshold * 1.3} color={d.color} height={10} />

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.muted }}>
                <span>0</span>
                <span style={{ color: borderColor, fontWeight: 600 }}>Trigger: {d.threshold} {d.unit}</span>
                <span>{Math.round(d.threshold * 1.3)} {d.unit}</span>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>{d.description}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: d.color, fontWeight: 600 }}>Payout on trigger: {Math.round(d.triggerPayout * 100)}% of daily coverage</div>

              <button onClick={() => simulateDisruption(d.id)}
                style={{ marginTop: 12, width: "100%", padding: "9px", borderRadius: 10, background: d.triggered ? `${C.red}15` : `${d.color}15`, color: d.triggered ? C.red : d.color, border: `1px solid ${d.triggered ? C.red : d.color}44`, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {d.triggered ? "⚡ Claim Auto-Processing..." : "🧪 Simulate Trigger"}
              </button>
            </Card>
          );
        })}
      </div>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Trigger History (Last 7 Days)</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={[
            { day: "Mon", rain: 2, heat: 0, pollution: 1, strike: 0 },
            { day: "Tue", rain: 0, heat: 1, pollution: 1, strike: 0 },
            { day: "Wed", rain: 3, heat: 0, pollution: 2, strike: 1 },
            { day: "Thu", rain: 1, heat: 2, pollution: 0, strike: 0 },
            { day: "Fri", rain: 0, heat: 3, pollution: 1, strike: 0 },
            { day: "Sat", rain: 2, heat: 1, pollution: 0, strike: 0 },
            { day: "Sun", rain: 4, heat: 0, pollution: 2, strike: 1 },
          ]}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: `1px solid ${C.border}` }} />
            <Bar dataKey="rain" fill={C.sky} name="Rain" radius={[3, 3, 0, 0]} />
            <Bar dataKey="heat" fill={C.orange} name="Heat" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pollution" fill="#A78BFA" name="Pollution" radius={[3, 3, 0, 0]} />
            <Bar dataKey="strike" fill={C.amber} name="Strike" radius={[3, 3, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

// ─── CLAIMS VIEW ──────────────────────────────────────────────
function ClaimsView({ claims }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? claims : claims.filter(c => c.status === filter);

  const getFraudColor = (score) => score >= 60 ? C.red : score >= 30 ? C.amber : C.emerald;
  const getStatusColor = (s) => s === "paid" ? C.emerald : s === "processing" ? C.amber : s === "validating" ? C.sky : s === "triggered" ? C.orange : C.red;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Claims Management</h2>
          <div style={{ fontSize: 13, color: C.muted }}>AI-validated · Zero-touch parametric claims</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "triggered", "validating", "processing", "paid", "rejected"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 14px", borderRadius: 20, background: filter === f ? C.orange : C.bg, color: filter === f ? "white" : C.muted, border: `1px solid ${filter === f ? C.orange : C.border}`, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Claims", value: claims.length, color: C.teal },
          { label: "Paid Out", value: `₹${claims.filter(c => c.status === "paid").reduce((a, c) => a + c.amount, 0).toLocaleString("en-IN")}`, color: C.emerald },
          { label: "Processing", value: claims.filter(c => c.status === "processing").length, color: C.amber },
          { label: "Auto-Triggered", value: `${Math.round((claims.filter(c => c.autoTriggered).length / claims.length) * 100)}%`, color: C.orange },
        ].map(s => (
          <Card key={s.label} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* AI Processing Visual */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.navy}08, ${C.navyLight}12)`, border: `1px solid ${C.navy}22` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: C.navy, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} color={C.orange} />
            <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>AI Claim Pipeline</span>
          </div>
          {["Weather Trigger", "→", "GPS Validation", "→", "Fraud Scan", "→", "Auto-Approve", "→", "UPI Payout"].map((step, i) => (
            <div key={i} style={{ fontSize: 12, fontWeight: step === "→" ? 400 : 600, color: step === "→" ? C.muted : C.text }}>
              {step !== "→" && <span style={{ background: C.teal + "20", borderRadius: 6, padding: "3px 8px", color: C.teal }}>{step}</span>}
              {step === "→" && <span style={{ color: C.muted, fontSize: 16 }}>→</span>}
            </div>
          ))}
          <Badge color={C.emerald} small>Avg: 47 seconds</Badge>
        </div>
      </Card>

      {filtered.map(c => (
        <Card key={c.id} style={{ marginBottom: 12, borderLeft: `4px solid ${getStatusColor(c.status)}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ background: C.bg, borderRadius: 10, padding: 12, marginTop: 2 }}>
                {c.type.includes("Rain") ? <CloudRain size={20} color={C.sky} /> :
                  c.type.includes("Heat") ? <Thermometer size={20} color={C.orange} /> :
                    c.type.includes("Pollution") ? <Wind size={20} color="#A78BFA" /> :
                      <AlertTriangle size={20} color={C.amber} />}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{c.type}</span>
                  {c.autoTriggered && <Badge color={C.teal} small><Zap size={10} /> Auto</Badge>}
                  <Badge color={getStatusColor(c.status)} small>{c.status.toUpperCase()}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                  {c.id} · {c.date} · Policy: {c.policyId}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ background: C.bg, borderRadius: 8, padding: "6px 10px" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>Claim Amount</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>₹{c.amount.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: "6px 10px" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>Fraud Score</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: getFraudColor(c.fraudScore) }}>{c.fraudScore}/100</div>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: "6px 10px" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>Trigger</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>Parametric ✓</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Fraud Risk</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 80 }}>
                  <ProgressBar value={c.fraudScore} max={100} color={getFraudColor(c.fraudScore)} height={6} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: getFraudColor(c.fraudScore) }}>
                  {c.fraudScore < 30 ? "CLEAN" : c.fraudScore < 60 ? "REVIEW" : "FLAGGED"}
                </span>
              </div>
              {c.status === "paid" && (
                <div style={{ marginTop: 10, fontSize: 12, color: C.emerald, fontWeight: 600 }}>
                  <CheckCircle size={13} style={{ display: "inline", marginRight: 4 }} />UPI Credited
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── PAYOUTS VIEW ─────────────────────────────────────────────
function PayoutsView({ claims }) {
  const paidClaims = claims.filter(c => c.status === "paid");
  const total = paidClaims.reduce((a, c) => a + c.amount, 0);
  const methods = [
    { name: "UPI (PhonePe)", icon: "📱", count: 3, amount: 2170 },
    { name: "UPI (GPay)", icon: "💳", count: 1, amount: 890 },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Payouts & Wallet</h2>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Instant UPI payouts · Usually within 60 seconds of claim approval</div>

      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 20, padding: 28, marginBottom: 24, color: "white" }}>
        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Total Income Protected This Year</div>
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1 }}>₹{total.toLocaleString("en-IN")}</div>
        <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 6 }}>Across {paidClaims.length} successful claims · 0 processing fees</div>
        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {methods.map(m => (
            <div key={m.name} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px" }}>
              <div style={{ fontSize: 16 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{m.count} payouts · ₹{m.amount.toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Monthly Payout Summary</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={[
              { month: "Oct", amount: 420 }, { month: "Nov", amount: 1140 },
              { month: "Dec", amount: 870 }, { month: "Jan", amount: 620 },
              { month: "Feb", amount: 2060 }, { month: "Mar", amount: total },
            ]}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Payout"]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="amount" fill={C.teal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Payment Method Split</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={[{ name: "PhonePe UPI", value: 71 }, { name: "GPay UPI", value: 29 }]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                <Cell fill={C.teal} />
                <Cell fill={C.orange} />
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {paidClaims.map((c, i) => (
        <Card key={c.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: C.emerald + "18", borderRadius: 10, padding: 10, color: C.emerald }}>
              <CheckCircle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: C.text }}>{c.type} · {c.id}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{c.date} · Policy {c.policyId} · Via UPI</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.emerald }}>+₹{c.amount.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>Credited in {12 + i * 8}s</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────
function AdminView() {
  const totalPremiums = adminAnalyticsData.reduce((a, d) => a + d.premiums, 0);
  const totalClaims = adminAnalyticsData.reduce((a, d) => a + d.claims, 0);
  const activePolicies = cityRiskData.reduce((a, d) => a + d.workers, 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Admin Analytics Dashboard</h2>
          <div style={{ fontSize: 13, color: C.muted }}>Insurer view · Real-time portfolio monitoring</div>
        </div>
        <Badge color={C.teal}>Live · {new Date().toLocaleDateString()}</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={<User size={18} />} label="Active Policies" value={activePolicies.toLocaleString("en-IN")} sub="Across 6 cities" color={C.teal} delta={18} />
        <StatCard icon={<IndianRupee size={18} />} label="Premium Revenue" value={`₹${(totalPremiums / 100000).toFixed(1)}L`} sub="6-month total" color={C.emerald} delta={24} />
        <StatCard icon={<FileText size={18} />} label="Claims Paid" value={`₹${(totalClaims / 100000).toFixed(1)}L`} sub="Loss ratio: 40%" color={C.orange} />
        <StatCard icon={<AlertTriangle size={18} />} label="Fraud Flagged" value={fraudCases.filter(f => f.status !== "cleared").length} sub={`₹${(fraudCases.filter(f => f.status === "rejected").length * 760).toLocaleString()} saved`} color={C.red} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Premium vs Claims (6 Months)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={adminAnalyticsData}>
              <defs>
                <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.orange} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.orange} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="premiums" stroke={C.teal} fill="url(#premGrad)" strokeWidth={2.5} name="Premiums Collected" />
              <Area type="monotone" dataKey="claims" stroke={C.orange} fill="url(#clmGrad)" strokeWidth={2.5} name="Claims Paid" />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Claims by Disruption Type</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[
                { name: "Heavy Rain", value: 38 },
                { name: "Extreme Heat", value: 22 },
                { name: "Pollution", value: 19 },
                { name: "Flash Flood", value: 12 },
                { name: "Strike", value: 9 },
              ]} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11 }}>
                {[C.sky, C.orange, "#A78BFA", C.teal, C.amber].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {[["Rain", C.sky], ["Heat", C.orange], ["Pollution", "#A78BFA"], ["Flood", C.teal], ["Strike", C.amber]].map(([l, c]) => (
              <span key={l} style={{ fontSize: 10, color: c, fontWeight: 600 }}>● {l}</span>
            ))}
          </div>
        </Card>
      </div>

      {/* City Risk Table */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>City Risk Portfolio</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["City", "Active Workers", "Claims (6M)", "Claim Rate", "Avg Premium/Wk", "Risk Level"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cityRiskData.map((row, i) => {
                const risk = row.ratio > 5.5 ? "High" : row.ratio > 4.5 ? "Medium" : "Low";
                const rColor = risk === "High" ? C.red : risk === "Medium" ? C.amber : C.emerald;
                return (
                  <tr key={row.city} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: C.text }}>{row.city}</td>
                    <td style={{ padding: "12px 14px", color: C.text }}>{row.workers.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 14px", color: C.text }}>{row.claims}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60 }}><ProgressBar value={row.ratio} max={8} color={rColor} height={5} /></div>
                        <span style={{ color: rColor, fontWeight: 700 }}>{row.ratio}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.text }}>₹{Math.round(49 * (CITIES[row.city]?.risk || 1) * 1.2)}</td>
                    <td style={{ padding: "12px 14px" }}><Badge color={rColor} small>{risk}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fraud Detection */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>🔍 Fraud Detection System</div>
          <Badge color={C.red}>{fraudCases.filter(f => f.status !== "cleared").length} Active Cases</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "GPS Spoofing Detection", desc: "Cross-validates location with cell tower data", icon: <MapPin size={16} />, color: C.teal },
            { label: "Activity Pattern AI", desc: "Compares platform app usage vs claim window", icon: <Activity size={16} />, color: C.orange },
            { label: "Weather Correlation", desc: "Validates claim against hyperlocal weather feed", icon: <CloudRain size={16} />, color: C.sky },
          ].map(f => (
            <div key={f.label} style={{ background: C.bg, borderRadius: 12, padding: 14 }}>
              <div style={{ color: f.color, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{f.desc}</div>
            </div>
          ))}
        </div>
        {fraudCases.map(f => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${C.border}`, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: f.score >= 60 ? C.red + "18" : f.score >= 30 ? C.amber + "18" : C.emerald + "18", borderRadius: 8, padding: "6px 10px", minWidth: 40, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: f.score >= 60 ? C.red : f.score >= 30 ? C.amber : C.emerald }}>{f.score}</div>
                <div style={{ fontSize: 9, color: C.muted }}>score</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{f.worker} · {f.claim}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  {f.flags.map(fl => (
                    <span key={fl} style={{ background: C.red + "15", color: C.red, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>⚑ {fl}</span>
                  ))}
                  {f.flags.length === 0 && <span style={{ fontSize: 11, color: C.emerald }}>✓ No anomalies detected</span>}
                </div>
              </div>
            </div>
            <Badge color={f.status === "rejected" ? C.red : f.status === "flagged" ? C.amber : f.status === "cleared" ? C.emerald : C.sky} small>
              {f.status.toUpperCase()}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function GigShieldApp() {
  const [worker, setWorker] = useState(null);
  const [view, setView] = useState("dashboard");
  const [disruptions, setDisruptions] = useState(initialDisruptions);
  const [claims, setClaims] = useState(sampleClaims);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const policy = worker ? {
    premium: worker.premium, coverage: worker.coverage, tier: worker.tier
  } : { premium: 68, coverage: 3200, tier: "standard" };

  const addClaim = (disruption) => {
    const newClaim = {
      id: `CLM-2026-${String(claims.length + 100).padStart(3, "0")}`,
      type: disruption.type, date: new Date().toISOString().slice(0, 10),
      amount: Math.round(policy.coverage * disruption.triggerPayout * (0.85 + Math.random() * 0.15)),
      status: "triggered", fraudScore: Math.round(Math.random() * 20),
      autoTriggered: true, policyId: "POL-4421"
    };
    setClaims(prev => [newClaim, ...prev]);
    setNotifs(prev => [`⚡ Auto-claim triggered: ${disruption.type} — ₹${newClaim.amount.toLocaleString("en-IN")} processing`, ...prev]);
    setTimeout(() => setClaims(prev => prev.map(c => c.id === newClaim.id ? { ...c, status: "validating" } : c)), 3000);
    setTimeout(() => setClaims(prev => prev.map(c => c.id === newClaim.id ? { ...c, status: "processing" } : c)), 7000);
    setTimeout(() => setClaims(prev => prev.map(c => c.id === newClaim.id ? { ...c, status: "paid" } : c)), 14000);
  };

  if (!worker) {
    return <OnboardingFlow onComplete={(data) => { setWorker(data); setView("dashboard"); }} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${C.bg}; }`}</style>
      <Sidebar active={view} setActive={setView} worker={worker} />

      <div style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        {/* Top Bar */}
        <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 14, color: C.muted }}>
            {view === "dashboard" && "Overview & Policy Status"}
            {view === "monitor" && "Real-time Parametric Trigger Monitoring"}
            {view === "claims" && "Claims & AI Validation Pipeline"}
            {view === "payouts" && "Payment History & UPI Processing"}
            {view === "admin" && "Insurer Analytics & Portfolio Management"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifs(!showNotifs)}
                style={{ background: notifs.length > 0 ? C.orange + "18" : C.bg, border: `1px solid ${notifs.length > 0 ? C.orange + "44" : C.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: notifs.length > 0 ? C.orange : C.muted }}>
                <Bell size={16} />
                {notifs.length > 0 && <span style={{ background: C.orange, color: "white", borderRadius: 10, fontSize: 10, fontWeight: 800, padding: "1px 6px" }}>{notifs.length}</span>}
              </button>
              {showNotifs && notifs.length > 0 && (
                <div style={{ position: "absolute", right: 0, top: 40, width: 320, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 50, overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.text }}>Notifications</div>
                  {notifs.map((n, i) => (
                    <div key={i} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.text }}>{n}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ background: C.navy, borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white" }}>
                {worker.name?.[0] || "W"}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{worker.name?.split(" ")[0]}</span>
            </div>
          </div>
        </div>

        {view === "dashboard" && <Dashboard worker={worker} policy={policy} claims={claims} disruptions={disruptions} />}
        {view === "monitor" && <DisruptionMonitor disruptions={disruptions} setDisruptions={setDisruptions} addClaim={addClaim} />}
        {view === "claims" && <ClaimsView claims={claims} />}
        {view === "payouts" && <PayoutsView claims={claims} />}
        {view === "admin" && <AdminView />}
      </div>
    </div>
  );
}