"use client";
import { useState, useEffect } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { getEconomy, setEconomy, getRewards, setRewards, getAllUsers, isProfileRestricted, addNotification, logActivity } from "@/lib/firebase";

const MULTS = [1, 1.5, 2, 3];
const HOURS = [[6, "6 hours"], [24, "1 day"], [48, "2 days"], [72, "3 days"], [168, "1 week"], [0, "No end"]];

// Admin tab: Keys events (multiplier), daily Keys cap, bulk level rewards and bulk Keys gifts.
export default function EconomyTab({ T, st, adminDb, uid, flash }) {
  const [eco, setEco] = useState(null);
  const [name, setName] = useState("Double Keys weekend");
  const [mult, setMult] = useState(2);
  const [hours, setHours] = useState(48);
  const [cap, setCap] = useState("500");
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [amt, setAmt] = useState("");
  const [gift, setGift] = useState(""); const [giftMsg, setGiftMsg] = useState(""); const [prog, setProg] = useState("");
  useEffect(() => { getEconomy().then(e => { setEco(e); if (e.dailyCap) setCap(String(e.dailyCap)); if (e.name) setName(e.name); }); }, []);
  const active = eco && eco.multiplier > 1 && (!eco.endsAt || eco.endsAt > Date.now()) && (!eco.startsAt || eco.startsAt <= Date.now());
  const save = async (patch, ok) => {
    setBusy(true);
    try { const next = { ...(eco || {}), ...patch }; await setEconomy(next, adminDb); setEco(next); await logActivity("economy_update", { adminUid: uid, detail: JSON.stringify(patch).slice(0, 180) }, adminDb).catch(() => {}); flash(ok); }
    catch (e) { flash("Failed: " + (e.code || e.message)); }
    setBusy(false);
  };
  const bulkRewards = async (clear) => {
    const a = Math.floor(Number(from)), b = Math.floor(Number(to)), v = Math.floor(Number(amt));
    if (!(a >= 1 && b >= a && b <= 1000 && b - a <= 300)) return flash("Enter a level range (up to 300 levels)");
    if (!clear && !(v >= 0 && v <= 500)) return flash("Reward must be 0-500");
    if (!confirm(clear ? `Clear custom rewards for levels ${a}-${b}?` : `Set levels ${a}-${b} to ${v} Keys each?`)) return;
    setBusy(true);
    try {
      const cur = await getRewards(); const levels = { ...(cur.levels || {}) };
      for (let i = a; i <= b; i++) { if (clear) delete levels[String(i)]; else levels[String(i)] = v; }
      await setRewards({ levels }, adminDb); await logActivity("rewards_bulk", { adminUid: uid, detail: `${clear ? "cleared" : v} levels ${a}-${b}` }, adminDb).catch(() => {});
      flash(clear ? "Cleared" : "Rewards set");
    } catch (e) { flash("Failed: " + (e.code || e.message)); }
    setBusy(false);
  };
  const sendGift = async () => {
    const v = Math.floor(Number(gift));
    if (!(v >= 1 && v <= 500)) return flash("Gift must be 1-500 Keys");
    if (!confirm(`Give ${v} Keys to every signed-in profile (13+)? This can't be undone.`)) return;
    setBusy(true); setProg("Loading users…");
    try {
      const users = await getAllUsers(adminDb); let n = 0;
      for (const u of users.slice(0, 500)) {
        const profs = (u.profiles || []).filter(p => !isProfileRestricted(p));
        if (!profs.length) continue;
        for (const p of profs) { await updateDoc(doc(adminDb, "accounts", u.uid, "profiles", p.id), { keys: increment(v) }).then(() => { n++; }).catch(() => {}); }
        await addNotification(u.uid, { type: "admin_message", title: `You got ${v} Keys!`, body: (giftMsg.trim() || "A gift from the AccuratKey team.").slice(0, 200) }, adminDb).catch(() => {});
        setProg(`Gifted ${n} profiles…`);
      }
      await logActivity("keys_gift_all", { adminUid: uid, detail: `${v} Keys to ${n} profiles` }, adminDb).catch(() => {});
      flash(`Gave ${v} Keys to ${n} profiles`); setProg("");
    } catch (e) { flash("Failed: " + (e.code || e.message)); setProg(""); }
    setBusy(false);
  };
  const chip = (on, color, label, fn) => <button key={label} onClick={fn} style={{ ...st.btn(on ? "#fff" : T.muted, on ? color : T.faint), fontSize: 11 }}>{label}</button>;
  if (!eco) return <div style={{ color: T.muted }}>Loading…</div>;
  return (
    <div>
      <div style={st.card}>
        <div style={st.label}>Keys event (multiplier)</div>
        {active ? <div style={{ color: "#10b981", fontSize: 12, marginBottom: 8 }}>Running now: {eco.name || "Keys event"} · {eco.multiplier}x{eco.endsAt ? ` until ${new Date(eco.endsAt).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ET` : " (no end)"}</div> : <div style={{ color: T.muted, fontSize: 12, marginBottom: 8 }}>No event running. Multiplies Keys earned from level runs (the daily cap still applies).</div>}
        <input value={name} maxLength={40} onChange={e => setName(e.target.value)} style={{ ...st.input, marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>{MULTS.filter(m => m > 1).map(m => chip(mult === m, T.purple, m + "x", () => setMult(m)))}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>{HOURS.map(([h, l]) => chip(hours === h, T.purple, l, () => setHours(h)))}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={busy} onClick={() => save({ name, multiplier: mult, startsAt: Date.now(), endsAt: hours ? Date.now() + hours * 3600000 : 0 }, "Event started")} style={{ ...st.btn("#fff", "#10b981"), flex: 1, padding: 10 }}>Start event now</button>
          {active && <button disabled={busy} onClick={() => save({ multiplier: 1, startsAt: 0, endsAt: 0 }, "Event ended")} style={st.btn("#fff", "#ef4444")}>End now</button>}
        </div>
      </div>
      <div style={st.card}>
        <div style={st.label}>Daily Keys cap per profile (50-5000)</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={cap} onChange={e => setCap(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" style={{ ...st.input, width: 100 }} />
          <button disabled={busy} onClick={() => save({ dailyCap: Math.max(50, Math.min(5000, Number(cap) || 500)) }, "Cap saved")} style={st.btn("#fff", T.purple)}>Save</button>
        </div>
      </div>
      <div style={st.card}>
        <div style={st.label}>Bulk level rewards</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          Levels <input value={from} onChange={e => setFrom(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="from" inputMode="numeric" style={{ ...st.input, width: 64 }} />
          to <input value={to} onChange={e => setTo(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="to" inputMode="numeric" style={{ ...st.input, width: 64 }} />
          = <input value={amt} onChange={e => setAmt(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Keys" inputMode="numeric" style={{ ...st.input, width: 70 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button disabled={busy} onClick={() => bulkRewards(false)} style={st.btn("#fff", T.purple)}>Set range</button>
          <button disabled={busy} onClick={() => bulkRewards(true)} style={st.btn(T.muted, T.faint)}>Clear range</button>
        </div>
      </div>
      <div style={st.card}>
        <div style={st.label}>Gift Keys to everyone (13+ profiles)</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={gift} onChange={e => setGift(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Keys" inputMode="numeric" style={{ ...st.input, width: 90 }} />
          <input value={giftMsg} maxLength={200} onChange={e => setGiftMsg(e.target.value)} placeholder="Message (optional)" style={st.input} />
        </div>
        <button disabled={busy} onClick={sendGift} style={st.btn("#fff", "#f59e0b")}>Send gift</button>
        {prog && <span style={{ color: T.muted, fontSize: 11, marginLeft: 8 }}>{prog}</span>}
        <div style={{ color: T.faint, fontSize: 10, marginTop: 6 }}>Under-13 profiles are skipped: their Keys are stored on their own device. Each gifted account also gets an in-game notification. Up to 500 accounts per send.</div>
      </div>
    </div>
  );
}
