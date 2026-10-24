"use client";
import { useState, useRef, useEffect } from "react";

const WORD = "home";

// Custom 404: on brand, and fittingly, you type your way out.
export default function NotFound() {
  const [typed, setTyped] = useState("");
  const [shake, setShake] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const onChange = (v: string) => {
    const t = v.toLowerCase();
    if (WORD.startsWith(t)) { setTyped(t); if (t === WORD) setTimeout(() => { location.href = "/"; }, 250); }
    else { setTyped(""); setShake(true); setTimeout(() => setShake(false), 350); }
  };
  return (
    <main onClick={() => ref.current?.focus()} style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e0e0ff", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <style>{`@keyframes nf-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      <div style={{ maxWidth: 440 }}>
        <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: 4, color: "#a78bfa", lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 22, margin: "12px 0 6px" }}>That key isn't on this keyboard</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 22px" }}>The page you typed in doesn't exist, or it moved. No harm done. Your progress is safe.</p>
        <div style={{ animation: shake ? "nf-shake .35s" : "none", display: "inline-flex", gap: 6, marginBottom: 6 }} aria-hidden>
          {WORD.split("").map((c, i) => (
            <span key={i} style={{ width: 44, height: 52, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, fontFamily: "ui-monospace, Menlo, monospace", border: `2px solid ${i < typed.length ? "#34d399" : i === typed.length ? "#a78bfa" : "#1e1e30"}`, color: i < typed.length ? "#34d399" : "#2e2e44", background: "#0f0f1a" }}>{c.toUpperCase()}</span>
          ))}
        </div>
        <input ref={ref} value={typed} onChange={e => onChange(e.target.value)} aria-label="Type home to go to the home page" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }} />
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 22 }}>Type <b style={{ color: "#a78bfa" }}>home</b> to head back, or use the buttons.</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ background: "#a78bfa", color: "#0a0a0f", fontWeight: 800, textDecoration: "none", padding: "10px 20px", borderRadius: 10, fontSize: 14 }}>Back to AccuratKey</a>
          <a href="/help" style={{ border: "1px solid #1e1e30", color: "#e0e0ff", textDecoration: "none", padding: "10px 20px", borderRadius: 10, fontSize: 14 }}>Help</a>
        </div>
      </div>
    </main>
  );
}
