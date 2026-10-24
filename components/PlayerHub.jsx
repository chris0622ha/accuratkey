"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { PRESETS, fromText, getKeyStats } from "@/lib/practice";
import { ALL_WORDS } from "./WordDB";
import { getHistory, dayCounts, dayKey, currentDayStreak } from "@/lib/stats";
import { loadReplay } from "@/lib/features";
import { canStore } from "@/lib/consent";

// "More tools" hub: insights, training extras, planning and privacy tools. Everything here is computed from, and stored on, this device only.
const TABS = [["insights", "📊 Insights"], ["train", "🎯 Train"], ["audio", "🎧 Focus & rhythm"], ["plan", "🗓 Plan"], ["data", "🔒 My data"]];
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? d; } catch { return d; } };
const lsSet = (k, v) => { if (!canStore()) return; try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const PASSAGES = [
  ["Alice in Wonderland", "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it."],
  ["Pride and Prejudice", "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families."],
  ["A Tale of Two Cities", "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness."],
  ["Gettysburg Address", "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal."],
  ["Moby-Dick", "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world."],
  ["The Raven", "Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore, while I nodded, nearly napping, suddenly there came a tapping, as of some one gently rapping, rapping at my chamber door."],
];
const CODE = {
  JavaScript: ["const total = items.reduce((sum, x) => sum + x.price, 0);", "function greet(name) { return `Hello, ${name}!`; }", "for (let i = 0; i < list.length; i++) { console.log(list[i]); }", "const names = users.filter(u => u.active).map(u => u.name);", "if (score >= 90 && !failed) { grade = 'A'; } else { grade = 'B'; }", "document.querySelector('#app').addEventListener('click', handle);", "const [count, setCount] = useState(0);", "export default async function load(url) { return fetch(url); }"],
  Python: ["def add(a, b): return a + b", "for i in range(10): print(i * 2)", "names = [u.name for u in users if u.active]", "with open('data.txt') as f: lines = f.readlines()", "class Dog: def __init__(self, name): self.name = name", "result = {k: v for k, v in pairs if v > 0}", "if x is not None and len(x) > 3: print(x[0])", "import os, sys, json"],
  HTML: ["<div class=\"card\"><h2>Title</h2><p>Text here.</p></div>", "<a href=\"https://example.com\" target=\"_blank\">Link</a>", "<ul><li>One</li><li>Two</li><li>Three</li></ul>", "<img src=\"photo.jpg\" alt=\"A photo\" width=\"200\">", "<button type=\"submit\" disabled>Send</button>", "<input type=\"text\" placeholder=\"Your name\" required>"],
};
const TWISTERS = ["She sells seashells by the seashore.", "Peter Piper picked a peck of pickled peppers.", "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", "Red lorry, yellow lorry, red lorry, yellow lorry.", "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.", "I scream, you scream, we all scream for ice cream.", "Betty Botter bought some butter but she said the butter's bitter.", "Unique New York, unique New York, you know you need unique New York.", "Six slippery snails slid slowly seaward.", "Toy boat, toy boat, toy boat."];
const TIPS = ["Look at the screen, not your hands. Trust your fingers to find the keys.", "Accuracy first: speed follows once mistakes stop interrupting your rhythm.", "Keep your wrists floating and relaxed, not resting hard on the desk.", "Take a short break every 20 minutes and look at something far away.", "Use all ten fingers. Every key has one finger that owns it.", "Slow, even rhythm beats fast, jerky bursts.", "Short daily practice beats one long weekly session.", "Sit with your feet flat and elbows near 90 degrees.", "Return your fingers to the home row (ASDF JKL;) after each key.", "When you slip, don't rush to fix it. Reset your rhythm and keep going."];
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export default function PlayerHub({ T, profile, onStart, onClose, onCloseAll }) {
  const pid = profile?.id || "guest";
  const [tab, setTab] = useState("insights");
  const [msg, setMsg] = useState("");
  const hist = useMemo(() => getHistory(pid), [pid]);
  const go = (lines, name) => { if (!lines || lines.length < 3) { setMsg("Not enough text to practice with."); return; } (onCloseAll || onClose)(); onStart(lines, name, {}); };
  const card = { background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 };
  const h = (t, sub) => <div style={{ marginBottom: 8 }}><div style={{ color: T.text, fontWeight: 800, fontSize: 13 }}>{t}</div>{sub && <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{sub}</div>}</div>;
  const btn = (primary) => ({ padding: "6px 12px", borderRadius: 8, border: primary ? "none" : `1px solid ${T.border}`, background: primary ? T.purple : "transparent", color: primary ? "#fff" : T.text, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" });
  const input = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, padding: "6px 9px", fontFamily: "inherit" };
  const P = { T, pid, hist, card, h, btn, input, go };
  return (
    <div onClick={e => { e.stopPropagation(); onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 16 }}>🧰 More tools</div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ color: T.muted, fontSize: 11, margin: "4px 0 10px" }}>Everything here works from this device only. Nothing is uploaded.</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>{TABS.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setMsg(""); }} style={{ ...btn(tab === k), fontSize: 11 }}>{l}</button>)}</div>
        {msg && <div style={{ color: "#f59e0b", fontSize: 12, marginBottom: 8 }}>{msg}</div>}
        {tab === "insights" && <Insights {...P} />}
        {tab === "train" && <Train {...P} />}
        {tab === "audio" && <Audio {...P} />}
        {tab === "plan" && <Plan {...P} />}
        {tab === "data" && <MyData {...P} profile={profile} flash={setMsg} />}
      </div>
    </div>
  );
}

