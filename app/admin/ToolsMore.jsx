"use client";
import { useState, useEffect, useCallback, useContext, createContext, useRef } from "react";
import { doc, getDocs, collection, query, where, limit, updateDoc, deleteDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { setMaintenanceMode, getAllBans, setEconomy, logActivity, getActivityLog, getLevelOverrides, getLevelNameOverrides, getLevelTargetOverrides, updateLevelWords, deleteLevelOverride, setLevelTargets, addNotification, getRewards, getEconomy, getLocks, setLocks, getMaintenanceMode } from "@/lib/firebase";
import { adminListPublic, adminListSubmissions, adminListRevertRequests, adminDeleteSet, adminSetBadge, adminSetReward, parseWords, validateSubmission, BADGES } from "@/lib/wordsets";
import { getModeration } from "@/lib/firebase";
import { moderate } from "@/lib/moderation";
import { GAMES } from "@/components/GameCatalog";
import { LOCKABLE_FEATURES } from "@/lib/locks";
import { getSite, setSite } from "@/lib/siteConfig";
import { WHATS_NEW } from "@/lib/whatsNew";
import { ADMIN_NEWS } from "@/lib/adminWhatsNew";

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

// ── Text editor: click any words on a live preview of the site and type what they should say ──
import { setTextRules, getOriginalText } from "@/lib/textOverrides";
const PREVIEW_PAGES = [["/", "Home"], ["/game", "Game"], ["/games", "Games"], ["/shop", "Shop"], ["/help", "Help"], ["/privacy", "Privacy"]];
export function TextPanel({ T, st, adminDb, uid, flash }) {
  const [saved, setSaved] = useState(null);
  const [rules, setRules] = useState([]);
  const [page, setPage] = useState("/game");
  const [edit, setEdit] = useState(true);
  const [sel, setSel] = useState(null);
  const [val, setVal] = useState("");
  const [sub, setSub] = useState(false);
  const frame = useRef(null); const editRef = useRef(true); const rulesRef = useRef([]);
  useEffect(() => { getSite().then(c => { const r = (c.texts || []).map(x => ({ ...x })); setSaved(r); setRules(r); }).catch(() => { setSaved([]); }); }, []);
  useEffect(() => { editRef.current = edit; }, [edit]);
  useEffect(() => { rulesRef.current = rules; }, [rules]);
  // What the preview shows: saved rules plus the one being typed right now
  const draft = sel == null ? rules : [...rules.filter(r => r.from !== sel), ...(val.trim() && val.trim() !== sel ? [{ from: sel, to: val.trim(), sub }] : [])];
  useEffect(() => { const d = frame.current?.contentDocument; if (d?.body) setTextRules(draft, d); });

  const onLoad = () => {
    const d = frame.current?.contentDocument; if (!d) return;
    try {
      const style = d.createElement("style"); style.textContent = ".ak-hl{outline:2px dashed #a78bfa!important;outline-offset:2px;cursor:pointer!important}"; d.head.appendChild(style);
      let hl = null;
      const clear = () => { if (hl) { hl.classList.remove("ak-hl"); hl = null; } };
      const own = (el) => [...el.childNodes].some(c => c.nodeType === 3 && c.data.trim());
      d.addEventListener("mouseover", e => { if (!editRef.current) return clear(); const el = e.target; if (el && el.nodeType === 1 && own(el)) { clear(); hl = el; el.classList.add("ak-hl"); } }, true);
      d.addEventListener("mouseout", clear, true);
      d.addEventListener("click", e => {
        if (!editRef.current) return;
        e.preventDefault(); e.stopPropagation();
        let n = null; const r = d.caretRangeFromPoint ? d.caretRangeFromPoint(e.clientX, e.clientY) : null;
        if (r && r.startContainer.nodeType === 3 && r.startContainer.data.trim()) n = r.startContainer;
        else n = [...e.target.childNodes].find(c => c.nodeType === 3 && c.data.trim());
        if (!n) return flash("No text there. Click right on the words");
        const orig = getOriginalText(n).trim(); if (!orig) return;
        const cur = rulesRef.current.find(x => x.from === orig);
        setSel(orig); setVal(cur ? cur.to : orig); setSub(!!cur?.sub);
      }, true);
      d.addEventListener("keydown", e => { if (editRef.current) e.stopPropagation(); }, true);
    } catch { flash("Couldn't open the preview. Reload the admin page and try again"); }
  };

  const apply = () => {
    if (sel == null) return;
    const to = val.trim();
    setRules(rs => { const rest = rs.filter(r => r.from !== sel); return to && to !== sel ? [...rest, { from: sel, to, sub }] : rest; });
    setSel(null);
  };
  const dirty = saved && JSON.stringify(rules.map(r => [r.from, r.to, !!r.sub])) !== JSON.stringify(saved.map(r => [r.from, r.to, !!r.sub]));
  const publish = async () => {
    if (sel != null) apply();
    const clean = (sel != null ? draft : rules).filter(r => r.from && r.to);
    await setSite({ texts: clean }, adminDb);
    logActivity("text_overrides", { adminUid: uid, detail: `${clean.length} text change(s)` }, adminDb).catch(() => {});
    setSaved(clean.map(x => ({ ...x }))); setRules(clean); flash("Published. Players see it on their next page load");
  };
  if (!saved) return <div style={{ color: T.muted }}>Loading…</div>;
  return (<>
    <Card T={T} st={st} title="Change any text" hint="1. Pick a page.  2. Click the words you want to change.  3. Type the new words, then Publish. The preview updates as you type.">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        {PREVIEW_PAGES.map(([p, l]) => <button key={p} onClick={() => { setPage(p); setSel(null); }} style={st.tab(page === p)}>{l}</button>)}
        <span style={{ flex: 1 }} />
        <button onClick={() => setEdit(true)} style={st.tab(edit)}>✏️ Edit text</button>
        <button onClick={() => setEdit(false)} style={st.tab(!edit)}>👆 Browse</button>
      </div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 8 }}>{edit ? "Click any words in the preview to change them." : "Browse mode: click around to open menus or other screens, then switch back to Edit text."}</div>
      {sel != null && (
        <div style={{ background: T.card2 || T.card, border: `1px solid ${T.purple}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
          <div style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>Changing: <b style={{ color: T.text }}>{sel}</b></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <input autoFocus value={val} maxLength={200} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") apply(); }} placeholder="New text" style={{ ...st.input, flex: "1 1 200px", width: "auto" }} />
            <button style={st.btn("#000", "#34d399")} onClick={apply}>Done</button>
            <button style={st.btn()} onClick={() => { setVal(sel); }}>Undo change</button>
            <button style={st.btn()} onClick={() => setSel(null)}>Cancel</button>
          </div>
          <label style={{ color: T.muted, fontSize: 11, display: "block", marginTop: 6 }}><input type="checkbox" checked={sub} onChange={e => setSub(e.target.checked)} /> Also change these words when they appear inside longer text</label>
        </div>
      )}
      <iframe ref={frame} key={page} name="ak-text-preview" src={page} onLoad={onLoad} title="Site preview" style={{ width: "100%", height: 460, border: `1px solid ${T.border}`, borderRadius: 10, background: "#0a0a0f" }} />
      <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
        <AB disabled={!dirty && sel == null} style={st.btn("#000", "#34d399")} onClick={publish}>{dirty || sel != null ? "Publish changes" : "Nothing to publish"}</AB>
        {dirty && <button style={st.btn()} onClick={() => { setRules(saved.map(x => ({ ...x }))); setSel(null); }}>Discard</button>}
        {dirty && <span style={{ color: "#fbbf24", fontSize: 11 }}>Not published yet</span>}
      </div>
    </Card>
    <Card T={T} st={st} title={`Changes (${rules.length})`} hint="Everything currently changed. Remove one to bring back the original words.">
      {rules.length === 0 && <div style={{ color: T.muted, fontSize: 12 }}>No changes yet.</div>}
      {rules.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: T.text, padding: "4px 0", borderTop: i ? `1px solid ${T.border}` : "none" }}>
          <span style={{ color: T.muted, textDecoration: "line-through", flex: "0 1 40%", overflow: "hidden", textOverflow: "ellipsis" }}>{r.from}</span>
          <span>→</span>
          <b style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{r.to}</b>
          <button style={st.btn()} onClick={() => { setSel(r.from); setVal(r.to); setSub(!!r.sub); }}>Edit</button>
          <button style={st.btn("#fff", T.danger)} onClick={() => setRules(rs => rs.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
    </Card>
  </>);
}

const NEWS_SRC = { news: "Player changelog (What's new)", adminNews: "Admin changelog" };
export function ChangelogPanel({ T, st, adminDb, uid, flash }) {
  const [which, setWhich] = useState("news");
  const [site, setSiteDoc] = useState(null);
  const [draft, setDraft] = useState({});
  const [nw, setNw] = useState({ title: "", items: "" });
  useEffect(() => { getSite().then(setSiteDoc).catch(() => setSiteDoc({})); }, []);
  if (!site) return <div style={{ color: T.muted }}>Loading…</div>;
  const cfg = site[which] || { edits: {}, hidden: [], extra: [] };
  const base = which === "news" ? WHATS_NEW : ADMIN_NEWS;
  const all = [...(cfg.extra || []), ...base].sort((a, b) => new Date(b.at) - new Date(a.at));
  const hidden = new Set(cfg.hidden || []);
  const persist = async (next) => { const doc2 = { edits: {}, hidden: [], extra: [], ...cfg, ...next }; const s2 = await setSite({ [which]: doc2 }, adminDb); setSiteDoc(s2); };
  const eff = (e) => ({ ...e, ...(cfg.edits?.[e.id] || {}) });
  const saveEntry = async (e) => {
    const d = draft[e.id]; if (!d) return;
    const items = d.items.split("\n").map(x => x.trim()).filter(Boolean);
    if (!d.title.trim() || !items.length) return flash("Enter a title and at least one line");
    if ((cfg.extra || []).some(x => x.id === e.id)) await persist({ extra: cfg.extra.map(x => x.id === e.id ? { ...x, title: d.title.trim(), items } : x) });
    else await persist({ edits: { ...(cfg.edits || {}), [e.id]: { title: d.title.trim(), items } } });
    setDraft(x => { const n = { ...x }; delete n[e.id]; return n; }); flash("Changelog entry saved");
  };
  const addEntry = async () => {
    const items = nw.items.split("\n").map(x => x.trim()).filter(Boolean);
    if (!nw.title.trim() || !items.length) return flash("Enter a title and at least one line");
    const e = { id: "x-" + Date.now(), at: new Date().toISOString(), title: nw.title.trim(), items };
    await persist({ extra: [e, ...(cfg.extra || [])] }); setNw({ title: "", items: "" }); flash("Entry added");
  };
  return (<>
    <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>{Object.entries(NEWS_SRC).map(([k, l]) => <button key={k} onClick={() => setWhich(k)} style={st.tab(which === k)}>{l}</button>)}</div>
    <Card T={T} st={st} title="Add an entry" hint="Shows at the top with today's date. Entries from the same day are combined for players.">
      <input value={nw.title} onChange={e => setNw({ ...nw, title: e.target.value })} placeholder="Title" style={{ ...st.input, marginBottom: 6 }} />
      <textarea value={nw.items} onChange={e => setNw({ ...nw, items: e.target.value })} rows={3} placeholder="One change per line" style={{ ...st.input, resize: "vertical" }} />
      <AB style={{ ...st.btn(), marginTop: 6 }} onClick={addEntry}>Add entry</AB>
    </Card>
    <Card T={T} st={st} title={`Entries (${all.length})`} hint="Edit the wording, hide an entry, or restore the original.">
      {all.map(e0 => {
        const e = eff(e0); const d = draft[e0.id]; const isHidden = hidden.has(e0.id); const isExtra = (cfg.extra || []).some(x => x.id === e0.id); const edited = !!cfg.edits?.[e0.id];
        return (
          <div key={e0.id} style={{ borderTop: `1px solid ${T.border}`, padding: "8px 0", opacity: isHidden ? 0.5 : 1 }}>
            <div style={{ color: T.muted, fontSize: 10 }}>{new Date(e0.at).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" })}{isExtra ? " · added by admin" : edited ? " · edited" : ""}{isHidden ? " · hidden" : ""}</div>
            {d ? (<>
              <input value={d.title} onChange={x => setDraft({ ...draft, [e0.id]: { ...d, title: x.target.value } })} style={{ ...st.input, margin: "4px 0" }} />
              <textarea value={d.items} onChange={x => setDraft({ ...draft, [e0.id]: { ...d, items: x.target.value } })} rows={Math.min(8, d.items.split("\n").length + 1)} style={{ ...st.input, resize: "vertical" }} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}><AB style={st.btn("#000", "#34d399")} onClick={() => saveEntry(e0)}>Save</AB><button style={st.btn()} onClick={() => setDraft(x => { const n = { ...x }; delete n[e0.id]; return n; })}>Cancel</button></div>
            </>) : (<>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{e.title}</div>
              <ul style={{ margin: "4px 0", paddingLeft: 18, color: T.muted, fontSize: 12 }}>{e.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button style={st.btn()} onClick={() => setDraft({ ...draft, [e0.id]: { title: e.title, items: e.items.join("\n") } })}>Edit</button>
                <AB style={st.btn()} onClick={() => persist({ hidden: isHidden ? cfg.hidden.filter(x => x !== e0.id) : [...(cfg.hidden || []), e0.id] }).then(() => flash(isHidden ? "Entry shown" : "Entry hidden"))}>{isHidden ? "Show" : "Hide"}</AB>
                {edited && <AB style={st.btn()} onClick={() => { const ed = { ...cfg.edits }; delete ed[e0.id]; return persist({ edits: ed }).then(() => flash("Restored original")); }}>Restore original</AB>}
                {isExtra && <AB style={st.btn("#fff", T.danger)} onClick={() => confirm("Delete this entry?") && persist({ extra: cfg.extra.filter(x => x.id !== e0.id) }).then(() => flash("Entry deleted"))}>Delete</AB>}
              </div>
            </>)}
          </div>
        );
      })}
    </Card>
  </>);
}
