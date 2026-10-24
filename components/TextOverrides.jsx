"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSite } from "@/lib/siteConfig";
import { setTextRules } from "@/lib/textOverrides";

// Applies admin text replacements (config/site.texts) everywhere except the admin panel itself.
export default function TextOverrides() {
  const path = usePathname() || "";
  useEffect(() => {
    if (path.startsWith("/admin")) { setTextRules([]); return; }
    if (window.name === "ak-text-preview") return; // the admin text editor applies its own draft rules to this frame
    let on = true;
    getSite().then(c => { if (on) setTextRules(c.texts); }).catch(() => {});
    return () => { on = false; };
  }, [path]);
  return null;
}