// ── Insights ──
function Insights({ T, pid, hist, card, h }) {
  const last = hist.slice(-30);
  const week = (off) => { const a = Date.now() - (off + 1) * 7 * 864e5, b = Date.now() - off * 7 * 864e5; return hist.filter(r => r.t >= a && r.t < b); };
  const tw = week(0), lw = week(1);
  const stat = (r) => ({ runs: r.length, mins: Math.round(r.reduce((s, x) => s + (x.secs || 0), 0) / 60), wpm: Math.round(avg(r.map(x => x.wpm))), acc: Math.round(avg(r.map(x => x.acc))) });
  const a = stat(tw), b = stat(lw);
  const days = {}; tw.forEach(r => { const k = dayKey(r.t); days[k] = (days[k] || 0) + 1; });
  const bestDay = Object.entries(days).sort((x, y) => y[1] - x[1])[0];
  const delta = (x, y, unit = "") => { const d = x - y; return <span style={{ color: d >= 0 ? "#10b981" : "#ef4444", fontSize: 11 }}> {d >= 0 ? "▲" : "▼"} {Math.abs(d)}{unit}</span>; };
  // heatmap: last 12 weeks
  const counts = dayCounts(hist); const cells = []; const start = new Date(); start.setDate(start.getDate() - (11 * 7 + start.getDay()));
  for (let i = 0; i < 12 * 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); cells.push({ k: dayKey(d.getTime()), n: counts[dayKey(d.getTime())] || 0, future: d.getTime() > Date.now() }); }
  const shade = (n) => n === 0 ? T.border : n < 2 ? "#10b98155" : n < 4 ? "#10b981aa" : "#10b981";
  // sparkline
  const w = last.map(r => r.wpm), mx = Math.max(1, ...w), mn = Math.min(...w, mx);
  const pts = w.map((v, i) => `${(i / Math.max(1, w.length - 1)) * 280},${58 - ((v - mn) / Math.max(1, mx - mn)) * 52}`).join(" ");
  // keyboard heat
  const ks = getKeyStats(pid);
  const heat = (k) => { const v = ks[k]; if (!v || v.n < 5) return T.border; const r = v.miss / v.n; return r < 0.03 ? "#10b98188" : r < 0.08 ? "#f59e0b99" : "#ef4444cc"; };
  // slips from the last replay
  const slips = useMemo(() => { const rp = loadReplay(pid); const m = {}; (rp?.ev || []).forEach(e => { if (e[1] && e[2] && e[1] !== e[2]) { const k = `${e[2]}→${e[1]}`; m[k] = (m[k] || 0) + 1; } }); return Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 6); }, [pid]);
  // badges
  const streak = currentDayStreak(hist), totalMins = Math.round(hist.reduce((s, r) => s + (r.secs || 0), 0) / 60), bestW = Math.max(0, ...hist.map(r => r.wpm));
  const BAD = [["🏃", "10 runs", hist.length >= 10], ["🏃‍♂️", "50 runs", hist.length >= 50], ["🏅", "100 runs", hist.length >= 100], ["🏆", "500 runs", hist.length >= 500], ["🔥", "3-day streak", streak >= 3], ["🔥", "7-day streak", streak >= 7], ["🌋", "30-day streak", streak >= 30], ["🎯", "A perfect run", hist.some(r => r.acc >= 100)], ["⚡", "50 WPM", bestW >= 50], ["🚀", "80 WPM", bestW >= 80], ["💫", "100 WPM", bestW >= 100], ["⏱", "1 hour total", totalMins >= 60], ["⌛", "10 hours total", totalMins >= 600]];
  // daily challenges
  const today = hist.filter(r => dayKey(r.t) === dayKey());
  const prevAvg = avg(hist.filter(r => dayKey(r.t) !== dayKey()).slice(-20).map(r => r.wpm));
  const POOL = [["Play 3 runs", today.length >= 3], ["Play 5 runs", today.length >= 5], ["Get a run at 90%+ accuracy", today.some(r => r.acc >= 90)], ["Get a run at 95%+ accuracy", today.some(r => r.acc >= 95)], ["Pass a level", today.some(r => r.passed)], ["Type for 2 minutes", today.reduce((s, r) => s + (r.secs || 0), 0) >= 120], ["Beat your recent average speed", prevAvg > 0 && today.some(r => r.wpm > prevAvg)], ["Reach 30 WPM", today.some(r => r.wpm >= 30)]];
  let seed = 0; for (const c of dayKey()) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const todays = [0, 1, 2].map(i => POOL[(seed + i * 3) % POOL.length]).filter((x, i, arr) => arr.findIndex(y => y[0] === x[0]) === i);
  const mean = Math.round(avg(hist.slice(-10).map(r => r.wpm)));
  const BANDS = [[0, "Just starting"], [20, "Building up"], [30, "Getting there"], [40, "Around the typical adult average"], [60, "Faster than most"], [80, "Professional speed"], [100, "Elite"]];
  const band = [...BANDS].reverse().find(x => mean >= x[0]);
  return (<>
    <div style={card}>{h("Daily mini-challenges", "Three small goals for today, checked from your runs.")}
      {todays.map(([t, ok]) => <div key={t} style={{ color: ok ? "#10b981" : T.text, fontSize: 13, padding: "3px 0" }}>{ok ? "✅" : "⬜"} {t}</div>)}</div>
    <div style={card}>{h("This week vs last week")}
      {!hist.length ? <div style={{ color: T.muted, fontSize: 12 }}>Play a few runs and your stats will show up here.</div> : <div style={{ color: T.text, fontSize: 13, lineHeight: 1.7 }}>
        Runs: <b>{a.runs}</b>{delta(a.runs, b.runs)} · Minutes: <b>{a.mins}</b>{delta(a.mins, b.mins)}<br />
        Avg speed: <b>{a.wpm}</b> WPM{delta(a.wpm, b.wpm)} · Avg accuracy: <b>{a.acc}%</b>{delta(a.acc, b.acc, "%")}
        {bestDay && <><br />Busiest day: <b>{new Date(bestDay[0] + "T12:00").toLocaleDateString("en-US", { weekday: "long" })}</b> ({bestDay[1]} runs)</>}</div>}</div>
    <div style={card}>{h("Activity calendar", "Last 12 weeks. Darker = more runs.")}
      <div style={{ display: "grid", gridTemplateRows: "repeat(7,12px)", gridAutoFlow: "column", gap: 3, overflowX: "auto" }}>{cells.map(c => <div key={c.k} title={`${c.k}: ${c.n} run${c.n === 1 ? "" : "s"}`} style={{ width: 12, height: 12, borderRadius: 3, background: c.future ? "transparent" : shade(c.n) }} />)}</div>
      <div style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>Current streak: <b style={{ color: T.text }}>{streak}</b> day{streak === 1 ? "" : "s"}</div></div>
    <div style={card}>{h("Speed trend", `Last ${last.length} runs`)}
      {last.length < 2 ? <div style={{ color: T.muted, fontSize: 12 }}>Needs at least two runs.</div> : <><svg viewBox="0 0 280 64" style={{ width: "100%", height: 64 }}><polyline points={pts} fill="none" stroke={T.purple} strokeWidth="2" /></svg>
        <div style={{ color: T.muted, fontSize: 11 }}>Low {Math.min(...w)} · High {Math.max(...w)} WPM</div></>}
      {mean > 0 && <div style={{ color: T.text, fontSize: 12, marginTop: 6 }}>Your recent average is <b>{mean} WPM</b>: {band[1]}. (A rough guide, not a grade.)</div>}</div>
    <div style={card}>{h("Keyboard heat map", "Green = few slips, orange = some, red = many. Grey = not enough data yet.")}
      {ROWS.map((r, i) => <div key={r} style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 4, marginLeft: i * 12 }}>{[...r].map(k => <div key={k} style={{ width: 26, height: 26, borderRadius: 6, background: heat(k), color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{k.toUpperCase()}</div>)}</div>)}</div>
    <div style={card}>{h("Common slips", "From your last saved replay: the key you meant → what you pressed.")}
      {slips.length ? <div style={{ color: T.text, fontSize: 13 }}>{slips.map(([k, n]) => <span key={k} style={{ display: "inline-block", marginRight: 10 }}><b>{k}</b> ×{n}</span>)}</div> : <div style={{ color: T.muted, fontSize: 12 }}>No replay yet, or no slips in it.</div>}</div>
    <div style={card}>{h("Milestones", "Earned from your history on this device.")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{BAD.map(([e, l, ok]) => <span key={l} title={l} style={{ padding: "4px 9px", borderRadius: 99, fontSize: 11, border: `1px solid ${ok ? "#10b981" : T.border}`, color: ok ? "#10b981" : T.muted, opacity: ok ? 1 : 0.6 }}>{e} {l}</span>)}</div></div>
    <div style={card}>{h("Tip of the day")}<div style={{ color: T.text, fontSize: 13 }}>{TIPS[seed % TIPS.length]}</div></div>
  </>);
}

