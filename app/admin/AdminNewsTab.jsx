"use client";
import { useEffect, useState } from "react";
import { ADMIN_NEWS } from "@/lib/adminWhatsNew";
import { groupByDay } from "@/lib/newsGroup";
import { applyNews } from "@/lib/newsEdits";
import { getGlobalSite, getSite, setGlobalSite } from "@/lib/siteConfig";
const list = () => applyNews(ADMIN_NEWS, getGlobalSite().adminNews);

export const adminNewsSeen = () => { try { return localStorage.getItem("ak_admin_news_seen"); } catch { return null; } };
export const adminNewsUnseen = () => adminNewsSeen() !== (list()[0] || ADMIN_NEWS[0]).id;


// Admin-only release notes (this tab only exists inside the admin panel).
export default function AdminNewsTab({ T, st, onSeen }) {
  const [, bump] = useState(0);
  useEffect(() => { getSite().then(c => { setGlobalSite({ ...getGlobalSite(), ...c }); bump(x => x + 1); }); }, []);
  useEffect(() => { try { localStorage.setItem("ak_admin_news_seen", (list()[0] || ADMIN_NEWS[0]).id); } catch {} onSeen && onSeen(); }, []);
  return (
    <div>
      <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>What changed in the admin tools. Entries from the same day are combined.</div>
      {groupByDay(list()).map(n => (
        <div key={n.id} style={st.card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: T.text, fontWeight: 800, fontSize: 13 }}>{n.title}</span><span style={{ color: T.faint, fontSize: 10 }}>{n.date}</span></div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: T.muted, fontSize: 12, lineHeight: 1.6 }}>{n.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
