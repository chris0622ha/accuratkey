"use client";
import React, { useState } from "react";

// One small, collapsible dock for passive notices (Keys event, site banner, maintenance heads-up, update available).
// It sits in the bottom-left corner below every popup, so it never covers the nav or the typing area.
export default function NoticeDock({ items }) {
  const [gone, setGone] = useState({});
  const [open, setOpen] = useState(false);
  const live = items.filter(i => !gone[i.id]);
  if (!live.length) return null;
  const dismiss = (i) => { setGone(g => ({ ...g, [i.id]: true })); i.onDismiss && i.onDismiss(); };
  const chip = (i, solo) => (
    <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#12121ee8", border: `1px solid ${i.color}`, color: i.color, borderRadius: 10, padding: "4px 6px 4px 9px", fontSize: 11, fontWeight: 700, maxWidth: solo ? 250 : 260, lineHeight: 1.3, pointerEvents: "auto" }}>
      <span style={{ flex: 1, minWidth: 0 }}>{i.icon} {i.text}{i.link && /^https:\/\//.test(i.link) && <> · <a href={i.link} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>More</a></>}</span>
      {i.action && <button onClick={i.action.run} style={{ border: "none", background: i.color, color: "#000", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>{i.action.label}</button>}
      <button aria-label="Dismiss" onClick={() => dismiss(i)} style={{ background: "none", border: "none", color: "inherit", fontSize: 14, cursor: "pointer", padding: "0 2px" }}>×</button>
    </div>);
  return (
    <div style={{ position: "fixed", left: 8, bottom: "calc(8px + env(safe-area-inset-bottom))", zIndex: 900, display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none", alignItems: "flex-start" }}>
      {live.length === 1 ? chip(live[0], true) : <>
        {open && live.map(i => chip(i))}
        <button onClick={() => setOpen(o => !o)} style={{ pointerEvents: "auto", background: "#12121ee8", border: "1px solid #6b7280", color: "#e0e0ff", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>🔔 {live.length} notice{live.length === 1 ? "" : "s"} {open ? "▾" : "▴"}</button>
      </>}
    </div>
  );
}