// ── Train ──
function Train({ T, card, h, btn, input, go }) {
  const [sets, setSets] = useState({ lower: true, upper: false, digits: false, symbols: false }); const [len, setLen] = useState(4);
  const [lang, setLang] = useState("JavaScript");
  const build = () => { let pool = ""; if (sets.lower) pool += "abcdefghijklmnopqrstuvwxyz"; if (sets.upper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; if (sets.digits) pool += "0123456789"; if (sets.symbols) pool += "!@#$%&*()-_=+[]{};:,.?/"; if (!pool) return; go(Array.from({ length: 12 }, () => Array.from({ length: 6 }, () => Array.from({ length: len }, () => pool[rnd(pool.length)]).join("")).join(" ")), "Custom drill"); };
  const warm = () => go([...PRESETS.bigrams().slice(0, 4), ...Array.from({ length: 4 }, () => Array.from({ length: 6 }, () => pick(ALL_WORDS.filter(w => w.length <= 5))).join(" ")), ...PRESETS.punctuation().slice(0, 4)], "Warm-up");
  return (<>
    <div style={card}>{h("Warm-up routine", "About 2 minutes: letter pairs, short words, then punctuation.")}<button style={btn(true)} onClick={warm}>Start warm-up</button></div>
    <div style={card}>{h("Drill builder", "Pick what to practice.")}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: T.text, fontSize: 12, marginBottom: 8 }}>{[["lower", "abc"], ["upper", "ABC"], ["digits", "123"], ["symbols", "#$%"]].map(([k, l]) => <label key={k}><input type="checkbox" checked={sets[k]} onChange={e => setSets({ ...sets, [k]: e.target.checked })} /> {l}</label>)}
        <label>Chunk size <select value={len} onChange={e => setLen(Number(e.target.value))} style={input}>{[2, 3, 4, 5, 6, 8].map(n => <option key={n}>{n}</option>)}</select></label></div>
      <button style={btn(true)} onClick={build}>Start drill</button></div>
    <div style={card}>{h("Classic passages", "Public-domain literature and speeches.")}{PASSAGES.map(([t, x]) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}><span style={{ flex: 1, color: T.text, fontSize: 13 }}>{t}</span><button style={btn()} onClick={() => go(fromText(x), t)}>Type it</button></div>)}</div>
    <div style={card}>{h("Code snippets")}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}><select value={lang} onChange={e => setLang(e.target.value)} style={input}>{Object.keys(CODE).map(l => <option key={l}>{l}</option>)}</select><button style={btn(true)} onClick={() => go([...CODE[lang]].sort(() => Math.random() - 0.5), lang + " code")}>Start</button></div></div>
    <div style={card}>{h("Tongue twisters")}<button style={btn(true)} onClick={() => go([...TWISTERS].sort(() => Math.random() - 0.5), "Tongue twisters")}>Start</button></div>
    <Dictation T={T} card={card} h={h} btn={btn} input={input} />
  </>);
}

