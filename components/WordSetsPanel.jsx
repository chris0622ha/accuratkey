"use client";
import React, { useState, useEffect } from "react";
import { fromText } from "@/lib/practice";
import { getPublicWordSets, submitWordSet, parseWords, validateSubmission, badgeInfo, LIMITS } from "@/lib/wordsets";

// Community word sets: browse + practice (everyone), submit (13+, signed in). Shared by the Sets tab and Practice lab.
export default function WordSetsPanel({ T, canSubmit, onPractice, maxListHeight }) {
  const [sets, setSets] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [sTitle, setSTitle] = useState("");
  const [sWords, setSWords] = useState("");
  const [sMsg, setSMsg] = useState("");
  const [sBusy, setSBusy] = useState(false);
  useEffect(() => { getPublicWordSets().then(setSets); }, []);
  const practiceSet = (w) => {
    const pool = []; while (pool.length < 60) pool.push(...[...w.words].sort(() => Math.random() - 0.5));
    onPractice(fromText(pool.slice(0, Math.max(60, w.words.length)).join(" ")), w.title);
  };
  const submit = async () => {
    const words = parseWords(sWords); const err = validateSubmission(sTitle, words);
    if (err) { setSMsg(err); return; }
    setSBusy(true);
    try { await submitWordSet(sTitle, words); setSMsg("Thanks! Your word set is waiting for review. If approved it will appear here for everyone, with no name attached."); setSTitle(""); setSWords(""); }
    catch (e) { setSMsg("Couldn't submit: " + (e.code === "permission-denied" ? "you may already have one waiting for review." : e.message)); }
    setSBusy(false);
  };
  const inp = { width: "100%", boxSizing: "border-box", background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, fontSize: 12, fontFamily: "inherit" };
  return (
    <div>
      {sets === null ? <div style={{ color: T.muted, fontSize: 12 }}>Loading…</div> : sets.length === 0 ? <div style={{ color: T.muted, fontSize: 12 }}>No community sets yet. Be the first to submit one!</div> :
        <div style={{ display: "grid", gap: 6, maxHeight: maxListHeight, overflowY: maxListHeight ? "auto" : "visible" }}>{sets.map(w => { const b = badgeInfo(w.badge); return (
          <button key={w.id} onClick={() => practiceSet(w)} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.bg, color: T.text, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ flex: 1 }}><span style={{ fontWeight: 700, fontSize: 13 }}>{w.title}</span><span style={{ color: T.muted, fontSize: 11 }}> · {w.words.length} words</span></span>
            {b && <span style={{ color: b.color, fontSize: 10, fontWeight: 800, border: `1px solid ${b.color}55`, borderRadius: 99, padding: "1px 8px" }}>{b.label}</span>}
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
