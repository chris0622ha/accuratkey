"use client";
import React, { useState, useEffect } from "react";
import { getConsent, setConsent } from "@/lib/consent";

const C = { bg: "#12121e", border: "#2a2a44", text: "#e0e0ff", muted: "#9aa0b4", purple: "#a78bfa" };
const btn = (primary) => ({ padding: "9px 16px", borderRadius: 9, border: primary ? "none" : `1px solid ${C.border}`, background: primary ? C.purple : "transparent", color: primary ? "#0a0a0f" : C.text, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" });

// First-visit banner + settings dialog. Reopen any time with the "ak-open-cookie-settings" event (links in Settings and the legal pages).
export default function CookieConsent() {
  const [decided, setDecided] = useState(true); // assume decided until we've read storage (avoids a flash)
  const [panel, setPanel] = useState(false);
  const [fn, setFn] = useState(false);
  useEffect(() => {
    const c = getConsent(); setDecided(!!c); setFn(!!c?.functional);
    const open = () => { const cc = getConsent(); setFn(!!cc?.functional); setPanel(true); };
    window.addEventListener("ak-open-cookie-settings", open); return () => window.removeEventListener("ak-open-cookie-settings", open);
  }, []);
  const choose = (functional) => { setConsent(functional); setDecided(true); setPanel(false); };
  if (decided && !panel) return null;
  return (
    <>
      {!decided && !panel && (
        <div role="dialog" aria-label="Cookie notice" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9997, padding: "10px 10px calc(10px + env(safe-area-inset-bottom))", display: "flex", justifyContent: "center", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", maxWidth: 680, width: "100%", boxShadow: "0 8px 30px #000a" }}>
            <div style={{ color: C.text, fontWeight: 800, fontSize: 14, marginBottom: 4 }}>🍪 Cookies &amp; saved data</div>
            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.55, marginBottom: 12 }}>
              We always use the storage needed to sign you in and keep your progress. With your OK we also save your practice history, replays, key stats and goals on this device so your stats and tips work. We don't use advertising or tracking cookies. <a href="/privacy" style={{ color: C.purple }}>Privacy policy</a>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={btn(true)} onClick={() => choose(true)}>Accept all</button>
              <button style={btn(false)} onClick={() => choose(false)}>Reject</button>
              <button style={btn(false)} onClick={() => setPanel(true)}>Cookie settings</button>
            </div>
          </div>
        </div>
      )}
      {panel && (
        <div onClick={() => (decided ? setPanel(false) : null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
          <div role="dialog" aria-label="Cookie settings" onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ color: C.text, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Cookie settings</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>Choose what AccuratKey may save on this device.</div>
            {[
              { k: "essential", title: "Essential", desc: "Signing in, keeping your progress and Keys, and remembering the settings you change. The game can't work without these, so they're always on.", on: true, locked: true },
              { k: "functional", title: "Preferences & practice data", desc: "Your run history, replays, key stats, missed words, goals and favorites, kept on this device. Turning this off means those features don't save, and anything already saved is erased.", on: fn },
            ].map(r => (
              <div key={r.k} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}><div style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{r.title}</div><div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginTop: 3 }}>{r.desc}</div></div>
                <button disabled={r.locked} onClick={() => !r.locked && setFn(v => !v)} aria-pressed={r.on} aria-label={`${r.title}: ${r.on ? "on" : "off"}`} style={{ flexShrink: 0, width: 46, height: 26, borderRadius: 13, border: "none", background: r.on ? C.purple : "#2e2e44", position: "relative", cursor: r.locked ? "default" : "pointer", opacity: r.locked ? 0.6 : 1 }}>
                  <span style={{ position: "absolute", top: 3, left: r.on ? 23 : 3, width: 20, height: 20, borderRadius: 10, background: "#fff", transition: "left .15s" }} />
                </button>
              </div>
            ))}
            <div style={{ color: C.muted, fontSize: 11, padding: "10px 0", borderTop: `1px solid ${C.border}` }}>No advertising or tracking cookies are used. <a href="/privacy" style={{ color: C.purple }}>Privacy policy</a></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={btn(true)} onClick={() => choose(fn)}>Save choices</button>
              <button style={btn(false)} onClick={() => choose(true)}>Accept all</button>
              <button style={btn(false)} onClick={() => choose(false)}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
