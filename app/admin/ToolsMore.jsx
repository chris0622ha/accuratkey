"use client";
import { useState, useEffect, useCallback, useContext, createContext, useRef } from "react";
import { doc, getDocs, collection, query, where, limit, updateDoc, deleteDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { setMaintenanceMode, getAllBans, setEconomy, logActivity, getActivityLog, getLevelOverrides, getLevelNameOverrides, getLevelTargetOverrides, updateLevelWords, deleteLevelOverride, setLevelTargets, addNotification, getRewards, getEconomy, getLocks, setLocks, getMaintenanceMode } from "@/lib/firebase";
import { adminListPublic, adminListSubmissions, adminListRevertRequests, adminDeleteSet, adminSetBadge, adminSetReward, parseWords, validateSubmission, BADGES } from "@/lib/wordsets";
import { getModeration } from "@/lib/firebase";
import { moderate } from "@/lib/moderation";
import { GAMES } from "@/components/GameCatalog";
import { LOCKABLE_FEATURES } from "@/lib/locks";

export const FlashCtx = createContext({ last: { current: "" } });
// Button that shows "Working…" while an async action runs and "✓ Done" if it finished with a success message
export function AB({ onClick, children, disabled, ...rest }) {
  const ctx = useContext(FlashCtx); const [s, setS] = useState(""); const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const click = async (e) => {
    if (!onClick) return; ctx.last.current = "";
    const r = onClick(e);
    if (r && typeof r.then === "function") {
      setS("w");
      try { await r; if (alive.current) { setS(ctx.last.current === "ok" ? "d" : ""); if (ctx.last.current === "ok") setTimeout(() => alive.current && setS(""), 1800); } } catch { if (alive.current) setS(""); }
    }
  };
  return <button {...rest} disabled={disabled || s === "w"} onClick={click}>{s === "w" ? "Working…" : s === "d" ? "✓ Done" : children}</button>;
}
const download = (name, text, type = "text/csv") => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
const csv = (rows) => rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
const tsMs = (t) => (t?.toDate ? t.toDate().getTime() : typeof t === "number" ? t : t?.seconds ? t.seconds * 1000 : 0);
const Card = ({ st, T, title, children, hint }) => (
  <div style={st.card}><div style={{ color: T.purple, fontSize: 11, fontWeight: 800, marginBottom: hint ? 2 : 8 }}>{title}</div>{hint && <div style={{ color: T.muted, fontSize: 11, marginBottom: 8 }}>{hint}</div>}{children}</div>
);
const lit = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── Levels: targets, find & replace, overrides list ──
export function LevelsPanel({ T, st, adminDb, uid, flash, levels }) {
  const [lid, setLid] = useState(""); const [wpm, setWpm] = useState(""); const [acc, setAcc] = useState("");
  const [find, setFind] = useState(""); const [rep, setRep] = useState(""); const [prev, setPrev] = useState(null);
  const [ov, setOv] = useState(null); const [busy, setBusy] = useState(false);
  const loadOv = useCallback(async () => { const o = await getLevelOverrides().catch(() => ({})); setOv({ words: o, names: { ...getLevelNameOverrides() }, targets: { ...getLevelTargetOverrides() } }); }, []);
  useEffect(() => { loadOv(); }, [loadOv]);
  const lv = (levels || []).find(l => String(l.id) === lid);
  const saveT = async (clear) => {
    if (!lv) return flash("Enter a valid level number");
    try { await setLevelTargets(lv.id, clear ? "" : wpm, clear ? "" : acc, adminDb); await logActivity("level_targets", { adminUid: uid, detail: clear ? `L${lv.id} targets reset` : `L${lv.id} wpm=${wpm || "default"} acc=${acc || "default"}` }, adminDb).catch(() => {}); flash(clear ? "Targets reset (reload to see)" : "Targets saved (players get them on next load)"); loadOv(); }
    catch (e) { flash("Failed: " + (e.code || e.message)); }
  };
  const plan = async () => {
    if (find.length < 2) return flash("Enter at least 2 characters to find");
    const o = await getLevelOverrides().catch(() => ({})); const re = new RegExp(lit(find), "g"); const out = [];
    for (const l of levels || []) { const cur = (o[String(l.id)] || l.words || []).map(String); const next = cur.map(x => x.replace(re, rep)); if (next.some((x, i) => x !== cur[i])) out.push({ id: l.id, name: l.name, next, hits: next.filter((x, i) => x !== cur[i]).length }); }
    setPrev(out); flash(`Preview: ${out.length} level(s) would change`);
  };
  const apply = async () => {
    if (!prev?.length || !confirm(`Change text in ${prev.length} level(s)?`)) return; setBusy(true);
    try { const names = getLevelNameOverrides(); for (const p of prev) await updateLevelWords(p.id, p.next, adminDb, names[String(p.id)] || null); await logActivity("level_find_replace", { adminUid: uid, detail: `"${find}" → "${rep}" in ${prev.length} levels`.slice(0, 180) }, adminDb).catch(() => {}); flash("Done"); setPrev(null); loadOv(); }
    catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false);
  };
  const ids = ov ? [...new Set([...Object.keys(ov.words), ...Object.keys(ov.names), ...Object.keys(ov.targets)])].sort((a, b) => a - b) : [];
  return (<>
    <Card T={T} st={st} title="Level targets" hint="Change a level's WPM and accuracy goals. Leave a box empty to keep the original.">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <input value={lid} onChange={e => setLid(e.target.value.trim())} placeholder="Level #" style={{ ...st.input, width: 90 }} />
        <input value={wpm} onChange={e => setWpm(e.target.value.replace(/\D/g, ""))} placeholder={lv ? `WPM (now ${lv.wpmTarget})` : "WPM"} style={{ ...st.input, width: 130 }} />
        <input value={acc} onChange={e => setAcc(e.target.value.replace(/\D/g, ""))} placeholder={lv ? `Accuracy % (now ${lv.accuracy})` : "Accuracy %"} style={{ ...st.input, width: 160 }} />
      </div>
      {lv && <div style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>{lv.name}</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}><AB style={st.btn()} onClick={() => saveT(false)}>Save</AB><AB style={st.btn("#fff", T.faint)} onClick={() => saveT(true)}>Reset to original</AB></div>
    </Card>
    <Card T={T} st={st} title="Find & replace across levels" hint="Case-sensitive. Shows how many levels change before you apply.">
      <div style={{ display: "flex", gap: 6 }}><input value={find} onChange={e => setFind(e.target.value)} placeholder="Find" style={st.input} /><input value={rep} onChange={e => setRep(e.target.value)} placeholder="Replace with" style={st.input} /></div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}><AB style={st.btn()} onClick={plan}>Preview</AB>{prev?.length > 0 && <AB disabled={busy} style={st.btn("#fff", T.danger)} onClick={apply}>Apply to {prev.length} level(s)</AB>}</div>
      {prev && <div style={{ marginTop: 8, fontSize: 12, color: T.text }}>{prev.length ? prev.slice(0, 40).map(p => <div key={p.id}>L{p.id} {p.name}: {p.hits} entr{p.hits === 1 ? "y" : "ies"}</div>) : "No matches."}</div>}
    </Card>
    <Card T={T} st={st} title={`Level overrides (${ids.length})`} hint="Levels you've changed. Reset removes the custom text, name and targets for that level.">
      {ids.map(id => <div key={id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: T.text, padding: "2px 0" }}>
        <span style={{ flex: 1 }}>L{id}{ov.names[id] ? ` "${ov.names[id]}"` : ""}{ov.words[id] ? ` · ${ov.words[id].length} entries` : ""}{ov.targets[id] ? ` · targets ${ov.targets[id].wpm ?? "–"} WPM / ${ov.targets[id].acc ?? "–"}%` : ""}</span>
        <AB style={st.btn("#fff", T.danger)} onClick={async () => { if (!confirm(`Reset level ${id} to original?`)) return; await deleteLevelOverride(id, adminDb); await logActivity("level_reset", { adminUid: uid, detail: `L${id}` }, adminDb).catch(() => {}); flash("Reset (reload to see)"); loadOv(); }}>Reset</AB></div>)}
      {ov && !ids.length && <div style={{ color: T.muted, fontSize: 11 }}>No overrides.</div>}
    </Card>
  </>);
}

