"use client";
import React, { useState, useEffect } from "react";
import { fromText } from "@/lib/practice";
import { getPublicWordSets, submitWordSet, parseWords, validateSubmission, badgeInfo, BADGES, LIMITS } from "@/lib/wordsets";

// Community word sets: browse + practice (everyone), submit (13+, signed in). Shared by the Sets tab and Practice lab.
export default function WordSetsPanel({ T, canSubmit, onPractice, maxListHeight }) {
  const [sets, setSets] = useState(null);
  const [q, setQ] = useState("");
  const [badgeF, setBadgeF] = useState("all"); // all | rewarded | badge id
  const [sort, setSort] = useState("new");   // new | badge | words | az
  const [showSubmit, setShowSubmit] = useState(false);
  const [sTitle, setSTitle] = useState("");
  const [sWords, setSWords] = useState("");
  const [sMsg, setSMsg] = useState("");
  const [sBusy, setSBusy] = useState(false);
  useEffect(() => { getPublicWordSets().then(setSets); }, []);
  const practiceSet = (w) => {
    const pool = []; while (pool.length < 60) pool.push(...[...w.words].sort(() => Math.random() - 0.5));
    onPractice(fromText(pool.slice(0, Math.max(60, w.words.length)).join(" ")), w.title, { setId: w.id, rewardKeys: w.rewardKeys || 0 });
  };
  const submit = async () => {
    const words = parseWords(sWords); const err = validateSubmission(sTitle, words);
    if (err) { setSMsg(err); return; }
    setSBusy(true);
    try { await submitWordSet(sTitle, words); setSMsg("Thanks! Your word set is waiting for review. If approved it will appear here for everyone, with no name attached."); setSTitle(""); setSWords(""); }
    catch (e) { setSMsg("Couldn't submit: " + (e.code === "permission-denied" ? "you may already have one waiting for review." : e.message)); }
    setSBusy(false);
  };
  const rank = (w) => { const i = BADGES.findIndex(b => b.id === w.badge); return i < 0 ? -1 : i; };
  const shown = (sets || []).filter(w => (!q.trim() || w.title.toLowerCase().includes(q.trim().toLowerCase()) || w.words.some(x => x.toLowerCase() === q.trim().toLowerCase()))
      && (badgeF === "all" || (badgeF === "rewarded" ? w.rewardKeys > 0 : w.badge === badgeF)))
    .sort((a, b) => sort === "badge" ? rank(b) - rank(a) : sort === "words" ? b.words.length - a.words.length : sort === "az" ? a.title.localeCompare(b.title) : 0);
  const chip = (id, label, color) => <button key={id} onClick={() => setBadgeF(id)} style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${badgeF === id ? (color || T.purple) : T.border}`, background: badgeF === id ? (color || T.purple) + "22" : "transparent", color: badgeF === id ? (color || T.purple) : T.muted }}>{label}</button>;
  const inp = { width: "100%", boxSizing: "border-box", background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, fontSize: 12, fontFamily: "inherit" };
  return (
    <div>
      {sets !== null && sets.length > 0 && <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search sets by title or word" aria-label="Search word sets" style={{ ...inp, flex: 1, padding: "8px 10px" }} />
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort word sets" style={{ ...inp, width: "auto", padding: "8px 6px" }}>
            <option value="new">Newest</option><option value="badge">Best badge</option><option value="words">Most words</option><option value="az">A to Z</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chip("all", "All")}{chip("rewarded", "Rewards", "#fbbf24")}{BADGES.filter(b => sets.some(w => w.badge === b.id)).map(b => chip(b.id, b.label, b.color))}
        </div>
        <div style={{ color: T.muted, fontSize: 11 }}>{shown.length} of {sets.length} sets</div>
      </div>}
      {sets === null ? <div style={{ color: T.muted, fontSize: 12 }}>Loading…</div> : sets.length === 0 ? <div style={{ color: T.muted, fontSize: 12 }}>No community sets yet. Be the first to submit one!</div> : shown.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: "10px 0" }}>No sets match. Try a different search or filter.</div> :
        <div style={{ display: "grid", gap: 6, gridTemplateColumns: maxListHeight ? "1fr" : "repeat(auto-fill,minmax(240px,1fr))", maxHeight: maxListHeight, overflowY: maxListHeight ? "auto" : "visible" }}>{shown.map(w => { const b = badgeInfo(w.badge); return (
          <button key={w.id} onClick={() => practiceSet(w)} style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", padding: "12px 14px", borderRadius: 12, border: `1px solid ${b ? b.color + "66" : T.border}`, background: T.bg, color: T.text, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{w.title}</span>
            <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: T.muted, fontSize: 11 }}>{w.words.length} words</span>
              {b && <span style={{ color: b.color, fontSize: 10, fontWeight: 800, border: `1px solid ${b.color}55`, borderRadius: 99, padding: "1px 8px" }}>{b.label}</span>}
              {w.rewardKeys > 0 && <span style={{ color: "#fbbf24", fontSize: 10, fontWeight: 800 }}>+{w.rewardKeys} Keys</span>}
            </span>
            <span style={{ color: T.faint, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.words.slice(0, 6).join(", ")}…</span>
          </button>); })}</div>}
      {canSubmit && (!showSubmit ? <button onClick={() => setShowSubmit(true)} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, border: `1px dashed ${T.border}`, background: "transparent", color: T.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>+ Submit your own word set</button> :
        <div style={{ marginTop: 8, padding: 10, border: `1px solid ${T.border}`, borderRadius: 10 }}>
          <input value={sTitle} onChange={e => { setSTitle(e.target.value.slice(0, LIMITS.titleMax)); setSMsg(""); }} placeholder="Set title" style={{ ...inp, marginBottom: 6 }} />
          <textarea value={sWords} onChange={e => { setSWords(e.target.value.slice(0, 2500)); setSMsg(""); }} rows={3} placeholder={`${LIMITS.minWords}-${LIMITS.maxWords} words separated by spaces or commas`} style={{ ...inp, resize: "vertical" }} />
          <div style={{ color: T.muted, fontSize: 10, margin: "4px 0" }}>{parseWords(sWords).length} different words (need {LIMITS.minWords}-{LIMITS.maxWords}). Only the title and words are shared, and only after an admin approves them. Your name is never shown. Don't include personal information.</div>
          {sMsg && <div style={{ color: sMsg.startsWith("Thanks") ? "#10b981" : "#ef4444", fontSize: 11, marginBottom: 4 }}>{sMsg}</div>}
          <button disabled={sBusy} onClick={submit} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: T.purple, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>{sBusy ? "Sending…" : "Submit for review"}</button>
        </div>)}
    </div>
  );
}
