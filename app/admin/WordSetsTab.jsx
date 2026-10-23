"use client";
import { useState, useEffect, useCallback } from "react";
import { moderate } from "@/lib/moderation";
import { getModeration } from "@/lib/firebase";
import { adminListSubmissions, adminListPublic, adminApprove, adminReject, adminSetBadge, adminSetReward, adminDeleteSet, parseWords, validateSubmission, BADGES, badgeInfo, BADGE_REWARD, adminSeedStarters, adminUpdateSet, adminGetHistory, adminRestoreVersion, adminListRevertRequests, adminClearRevertRequests } from "@/lib/wordsets";

export default function WordSetsTab({ T, st, adminDb, flash }) {
  const [subs, setSubs] = useState([]);
  const [pub, setPub] = useState([]);
  const [pick, setPick] = useState({}); // submission id -> badge chosen at approval
  const [edit, setEdit] = useState({}); // submission id -> edited words text
  const [busy, setBusy] = useState(false);
  const [rew, setRew] = useState({}); // id -> reward keys text
  const [why, setWhy] = useState({}); // submission id -> rejection reason
  const [mod, setMod] = useState({});
  const [reqs, setReqs] = useState({}); // setId -> number of revert requests
  const [hist, setHist] = useState(null); // { id, items } while a History panel is open
  const [ed, setEd] = useState(null); // { id, title, text } while editing a published set
  useEffect(() => { getModeration().then(setMod); }, []);
  const load = useCallback(async () => {
    try { setSubs(await adminListSubmissions(adminDb)); const pl = await adminListPublic(adminDb); setPub(pl); const r = {}; (await adminListRevertRequests(adminDb).catch(() => [])).forEach(x => { r[x.setId] = (r[x.setId] || 0) + 1; }); setReqs(r); }
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
      {(() => { const clean = subs.filter(x => !validateSubmission(x.title, x.words) && !(x.flags && x.flags.length) && !moderate(x.title, x.words, { ...mod, enabled: true }).length);
        return clean.length > 1 ? <button disabled={busy} onClick={() => { if (confirm(`Approve ${clean.length} clean sets with no badge and no reward? You can set badges later.`)) run(async () => { let bad = 0; for (const x of clean) { const r = await adminApprove(adminDb, x, { title: x.title, words: x.words, badge: null, rewardKeys: 0 }).catch(() => false); if (r === false) bad++; } return bad ? false : true; }, `Approved ${clean.length} sets`); }} style={{ ...st.btn("#fff", "#10b981"), marginBottom: 10 }}>Approve all {clean.length} clean sets</button> : null; })()}
      {subs.length === 0 && <div style={{ ...st.card, color: T.muted, fontSize: 12 }}>Nothing waiting.</div>}
      {subs.map(s => {
        const text = edit[s.id] ?? s.words.join(" ");
        const words = parseWords(text);
        const err = validateSubmission(s.title, words);
        return (
          <div key={s.id} style={st.card}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
            {(() => { const fl = [...new Set([...(s.flags || []), ...moderate(s.title, s.words, { ...mod, enabled: true })])]; return fl.length ? <div style={{ background: "#f59e0b22", border: "1px solid #f59e0b66", color: "#f59e0b", borderRadius: 8, padding: "6px 8px", fontSize: 11, marginBottom: 8 }}>⚠ Auto-moderation flagged: {fl.join(" · ")}</div> : null; })()}
            <textarea value={text} onChange={e => setEdit(x => ({ ...x, [s.id]: e.target.value }))} rows={4} style={{ ...st.input, resize: "vertical", marginBottom: 6 }} />
            <div style={{ color: err ? "#ef4444" : T.muted, fontSize: 11, marginBottom: 8 }}>{err || `${words.length} words — you can edit the list before approving`}</div>
            <div style={{ marginBottom: 8 }}><BadgePick value={pick[s.id] || null} onChange={b => setPick(x => ({ ...x, [s.id]: b }))} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: T.muted, fontSize: 11 }}>Keys reward (0-50, once a day per player; picking a badge suggests one):
              <input value={rew[s.id] ?? (pick[s.id] ? String(BADGE_REWARD[pick[s.id]] || "") : "")} onChange={e => setRew(x => ({ ...x, [s.id]: e.target.value.replace(/\D/g, "").slice(0, 2) }))} placeholder="0" inputMode="numeric" style={{ ...st.input, width: 64, textAlign: "right" }} /></div>
            <input value={why[s.id] || ""} onChange={e => setWhy(x => ({ ...x, [s.id]: e.target.value.slice(0, 140) }))} placeholder="Reason if rejecting (optional, shown to the user)" style={{ ...st.input, marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={busy || !!err} onClick={() => run(() => adminApprove(adminDb, s, { title: s.title, words, badge: pick[s.id] || null, rewardKeys: rew[s.id] }), "Approved & published")} style={{ ...st.btn("#fff", "#10b981"), flex: 1, padding: 10, opacity: err ? .5 : 1 }}>Approve</button>
              <button disabled={busy} onClick={() => run(() => adminReject(adminDb, s, why[s.id]), "Rejected & user notified")} style={st.btn("#fff", "#ef4444")}>Reject</button>
            </div>
          </div>
        );
      })}
      <button disabled={busy} onClick={() => run(async () => { const n = await adminSeedStarters(adminDb); flash(n ? `Added ${n} starter set(s)` : "Starter sets already exist"); return true; }, "Done")} style={{ ...st.btn("#fff", T.purple), marginTop: 14 }}>Add 1 starter set per rating</button>
      <div style={{ ...st.label, marginTop: 18 }}>Published ({pub.length})</div>
      {pub.map(p => (
        <div key={p.id} style={st.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ color: T.text, fontWeight: 800, fontSize: 13, flex: 1 }}>{p.title} <span style={{ color: T.muted, fontWeight: 400, fontSize: 11 }}>· {p.words.length} words</span></span>
            {badgeInfo(p.badge) && <span style={{ color: badgeInfo(p.badge).color, fontSize: 10, fontWeight: 800 }}>{badgeInfo(p.badge).label.toUpperCase()}</span>}
            <button disabled={busy} onClick={() => { { const r = prompt("Remove this word set? Optional reason (shown to the creator if known). Cancel to keep it.", ""); if (r !== null) run(async () => { const n = await adminDeleteSet(adminDb, p.id, r, p.title); return n === null ? true : n; }, "Removed"); } }} style={st.btn("#fff", "#ef4444")}>Delete</button>
          </div>
          {ed && ed.id === p.id ? (() => { const w = parseWords(ed.text); const e2 = validateSubmission(ed.title, w); return (
            <div style={{ marginBottom: 8 }}>
              <input value={ed.title} maxLength={40} onChange={e => setEd(x => ({ ...x, title: e.target.value }))} style={{ ...st.input, marginBottom: 6 }} />
              <textarea value={ed.text} onChange={e => setEd(x => ({ ...x, text: e.target.value }))} rows={5} style={{ ...st.input, resize: "vertical", marginBottom: 4 }} />
              <div style={{ color: e2 ? "#ef4444" : T.muted, fontSize: 11, marginBottom: 6 }}>{e2 || `${w.length} words`}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button disabled={busy || !!e2} onClick={async () => { await run(async () => { const n = await adminUpdateSet(adminDb, p.id, ed.title, w, { title: p.title, words: p.words }); return n === null ? true : n; }, "Set updated"); setEd(null); }} style={{ ...st.btn("#fff", "#10b981"), flex: 1, opacity: e2 ? .5 : 1 }}>Save changes</button>
                <button onClick={() => setEd(null)} style={st.btn(T.muted, T.faint)}>Cancel</button>
              </div>
            </div>); })() : <button onClick={() => setEd({ id: p.id, title: p.title, text: p.words.join(" ") })} style={{ ...st.btn("#fff", T.purple), marginBottom: 8 }}>Edit title & words</button>}
          <button disabled={busy} onClick={async () => { if (hist && hist.id === p.id) return setHist(null); try { setHist({ id: p.id, items: await adminGetHistory(adminDb, p.id) }); } catch (e) { flash("Couldn't load history: " + (e.code || e.message)); } }} style={{ ...st.btn("#fff", "#f59e0b"), marginBottom: 8, marginLeft: 6 }}>History{hist && hist.id === p.id ? " ▲" : ""}</button>
          {reqs[p.id] > 0 && <span style={{ marginLeft: 8, color: "#f59e0b", fontSize: 11, fontWeight: 800 }}>↩ Revert requested ({reqs[p.id]})</span>}
          {hist && hist.id === p.id && (
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, marginBottom: 8 }}>
              <div style={{ color: T.muted, fontSize: 11, marginBottom: 6 }}>Current: <b style={{ color: T.text }}>{p.title}</b> · {p.words.length} words</div>
              {hist.items.length === 0 && <div style={{ color: T.muted, fontSize: 12 }}>No earlier versions yet. Versions are saved each time you edit the title or words.</div>}
              {hist.items.map((v, i) => (
                <div key={i} style={{ borderTop: i ? `1px solid ${T.border}` : "none", padding: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: T.text, fontSize: 12, fontWeight: 700, flex: 1 }}>{v.title} <span style={{ color: T.muted, fontWeight: 400 }}>· {v.words.length} words · {new Date(v.at).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ET</span></span>
                    <button disabled={busy} onClick={() => { if (confirm("Restore this version? The current one is saved to history.")) run(async () => { const n = await adminRestoreVersion(adminDb, p.id, i, { title: p.title, words: p.words }); setHist(null); return n === null ? true : n; }, "Restored"); }} style={st.btn("#fff", "#10b981")}>Restore</button>
                  </div>
                  <div style={{ color: T.faint, fontSize: 11, marginTop: 2, wordBreak: "break-word" }}>{v.words.slice(0, 20).join(" ")}{v.words.length > 20 ? " …" : ""}</div>
                </div>
              ))}
              {reqs[p.id] > 0 && <button onClick={() => run(async () => { await adminClearRevertRequests(adminDb, p.id); return true; }, "Request dismissed")} style={{ ...st.btn(T.muted, T.faint), marginTop: 6 }}>Dismiss revert request</button>}
            </div>
          )}
          <BadgePick value={p.badge || null} onChange={b => run(() => adminSetBadge(adminDb, p.id, b), "Badge updated")} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: T.muted, fontSize: 11 }}>Keys reward:
            <input defaultValue={p.rewardKeys || 0} onBlur={e => { const v = e.target.value; if (String(p.rewardKeys || 0) !== v) run(() => adminSetReward(adminDb, p.id, v), "Reward updated"); }} inputMode="numeric" style={{ ...st.input, width: 64, textAlign: "right" }} /> (saves when you tap away)</div>
        </div>
      ))}
    </div>
  );
}
