"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { parseCommand, VERBS, VERB_USAGE } from "@/lib/adminCommands";

const HK = "ak_admin_cmdhist";
const RISKY = /^\/?(ban|admin|broadcast|announce|gift|maintenance\s+on|sets\s+(remove|approve)|level\s+\d+\s+reset|keys\s+\S+\s+=)/i;
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// Minecraft-style command line: press / (or Ctrl/Cmd+K) to open, type a /command, Tab completes, Up/Down recalls history, Enter runs.
export default function CommandBar({ open, setOpen, adminDb, uid, setTab, tabs, onLookup }) {
  const [text, setText] = useState("/");
  const [lines, setLines] = useState([]); // {id, at, kind, text}
  const [hist, setHist] = useState([]); const [hi, setHi] = useState(-1);
  const [sug, setSug] = useState(0); const [armed, setArmed] = useState(""); const [, tick] = useState(0);
  const inp = useRef(null); const idRef = useRef(0);
  useEffect(() => { try { setHist(JSON.parse(localStorage.getItem(HK) || "[]")); } catch {} }, []);
  useEffect(() => { if (open) { setText(t => (t ? t : "/")); setHi(-1); setArmed(""); setTimeout(() => inp.current?.focus(), 20); } }, [open]);
  useEffect(() => { if (!lines.length) return; const t = setInterval(() => tick(n => n + 1), 1000); return () => clearInterval(t); }, [lines.length]);
  const say = (kind, t) => setLines(l => [...l.slice(-30), { id: ++idRef.current, at: Date.now(), kind, text: t }]);
  const q = text.replace(/^\//, "");
  const cmd = useMemo(() => (text.trim().length > 1 ? parseCommand(text, Date.now()) : { isCommand: false }), [text]);
  const sugs = useMemo(() => {
    const m = q.match(/^(\S*)$/); const g = q.match(/^go\s+(\S*)$/i);
    if (m) return VERBS.filter(v => v.startsWith(m[1].toLowerCase())).map(v => ({ fill: "/" + v + " ", label: "/" + v, hint: VERB_USAGE[v] || "" })).slice(0, 8);
    if (g) return tabs.filter(t => t.startsWith(g[1].toLowerCase())).map(t => ({ fill: "/go " + t, label: t, hint: "tab" })).slice(0, 8);
    return [];
  }, [q, tabs]);
  useEffect(() => setSug(0), [q]);
  const remember = (t) => { const h = [t, ...hist.filter(x => x !== t)].slice(0, 50); setHist(h); try { localStorage.setItem(HK, JSON.stringify(h)); } catch {} };
  const run = async () => {
    const t = text.trim(); if (t.length < 2) return;
    if (/^\/?help$/i.test(t)) { setText("/"); say("echo", "Commands (Tab completes, ↑↓ history):"); VERBS.filter(v => v !== "help").forEach(v => say("ok", VERB_USAGE[v])); return; }
    if (cmd.isCommand) {
      if (!cmd.ok) { say("err", cmd.error); return; }
      if (RISKY.test(t) && armed !== text) { setArmed(text); return; }
      remember(t); say("echo", t); setArmed(""); setText("/"); setHi(-1);
      try { const r = await cmd.run({ adminDb, uid, setTab, tabs }); say("ok", r?.msg || "Done"); } catch (e) { say("err", e.message || e.code || "Failed"); }
      return;
    }
    const w = q.trim().toLowerCase();
    if (t.startsWith("/") && !t.startsWith("/@") && /^[a-z]+$/.test(w)) { if (tabs.includes(w)) { setTab(w); setOpen(false); return; } say("err", `Unknown command “${w}”. Type / to see the list`); return; }
    remember(t); setOpen(false); setText("/"); onLookup(q.replace(/^@?/, "@").trim());
  };
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); return; }
    if (e.key === "Enter") { e.preventDefault(); run(); return; }
    if (e.key === "Tab") { e.preventDefault(); if (sugs.length) { const s = sugs[sug % sugs.length]; setText(s.fill); setSug(i => i + 1); } return; }
    if (e.key === "ArrowUp") { e.preventDefault(); if (sugs.length > 1 && q && !q.includes(" ")) { setSug(i => (i - 1 + sugs.length) % sugs.length); return; } const n = Math.min(hist.length - 1, hi + 1); if (n >= 0) { setHi(n); setText(hist[n]); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); if (sugs.length > 1 && q && !q.includes(" ")) { setSug(i => (i + 1) % sugs.length); return; } const n = hi - 1; setHi(n); setText(n >= 0 ? hist[n] : "/"); return; }
    if (e.key === "Backspace" && text === "/") { e.preventDefault(); setOpen(false); }
  };
  const now = Date.now();
  const visible = open ? lines.slice(-10) : lines.filter(l => now - l.at < 7000).slice(-6);
  if (!open && !visible.length) return null;
  const col = { ok: "#55ff55", err: "#ff5555", echo: "#aaaaaa" };
  const shadow = "1px 1px 0 #000";
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 10002, pointerEvents: open ? "auto" : "none", fontFamily: mono, padding: "0 6px 6px" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: -1 }} />}
      <div style={{ maxWidth: 760 }}>
        {visible.length > 0 && <div style={{ background: open ? "#000000aa" : "transparent", padding: "4px 8px", marginBottom: 4 }}>
          {visible.map(l => <div key={l.id} style={{ color: col[l.kind], fontSize: 13, lineHeight: 1.45, textShadow: shadow, background: open ? "transparent" : "#00000088", display: "inline-block", clear: "both", float: "left", padding: "0 4px", opacity: open ? 1 : Math.max(0.2, 1 - (now - l.at) / 7000) }}>{l.kind === "echo" ? "> " : l.kind === "ok" ? "✓ " : "✕ "}{l.text}</div>)}
          <div style={{ clear: "both" }} />
        </div>}
        {open && sugs.length > 0 && <div style={{ background: "#000000cc", border: "1px solid #3a3a3a", marginBottom: 4, padding: "4px 0" }}>
          {sugs.map((s, i) => <div key={s.label} onClick={() => { setText(s.fill); inp.current?.focus(); }} style={{ display: "flex", gap: 10, padding: "2px 10px", fontSize: 13, cursor: "pointer", background: i === sug % sugs.length ? "#ffffff22" : "transparent", color: i === sug % sugs.length ? "#ffff55" : "#dddddd" }}><span>{s.label}</span><span style={{ color: "#888", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.hint}</span></div>)}
        </div>}
        {open && (cmd.isCommand ? <div style={{ color: cmd.ok ? (armed === text ? "#ffaa00" : "#55ffff") : "#ff5555", fontSize: 12, padding: "2px 6px", textShadow: shadow }}>{cmd.ok ? (armed === text ? `⚠ Press Enter again to confirm: ${cmd.summary}` : `↵ ${cmd.summary}`) : `✕ ${cmd.error}`}</div> : q && !sugs.length && <div style={{ color: "#888", fontSize: 12, padding: "2px 6px" }}>↵ look up “{q.replace(/^@/, "")}” as an account</div>)}
        {open && <input ref={inp} value={text} onChange={e => { setText(e.target.value.startsWith("/") ? e.target.value : "/" + e.target.value); setHi(-1); setArmed(""); }} onKeyDown={onKey} spellCheck={false} autoComplete="off" autoCapitalize="off" aria-label="Admin command line"
          style={{ width: "100%", boxSizing: "border-box", background: "#000000bb", border: "2px solid #ffffff55", color: "#fff", fontFamily: mono, fontSize: 15, padding: "7px 10px", outline: "none", caretColor: "#fff" }} />}
        {open && <div style={{ color: "#777", fontSize: 10, padding: "2px 6px" }}>Tab = complete · ↑↓ = history · Enter = run · Esc = close</div>}
      </div>
    </div>
  );
}
