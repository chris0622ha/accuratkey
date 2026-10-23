"use client";
import { useEffect } from "react";
import { ADMIN_NEWS } from "@/lib/adminWhatsNew";

export const adminNewsSeen = () => { try { return localStorage.getItem("ak_admin_news_seen"); } catch { return null; } };
export const adminNewsUnseen = () => adminNewsSeen() !== ADMIN_NEWS[0].id;

const fmt = (iso) => new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

// Admin-only release notes (this tab only exists inside the admin panel).
export default function AdminNewsTab({ T, st, onSeen }) {
  useEffect(() => { try { localStorage.setItem("ak_admin_news_seen", ADMIN_NEWS[0].id); } catch {} onSeen && onSeen(); }, []);
  return (
    <div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>What changed in the admin tools. Times are US Eastern.</div>
      {ADMIN_NEWS.map(n => (
        <div key={n.id} style={st.card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: T.text, fontWeight: 800, fontSize: 13 }}>{n.title}</span><span style={{ color: T.faint, fontSize: 10 }}>{fmt(n.at)}</span></div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: T.muted, fontSize: 12, lineHeight: 1.6 }}>{n.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
