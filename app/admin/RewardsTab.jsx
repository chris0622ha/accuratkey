"use client";
import { useState, useEffect } from "react";
import { getRewards, setRewards, logActivity } from "@/lib/firebase";

// Admin tab: choose how many Keys each level gives when passed. Empty = default (10 + WPM/10).
export default function RewardsTab({ T, st, adminDb, uid, flash, levels }) {
  const [vals, setVals] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [amt, setAmt] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => { getRewards().then(r => { const o = {}; for (const [k, v] of Object.entries(r.levels || {})) o[k] = String(v); setVals(o); setLoaded(true); }); }, []);
  const setOne = (id, v) => setVals(x => { const n = { ...x }; if (v === "") delete n[id]; else n[id] = v.replace(/[^0-9]/g, "").slice(0, 3); return n; });
  const applyRange = () => {
    const a = parseInt(from, 10), b = parseInt(to, 10), n = parseInt(amt, 10);
    if (!(a > 0 && b >= a && n >= 0)) { flash("Enter a valid range and amount"); return; }
    setVals(x => { const o = { ...x }; for (const l of levels) if (l.id >= a && l.id <= b) o[String(l.id)] = String(Math.min(500, n)); return o; });
  };
  const save = async () => {
    setSaving(true);
    try {
      const out = {}; for (const [k, v] of Object.entries(vals)) if (v !== "") out[k] = parseInt(v, 10);
      await setRewards({ levels: out }, adminDb);
      await logActivity("rewards_update", { adminUid: uid, detail: `${Object.keys(out).length} level rewards set` }, adminDb).catch(() => {});
      flash("Rewards saved");
    } catch (e) { flash("Save failed: " + (e.code || e.message)); }
    setSaving(false);
  };
  if (!loaded) return <div style={{ color: T.muted }}>Loading…</div>;
  const shown = levels.filter(l => !q || String(l.id) === q.trim() || l.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>Keys given when a player passes a level. Leave a level blank to use the default (10 + WPM ÷ 10). Failing a level always gives 3. The daily Keys cap still applies. Word-set rewards are set in the Word sets tab.</div>
      <div style={st.card}>
        <div style={st.label}>Set a range at once</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <input value={from} onChange={e => setFrom(e.target.value.replace(/\D/g, ""))} placeholder="From level" style={{ ...st.input, width: 90 }} />
          <input value={to} onChange={e => setTo(e.target.value.replace(/\D/g, ""))} placeholder="To level" style={{ ...st.input, width: 90 }} />
          <input value={amt} onChange={e => setAmt(e.target.value.replace(/\D/g, ""))} placeholder="Keys" style={{ ...st.input, width: 80 }} />
          <button onClick={applyRange} style={st.btn()}>Apply</button>
          <button onClick={() => setVals({})} style={st.btn("#fff", "#ef4444")}>Reset all to default</button>
        </div>
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search level number or name" style={{ ...st.input, marginBottom: 8 }} />
      <div style={{ maxHeight: 420, overflowY: "auto", marginBottom: 10 }}>
        {shown.map(l => (
          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ width: 38, color: T.muted, fontSize: 11 }}>#{l.id}</span>
            <span style={{ flex: 1, color: T.text, fontSize: 12 }}>{l.emoji} {l.name}</span>
            <input value={vals[String(l.id)] ?? ""} onChange={e => setOne(String(l.id), e.target.value)} placeholder="default" inputMode="numeric" style={{ ...st.input, width: 80, textAlign: "right" }} />
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving} style={{ ...st.btn(), width: "100%", padding: 12 }}>{saving ? "Saving…" : "Save rewards"}</button>
    </div>
  );
}
