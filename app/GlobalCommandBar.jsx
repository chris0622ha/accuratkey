"use client";
import { useState, useEffect, useRef } from "react";
import { ADMIN_TABS } from "@/lib/adminTabs";

// Mounted once in the root layout so admins get the command line on every page (game included).
// It stays completely inert for everyone else: it only turns on when this browser is signed in to the admin session AND that account is an admin.
export default function GlobalCommandBar() {
  const [ctx, setCtx] = useState(null); // { adminDb, uid }
  const [Bar, setBar] = useState(null);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState("");
  const ctxRef = useRef(null); ctxRef.current = ctx;
  const openRef = useRef(false); openRef.current = open;

  useEffect(() => {
    let off = () => {}; let dead = false;
    Promise.all([import("@/lib/firebase"), import("firebase/auth")]).then(([{ getAdminAuth, getAdminDb, isAdmin }, { onAuthStateChanged }]) => {
      if (dead) return;
      const a = getAdminAuth(); const db = getAdminDb();
      off = onAuthStateChanged(a, async (u) => {
        if (!u) { setCtx(null); setOpen(false); return; }
        let ok = false; try { ok = await isAdmin(u.uid, db); } catch {}
        if (dead) return;
        if (ok) { setCtx({ adminDb: db, uid: u.uid }); import("./admin/CommandBar").then(m => !dead && setBar(() => m.default)); } else setCtx(null);
      });
    }).catch(() => {});
    return () => { dead = true; off(); };
  }, []);

  useEffect(() => {
    const onKey = async (e) => {
      const combo = (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "k" || e.key === "/");
      const tg = e.target && e.target.tagName; const typing = tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT" || (e.target && e.target.isContentEditable);
      const slash = e.key === "/" && !typing && !e.altKey && !e.ctrlKey && !e.metaKey && location.pathname !== "/"; // "/" is also a typing character in the game, so there only the Ctrl/Cmd shortcuts open it
      if (!combo && !slash) return;
      if (ctxRef.current) { e.preventDefault(); setOpen(o => !o); return; }
      if (combo) { // not signed in to the admin session: tell real admins how to enable it, stay silent for everyone else
        try {
          const { auth, isAdmin } = await import("@/lib/firebase");
          if (auth.currentUser && await isAdmin(auth.currentUser.uid)) { setHint("Commands need an admin session. Open /admin and sign in once, then this works on every page."); setTimeout(() => setHint(""), 6000); }
        } catch {}
      }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inAdmin = () => location.pathname.startsWith("/admin");
  const setTab = (t) => { if (inAdmin()) window.dispatchEvent(new CustomEvent("ak-admin-go", { detail: t })); else location.href = "/admin#" + t; setOpen(false); };
  const onLookup = (q) => { if (inAdmin()) window.dispatchEvent(new CustomEvent("ak-admin-lookup", { detail: q })); else { try { sessionStorage.setItem("ak_admin_lookup", q); } catch {} location.href = "/admin"; } };
  return (<>
    {hint && <div role="status" style={{ position: "fixed", bottom: 14, left: "50%", transform: "translateX(-50%)", zIndex: 10003, maxWidth: "92vw", background: "#111", color: "#fbbf24", border: "1px solid #fbbf24", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontFamily: "ui-monospace, Menlo, monospace" }}>{hint} <a href="/admin" style={{ color: "#fff" }}>Open /admin</a></div>}
    {ctx && Bar && <Bar open={open} setOpen={setOpen} adminDb={ctx.adminDb} uid={ctx.uid} setTab={setTab} tabs={ADMIN_TABS} onLookup={onLookup} />}
  </>);
}