function Dictation({ T, card, h, btn, input }) {
  const [list, setList] = useState(null); const [i, setI] = useState(0); const [v, setV] = useState(""); const [ok, setOk] = useState(0); const [fb, setFb] = useState("");
  const can = typeof window !== "undefined" && "speechSynthesis" in window;
  const say = (w) => { try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(w); u.rate = 0.85; window.speechSynthesis.speak(u); } catch {} };
  const start = () => { const l = Array.from({ length: 12 }, () => pick(ALL_WORDS.filter(w => w.length >= 4 && w.length <= 8))); setList(l); setI(0); setOk(0); setV(""); setFb(""); say(l[0]); };
  const submit = () => {
    if (!v.trim()) return; const right = v.trim().toLowerCase() === list[i].toLowerCase(); if (right) setOk(o => o + 1); setFb(right ? "✅" : `❌ it was "${list[i]}"`); setV("");
    const n = i + 1; setI(n); if (n < list.length) setTimeout(() => say(list[n]), 600);
  };
  const done = list && i >= list.length;
  return <div style={card}>{h("Dictation", "Listen, then type the word you hear. Great for spelling and ear-to-finger speed.")}
    {!can ? <div style={{ color: T.muted, fontSize: 12 }}>Your browser doesn't support speech.</div> : !list || done ? <>{done && <div style={{ color: T.text, fontSize: 13, marginBottom: 6 }}>Score: <b>{ok}/{list.length}</b></div>}<button style={btn(true)} onClick={start}>{done ? "Play again" : "Start dictation"}</button></> :
      <div><div style={{ color: T.muted, fontSize: 12, marginBottom: 6 }}>Word {i + 1} of {list.length} {fb}</div>
        <div style={{ display: "flex", gap: 6 }}><input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); else if (e.key === "\\") { e.preventDefault(); setV(""); } }} autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{ ...input, flex: 1 }} placeholder="Type, then Enter" /><button style={btn()} onClick={() => say(list[i])}>🔊 Again</button></div></div>}</div>;
}

