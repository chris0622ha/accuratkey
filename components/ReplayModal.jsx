"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { loadReplay, rhythm } from "@/lib/features";

// Watch your last run back, key by key, with timing. Local only.
export default function ReplayModal({ T, pid, onClose }) {
  const rep = useMemo(() => loadReplay(pid), [pid]);
  const rh = useMemo(() => rep && rhythm(rep.ev), [rep]);
  const [n, setN] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(null);
  const ev = rep?.ev || [];
  useEffect(() => {
    if (!playing) return;
    if (n >= ev.length) { setPlaying(false); return; }
    const wait = n === 0 ? 200 : Math.min(800, Math.max(8, (ev[n][0] - ev[n - 1][0]) / speed));
    tRef.current = setTimeout(() => setN(x => x + 1), wait);
    return () => clearTimeout(tRef.current);
  }, [playing, n, speed]);
  const shown = ev.slice(0, n);
  const lines = []; shown.forEach(e => { const L = e[3] || 0; (lines[L] = lines[L] || []).push(e); });
  const cur = n > 0 ? lines.length - 1 : 0;
  const Btn = ({ on, children, onClick }) => <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${on ? T.purple : T.border}`, background: on ? T.purple + "33" : "transparent", color: T.text }}>{children}</button>;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 9100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 16 }}>Replay & rhythm</div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>Your most recent run, saved on this device only.</div>
        {!rep ? <div style={{ color: T.muted, fontSize: 13 }}>Finish a run first, then come back.</div> : <>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, minHeight: 90, fontFamily: "monospace", fontSize: 16, letterSpacing: 1, lineHeight: 1.8, wordBreak: "break-all" }}>
            {lines.slice(Math.max(0, cur - 1), cur + 1).map((l, i) => <div key={i}>{l.map((e, j) => <span key={j} style={{ color: e[1] === e[2] ? T.accent2 : "#ef4444", textDecoration: e[1] === e[2] ? "none" : "underline" }}>{e[2] || e[1]}</span>)}</div>)}
            {n === 0 && <span style={{ color: T.faint }}>Press play</span>}
          </div>
          <div style={{ height: 5, background: T.border, borderRadius: 3, margin: "10px 0" }}><div style={{ height: "100%", width: `${ev.length ? (n / ev.length) * 100 : 0}%`, background: T.purple, borderRadius: 3 }} /></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <Btn on={playing} onClick={() => { if (n >= ev.length) setN(0); setPlaying(p => !p); }}>{playing ? "Pause" : n >= ev.length ? "Replay" : "Play"}</Btn>
            {[1, 2, 4].map(s => <Btn key={s} on={speed === s} onClick={() => setSpeed(s)}>{s}x</Btn>)}
          </div>
          <div style={{ color: T.muted, fontSize: 12 }}>{rep.wpm} WPM · {rep.acc}% accuracy · {ev.length} keys</div>
          {rh && <div style={{ marginTop: 12, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12 }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>Rhythm</div>
            <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>Average {rh.avgMs} ms between keys · consistency <b style={{ color: T.text }}>{rh.consistency}/100</b></div>
            {rh.slow.length > 0 && <div style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>Slowest letter pairs: {rh.slow.map(([p, ms]) => `${p} (${ms} ms)`).join(", ")}</div>}
          </div>}
        </>}
      </div>
    </div>
  );
}
