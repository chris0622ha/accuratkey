"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { doc, getDoc, setDoc, getDocs, collection, query, where, limit, updateDoc, deleteDoc } from "firebase/firestore";
import { adminLookupUser, logActivity, getActivityLog, getModeration, setModeration } from "@/lib/firebase";
import { getSite, setSite } from "@/lib/siteConfig";
import { cleanBlocked } from "@/lib/moderation";
import { adminListPublic, adminListSubmissions, adminDeleteSet } from "@/lib/wordsets";
import { GAMES } from "@/components/GameCatalog";
import { SYN_ANT } from "@/components/SynAntDB";
import { LevelsPanel, SetsPanel, ExportsPanel, TestPanel, TextPanel, ChangelogPanel, AB, FlashCtx } from "./ToolsMore";

const CONFIG_DOCS = ["economy", "rewards", "locks", "moderation", "announcements", "maintenance", "broadcast", "site"];
const SUBS = [["site", "🌐 Site"], ["text", "✏️ Text"], ["changelog", "📰 Changelog"], ["audit", "📜 Audit"], ["notes", "🗒 Notes"], ["tasks", "✅ Tasks"], ["backup", "💾 Backup"], ["health", "🩺 Health"], ["levelqa", "🔎 Level QA"], ["setstats", "📈 Set stats"], ["blocklist", "🚫 Blocklist"], ["levels", "🎚 Levels"], ["sets", "📚 Sets"], ["exports", "📤 Exports"], ["test", "🧪 Test & safety"], ["prefs", "⚙ Admin prefs"]];
const download = (name, text, type = "application/json") => {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
const tsMs = (t) => (t?.toDate ? t.toDate().getTime() : typeof t === "number" ? t : t?.seconds ? t.seconds * 1000 : 0);
const fmt = (t) => { const m = tsMs(t); return m ? new Date(m).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""; };

export default function ToolsTab({ T, st, adminDb, uid, flash, levels, tabs }) {
  const [sub, setSub] = useState(() => { try { const v = localStorage.getItem("ak_tools_sub"); if (v) { localStorage.removeItem("ak_tools_sub"); return v; } } catch {} return "site"; });
  const last = useRef("");
  const flash2 = (m) => { last.current = /^(failed|couldn't|could not|not found|enter |pick |add |link must|nothing|not an)|failed/i.test(String(m)) ? "bad" : "ok"; flash(m); };
  const p = { T, st, adminDb, uid, flash: flash2 };
  return (
    <FlashCtx.Provider value={{ last }}>
    <div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
        {SUBS.map(([k, l]) => <AB key={k} onClick={() => setSub(k)} style={st.tab(sub === k)}>{l}</AB>)}
      </div>
      {sub === "site" && <SitePanel {...p} />}
      {sub === "text" && <TextPanel {...p} />}
      {sub === "changelog" && <ChangelogPanel {...p} />}
      {sub === "audit" && <AuditPanel {...p} />}
      {sub === "notes" && <NotesPanel {...p} />}
      {sub === "tasks" && <TasksPanel {...p} />}
      {sub === "backup" && <BackupPanel {...p} />}
      {sub === "health" && <HealthPanel {...p} />}
      {sub === "levelqa" && <LevelQA {...p} levels={levels} />}
      {sub === "setstats" && <SetStats {...p} />}
      {sub === "blocklist" && <Blocklist {...p} />}
      {sub === "levels" && <LevelsPanel {...p} levels={levels} />}
      {sub === "sets" && <SetsPanel {...p} />}
      {sub === "exports" && <ExportsPanel {...p} levels={levels} />}
      {sub === "test" && <TestPanel {...p} />}
      {sub === "prefs" && <PrefsPanel {...p} tabs={tabs} />}
    </div>
    </FlashCtx.Provider>
  );
}

const Card = ({ st, T, title, children, hint }) => (
  <div style={st.card}>
    <div style={{ color: T.purple, fontSize: 11, fontWeight: 800, marginBottom: hint ? 2 : 8 }}>{title}</div>
    {hint && <div style={{ color: T.muted, fontSize: 11, marginBottom: 8 }}>{hint}</div>}
    {children}
  </div>
);

// ── Site: banner, welcome message, refresh-everyone, spotlight game, forced word of the day ──
function SitePanel({ T, st, adminDb, uid, flash }) {
  const [site, setS] = useState(null);
  const [bText, setBText] = useState(""); const [bColor, setBColor] = useState("#a78bfa"); const [bLink, setBLink] = useState(""); const [bHours, setBHours] = useState(24);
  const [wOn, setWOn] = useState(false); const [wTitle, setWTitle] = useState("Welcome to AccuratKey!"); const [wBody, setWBody] = useState("");
  const [spot, setSpot] = useState(""); const [wotd, setWotd] = useState(""); const [pAt, setPAt] = useState(""); const [pText, setPText] = useState("");
  useEffect(() => { getSite().then(s => { setS(s); setBText(s.banner?.text || ""); setBColor(s.banner?.color || "#a78bfa"); setBLink(s.banner?.link || ""); setWOn(!!s.welcome?.enabled); setWTitle(s.welcome?.title || "Welcome to AccuratKey!"); setWBody(s.welcome?.body || ""); setSpot(s.spotlight || ""); setWotd(s.wotd || ""); }); }, []);
  const save = async (patch, label) => {
    try { const n = await setSite(patch, adminDb); setS(n); await logActivity("site_update", { adminUid: uid, detail: label }, adminDb).catch(() => {}); flash("Saved: " + label); }
    catch (e) { flash("Failed: " + (e.code || e.message)); }
  };
  const [recent, setRecent] = useState(() => { try { return JSON.parse(localStorage.getItem("ak_admin_banners") || "[]"); } catch { return []; } });
  const rememberBanner = () => { const n = [{ text: bText.trim(), color: bColor, link: bLink }, ...recent.filter(r => r.text !== bText.trim())].slice(0, 5); setRecent(n); try { localStorage.setItem("ak_admin_banners", JSON.stringify(n)); } catch {} };
  const colors = ["#a78bfa", "#34d399", "#fbbf24", "#f87171", "#60a5fa"];
  return (<>
    <Card T={T} st={st} title="Site banner" hint="A dismissible message pinned at the bottom of the game for everyone. Dismissing is remembered on their device.">
      <input value={bText} onChange={e => setBText(e.target.value.slice(0, 160))} placeholder="Banner text (160 max)" style={st.input} />
      <input value={bLink} onChange={e => setBLink(e.target.value.trim())} placeholder="Optional https:// link" style={{ ...st.input, marginTop: 6 }} />
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        {colors.map(c => <AB key={c} onClick={() => setBColor(c)} aria-label={c} style={{ width: 22, height: 22, borderRadius: 11, background: c, border: bColor === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />)}
        <select value={bHours} onChange={e => setBHours(Number(e.target.value))} style={{ ...st.input, width: "auto" }}>
          {[[6, "6 hours"], [24, "1 day"], [72, "3 days"], [168, "1 week"], [0, "No end"]].map(([h, l]) => <option key={h} value={h}>{l}</option>)}
        </select>
      </div>
      {recent.length > 0 && <div style={{ marginTop: 8, fontSize: 11, color: T.muted }}>Recent: {recent.map(r => <AB key={r.text} onClick={() => { setBText(r.text); setBColor(r.color); setBLink(r.link || ""); }} style={{ marginRight: 6, background: T.faint, border: "none", color: T.text, borderRadius: 6, padding: "2px 8px", fontSize: 11, cursor: "pointer" }}>{r.text.slice(0, 24)}</AB>)}</div>}
      {bText && <div style={{ marginTop: 8, display: "inline-block", border: `1px solid ${bColor}`, color: bColor, background: bColor + "22", borderRadius: 12, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>{bText}</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <AB style={st.btn()} onClick={() => { if (!bText.trim()) return flash("Enter banner text"); if (bLink && !/^https:\/\//.test(bLink)) return flash("Link must start with https://"); rememberBanner(); save({ banner: { id: String(Date.now()), text: bText.trim(), color: bColor, link: bLink, endsAt: bHours ? Date.now() + bHours * 3600000 : 0 } }, "banner on"); }}>Publish banner</AB>
        <AB style={st.btn("#fff", T.faint)} onClick={() => save({ banner: null }, "banner off")}>Remove banner</AB>
      </div>
      {site?.banner && <div style={{ color: T.muted, fontSize: 10, marginTop: 6 }}>Live now: "{site.banner.text}"{site.banner.endsAt ? ` until ${fmt(site.banner.endsAt)}` : ""}</div>}
    </Card>
    <Card T={T} st={st} title="Welcome message" hint="Shows once in each player's notifications (13+ only, children's profiles never get it). Editing and saving shows it again to everyone.">
      <label style={{ color: T.text, fontSize: 12 }}><input type="checkbox" checked={wOn} onChange={e => setWOn(e.target.checked)} /> Enabled</label>
      <input value={wTitle} onChange={e => setWTitle(e.target.value.slice(0, 60))} style={{ ...st.input, marginTop: 6 }} />
      <textarea value={wBody} onChange={e => setWBody(e.target.value.slice(0, 300))} rows={3} placeholder="Message (300 max)" style={{ ...st.input, marginTop: 6, resize: "vertical" }} />
      <AB style={{ ...st.btn(), marginTop: 8 }} onClick={() => save({ welcome: { enabled: wOn, title: wTitle, body: wBody, at: Date.now() } }, "welcome message")}>Save welcome</AB>
    </Card>
    <Card T={T} st={st} title="Planned maintenance notice" hint="Players see a notice in the 24 hours before the time you set. It does not turn maintenance mode on by itself.">
      <input type="datetime-local" value={pAt} onChange={e => setPAt(e.target.value)} style={st.input} />
      <input value={pText} onChange={e => setPText(e.target.value.slice(0, 100))} placeholder="Optional note (100 max)" style={{ ...st.input, marginTop: 6 }} />
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <AB style={st.btn()} onClick={() => { const t = pAt ? new Date(pAt).getTime() : 0; if (!t || t < Date.now()) return flash("Pick a future time"); save({ planned: { at: t, text: pText } }, "planned maintenance"); }}>Publish notice</AB>
        <AB style={st.btn("#fff", T.faint)} onClick={() => save({ planned: null }, "planned maintenance cleared")}>Clear</AB>
      </div>
    </Card>
    <Card T={T} st={st} title="Ask everyone to refresh" hint="Players who already have the game open see an 'New update available' button. Use it after you ship a fix.">
      <AB style={st.btn()} onClick={() => save({ version: String(Date.now()) }, "refresh prompt")}>Send refresh prompt</AB>
    </Card>
    <Card T={T} st={st} title="Spotlight game" hint="Adds a ⭐ Spotlight tag to one game in the Games tab.">
      <select value={spot} onChange={e => setSpot(e.target.value)} style={st.input}>
        <option value="">None</option>{GAMES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <AB style={{ ...st.btn(), marginTop: 8 }} onClick={() => save({ spotlight: spot }, "spotlight " + (spot || "off"))}>Save spotlight</AB>
    </Card>
    <Card T={T} st={st} title="Word of the day override" hint="Force a specific word in the Practice lab. Must be a word in the synonym list. Leave blank for the automatic daily word.">
      <input value={wotd} onChange={e => setWotd(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))} placeholder="e.g. brave" style={st.input} />
      <AB style={{ ...st.btn(), marginTop: 8 }} onClick={() => { if (wotd && !SYN_ANT.find(x => x.word === wotd && x.syn?.length)) return flash(`"${wotd}" is not in the synonym list`); save({ wotd }, "word of the day " + (wotd || "auto")); }}>Save word</AB>
    </Card>
  </>);
}

// ── Audit: who did what, with filters ──
function AuditPanel({ T, st, adminDb, flash }) {
  const [rows, setRows] = useState(null); const [act, setAct] = useState(""); const [who, setWho] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const load = useCallback(async () => { setRows(await getActivityLog(500, adminDb).catch(() => [])); }, [adminDb]);
  const reload = async () => { await load(); flash && flash("Reloaded"); };
  useEffect(() => { load(); }, [load]);
  if (!rows) return <div style={{ color: T.muted }}>Loading…</div>;
  const f0 = from ? new Date(from).getTime() : 0, t0 = to ? new Date(to).getTime() + 86400000 : Infinity;
  const fr = rows.filter(r => (!act || r.action === act) && (!who || r.adminUid === who) && tsMs(r.createdAt) >= f0 && tsMs(r.createdAt) < t0);
  const count = (key) => { const m = {}; fr.forEach(r => { const k = r[key] || "—"; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const actions = [...new Set(rows.map(r => r.action))].sort(); const admins = [...new Set(rows.map(r => r.adminUid).filter(Boolean))];
  return (<>
    <Card T={T} st={st} title={`Audit — last ${rows.length} log entries`} hint="Filters apply to the numbers and the list below.">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <select value={act} onChange={e => setAct(e.target.value)} style={{ ...st.input, width: "auto" }}><option value="">All actions</option>{actions.map(a => <option key={a}>{a}</option>)}</select>
        <select value={who} onChange={e => setWho(e.target.value)} style={{ ...st.input, width: "auto" }}><option value="">All admins</option>{admins.map(a => <option key={a} value={a}>{a.slice(0, 8)}…</option>)}</select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...st.input, width: "auto" }} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...st.input, width: "auto" }} />
        <AB style={st.btn()} onClick={reload}>Reload</AB>
      </div>
    </Card>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
      <Card T={T} st={st} title="By action">{count("action").slice(0, 12).map(([k, n]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", color: T.text, fontSize: 12 }}><span>{k}</span><b>{n}</b></div>)}</Card>
      <Card T={T} st={st} title="By admin (last active)">{count("adminUid").slice(0, 12).map(([k, n]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", color: T.text, fontSize: 12 }}><span>{k.slice(0, 10)}… <span style={{ color: T.muted, fontSize: 10 }}>{fmt(fr.find(r => r.adminUid === k)?.createdAt)}</span></span><b>{n}</b></div>)}</Card>
    </div>
    <Card T={T} st={st} title={`Entries (${fr.length})`}>
      {fr.slice(0, 80).map(r => <div key={r.id} style={{ fontSize: 11, color: T.muted, padding: "3px 0", borderBottom: `1px solid ${T.border}` }}><b style={{ color: T.text }}>{r.action}</b> · {r.targetUsername ? "@" + r.targetUsername + " · " : ""}{(r.detail || "").slice(0, 100)} <span style={{ float: "right" }}>{fmt(r.createdAt)}</span></div>)}
    </Card>
  </>);
}

// helpers for admin-only records kept in activityLog (admin read/update/delete, any signed-in create)
const listLog = async (adb, action, extra) => {
  const q = extra ? query(collection(adb, "activityLog"), where("action", "==", action), where(extra[0], "==", extra[1]), limit(100)) : query(collection(adb, "activityLog"), where("action", "==", action), limit(100));
  return (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => tsMs(b.createdAt) - tsMs(a.createdAt));
};

function NotesPanel({ T, st, adminDb, uid, flash }) {
  const [q, setQ] = useState(""); const [who, setWho] = useState(null); const [notes, setNotes] = useState([]); const [txt, setTxt] = useState("");
  const find = async () => { const u = await adminLookupUser(adminDb, q).catch(() => null); if (!u) { setWho(null); setNotes([]); return flash("Not found"); } setWho(u); setNotes(await listLog(adminDb, "admin_note", ["targetUid", u.uid]).catch(() => [])); };
  const add = async () => { if (!txt.trim() || !who) return; await logActivity("admin_note", { adminUid: uid, targetUid: who.uid, targetUsername: who.username, detail: txt.trim().slice(0, 400) }, adminDb); setTxt(""); setNotes(await listLog(adminDb, "admin_note", ["targetUid", who.uid])); flash("Note added"); };
  return (<>
    <Card T={T} st={st} title="Staff notes on an account" hint="Private to admins. Look up by @username or UID. Don't store personal details about children here.">
      <div style={{ display: "flex", gap: 6 }}><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && find()} placeholder="@username or UID" style={st.input} /><AB style={st.btn()} onClick={find}>Find</AB></div>
    </Card>
    {who && <Card T={T} st={st} title={`@${who.username || who.uid}`}>
      <textarea value={txt} onChange={e => setTxt(e.target.value)} rows={2} placeholder="Add a note (400 max)" style={{ ...st.input, resize: "vertical" }} />
      <AB style={{ ...st.btn(), marginTop: 6 }} onClick={add}>Add note</AB>
      {notes.map(n => <div key={n.id} style={{ marginTop: 8, fontSize: 12, color: T.text, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>{n.detail}<div style={{ color: T.muted, fontSize: 10 }}>{fmt(n.createdAt)} · {String(n.adminUid || "").slice(0, 6)}… <AB onClick={async () => { if (!confirm("Delete this note?")) return; await deleteDoc(doc(adminDb, "activityLog", n.id)); setNotes(notes.filter(x => x.id !== n.id)); }} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer", fontSize: 10 }}>delete</AB></div></div>)}
      {!notes.length && <div style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>No notes yet.</div>}
    </Card>}
  </>);
}

function TasksPanel({ T, st, adminDb, uid, flash }) {
  const [tasks, setTasks] = useState([]); const [shift, setShift] = useState([]); const [t, setT] = useState(""); const [s, setSn] = useState("");
  const load = useCallback(async () => { setTasks(await listLog(adminDb, "admin_task").catch(() => [])); setShift(await listLog(adminDb, "admin_shift").catch(() => [])); }, [adminDb]);
  useEffect(() => { load(); }, [load]);
  const open = tasks.filter(x => !x.done), done = tasks.filter(x => x.done);
  return (<>
    <Card T={T} st={st} title={`Admin tasks (${open.length} open)`} hint="A shared to-do list for all admins.">
      <div style={{ display: "flex", gap: 6 }}><input value={t} onChange={e => setT(e.target.value)} onKeyDown={async e => { if (e.key === "Enter" && t.trim()) { await logActivity("admin_task", { adminUid: uid, detail: t.trim().slice(0, 200) }, adminDb); setT(""); load(); flash("Task added"); } }} placeholder="New task, press Enter" style={st.input} /></div>
      {open.map(x => <div key={x.id} style={{ marginTop: 6, fontSize: 12, color: T.text, display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" onChange={async () => { await updateDoc(doc(adminDb, "activityLog", x.id), { done: true }); load(); flash("Task done"); }} />{x.detail}</div>)}
      {done.length > 0 && <details style={{ marginTop: 8 }}><summary style={{ color: T.muted, fontSize: 11, cursor: "pointer" }}>Done ({done.length})</summary>{done.map(x => <div key={x.id} style={{ fontSize: 11, color: T.muted, textDecoration: "line-through" }}>{x.detail} <AB onClick={async () => { await deleteDoc(doc(adminDb, "activityLog", x.id)); load(); }} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer", fontSize: 10 }}>clear</AB></div>)}</details>}
    </Card>
    <Card T={T} st={st} title="Shift notes" hint="Leave a handoff note for the next admin.">
      <textarea value={s} onChange={e => setSn(e.target.value)} rows={2} placeholder="What should the next admin know?" style={{ ...st.input, resize: "vertical" }} />
      <AB style={{ ...st.btn(), marginTop: 6 }} onClick={async () => { if (!s.trim()) return; await logActivity("admin_shift", { adminUid: uid, detail: s.trim().slice(0, 400) }, adminDb); setSn(""); load(); flash("Shift note posted"); }}>Post note</AB>
      {shift.slice(0, 10).map(x => <div key={x.id} style={{ marginTop: 8, fontSize: 12, color: T.text, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>{x.detail}<div style={{ color: T.muted, fontSize: 10 }}>{fmt(x.createdAt)}</div></div>)}
    </Card>
  </>);
}

// ── Backup / restore of admin configuration (never user data) ──
function BackupPanel({ T, st, adminDb, uid, flash }) {
  const [busy, setBusy] = useState(false); const [plan, setPlan] = useState(null); const [undo, setUndo] = useState(() => { try { return !!localStorage.getItem("ak_admin_undo"); } catch { return false; } });
  const snapshot = async () => {
    const out = { app: "accuratkey-config", at: new Date().toISOString(), config: {}, levelOverrides: {} };
    for (const n of CONFIG_DOCS) { const s = await getDoc(doc(adminDb, "config", n)); if (s.exists()) out.config[n] = s.data(); }
    (await getDocs(collection(adminDb, "levelOverrides"))).forEach(d => { out.levelOverrides[d.id] = d.data(); });
    return out;
  };
  const exportNow = async () => { setBusy(true); try { const o = await snapshot(); download(`accuratkey-config-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(o, null, 1)); await logActivity("config_backup", { adminUid: uid, detail: `${Object.keys(o.config).length} docs, ${Object.keys(o.levelOverrides).length} level overrides` }, adminDb).catch(() => {}); flash("Backup downloaded"); } catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false); };
  const doUndo = async () => {
    let u; try { u = JSON.parse(localStorage.getItem("ak_admin_undo") || "null"); } catch {} if (!u || !confirm(`Undo the restore from ${u.at}? This puts back the ${u.docs.length} setting(s) as they were just before it.`)) return;
    setBusy(true); try { for (const d of u.docs) { if (d.prev) await setDoc(doc(adminDb, d.kind, d.id), d.prev); else await deleteDoc(doc(adminDb, d.kind, d.id)); } localStorage.removeItem("ak_admin_undo"); setUndo(false); await logActivity("config_restore_undo", { adminUid: uid, detail: `${u.docs.length} docs` }, adminDb).catch(() => {}); flash("Restore undone"); } catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false);
  };
  const clean = (o) => { const r = {}; for (const [k, v] of Object.entries(o || {})) { if (v && typeof v === "object" && !Array.isArray(v) && "seconds" in v && "nanoseconds" in v) continue; r[k] = v; } return r; };
  const pick = async (file) => {
    if (!file) return;
    try {
      const o = JSON.parse(await file.text()); if (o.app !== "accuratkey-config") return flash("Not an AccuratKey config backup");
      const cur = await snapshot(); const changes = [];
      for (const n of CONFIG_DOCS) if (o.config?.[n] && JSON.stringify(clean(o.config[n])) !== JSON.stringify(clean(cur.config[n]))) changes.push({ kind: "config", id: n, data: clean(o.config[n]), prev: cur.config[n] ? clean(cur.config[n]) : null });
      for (const [id, d] of Object.entries(o.levelOverrides || {})) if (/^\d{1,4}$/.test(id) && JSON.stringify(clean(d)) !== JSON.stringify(clean(cur.levelOverrides[id]))) changes.push({ kind: "levelOverrides", id, data: clean(d), prev: cur.levelOverrides[id] ? clean(cur.levelOverrides[id]) : null });
      setPlan({ at: o.at, changes });
    } catch { flash("Could not read that file"); }
  };
  const apply = async () => {
    if (!plan?.changes.length || !confirm(`Overwrite ${plan.changes.length} settings with the backup from ${plan.at}?`)) return;
    setBusy(true);
    try { try { localStorage.setItem("ak_admin_undo", JSON.stringify({ at: new Date().toISOString(), docs: plan.changes.map(c => ({ kind: c.kind, id: c.id, prev: c.prev })) })); setUndo(true); } catch {}
      for (const c of plan.changes) await setDoc(doc(adminDb, c.kind, c.id), c.data); await logActivity("config_restore", { adminUid: uid, detail: `${plan.changes.length} docs from ${plan.at}` }, adminDb).catch(() => {}); flash("Restored"); setPlan(null); }
    catch (e) { flash("Failed: " + (e.code || e.message)); }
    setBusy(false);
  };
  return (
    <Card T={T} st={st} title="Config backup and restore" hint="Saves Economy, Rewards, Locks, Moderation, announcements, maintenance, broadcast, Site and level text overrides. It never includes accounts, profiles or scores.">
      <AB disabled={busy} style={st.btn()} onClick={exportNow}>Download backup (.json)</AB>
      <div style={{ marginTop: 10 }}><label style={st.label}>Restore from a backup</label><input type="file" accept="application/json" onChange={e => pick(e.target.files?.[0])} style={{ color: T.text, fontSize: 12 }} /></div>
      {undo && <div style={{ marginTop: 10 }}><AB disabled={busy} style={st.btn("#fff", T.faint)} onClick={doUndo}>↩ Undo last restore</AB></div>}
      {plan && <div style={{ marginTop: 8, fontSize: 12, color: T.text }}>Backup from {plan.at}: <b>{plan.changes.length}</b> setting(s) differ from now{plan.changes.length ? ": " + plan.changes.map(c => c.kind === "config" ? c.id : "level " + c.id).join(", ") : ""}.
        {plan.changes.length > 0 && <div><AB disabled={busy} style={{ ...st.btn("#fff", T.danger), marginTop: 6 }} onClick={apply}>Restore these</AB></div>}</div>}
    </Card>
  );
}

function HealthPanel({ T, st, adminDb, flash }) {
  const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true); const out = [];
    const time = async (label, fn) => { const t = performance.now(); try { const v = await fn(); out.push({ label, ok: true, ms: Math.round(performance.now() - t), note: v }); } catch (e) { out.push({ label, ok: false, ms: Math.round(performance.now() - t), note: e.code || e.message }); } };
    for (const n of CONFIG_DOCS) await time(`config/${n}`, async () => ((await getDoc(doc(adminDb, "config", n))).exists() ? "set" : "empty"));
    for (const c of ["wordSets", "levelOverrides", "activityLog", "wordSetSubmissions"]) await time(c, async () => (await getDocs(query(collection(adminDb, c), limit(50)))).size + " docs (first 50)");
    out.push({ label: "Browser online", ok: navigator.onLine, ms: 0, note: navigator.onLine ? "yes" : "no" });
    setRes(out); setBusy(false); flash(out.every(r => r.ok) ? "All checks passed" : `Failed: ${out.filter(r => !r.ok).length} check(s) had problems`);
  };
  return (
    <Card T={T} st={st} title="System health" hint="Read-only checks against your database from this admin session.">
      <AB disabled={busy} style={st.btn()} onClick={run}>{busy ? "Checking…" : "Run checks"}</AB>
      {res && <div style={{ marginTop: 10 }}>{res.map(r => <div key={r.label} style={{ display: "flex", gap: 8, fontSize: 12, padding: "2px 0", color: r.ok ? T.text : T.danger }}><span>{r.ok ? "✅" : "❌"}</span><span style={{ flex: 1 }}>{r.label}</span><span style={{ color: T.muted }}>{r.note}</span><span style={{ color: T.muted, width: 52, textAlign: "right" }}>{r.ms ? r.ms + " ms" : ""}</span></div>)}</div>}
    </Card>
  );
}

function LevelQA({ T, st, levels }) {
  const [sel, setSel] = useState("");
  const strip = (s) => String(s).replace(/\s+/g, "");
  const issues = [];
  (levels || []).forEach(l => {
    const w = Array.isArray(l.words) ? l.words : [];
    const add = (m) => issues.push({ id: l.id, name: l.name, m });
    if (w.length < 3) add(`only ${w.length} text entries`);
    if (w.some(x => !String(x).trim())) add("has an empty entry");
    if (w.some(x => /\s/.test(String(x)))) add("entry contains spaces (stripped when played)");
    if (new Set(w.map(x => strip(x).toLowerCase())).size < w.length) add("duplicate entries");
    if (w.some(x => /[^\x20-\x7e]/.test(String(x)))) add("non-keyboard characters");
    if (w.some(x => strip(x).length > 120)) add("entry longer than 120 characters");
    if (!l.name || !String(l.name).trim()) add("missing name");
  });
  const lv = (levels || []).find(l => String(l.id) === sel);
  return (<>
    <Card T={T} st={st} title={`Level QA — ${issues.length} issue(s) across ${(levels || []).length} levels`} hint="Scans the level text currently loaded in the admin page.">
      {!issues.length && <div style={{ color: T.accent, fontSize: 12 }}>No problems found.</div>}
      <div style={{ maxHeight: 260, overflow: "auto" }}>{issues.slice(0, 200).map((i, k) => <div key={k} style={{ fontSize: 12, color: T.text, padding: "2px 0" }}><b>L{i.id}</b> {i.name}: <span style={{ color: T.warn }}>{i.m}</span></div>)}</div>
    </Card>
    <Card T={T} st={st} title="Level preview" hint="What a player types for a level (spaces removed).">
      <input value={sel} onChange={e => setSel(e.target.value.trim())} placeholder="Level number" style={st.input} />
      {sel && !lv && <div style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>No such level.</div>}
      {lv && <div style={{ marginTop: 8, fontSize: 12, color: T.text }}><b>{lv.name}</b> · target {lv.wpmTarget || "—"} WPM · {lv.accuracy}% accuracy{(lv.words || []).slice(0, 8).map((x, i) => <div key={i} style={{ fontFamily: "monospace", color: T.muted, wordBreak: "break-all", marginTop: 3 }}>{strip(x).slice(0, 140)}</div>)}</div>}
    </Card>
  </>);
}

function SetStats({ T, st, adminDb, uid, flash }) {
  const [d, setD] = useState(null); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const [pub, subs, owners] = await Promise.all([adminListPublic(adminDb).catch(() => []), adminListSubmissions(adminDb).catch(() => []), getDocs(collection(adminDb, "wordSetOwners")).then(s => s.docs.map(x => ({ id: x.id, ...x.data() }))).catch(() => [])]);
    const byOwner = {}; owners.forEach(o => { (byOwner[o.uid] = byOwner[o.uid] || []).push(o); });
    const badges = {}; pub.forEach(p => { badges[p.badge || "none"] = (badges[p.badge || "none"] || 0) + 1; });
    setD({ pub, subs, owners, byOwner, badges });
  }, [adminDb]);
  useEffect(() => { load(); }, [load]);
  if (!d) return <div style={{ color: T.muted }}>Loading…</div>;
  const top = Object.entries(d.byOwner).sort((a, b) => b[1].length - a[1].length).slice(0, 10);
  const removeAll = async (ou, sets) => {
    const reason = prompt(`Reason sent to the creator (removes ${sets.length} set(s)):`, "Removed by an admin"); if (reason === null) return;
    setBusy(true); try { for (const s of sets) await adminDeleteSet(adminDb, s.id, reason, s.title); await logActivity("wordset_bulk_remove", { adminUid: uid, targetUid: ou, detail: `${sets.length} sets: ${reason}`.slice(0, 180) }, adminDb).catch(() => {}); flash("Removed"); await load(); } catch (e) { flash("Failed: " + (e.code || e.message)); } setBusy(false);
  };
  return (<>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
      {[["Published", d.pub.length], ["Waiting", d.subs.length], ["With owner record", d.owners.length]].map(([l, n]) => <div key={l} style={{ ...st.card, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{n}</div><div style={{ fontSize: 10, color: T.muted }}>{l}</div></div>)}
    </div>
    <Card T={T} st={st} title="By rating">{Object.entries(d.badges).map(([k, n]) => <span key={k} style={{ display: "inline-block", marginRight: 10, fontSize: 12, color: T.text }}>{k}: <b>{n}</b></span>)}</Card>
    <Card T={T} st={st} title="Top creators" hint="Only sets approved since owner records began are linked to a creator. Shown by account ID, never by name.">
      {top.map(([ou, sets]) => <div key={ou} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.text, padding: "3px 0" }}><span style={{ flex: 1, fontFamily: "monospace" }}>{ou.slice(0, 12)}… <b>{sets.length}</b> set(s)</span><AB disabled={busy} style={st.btn("#fff", T.danger)} onClick={() => removeAll(ou, sets)}>Remove all</AB></div>)}
      {!top.length && <div style={{ color: T.muted, fontSize: 11 }}>No data yet.</div>}
    </Card>
  </>);
}

function Blocklist({ T, st, adminDb, uid, flash }) {
  const [txt, setTxt] = useState(""); const [cur, setCur] = useState(null);
  useEffect(() => { getModeration().then(m => setCur(m.blocked || [])); }, []);
  const merge = async () => {
    const add = cleanBlocked(txt); if (!add.length) return flash("Nothing to add");
    const m = await getModeration(); const all = cleanBlocked([...(m.blocked || []), ...add].join(","));
    try { await setModeration({ ...m, blocked: all }, adminDb); setCur(all); setTxt(""); await logActivity("moderation_import", { adminUid: uid, detail: `+${add.length} → ${all.length}` }, adminDb).catch(() => {}); flash(`Blocklist now ${all.length} words`); } catch (e) { flash("Failed: " + (e.code || e.message)); }
  };
  return (
    <Card T={T} st={st} title={`Blocklist import / export${cur ? ` (${cur.length} words)` : ""}`} hint="Paste words separated by commas, spaces or new lines to add them. Existing words are kept.">
      <textarea value={txt} onChange={e => setTxt(e.target.value)} rows={4} style={{ ...st.input, resize: "vertical" }} placeholder="word1, word2, word3" />
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <AB style={st.btn()} onClick={merge}>Add to blocklist</AB>
        <AB style={st.btn("#fff", T.faint)} onClick={() => cur && download("blocklist.txt", cur.join("\n"), "text/plain")}>Export (.txt)</AB>
      </div>
    </Card>
  );
}

export const ADMIN_PREFS_KEY = "ak_admin_prefs";
export const readAdminPrefs = () => { try { return { idle: 30, pinned: [], ...JSON.parse(localStorage.getItem(ADMIN_PREFS_KEY) || "{}") }; } catch { return { idle: 30, pinned: [] }; } };
function PrefsPanel({ T, st, flash, tabs }) {
  const [pr, setPr] = useState(() => readAdminPrefs());
  const save = (n) => { setPr(n); try { localStorage.setItem(ADMIN_PREFS_KEY, JSON.stringify(n)); } catch {} flash("Saved on this device — reload to apply"); };
  return (<>
    <Card T={T} st={st} title="Auto sign-out when idle" hint="Signs this browser out of the admin panel after no activity. Saved on this device.">
      <select value={pr.idle} onChange={e => save({ ...pr, idle: Number(e.target.value) })} style={st.input}>{[[0, "Never"], [10, "10 minutes"], [30, "30 minutes"], [60, "1 hour"]].map(([m, l]) => <option key={m} value={m}>{l}</option>)}</select>
    </Card>
    <Card T={T} st={st} title="Pinned tabs" hint="Pinned tabs appear first. Alt+1 to Alt+9 jump to the first nine tabs. Ctrl/Cmd+K opens the command palette.">
      {(tabs || []).filter(t => t !== "tools").map(t => <label key={t} style={{ display: "inline-block", marginRight: 12, fontSize: 12, color: T.text }}><input type="checkbox" checked={pr.pinned.includes(t)} onChange={e => save({ ...pr, pinned: e.target.checked ? [...pr.pinned, t] : pr.pinned.filter(x => x !== t) })} /> {t}</label>)}
    </Card>
  </>);
}