// ── Sets: featured, bulk edit, duplicates, bulk import ──
export function SetsPanel({ T, st, adminDb, uid, flash }) {
  const [sets, setSets] = useState(null); const [sel, setSel] = useState({}); const [badge, setBadge] = useState(""); const [rew, setRew] = useState("");
  const [imp, setImp] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => setSets(await adminListPublic(adminDb).catch(() => [])), [adminDb]);
  useEffect(() => { load(); }, [load]);
  if (!sets) return <div style={{ color: T.muted }}>Loading…</div>;
  const chosen = sets.filter(s => sel[s.id]);
  const run = async (fn, label) => { setBusy(true); try { await fn(); await logActivity("wordset_bulk", { adminUid: uid, detail: `${label} (${chosen.length})` }, adminDb).catch(() => {}); flash(label + " done"); setSel({}); await load(); } catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false); };
  const groups = {}; sets.forEach(s => { const k = [...s.words].map(w => w.toLowerCase()).sort().join(","); (groups[k] = groups[k] || []).push(s); const t = "t:" + s.title.trim().toLowerCase(); (groups[t] = groups[t] || []).push(s); });
  const seen = new Set(); const dups = Object.values(groups).filter(g => g.length > 1).map(g => g.filter((x, i, a) => a.findIndex(y => y.id === x.id) === i)).filter(g => { const k = g.map(x => x.id).sort().join(); if (seen.has(k) || g.length < 2) return false; seen.add(k); return true; });
  const [wf, setWf] = useState(""); 
  const wfHits = wf.trim().length >= 2 ? sets.filter(x => x.words.some(w => w.toLowerCase() === wf.trim().toLowerCase()) || x.title.toLowerCase().includes(wf.trim().toLowerCase())) : null;
  const doImport = async () => {
    const lines = imp.split("\n").map(l => l.trim()).filter(Boolean); if (!lines.length) return;
    const cfg = await getModeration(); const ok = [], bad = [];
    for (const l of lines.slice(0, 50)) { const [title, ...rest] = l.split("|"); const words = parseWords(rest.join(" ")); const err = validateSubmission(title || "", words) || (moderate(title, words, cfg).length ? "flagged by auto-moderation" : null); if (err) bad.push(`${(title || "").slice(0, 20)}: ${err}`); else ok.push({ title: title.trim(), words }); }
    if (!ok.length) return flash(bad[0] || "Nothing valid");
    if (!confirm(`Publish ${ok.length} set(s)?${bad.length ? ` (${bad.length} will be skipped)` : ""}`)) return;
    setBusy(true); try { for (const s of ok) await setDoc(doc(collection(adminDb, "wordSets")), { title: s.title, words: s.words, badge: null, rewardKeys: 0, createdAt: serverTimestamp() }); await logActivity("wordset_import", { adminUid: uid, detail: `${ok.length} imported` }, adminDb).catch(() => {}); flash(`Published ${ok.length}${bad.length ? `, skipped ${bad.length}: ${bad[0]}` : ""}`); setImp(""); await load(); } catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false);
  };
  return (<>
    <Card T={T} st={st} title={`Published sets (${sets.length}) — select for bulk actions`}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <select value={badge} onChange={e => setBadge(e.target.value)} style={{ ...st.input, width: "auto" }}><option value="">Rating…</option><option value="none">No rating</option>{(BADGES || []).map(b => <option key={b.id} value={b.id}>{b.label || b.id}</option>)}</select>
        <AB disabled={busy || !chosen.length || !badge} style={st.btn()} onClick={() => run(async () => { for (const s of chosen) await adminSetBadge(adminDb, s.id, badge === "none" ? null : badge); }, "Set rating")}>Apply rating</AB>
        <input value={rew} onChange={e => setRew(e.target.value.replace(/\D/g, ""))} placeholder="Keys 0-50" style={{ ...st.input, width: 90 }} />
        <AB disabled={busy || !chosen.length || rew === ""} style={st.btn()} onClick={() => run(async () => { for (const s of chosen) await adminSetReward(adminDb, s.id, rew); }, "Set reward")}>Apply reward</AB>
        <AB disabled={busy || !chosen.length} style={st.btn("#000", "#fbbf24")} onClick={() => run(async () => { for (const s of chosen) await updateDoc(doc(adminDb, "wordSets", s.id), { featured: !s.featured }); }, "Toggle ⭐")}>Toggle ⭐ Featured</AB>
        <AB disabled={busy || !chosen.length} style={st.btn("#fff", T.danger)} onClick={() => { const r = prompt(`Remove ${chosen.length} set(s)? Reason for the creators (optional):`, ""); if (r === null) return; run(async () => { for (const s of chosen) await adminDeleteSet(adminDb, s.id, r, s.title); }, "Remove"); }}>Remove</AB>
      </div>
      <div style={{ maxHeight: 280, overflow: "auto" }}>{sets.map(s => <label key={s.id} style={{ display: "block", fontSize: 12, color: T.text, padding: "2px 0" }}><input type="checkbox" checked={!!sel[s.id]} onChange={e => setSel({ ...sel, [s.id]: e.target.checked })} /> {s.featured ? "⭐ " : ""}{s.title} <span style={{ color: T.muted }}>· {s.words.length} words{s.badge ? " · " + s.badge : ""}{s.rewardKeys ? ` · ${s.rewardKeys} Keys` : ""}</span></label>)}</div>
    </Card>
    <Card T={T} st={st} title="Word finder" hint="Which published sets contain a word (or have it in the title)?">
      <input value={wf} onChange={e => setWf(e.target.value)} placeholder="Type a word" style={st.input} />
      {wfHits && <div style={{ marginTop: 6, fontSize: 12, color: T.text }}>{wfHits.length ? wfHits.map(x => <div key={x.id}>{x.title} <span style={{ color: T.muted }}>· {x.words.length} words</span></div>) : "No sets contain it."}</div>}
    </Card>
    <Card T={T} st={st} title={`Possible duplicates (${dups.length})`} hint="Same title or same word list.">
      {dups.map((g, i) => <div key={i} style={{ fontSize: 12, color: T.text, marginBottom: 6 }}>{g.map(s => s.title).join("  ≈  ")} <AB disabled={busy} style={{ ...st.btn("#fff", T.danger), marginLeft: 6 }} onClick={() => { if (!confirm(`Keep "${g[g.length - 1].title}" (oldest) and remove ${g.length - 1} other(s)?`)) return; setBusy(true); (async () => { try { for (const s of g.slice(0, -1)) await adminDeleteSet(adminDb, s.id, "Duplicate of another set", s.title); flash("Removed"); await load(); } catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false); })(); }}>Keep oldest</AB></div>)}
      {!dups.length && <div style={{ color: T.muted, fontSize: 11 }}>None found.</div>}
    </Card>
    <Card T={T} st={st} title="Bulk import" hint="One set per line: Title | word word word …  Each line is checked like a player submission and by auto-moderation. Up to 50 lines.">
      <textarea value={imp} onChange={e => setImp(e.target.value)} rows={5} style={{ ...st.input, resize: "vertical", fontFamily: "monospace" }} placeholder={"Garden Words | rose tulip daisy lily fern moss vine bloom petal stem\nKitchen | spoon knife plate bowl whisk ladle tray pan pot cup"} />
      <AB disabled={busy} style={{ ...st.btn(), marginTop: 8 }} onClick={doImport}>Validate & publish</AB>
    </Card>
  </>);
}