// ── Focus sound, Pomodoro, metronome ──
function Audio({ T, card, h, btn, input }) {
  const ctxRef = useRef(null); const noiseRef = useRef(null); const [noise, setNoise] = useState(false); const [vol, setVol] = useState(0.25);
  const ac = () => { if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); return ctxRef.current; };
  const toggleNoise = () => {
    if (noiseRef.current) { try { noiseRef.current.src.stop(); } catch {} noiseRef.current = null; setNoise(false); return; }
    const c = ac(); const len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const wn = Math.random() * 2 - 1; last = (last + 0.02 * wn) / 1.02; d[i] = last * 3.5; }
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true; const g = c.createGain(); g.gain.value = vol; src.connect(g); g.connect(c.destination); src.start(); noiseRef.current = { src, g }; setNoise(true);
  };
  useEffect(() => { if (noiseRef.current) noiseRef.current.g.gain.value = vol; }, [vol]);
  // pomodoro
  const [mode, setMode] = useState("focus"); const [left, setLeft] = useState(25 * 60); const [run, setRun] = useState(false); const [focusMin, setFocusMin] = useState(25);
  useEffect(() => { if (!run) return; const t = setInterval(() => setLeft(l => l - 1), 1000); return () => clearInterval(t); }, [run]);
  useEffect(() => { if (left > 0) return; try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 660; g.gain.value = 0.15; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.4); } catch {} const m = mode === "focus" ? "break" : "focus"; setMode(m); setLeft((m === "focus" ? focusMin : 5) * 60); }, [left]);
  // metronome
  const [bpm, setBpm] = useState(90); const [met, setMet] = useState(false); const [pulse, setPulse] = useState(false); const metRef = useRef({ t0: 0, id: null }); const [on, setOn] = useState({ hits: 0, total: 0 });
  const startMet = () => { if (met) { clearInterval(metRef.current.id); setMet(false); return; } const c = ac(); const period = 60000 / bpm; metRef.current.t0 = performance.now(); setOn({ hits: 0, total: 0 });
    const tick = () => { try { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.12; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.05); } catch {} setPulse(true); setTimeout(() => setPulse(false), 90); };
    tick(); metRef.current.id = setInterval(tick, period); setMet(true); };
  useEffect(() => () => { clearInterval(metRef.current.id); try { noiseRef.current?.src.stop(); } catch {} }, []);
  const onKey = (e) => { if (!met || e.key.length !== 1) return; const period = 60000 / bpm, off = (performance.now() - metRef.current.t0) % period, dev = Math.min(off, period - off); setOn(o => ({ hits: o.hits + (dev < period * 0.15 ? 1 : 0), total: o.total + 1 })); };
  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, "0"), ss = String(Math.max(0, left) % 60).padStart(2, "0");
  return (<>
    <div style={card}>{h("Focus sound", "Soft brown noise to mask distractions.")}<div style={{ display: "flex", gap: 8, alignItems: "center" }}><button style={btn(!noise)} onClick={toggleNoise}>{noise ? "Stop" : "Play"}</button><input type="range" min="0.05" max="0.6" step="0.05" value={vol} onChange={e => setVol(Number(e.target.value))} aria-label="Volume" /></div></div>
    <div style={card}>{h("Focus timer", "Work in focused blocks with short breaks.")}
      <div style={{ color: mode === "focus" ? T.text : "#10b981", fontSize: 30, fontWeight: 900 }}>{mm}:{ss} <span style={{ fontSize: 12, fontWeight: 600 }}>{mode === "focus" ? "focus" : "break"}</span></div>
      <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}><button style={btn(true)} onClick={() => setRun(r => !r)}>{run ? "Pause" : "Start"}</button><button style={btn()} onClick={() => { setRun(false); setMode("focus"); setLeft(focusMin * 60); }}>Reset</button>
        <select value={focusMin} onChange={e => { const m = Number(e.target.value); setFocusMin(m); if (!run && mode === "focus") setLeft(m * 60); }} style={input}>{[10, 15, 25, 40].map(m => <option key={m} value={m}>{m} min focus</option>)}</select></div></div>
    <div style={card}>{h("Rhythm trainer", "Type in the box to the beat. Aim for steady, even keystrokes, not speed.")}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><div style={{ width: 18, height: 18, borderRadius: 9, background: pulse ? T.purple : T.border }} /><input type="range" min="40" max="200" value={bpm} disabled={met} onChange={e => setBpm(Number(e.target.value))} aria-label="Beats per minute" /><span style={{ color: T.text, fontSize: 12 }}>{bpm} BPM</span><button style={btn(true)} onClick={startMet}>{met ? "Stop" : "Start"}</button></div>
      <textarea onKeyDown={onKey} rows={2} placeholder="Type here with the beat…" style={{ ...input, width: "100%", marginTop: 8, boxSizing: "border-box" }} />
      {on.total > 0 && <div style={{ color: T.text, fontSize: 12, marginTop: 4 }}>On the beat: <b>{Math.round((on.hits / on.total) * 100)}%</b> ({on.hits}/{on.total})</div>}</div>
  </>);
}

