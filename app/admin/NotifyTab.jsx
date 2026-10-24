"use client";
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getAnnouncements, setAnnouncements, addNotification, logActivity } from "@/lib/firebase";

const AUD = [["all", "Everyone"], ["users", "Regular users"], ["admins", "Admins"], ["specific", "Specific people"]];
const LVL = [["none", "Nothing", "#6b7280"], ["important", "Important (!! on profile)", "#f59e0b"], ["urgent", "Urgent (popup)", "#ef4444"]];
const EXP = [[1, "1 day"], [7, "7 days"], [30, "30 days"], [0, "Never"]];

// Admin tab: send in-game notifications (not push). Group messages are shared; specific people get a personal inbox item.
export default function NotifyTab({ T, st, adminDb, uid, flash }) {
  const [aud, setAud] = useState("all");
  const [names, setNames] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState("none");
  const [exp, setExp] = useState(7);
  const [delay, setDelay] = useState(0);
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState([]);
  const [tpls, setTpls] = useState([]);
  useEffect(() => { try { setTpls(JSON.parse(localStorage.getItem("ak_admin_tpls") || "[]")); } catch {} }, []);
  const saveTpls = (t) => { setTpls(t); try { localStorage.setItem("ak_admin_tpls", JSON.stringify(t.slice(0, 20))); } catch {} };
  const load = useCallback(async () => { setList(await getAnnouncements()); }, []);
  useEffect(() => { load(); }, [load]);

  const send = async () => {
    const t = title.trim().slice(0, 80), b = body.trim().slice(0, 300);
    if (!t) return flash("Add a title");
    if (aud === "specific" && !names.trim()) return flash("Add at least one username");
    if (!confirm(`Send to ${AUD.find(a => a[0] === aud)[1].toLowerCase()}${level !== "none" ? " as " + level.toUpperCase() : ""}?`)) return;
    setBusy(true);
    try {
      if (aud === "specific") {
        const list2 = [...new Set(names.split(/[\s,]+/).map(x => x.trim().toLowerCase().replace(/^@/, "")).filter(Boolean))].slice(0, 25);
        let ok = 0; const missing = [];
        for (const n of list2) {
          const snap = await getDoc(doc(adminDb, "usernames", n)).catch(() => null);
          const target = snap && snap.exists() ? snap.data().uid : null;
          if (!target) { missing.push(n); continue; }
          if (await addNotification(target, { type: "admin_message", title: t, body: b, level }, adminDb)) ok++; else missing.push(n);
        }
        flash(`Sent to ${ok}${missing.length ? ` - not found/failed: ${missing.join(", ")}` : ""}`);
      } else {
        const cur = await getAnnouncements();
        const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: t, body: b, level, audience: aud, at: Date.now(), startsAt: delay ? Date.now() + delay * 3600000 : null, expiresAt: exp ? Date.now() + delay * 3600000 + exp * 86400000 : null };
        await setAnnouncements([item, ...cur], adminDb);
        flash("Sent");
        await load();
      }
      await logActivity("admin_notification", { adminUid: uid, detail: `${aud} ${level}: ${t}` }, adminDb).catch(() => {});
      setTitle(""); setBody(""); setLevel("none");
    } catch (e) { flash("Failed: " + (e.code || e.message)); }
    setBusy(false);
  };
  const remove = async (id) => {
    if (!confirm("Remove this notification for everyone?")) return;
    try { await setAnnouncements((await getAnnouncements()).filter(x => x.id !== id), adminDb); flash("Removed"); await load(); } catch (e) { flash("Failed: " + (e.code || e.message)); }
  };
  const edit = async (a) => {
    const t = prompt("Title", a.title); if (t === null) return; const b = prompt("Message", a.body); if (b === null) return;
    if (!t.trim()) return flash("Add a title");
    try { const cur = await getAnnouncements(); await setAnnouncements(cur.map(x => x.id === a.id ? { ...x, title: t.trim().slice(0, 80), body: b.trim().slice(0, 300), editedAt: Date.now() } : x), adminDb); await logActivity("admin_notification_edit", { adminUid: uid, detail: t.trim().slice(0, 80) }, adminDb).catch(() => {}); flash("Notification updated"); await load(); } catch (e) { flash("Failed: " + (e.code || e.message)); }
  };
  const reuse = (a) => { setAud(a.audience === "specific" ? "all" : a.audience); setTitle(a.title); setBody(a.body); setLevel(a.level || "none"); window.scrollTo({ top: 0, behavior: "smooth" }); flash("Loaded into the form above — edit and send"); };
  const chip = (active, color, label, onClick) => <button key={label} onClick={onClick} style={{ ...st.btn(active ? "#fff" : T.muted, active ? color : T.faint), fontSize: 11 }}>{label}</button>;
  return (
    <div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>Sends an in-game notification (not a push). Important shows !! on the player's profile until read. Urgent shows a popup the next time they open the game.</div>
      <div style={st.card}>
        <div style={st.label}>Send to</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>{AUD.map(([k, l]) => chip(aud === k, T.purple, l, () => setAud(k)))}</div>
        {aud === "specific" && <><div style={st.label}>Usernames (comma or space separated)</div><input value={names} onChange={e => setNames(e.target.value)} placeholder="player1, player2" style={{ ...st.input, marginBottom: 10 }} /></>}
        <div style={st.label}>Title</div>
        <input value={title} maxLength={80} onChange={e => setTitle(e.target.value)} style={{ ...st.input, marginBottom: 10 }} />
        <div style={st.label}>Message</div>
        <textarea value={body} maxLength={300} onChange={e => setBody(e.target.value)} rows={3} style={{ ...st.input, resize: "vertical", marginBottom: 4 }} />
        <div style={{ color: T.faint, fontSize: 10, marginBottom: 10 }}>{body.length}/300 - don't include personal info</div>
        <div style={st.label}>Priority</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>{LVL.map(([k, l, c]) => chip(level === k, c, l, () => setLevel(k)))}</div>
        {aud !== "specific" && <><div style={st.label}>Disappears after</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>{EXP.map(([k, l]) => chip(exp === k, T.purple, l, () => setExp(k)))}</div>
        <div style={st.label}>Send in</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>{[[0, "Now"], [1, "1 hour"], [6, "6 hours"], [24, "Tomorrow"], [72, "3 days"]].map(([k, l]) => chip(delay === k, T.purple, l, () => setDelay(k)))}</div></>}
        <button disabled={busy} onClick={send} style={{ ...st.btn("#fff", "#10b981"), width: "100%", padding: 10 }}>{busy ? "Sending…" : "Send notification"}</button>
      </div>
      <div style={st.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={st.label}>Templates (saved in this browser)</span>
          <button onClick={() => { if (!title.trim()) return flash("Write a title first"); saveTpls([{ title, body, level, aud }, ...tpls.filter(x => x.title !== title)]); flash("Template saved"); }} style={{ ...st.btn("#fff", T.purple), marginLeft: "auto" }}>Save current as template</button>
        </div>
        {tpls.length === 0 && <div style={{ color: T.faint, fontSize: 11, marginTop: 6 }}>None yet.</div>}
        {tpls.map((x, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ color: T.text, fontSize: 12, flex: 1 }}>{x.title}</span>
            <button onClick={() => { setTitle(x.title); setBody(x.body); setLevel(x.level); setAud(x.aud === "specific" ? "all" : x.aud); }} style={st.btn(T.muted, T.faint)}>Use</button>
            <button onClick={() => saveTpls(tpls.filter((_, j) => j !== i))} style={st.btn("#fff", "#ef4444")}>×</button>
          </div>))}
      </div>
      <div style={st.label}>Active group notifications ({list.length})</div>
      {list.length === 0 && <div style={{ ...st.card, color: T.muted, fontSize: 12 }}>None.</div>}
      {list.map(a => (
        <div key={a.id} style={st.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: T.text, fontWeight: 800, fontSize: 13, flex: 1 }}>{a.title}</span>
            {a.level !== "none" && <span style={{ color: a.level === "urgent" ? "#ef4444" : "#f59e0b", fontSize: 10, fontWeight: 800 }}>{String(a.level).toUpperCase()}</span>}
            <button onClick={() => edit(a)} style={st.btn("#fff", T.faint)}>Edit</button>
            <button onClick={() => reuse(a)} style={st.btn("#fff", T.faint)}>Reuse</button>
            <button onClick={() => remove(a.id)} style={st.btn("#fff", "#ef4444")}>Remove</button>
          </div>
          <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{a.body}</div>
          <div style={{ color: T.faint, fontSize: 10, marginTop: 4 }}>To {a.audience} · {new Date(a.at).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ET{a.expiresAt && a.expiresAt < Date.now() ? " · expired" : a.expiresAt ? " · expires " + new Date(a.expiresAt).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }) : ""}</div>
        </div>
      ))}
    </div>
  );
}