// ── Exports, reports, log cleanup ──
export function ExportsPanel({ T, st, adminDb, uid, flash, levels }) {
  const [rep, setRep] = useState(""); const [days, setDays] = useState(90); const [cnt, setCnt] = useState(null);
  const sets = async () => { const s = await adminListPublic(adminDb); flash(`Downloaded ${s.length} sets`); download("word-sets.csv", csv([["title", "rating", "keys", "featured", "words"], ...s.map(x => [x.title, x.badge || "", x.rewardKeys || 0, x.featured ? "yes" : "", x.words.join(" ")])])); };
  const lvls = async () => { flash("Downloaded levels.csv"); const o = await getLevelOverrides().catch(() => ({})); download("levels.csv", csv([["id", "name", "wpm", "accuracy", "entries"], ...(levels || []).map(l => [l.id, l.name, l.wpmTarget, l.accuracy, (o[String(l.id)] || l.words || []).join(" | ")])])); };
  const bans = async () => { const b = await getAllBans(adminDb); flash(`Downloaded ${b.length} bans`); download("bans.csv", csv([["uid", "username", "reason", "until"], ...b.map(x => [x.uid, x.username || "", x.reason || "", x.until ? new Date(tsMs(x.until) || x.until).toISOString() : "permanent"])])); };
  const log = async () => { const r = await getActivityLog(500, adminDb); flash(`Downloaded ${r.length} log entries`); download("activity-log.json", JSON.stringify(r.map(x => ({ ...x, createdAt: tsMs(x.createdAt) })), null, 1), "application/json"); };
  const report = async () => {
    flash("Building report…");
    const [subs, rv, eco, locks, maint, tasks] = await Promise.all([adminListSubmissions(adminDb).catch(() => []), adminListRevertRequests(adminDb).catch(() => []), getEconomy().catch(() => ({})), getLocks().catch(() => ({})), getMaintenanceMode().catch(() => ({})), getDocs(query(collection(adminDb, "activityLog"), where("action", "==", "admin_task"), limit(100))).then(s => s.docs.map(d => d.data())).catch(() => [])]);
    const live = eco.multiplier > 1 && (!eco.endsAt || eco.endsAt > Date.now());
    setRep([`AccuratKey admin report — ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET`, `Word sets waiting: ${subs.length}`, `Revert requests: ${rv.length}`, `Open admin tasks: ${tasks.filter(t => !t.done).length}`, `Keys event: ${live ? `${eco.multiplier}x${eco.name ? " (" + eco.name + ")" : ""}` : "none"}`, `Locked: ${Object.keys(locks.features || {}).length} features, ${Object.keys(locks.games || {}).length} games`, `Maintenance mode: ${maint.enabled ? "ON" : "off"}`].join("\n")); flash("Report ready");
  };
  const count = async () => {
    const cut = Date.now() - days * 86400000; const r = await getActivityLog(500, adminDb);
    const old = r.filter(x => tsMs(x.createdAt) && tsMs(x.createdAt) < cut && !["admin_task", "admin_note", "admin_shift"].includes(x.action)); setCnt(old); flash(`${old.length} old entr${old.length === 1 ? "y" : "ies"} found`);
  };
  const clean = async () => { if (!cnt?.length || !confirm(`Permanently delete ${cnt.length} activity log entries older than ${days} days? Notes, tasks and shift notes are kept.`)) return; for (const x of cnt) await deleteDoc(doc(adminDb, "activityLog", x.id)); await logActivity("log_cleanup", { adminUid: uid, detail: `${cnt.length} entries older than ${days}d` }, adminDb).catch(() => {}); flash(`Deleted ${cnt.length}`); setCnt(null); };
  return (<>
    <Card T={T} st={st} title="Exports" hint="Spreadsheet-ready CSV files. No account or personal data is included.">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><AB style={st.btn()} onClick={sets}>Word sets (.csv)</AB><AB style={st.btn()} onClick={lvls}>Levels (.csv)</AB><AB style={st.btn()} onClick={bans}>Bans (.csv)</AB><AB style={st.btn()} onClick={log}>Activity log (.json)</AB></div>
    </Card>
    <Card T={T} st={st} title="Daily report" hint="A quick status summary you can paste into a message.">
      <AB style={st.btn()} onClick={report}>Build report</AB>
      {rep && <><pre style={{ whiteSpace: "pre-wrap", color: T.text, fontSize: 12, marginTop: 8 }}>{rep}</pre><AB style={st.btn("#fff", T.faint)} onClick={() => navigator.clipboard?.writeText(rep).then(() => flash("Copied"))}>Copy</AB></>}
    </Card>
    <Card T={T} st={st} title="Activity log cleanup" hint="Looks at the most recent 500 entries. Kept: notes, tasks and shift notes.">
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}><select value={days} onChange={e => { setDays(Number(e.target.value)); setCnt(null); }} style={{ ...st.input, width: "auto" }}>{[30, 90, 180, 365].map(d => <option key={d} value={d}>older than {d} days</option>)}</select><AB style={st.btn()} onClick={count}>Count</AB>{cnt && <AB style={st.btn("#fff", T.danger)} disabled={!cnt.length} onClick={clean}>Delete {cnt.length}</AB>}</div>
    </Card>
  </>);
}

