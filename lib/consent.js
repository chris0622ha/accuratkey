// Cookie / local-storage consent. Essential storage (sign-in, saved progress, settings you change) is always on.
// "Preferences & practice data" (run history, replays, key stats, missed words, goals, favorites) is saved on the device only if allowed.
const KEY = "ak_consent_v1";
const OPTIONAL_PREFIXES = ["ak_hist_", "ak_keystats_", "ak_missed_", "ak_replay_", "ak_goal_", "ak_ach_", "ak_hubgoal_", "ak_hubgoals_", "ak_fav", "ak_plan_"];

export function getConsent() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v && typeof v === "object" ? v : null; } catch { return null; }
}
export const consentDecided = () => !!getConsent();
// true when this kind of optional data may be written. Before a choice is made we stay conservative (off).
export const canStore = (kind = "functional") => { const c = getConsent(); return !!(c && c[kind]); };
export function clearOptionalData() {
  try { Object.keys(localStorage).filter(k => OPTIONAL_PREFIXES.some(p => k.startsWith(p))).forEach(k => localStorage.removeItem(k)); } catch {}
}
export function setConsent(functional) {
  const prev = getConsent();
  try { localStorage.setItem(KEY, JSON.stringify({ essential: true, functional: !!functional, at: Date.now() })); } catch {}
  if (!functional && (!prev || prev.functional)) clearOptionalData();
  try { window.dispatchEvent(new CustomEvent("ak-consent-changed")); } catch {}
}
export const openCookieSettings = () => { try { window.dispatchEvent(new CustomEvent("ak-open-cookie-settings")); } catch {} };
