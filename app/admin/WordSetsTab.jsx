"use client";
import { useState, useEffect, useCallback } from "react";
import { adminListSubmissions, adminListPublic, adminApprove, adminReject, adminSetBadge, adminSetReward, adminDeleteSet, parseWords, validateSubmission, BADGES, badgeInfo } from "@/lib/wordsets";

export default function WordSetsTab({ T, st, adminDb, flash }) {
  const [subs, setSubs] = useState([]);
  const [pub, setPub] = useState([]);
  const [pick, setPick] = useState({}); // submission id -> badge chosen at approval
  const [edit, setEdit] = useState({}); // submission id -> edited words text
  const [busy, setBusy] = useState(false);
  const [rew, setRew] = useState({}); // id -> reward keys text
  const load = useCallback(async () => {
    try { setSubs(await adminListSubmissions(adminDb)); setPub(await adminListPublic(adminDb)); }
    catch (e) { flash("Load failed: " + (e.code || e.message)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminDb]);
  useEffect(() => { load(); }, [load]);
  const run = async (fn, ok) => { setBusy(true); try { const r = await fn(); flash(r === false ? ok + " (but the user notification could not be sent)" : ok); await load(); } catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false); };
  const BadgePick = ({ value, onChange }) => (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      <button onClick={() => onChange(null)} style={{ ...st.btn(!value ? "#fff" : T.muted, !value ? T.purple : T.faint), fontSize: 10 }}>No badge</button>
      {BADGES.map(b => <button key={b.id} onClick={() => onChange(b.id)} style={{ ...st.btn(value === b.id ? "#000" : b.color, value === b.id ? b.color : T.faint), fontSize: 10 }}>{b.label}</button>)}
    </div>
  );
  return (
    <div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>Submissions are anonymous in the app. You see only the word list here (no name or email). Approving publishes title + words + badge only.</div>
      <div style={st.label}>Pending ({subs.length})</div>
      {subs.length === 0 && <div style={{ ...st.card, color: T.muted, fontSize: 12 }}>Nothing waiting.</div>}
      {subs.map(s => {
        const text = edit[s.id] ?? s.words.join(" ");
        const words = parseWords(text);
        const err = validateSubmission(s.title, words);
        return (
          <div key={s.id} style={st.card}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
            <textarea value={text} onChange={e => setEdit(x => ({ ...x, [s.id]: e.target.value }))} rows={4} style={{ ...st.input, resize: "vertical", marginBottom: 6 }} />
            <div style={{ color: err ? "#ef4444" : T.muted, fontSize: 11, marginBottom: 8 }}>{err || `${words.length} words — you can edit the list before approving`}</div>
            <div style={{ marginBottom: 8 }}><BadgePick value={pick[s.id] || null} onChange={b => setPick(x => ({ ...x, [s.id]: b }))} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: T.muted, fontSize: 11 }}>Keys reward (0-50, once a day per player):
              <input value={rew[s.id] ?? ""} onChange={e => setRew(x => ({ ...x, [s.id]: e.target.value.replace(/\D/g, "").slice(0, 2) }))} placeholder="0" inputMode="numeric" style={{ ...st.input, width: 64, textAlign: "right" }} /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={busy || !!err} onClick={() => run(() => adminApprove(adminDb, s, { title: s.title, words, badge: pick[s.id] || null, rewardKeys: rew[s.id] }), "Approved & published")} style={{ ...st.btn("#fff", "#10b981"), flex: 1, padding: 10, opacity: err ? .5 : 1 }}>Approve</button>
              <button disabled={busy} onClick={() => run(() => adminReject(adminDb, s), "Rejected & deleted")} style={st.btn("#fff", "#ef4444")}>Reject</button>
            </div>
          </div>
        );
      })}
      <div style={{ ...st.label, marginTop: 18 }}>Published ({pub.length})</div>
      {pub.map(p => (
        <div key={p.id} style={st.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ color: T.text, fontWeight: 800, fontSize: 13, flex: 1 }}>{p.title} <span style={{ color: T.muted, fontWeight: 400, fontSize: 11 }}>· {p.words.length} words</span></span>
            {badgeInfo(p.badge) && <span style={{ color: badgeInfo(p.badge).color, fontSize: 10, fontWeight: 800 }}>{badgeInfo(p.badge).label.toUpperCase()}</span>}
            <button disabled={busy} onClick={() => { if (confirm("Delete this word set?")) run(() => adminDeleteSet(adminDb, p.id), "Deleted"); }} style={st.btn("#fff", "#ef4444")}>Delete</button>
          </div>
          <BadgePick value={p.badge || null} onChange={b => run(() => adminSetBadge(adminDb, p.id, b), "Badge updated")} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: T.muted, fontSize: 11 }}>Keys reward:
            <input defaultValue={p.rewardKeys || 0} onBlur={e => { const v = e.target.value; if (String(p.rewardKeys || 0) !== v) run(() => adminSetReward(adminDb, p.id, v), "Reward updated"); }} inputMode="numeric" style={{ ...st.input, width: 64, textAlign: "right" }} /> (saves when you tap away)</div>
        </div>
      ))}
    </div>
  );
}
