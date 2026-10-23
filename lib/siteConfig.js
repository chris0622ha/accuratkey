import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// config/site: one admin-written, public-read doc for site-wide extras.
// { banner:{id,text,color,link,endsAt}, welcome:{enabled,title,body,at}, version:string, spotlight:gameId, wotd:word }
let _site = {};
export const getGlobalSite = () => _site;
export const setGlobalSite = (s) => { _site = s || {}; };

export async function getSite() {
  try { const s = await getDoc(doc(db, "config", "site")); return s.exists() ? s.data() : {}; } catch { return {}; }
}
export async function setSite(patch, adb = db) {
  let cur = {};
  try { const s = await getDoc(doc(adb, "config", "site")); if (s.exists()) cur = s.data(); } catch {}
  const next = { ...cur, ...patch };
  await setDoc(doc(adb, "config", "site"), next);
  return next;
}
export const bannerActive = (b) => !!(b && b.text && (!b.endsAt || b.endsAt > Date.now()));
