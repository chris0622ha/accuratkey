import { canStore } from "./consent";
// Local-only player features (per profile, in localStorage). Nothing here leaves the device, so it is safe for under-13 profiles.
import { dayKey, dayCounts } from "./stats";

// ── Favorite word sets (per device) ──
const FAV = "ak_favsets";
export function getFavs() { try { return JSON.parse(localStorage.getItem(FAV) || "[]"); } catch { return []; } }
export function toggleFav(id) {
  const f = getFavs(); const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.unshift(id);
  if (canStore()) { try { localStorage.setItem(FAV, JSON.stringify(f.slice(0, 100))); } catch {} }
  return f;
}

// ── Personal records, from run history ──
export function records(h) {
  const real = h.filter(r => r.level !== -2);
  if (!h.length) return null;
  const best = (arr, key) => arr.reduce((b, r) => (!b || r[key] > b[key] ? r : b), null);
  const days = dayCounts(h);
  const busiest = Object.entries(days).sort((a, b) => b[1] - a[1])[0];
  let streak = 0, run = 0;
  for (const r of h) { if (r.passed) { run++; streak = Math.max(streak, run); } else run = 0; }
  return {
    fastest: best(real.length ? real : h, "wpm"),
    sharpest: best((real.length ? real : h).filter(r => r.wpm >= 10), "acc"),
    longest: best(h, "secs"),
    mostChars: best(h, "chars"),
    totalChars: h.reduce((a, r) => a + (r.chars || 0), 0),
    totalRuns: h.length,
    busiestDay: busiest ? { day: busiest[0], runs: busiest[1] } : null,
    passStreak: streak,
  };
}

// ── Word of the day (same word all day, from the synonym list) ──
export function wordOfDay(entries, t = Date.now()) {
  const list = entries.filter(e => e.syn?.length && e.word && /^[a-z]+$/.test(e.word));
  if (!list.length) return null;
  const k = dayKey(t); let n = 0; for (const c of k) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return list[n % list.length];
}

// ── Run replay + rhythm. Events: [ms since start, typed char, expected char, line index] ──
const RKEY = (pid) => `ak_replay_${pid || "guest"}`;
const RMAX = 2500;
export function saveReplay(pid, events, meta) {
  if (!canStore()) return;
  try {
    if (!events || events.length < 5) return;
    localStorage.setItem(RKEY(pid), JSON.stringify({ at: Date.now(), wpm: meta?.wpm || 0, acc: meta?.accuracy || 0, level: meta?.level, ev: events.slice(0, RMAX) }));
  } catch {}
}
export function loadReplay(pid) { try { const v = JSON.parse(localStorage.getItem(RKEY(pid)) || "null"); return v && Array.isArray(v.ev) ? v : null; } catch { return null; } }
export function rhythm(ev) {
  if (!ev || ev.length < 8) return null;
  const gaps = [];
  for (let i = 1; i < ev.length; i++) { const d = ev[i][0] - ev[i - 1][0]; if (d > 0 && d < 2000) gaps.push({ d, pair: (ev[i - 1][2] || "?") + (ev[i][2] || "?"), ok: ev[i][1] === ev[i][2] }); }
  if (gaps.length < 6) return null;
  const mean = gaps.reduce((a, g) => a + g.d, 0) / gaps.length;
  const sd = Math.sqrt(gaps.reduce((a, g) => a + (g.d - mean) ** 2, 0) / gaps.length);
  const consistency = Math.max(0, Math.min(100, Math.round(100 - (sd / mean) * 60)));
  const byPair = {};
  gaps.forEach(g => { if (/^[a-z]{2}$/i.test(g.pair)) { const p = g.pair.toLowerCase(); (byPair[p] = byPair[p] || []).push(g.d); } });
  const slow = Object.entries(byPair).filter(([, a]) => a.length >= 2).map(([p, a]) => [p, Math.round(a.reduce((x, y) => x + y, 0) / a.length)]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { avgMs: Math.round(mean), consistency, slow };
}

// ── Break reminders: accumulated play time since the last nudge ──
export function breakDue(accMs, everyMin) { return everyMin > 0 && accMs >= everyMin * 60000; }