// ── Plan ──
function Plan({ T, pid, hist, card, h, btn, input }) {
  const gk = `ak_hubgoal_${pid}`, mk = `ak_hubgoals_${pid}`;
  const cur = Math.round(avg(hist.slice(-10).map(r => r.wpm)));
  const [g, setG] = useState(() => lsGet(gk, { target: "", date: "" })); const [mine, setMine] = useState(() => lsGet(mk, [])); const [nt, setNt] = useState("");
  useEffect(() => { lsSet(gk, g); }, [g]); useEffect(() => { lsSet(mk, mine); }, [mine]);
  const weeks = g.date ? Math.max(0, (new Date(g.date + "T23:59").getTime() - Date.now()) / (7 * 864e5)) : 0;
  const need = g.target && cur ? Number(g.target) - cur : null;
  const [wpm, setWpm] = useState("40"); const [secs, setSecs] = useState("60"); const [words, setWords] = useState("500"); const [wpm2, setWpm2] = useState("40");
  return (<>
    <div style={card}>{h("Goal planner", "Set a speed target and a date, and see the pace you'd need.")}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><input value={g.target} onChange={e => setG({ ...g, target: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="Target WPM" style={{ ...input, width: 110 }} /><input type="date" value={g.date} onChange={e => setG({ ...g, date: e.target.value })} style={input} /></div>
      <div style={{ color: T.text, fontSize: 13, marginTop: 8 }}>Recent average: <b>{cur || "—"}</b> WPM{need != null && <><br />{need <= 0 ? <b style={{ color: "#10b981" }}>You've already reached it! 🎉</b> : weeks > 0 ? <>You need <b>+{need} WPM</b> in {weeks.toFixed(1)} weeks, about <b>{(need / weeks).toFixed(1)} WPM per week</b>.</> : "Pick a date in the future."}</>}</div>
      {g.target && cur > 0 && <div style={{ height: 8, background: T.border, borderRadius: 4, marginTop: 8 }}><div style={{ width: `${Math.min(100, (cur / Number(g.target)) * 100)}%`, height: 8, background: T.purple, borderRadius: 4 }} /></div>}</div>
    <div style={card}>{h("My goals", "Your own checklist.")}
      <div style={{ display: "flex", gap: 6 }}><input value={nt} onChange={e => setNt(e.target.value.slice(0, 80))} onKeyDown={e => { if (e.key === "Enter" && nt.trim()) { setMine([...mine, { t: nt.trim(), d: false }].slice(0, 30)); setNt(""); } }} placeholder="Add a goal, press Enter" style={{ ...input, flex: 1 }} /></div>
      {mine.map((x, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", color: x.d ? T.muted : T.text, textDecoration: x.d ? "line-through" : "none", fontSize: 13 }}><input type="checkbox" checked={x.d} onChange={() => setMine(mine.map((y, j) => j === i ? { ...y, d: !y.d } : y))} /><span style={{ flex: 1 }}>{x.t}</span><button onClick={() => setMine(mine.filter((_, j) => j !== i))} aria-label="Delete goal" style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}>×</button></div>)}</div>
    <div style={card}>{h("Speed calculators")}
      <div style={{ color: T.text, fontSize: 13, lineHeight: 2 }}>
        <div><input value={words} onChange={e => setWords(e.target.value.replace(/\D/g, ""))} style={{ ...input, width: 70 }} /> words in <input value={secs} onChange={e => setSecs(e.target.value.replace(/\D/g, ""))} style={{ ...input, width: 60 }} /> seconds = <b>{Number(secs) ? Math.round(Number(words) / (Number(secs) / 60)) : 0} WPM</b></div>
        <div>At <input value={wpm} onChange={e => setWpm(e.target.value.replace(/\D/g, ""))} style={{ ...input, width: 60 }} /> WPM you type <b>{Number(wpm) * 5}</b> characters a minute</div>
        <div>A <input value={wpm2} onChange={e => setWpm2(e.target.value.replace(/\D/g, ""))} style={{ ...input, width: 60 }} /> WPM typist needs <b>{Number(wpm2) ? (1000 / Number(wpm2)).toFixed(1) : 0}</b> minutes for 1,000 words</div></div></div>
  </>);
}

// ── My data: share card, export, delete ──
function MyData({ T, pid, hist, card, h, btn, input, flash }) {
  const [typed, setTyped] = useState("");
  const best = Math.max(0, ...hist.map(r => r.wpm)), mean = Math.round(avg(hist.slice(-10).map(r => r.wpm))), acc = Math.round(avg(hist.slice(-10).map(r => r.acc)));
  const share = () => {
    const c = document.createElement("canvas"); c.width = 800; c.height = 420; const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 800, 420); g.addColorStop(0, "#1e1b4b"); g.addColorStop(1, "#0f172a"); x.fillStyle = g; x.fillRect(0, 0, 800, 420);
    x.fillStyle = "#a78bfa"; x.font = "bold 34px sans-serif"; x.fillText("AccuratKey", 40, 70); x.fillStyle = "#cbd5e1"; x.font = "20px sans-serif"; x.fillText("My typing progress", 40, 104);
    const box = (lbl, val, px, py) => { x.fillStyle = "#ffffff12"; x.fillRect(px, py, 220, 120); x.fillStyle = "#94a3b8"; x.font = "16px sans-serif"; x.fillText(lbl, px + 16, py + 32); x.fillStyle = "#fff"; x.font = "bold 44px sans-serif"; x.fillText(val, px + 16, py + 90); };
    box("Best speed", `${best} WPM`, 40, 150); box("Recent average", `${mean} WPM`, 290, 150); box("Accuracy", `${acc}%`, 540, 150);
    x.fillStyle = "#94a3b8"; x.font = "18px sans-serif"; x.fillText(`${hist.length} runs · ${currentDayStreak(hist)}-day streak`, 40, 330); x.fillText("accuratkey.vercel.app", 40, 380);
    c.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "my-typing-progress.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); flash("Image saved to your downloads"); });
  };
  const exportCsv = () => {
    const rows = [["date", "level", "wpm", "accuracy", "passed", "seconds", "characters"], ...hist.map(r => [new Date(r.t).toISOString(), r.level, r.wpm, r.acc, r.passed ? "yes" : "no", r.secs, r.chars])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" })); a.download = "my-typing-history.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); flash("History saved to your downloads");
  };
  const wipe = () => {
    const pre = ["ak_hist_", "ak_keystats_", "ak_missed_", "ak_replay_", "ak_goal_", "ak_ach_", "ak_plan_", "ak_hubgoal_", "ak_hubgoals_"]; let n = 0;
    try { Object.keys(localStorage).filter(k => pre.some(p => k === p + pid || k.startsWith(p + pid + "_"))).forEach(k => { localStorage.removeItem(k); n++; }); } catch {}
    flash(`Erased ${n} saved item${n === 1 ? "" : "s"}. Your level progress and Keys were not touched.`); setTyped("");
  };
  return (<>
    <div style={card}>{h("Share card", "Makes a picture of your stats. It has no name or personal info, and nothing is uploaded.")}<button style={btn(true)} onClick={share} disabled={!hist.length}>Save as image</button></div>
    <div style={card}>{h("Export my history", "A spreadsheet file of every run saved on this device.")}<button style={btn(true)} onClick={exportCsv} disabled={!hist.length}>Download CSV</button></div>
    <div style={card}>{h("Erase my practice data", "Removes this profile's saved run history, key stats, replay, missed words and goals from this device. Level progress and Keys are not affected. Type DELETE to confirm.")}
      <div style={{ display: "flex", gap: 6 }}><input value={typed} onChange={e => setTyped(e.target.value)} placeholder="DELETE" style={{ ...input, width: 110 }} /><button style={{ ...btn(), color: "#ef4444", borderColor: "#ef4444" }} disabled={typed !== "DELETE"} onClick={wipe}>Erase</button></div></div>
  </>);
}
