"use client";
import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";

// Signups over time. Reads only each account's creation time (no names, emails or profiles).
export default function GrowthCard({ T, st, adminDb }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true);
    try {
      const snap = await getDocs(collection(adminDb, "accounts"));
      const days = {}; let total = 0, unknown = 0;
      snap.docs.forEach(d => { total++; const t = d.data().createdAt; const ms = t?.seconds ? t.seconds * 1000 : 0; if (!ms) { unknown++; return; } const k = new Date(ms).toLocaleDateString("en-CA", { timeZone: "America/New_York" }); days[k] = (days[k] || 0) + 1; });
      const out = []; const now = Date.now();
      for (let i = 29; i >= 0; i--) { const k = new Date(now - i * 86400000).toLocaleDateString("en-CA", { timeZone: "America/New_York" }); out.push({ k, n: days[k] || 0 }); }
      setData({ out, total, unknown, last7: out.slice(-7).reduce((a, x) => a + x.n, 0), last30: out.reduce((a, x) => a + x.n, 0) });
    } catch (e) { setData({ err: e.code || e.message }); }
    setBusy(false);
  };
  const max = data?.out ? Math.max(1, ...data.out.map(x => x.n)) : 1;
  return (
    <div style={st.card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: T.text, fontWeight: 800, fontSize: 13, flex: 1 }}>📈 Signups (last 30 days)</span>
        <button disabled={busy} onClick={load} style={st.btn("#fff", T.purple)}>{busy ? "Loading…" : data ? "Refresh" : "Load"}</button>
      </div>
      {data?.err && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>Failed: {data.err}</div>}
      {data?.out && <>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 70, marginTop: 10 }}>{data.out.map(x => <div key={x.k} title={`${x.k}: ${x.n}`} style={{ flex: 1, height: `${Math.max(3, (x.n / max) * 100)}%`, background: x.n ? T.purple : T.border, borderRadius: 2 }} />)}</div>
        <div style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>{data.last7} this week · {data.last30} in 30 days · {data.total} accounts total{data.unknown ? ` (${data.unknown} without a date)` : ""}</div>
      </>}
    </div>
  );
}
