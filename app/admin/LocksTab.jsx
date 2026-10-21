"use client";
import { useState, useEffect } from "react";
import { getLocks, setLocks, logActivity } from "@/lib/firebase";
import { LOCKABLE_FEATURES } from "@/lib/locks";
import { GAMES } from "@/components/GameCatalog";

// Admin tab: globally lock features and games for everyone except admins.
export default function LocksTab({ T, st, adminDb, uid, flash }) {
  const [locks, setL] = useState({ games: {}, features: {}, message: "" });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { getLocks().then(l => { setL({ games: l.games || {}, features: l.features || {}, message: l.message || "" }); setLoaded(true); }); }, []);
  const tog = (kind, id) => setL(l => ({ ...l, [kind]: { ...l[kind], [id]: !l[kind][id] } }));
  const setAllGames = v => setL(l => ({ ...l, games: Object.fromEntries(GAMES.map(g => [g.id, v])) }));
  const save = async () => {
    setSaving(true);
    try {
      const clean = k => Object.fromEntries(Object.entries(locks[k]).filter(([, v]) => v));
      await setLocks({ games: clean("games"), features: clean("features"), message: locks.message.slice(0, 140) }, adminDb);
      await logActivity("locks_update", { adminUid: uid, detail: `${Object.keys(clean("features")).length} features, ${Object.keys(clean("games")).length} games locked` }, adminDb).catch(() => {});
      flash("Locks saved");
    } catch (e) { flash("Save failed: " + (e.code || e.message)); }
    setSaving(false);
  };
  const row = (kind, id, label) => (
    <label key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, background: locks[kind][id] ? "#ef444422" : "transparent", cursor: "pointer", fontSize: 12, color: T.text }}>
      <input type="checkbox" checked={!!locks[kind][id]} onChange={() => tog(kind, id)} />
      <span style={{ flex: 1 }}>{label}</span>
      {locks[kind][id] && <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 800 }}>LOCKED</span>}
    </label>
  );
  if (!loaded) return <div style={{ color: T.muted }}>Loading…</div>;
  return (
    <div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>Locked items are disabled for every user (admins still have access). Nothing is changed until you press Save.</div>
      <div style={st.card}>
        <div style={st.label}>Message shown on locked items (optional)</div>
        <input value={locks.message} maxLength={140} onChange={e => setL(l => ({ ...l, message: e.target.value }))} placeholder="Coming back soon" style={st.input} />
      </div>
      <div style={st.card}>
        <div style={st.label}>Features</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>{LOCKABLE_FEATURES.map(([id, n]) => row("features", id, n))}</div>
      </div>
      <div style={st.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ ...st.label, margin: 0, flex: 1 }}>Games ({GAMES.length})</div>
          <button onClick={() => setAllGames(true)} style={st.btn("#fff", "#ef4444")}>Lock all</button>
          <button onClick={() => setAllGames(false)} style={st.btn(T.muted, T.faint)}>Unlock all</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>{GAMES.map(g => row("games", g.id, `${g.name}`))}</div>
      </div>
      <button onClick={save} disabled={saving} style={{ ...st.btn(), width: "100%", padding: 12 }}>{saving ? "Saving…" : "Save locks"}</button>
    </div>
  );
}
