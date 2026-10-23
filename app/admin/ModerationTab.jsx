"use client";
import { useState, useEffect } from "react";
import { getModeration, setModeration, logActivity } from "@/lib/firebase";
import { moderate, cleanBlocked, DEFAULT_MOD } from "@/lib/moderation";
import { adminListPublic, adminDeleteSet } from "@/lib/wordsets";

// Admin tab: control the auto-moderation applied to community word sets.
export default function ModerationTab({ T, st, adminDb, uid, flash }) {
  const [cfg, setCfg] = useState(DEFAULT_MOD);
  const [blockedText, setBlockedText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hits, setHits] = useState(null);
  const [testT, setTestT] = useState("");
  useEffect(() => { getModeration().then(c => { const m = { ...DEFAULT_MOD, ...c }; setCfg(m); setBlockedText((m.blocked || []).join(", ")); setLoaded(true); }); }, []);
  const save = async () => {
    setSaving(true);
    try {
      const blocked = cleanBlocked(blockedText);
      await setModeration({ ...cfg, blocked }, adminDb);
      setBlockedText(blocked.join(", "));
      await logActivity("moderation_update", { adminUid: uid, detail: `enabled=${cfg.enabled} autoReject=${cfg.autoReject} blocked=${blocked.length}` }, adminDb).catch(() => {});
      flash("Moderation saved");
    } catch (e) { flash("Save failed: " + (e.code || e.message)); }
    setSaving(false);
  };
  const scan = async () => {
    try {
      const list = await adminListPublic(adminDb);
      const c = { ...cfg, enabled: true, blocked: cleanBlocked(blockedText) };
      setHits(list.map(p => ({ p, flags: moderate(p.title, p.words, c) })).filter(x => x.flags.length));
    } catch (e) { flash("Scan failed: " + (e.code || e.message)); }
  };
  const remove = async (p) => {
    const r = prompt("Remove \"" + p.title + "\"? Optional reason (sent to the creator if known). Cancel to keep it.", "");
    if (r === null) return;
    try { await adminDeleteSet(adminDb, p.id, r, p.title); flash("Removed"); setHits(h => h.filter(x => x.p.id !== p.id)); } catch (e) { flash("Failed: " + (e.code || e.message)); }
  };
  const Toggle = ({ k, label, hint }) => (
    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", cursor: "pointer", color: T.text, fontSize: 13 }}>
      <input type="checkbox" checked={!!cfg[k]} onChange={() => setCfg(c => ({ ...c, [k]: !c[k] }))} style={{ marginTop: 3 }} />
      <span><b>{label}</b><div style={{ color: T.muted, fontSize: 11, fontWeight: 400 }}>{hint}</div></span>
    </label>
  );
  if (!loaded) return <div style={{ color: T.muted }}>Loading…</div>;
  return (
    <div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>Auto-moderation checks every community word set when it is submitted. Flagged sets show a warning in the Word sets tab. A built-in filter for slurs and explicit words always runs, regardless of these settings. Nothing changes until you press Save.</div>
      <div style={st.card}>
        <Toggle k="enabled" label="Auto-moderation on" hint="Checks the blocked-words list, personal info and spam patterns below." />
        <Toggle k="autoReject" label="Auto-reject flagged sets" hint="Flagged sets are refused at submit time and the player is told what to fix. When off, flagged sets still reach you with a warning." />
        <Toggle k="checkPII" label="Block personal info" hint="Emails, @handles, links and phone-number-like digits." />
      </div>
      <div style={st.card}>
        <div style={st.label}>Extra blocked words (comma or space separated)</div>
        <textarea value={blockedText} onChange={e => setBlockedText(e.target.value)} rows={3} style={{ ...st.input, resize: "vertical" }} placeholder="word1, word2" />
        <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>Whole-word match, also catches common swaps like @ for a. {cleanBlocked(blockedText).length} words.</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button disabled={saving} onClick={save} style={{ ...st.btn("#fff", "#10b981"), flex: 1, padding: 10 }}>{saving ? "Saving…" : "Save"}</button>
        <button onClick={scan} style={st.btn("#fff", T.purple)}>Scan published sets</button>
      </div>
      <div style={{ ...st.card, marginTop: 14 }}>
        <div style={st.label}>Test the filter (nothing is saved)</div>
        <textarea value={testT} onChange={e => setTestT(e.target.value)} rows={2} placeholder="Type a title and words to see what would be flagged" style={{ ...st.input, resize: "vertical" }} />
        {testT.trim() && (() => { const f = moderate("Test", testT.split(/[\s,]+/).filter(Boolean), { ...cfg, enabled: true, blocked: cleanBlocked(blockedText) }); return <div style={{ color: f.length ? "#f59e0b" : "#10b981", fontSize: 12, marginTop: 6 }}>{f.length ? "⚠ " + f.join(" · ") : "✓ Nothing flagged"}</div>; })()}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => { const c = cleanBlocked(blockedText).sort(); setBlockedText(c.join(", ")); flash("Sorted and de-duplicated (not saved yet)"); }} style={st.btn(T.muted, T.faint)}>Sort & dedupe list</button>
          <button onClick={() => { try { navigator.clipboard.writeText(cleanBlocked(blockedText).join(", ")); flash("List copied"); } catch { flash("Copy failed"); } }} style={st.btn(T.muted, T.faint)}>Copy list</button>
        </div>
      </div>
      {hits && (
        <div style={{ marginTop: 14 }}>
          <div style={st.label}>{hits.length ? `${hits.length} published set(s) flagged` : "No published sets flagged"}</div>
          {hits.map(({ p, flags }) => (
            <div key={p.id} style={st.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: T.text, fontWeight: 800, fontSize: 13, flex: 1 }}>{p.title}</span>
                <button onClick={() => remove(p)} style={st.btn("#fff", "#ef4444")}>Remove</button>
              </div>
              <div style={{ color: "#f59e0b", fontSize: 11, marginTop: 4 }}>⚠ {flags.join(" · ")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
