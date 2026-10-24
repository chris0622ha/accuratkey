// Cookie / local-storage consent. Essential storage (sign-in, saved progress, settings you change) is always on.
// "Preferences & practice data" (run history, replays, key stats, missed words, goals, favorites) is saved on the device only if allowed.
const KEY = "ak_consent_v1";
const OPTIONAL_PREFIXES = ["ak_hist_", "ak_keystats_", "ak_missed_", "ak_replay_", "ak_goal_", "ak_ach_", "ak_hubgoal_", "ak_hubgoals_", "ak_fav", "ak_plan_"];

// The choice is kept in localStorage and mirrored in a first-party cookie, so it survives when one of the two is
// cleared or blocked (private tabs, some in-app browsers, storage cleanup). In-memory copy covers both being blocked.
let mem = null;
const readCookie = () => { try { const m = document.cookie.match(/(?:^|; )ak_consent=([^;]*)/); return m ? JSON.parse(decodeURIComponent(m[1])) : null; } catch { return null; } };
const writeCookie = (v) => { try { document.cookie = `ak_consent=${encodeURIComponent(JSON.stringify(v))}; max-age=31536000; path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; } catch {} };
export function getConsent() {
  let v = null;
  try { v = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
  if (!v || typeof v !== "object") v = readCookie() || mem;
  if (!v || typeof v !== "object") return null;
  mem = v;
  try { if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
  return v;
}
export const consentDecided = () => !!getConsent();
// true when this kind of optional data may be written. Before a choice is made we stay conservative (off).
export const canStore = (kind = "functional") => { const c = getConsent(); return !!(c && c[kind]); };
export function clearOptionalData() {
  try { Object.keys(localStorage).filter(k => OPTIONAL_PREFIXES.some(p => k.startsWith(p))).forEach(k => localStorage.removeItem(k)); } catch {}
}
export function setConsent(functional) {
  const prev = getConsent();
  const v = { essential: true, functional: !!functional, at: Date.now() };
  mem = v; writeCookie(v);
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
  if (!functional && (!prev || prev.functional)) clearOptionalData();
  try { window.dispatchEvent(new CustomEvent("ak-consent-changed")); } catch {}
}
export const openCookieSettings = () => { try { window.dispatchEvent(new CustomEvent("ak-open-cookie-settings")); } catch {} };