// ── Testing and safety ──
export function TestPanel({ T, st, adminDb, uid, flash }) {
  const [lvl, setLvl] = useState("none"); const [wpm, setWpm] = useState("40"); const [level, setLevelN] = useState(""); const [calc, setCalc] = useState(null); const [lk, setLk] = useState(null);
  useEffect(() => { getLocks().then(setLk); }, []);
  const preview = async () => { const ok = await addNotification(uid, { type: "admin_message", title: "Preview: " + lvl, body: "This is how a " + lvl + " notification looks.", level: lvl }, adminDb); flash(ok ? "Sent to your own inbox" : "Couldn't send"); };
  const doCalc = async () => {
    const [r, e] = await Promise.all([getRewards(), getEconomy()]); const w = Math.max(0, Number(wpm) || 0); const lr = level ? r.levels?.[String(level)] : undefined;
    const mult = e.multiplier > 1 && (!e.endsAt || e.endsAt > Date.now()) && (!e.startsAt || e.startsAt <= Date.now()) ? e.multiplier : 1;
    const base = lr ?? 10 + Math.floor(w / 10);
    flash("Calculated"); setCalc({ pass: Math.round(base * mult), fail: Math.round(3 * mult), mult, cap: e.dailyCap || 500, custom: lr != null });
  };
  const [lkKind, setLkKind] = useState("features"); const [lkId, setLkId] = useState("wordsets"); const [lkHrs, setLkHrs] = useState(2);
  const [mOn, setMOn] = useState(null); const [mMsg, setMMsg] = useState("");
  useEffect(() => { getMaintenanceMode().then(m => { setMOn(!!m.enabled); setMMsg(m.message || ""); }); }, []);
  const timers = lk ? Object.entries(lk.until || {}).filter(([, t]) => t > Date.now()) : [];
  const lockFor = async () => {
    const n = { ...lk, features: { ...(lk.features || {}) }, games: { ...(lk.games || {}) }, until: { ...(lk.until || {}) } };
    n[lkKind][lkId] = true; n.until[(lkKind === "games" ? "g:" : "f:") + lkId] = Date.now() + lkHrs * 3600000;
    try { await setLocks(n, adminDb); setLk(n); await logActivity("lock_timer", { adminUid: uid, detail: `${lkKind}/${lkId} for ${lkHrs}h` }, adminDb).catch(() => {}); flash(`Locked for ${lkHrs}h — players see it unlock on their next page load after that`); } catch (e) { flash("Failed: " + (e.code || e.message)); }
  };
  const clearTimer = async (k) => { const n = { ...lk, until: { ...(lk.until || {}) } }; delete n.until[k]; try { await setLocks(n, adminDb); setLk(n); flash("Timer removed (lock stays until you unlock it)"); } catch (e) { flash("Failed: " + (e.code || e.message)); } };
  const presets = [["Double Keys weekend", 2, 48], ["Triple Keys day", 3, 24], ["Bonus hour (1.5x)", 1.5, 6]];
  const applyPreset = async ([name, m, h]) => { if (!confirm(`Start "${name}" (${m}x for ${h}h) now?`)) return; try { const e = await getEconomy(); await setEconomy({ ...e, multiplier: m, name, startsAt: Date.now(), endsAt: Date.now() + h * 3600000 }, adminDb); await logActivity("economy_update", { adminUid: uid, detail: `preset ${name}` }, adminDb).catch(() => {}); flash(`${name} started`); } catch (e) { flash("Failed: " + (e.code || e.message)); } };
  const setMaint = async (on) => { if (!confirm(on ? "Turn maintenance mode ON for players now?" : "Turn maintenance mode OFF?")) return; try { const m = await getMaintenanceMode(); await setMaintenanceMode(on, mMsg || m.message || "We'll be right back.", m.triggers || { admins: false, users: true }, adminDb); setMOn(on); await logActivity("maintenance", { adminUid: uid, detail: on ? "on" : "off" }, adminDb).catch(() => {}); flash(on ? "Maintenance mode ON" : "Maintenance mode OFF"); } catch (e) { flash("Failed: " + (e.code || e.message)); } };
  const wsLocked = !!lk?.features?.wordsets;
  const toggle = async () => { if (!confirm(wsLocked ? "Re-open community word sets for everyone?" : "Lock community word sets for everyone now?")) return; const n = { ...lk, features: { ...(lk.features || {}) } }; if (wsLocked) delete n.features.wordsets; else n.features.wordsets = true; try { await setLocks(n, adminDb); setLk(n); await logActivity("emergency_lock", { adminUid: uid, detail: wsLocked ? "wordsets unlocked" : "wordsets locked" }, adminDb).catch(() => {}); flash(wsLocked ? "Unlocked" : "Locked"); } catch (e) { flash("Failed: " + (e.code || e.message)); } };
  return (<>
    <Card T={T} st={st} title="Notification preview" hint="Sends a test notification to your own account so you can see how it looks at each priority.">
      <div style={{ display: "flex", gap: 6 }}>{["none", "important", "urgent"].map(l => <AB key={l} onClick={() => setLvl(l)} style={st.btn(lvl === l ? "#fff" : T.muted, lvl === l ? T.purple : T.faint)}>{l}</AB>)}<AB style={st.btn("#fff", "#10b981")} onClick={preview}>Send to me</AB></div>
    </Card>
    <Card T={T} st={st} title="Keys calculator" hint="What a run pays right now, using your current rewards and Keys event.">
      <div style={{ display: "flex", gap: 6 }}><input value={wpm} onChange={e => setWpm(e.target.value.replace(/\D/g, ""))} placeholder="WPM" style={{ ...st.input, width: 90 }} /><input value={level} onChange={e => setLevelN(e.target.value.replace(/\D/g, ""))} placeholder="Level # (optional)" style={{ ...st.input, width: 150 }} /><AB style={st.btn()} onClick={doCalc}>Calculate</AB></div>
      {calc && <div style={{ marginTop: 8, color: T.text, fontSize: 12 }}>Pass: <b>{calc.pass}</b> Keys{calc.custom ? " (custom level reward)" : ""} · Fail: <b>{calc.fail}</b> · Multiplier: {calc.mult}x · Daily cap: {calc.cap}</div>}
    </Card>
    <Card T={T} st={st} title="Lock for a set time" hint="Locks a feature or game and unlocks it by itself later (takes effect for players on their next page load).">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <select value={lkKind} onChange={e => { setLkKind(e.target.value); setLkId(e.target.value === "games" ? GAMES[0].id : "wordsets"); }} style={{ ...st.input, width: "auto" }}><option value="features">Feature</option><option value="games">Game</option></select>
        <select value={lkId} onChange={e => setLkId(e.target.value)} style={{ ...st.input, width: "auto" }}>{(lkKind === "games" ? GAMES.map(g => [g.id, g.name]) : LOCKABLE_FEATURES).map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select>
        <select value={lkHrs} onChange={e => setLkHrs(Number(e.target.value))} style={{ ...st.input, width: "auto" }}>{[1, 2, 6, 12, 24, 72].map(h => <option key={h} value={h}>{h}h</option>)}</select>
        <AB disabled={!lk} style={st.btn()} onClick={lockFor}>Lock</AB>
      </div>
      {timers.map(([k, t]) => <div key={k} style={{ fontSize: 12, color: T.text, marginTop: 6 }}>{k.slice(2)} unlocks {new Date(t).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ET <AB style={st.btn("#fff", T.faint)} onClick={() => clearTimer(k)}>Remove timer</AB></div>)}
    </Card>
    <Card T={T} st={st} title="Keys event presets" hint="Start a common Keys event in one tap (replaces any current event).">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{presets.map(p => <AB key={p[0]} style={st.btn()} onClick={() => applyPreset(p)}>{p[0]}</AB>)}</div>
    </Card>
    <Card T={T} st={st} title={`Quick maintenance mode${mOn === null ? "" : mOn ? " — currently ON" : " — currently off"}`} hint="Uses the same switch as Settings. Players (not admins, unless you chose so in Settings) see your message.">
      <input value={mMsg} onChange={e => setMMsg(e.target.value.slice(0, 140))} placeholder="Message for players" style={st.input} />
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}><AB style={st.btn("#fff", T.danger)} onClick={() => setMaint(true)}>Turn ON</AB><AB style={st.btn("#fff", "#10b981")} onClick={() => setMaint(false)}>Turn OFF</AB></div>
    </Card>
    <Card T={T} st={st} title="Emergency lock: community word sets" hint="One tap to hide and block community sets for everyone except admins; tap again to bring them back.">
      <AB disabled={!lk} style={st.btn("#fff", wsLocked ? "#10b981" : T.danger)} onClick={toggle}>{wsLocked ? "Unlock community word sets" : "Lock community word sets now"}</AB>
    </Card>
  </>);
}

// ── Strip shown at the top of the Stats tab ──
export function HomeStrip({ T, st, adminDb }) {
  const [d, setD] = useState(null);
  useEffect(() => { (async () => {
    try {
      const [t, sh, subs] = await Promise.all([getDocs(query(collection(adminDb, "activityLog"), where("action", "==", "admin_task"), limit(100))), getDocs(query(collection(adminDb, "activityLog"), where("action", "==", "admin_shift"), limit(30))), adminListSubmissions(adminDb).catch(() => [])]);
      const notes = sh.docs.map(x => x.data()).sort((a, b) => tsMs(b.createdAt) - tsMs(a.createdAt));
      setD({ open: t.docs.filter(x => !x.data().done).length, note: notes[0]?.detail || "", subs: subs.length });
    } catch { setD(null); }
  })(); }, [adminDb]);
  if (!d || (!d.open && !d.note && !d.subs)) return null;
  return <div style={{ ...st.card, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", fontSize: 12, color: T.text }}>
    <span>✅ <b>{d.open}</b> open task{d.open === 1 ? "" : "s"}</span><span>📝 <b>{d.subs}</b> set{d.subs === 1 ? "" : "s"} waiting</span>
    {d.note && <span style={{ color: T.muted }}>Last shift note: “{d.note.slice(0, 120)}”</span>}
  </div>;
}
