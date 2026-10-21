// Local-only run history, XP, goals and achievements. Stored per profile in localStorage:
// nothing leaves the device, so it is safe for under-13 profiles (COPPA). The tradeoff is
// that stats are per device/browser and don't sync.
const hkey = (pid) => `ak_hist_${pid || "guest"}`;
const gkey = (pid) => `ak_goal_${pid || "guest"}`;
const MAX = 600;

export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

export function getHistory(pid) { try { return JSON.parse(localStorage.getItem(hkey(pid)) || "[]"); } catch { return []; } }
export function logRun(pid, rd) {
  try {
    const h = getHistory(pid);
    const secs = rd.wpm > 0 ? Math.round((rd.chars / 5 / rd.wpm) * 60) : 0;
    h.push({ t: Date.now(), level: rd.level, wpm: rd.wpm, acc: rd.accuracy, passed: !!rd.passed, secs });
    localStorage.setItem(hkey(pid), JSON.stringify(h.slice(-MAX)));
  } catch {}
}
export function getGoal(pid) { try { return { runsPerDay: 3, ...(JSON.parse(localStorage.getItem(gkey(pid)) || "{}")) }; } catch { return { runsPerDay: 3 }; } }
export function setGoal(pid, g) { try { localStorage.setItem(gkey(pid), JSON.stringify({ ...getGoal(pid), ...g })); } catch {} }

export const runXp = (r) => 10 + Math.round((r.wpm || 0) / 2) + (r.passed ? 20 : 0);
export function xpInfo(history) {
  const xp = history.reduce((a, r) => a + runXp(r), 0);
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const base = 50 * (level - 1) ** 2, next = 50 * level ** 2;
  return { xp, level, into: xp - base, span: next - base };
}
export function dayCounts(history) { const m = {}; history.forEach(r => { const k = dayKey(r.t); m[k] = (m[k] || 0) + 1; }); return m; }
export function currentDayStreak(history) {
  const m = dayCounts(history); let s = 0; const d = new Date();
  if (!m[dayKey(d.getTime())]) d.setDate(d.getDate() - 1); // today not yet played doesn't break it
  while (m[dayKey(d.getTime())]) { s++; d.setDate(d.getDate() - 1); }
  return s;
}
export function summary(history) {
  const n = history.length; if (!n) return { runs: 0 };
  const last = history.slice(-20);
  return {
    runs: n, passed: history.filter(r => r.passed).length,
    bestWpm: Math.max(...history.map(r => r.wpm)), avgWpm: Math.round(last.reduce((a, r) => a + r.wpm, 0) / last.length),
    avgAcc: Math.round(last.reduce((a, r) => a + r.acc, 0) / last.length), bestAcc: Math.max(...history.map(r => r.acc)),
    minutes: Math.round(history.reduce((a, r) => a + (r.secs || 0), 0) / 60),
  };
}

export const ACHIEVEMENTS = [
  { id: "first", name: "First Keystrokes", desc: "Finish your first run", test: (h) => h.length >= 1 },
  { id: "runs10", name: "Getting Warm", desc: "Finish 10 runs", test: (h) => h.length >= 10 },
  { id: "runs50", name: "Regular", desc: "Finish 50 runs", test: (h) => h.length >= 50 },
  { id: "runs200", name: "Dedicated", desc: "Finish 200 runs", test: (h) => h.length >= 200 },
  { id: "pass1", name: "Level Up", desc: "Pass a level", test: (h) => h.some(r => r.passed) },
  { id: "pass25", name: "Climber", desc: "Pass 25 runs", test: (h) => h.filter(r => r.passed).length >= 25 },
  { id: "wpm30", name: "30 WPM", desc: "Reach 30 WPM", test: (h) => h.some(r => r.wpm >= 30) },
  { id: "wpm50", name: "50 WPM", desc: "Reach 50 WPM", test: (h) => h.some(r => r.wpm >= 50) },
  { id: "wpm80", name: "80 WPM", desc: "Reach 80 WPM", test: (h) => h.some(r => r.wpm >= 80) },
  { id: "wpm100", name: "Century", desc: "Reach 100 WPM", test: (h) => h.some(r => r.wpm >= 100) },
  { id: "acc95", name: "Sharp", desc: "A run at 95%+ accuracy", test: (h) => h.some(r => r.acc >= 95) },
  { id: "acc100", name: "Flawless", desc: "A run at 100% accuracy", test: (h) => h.some(r => r.acc >= 100) },
  { id: "precise", name: "Precision Pair", desc: "Two 98%+ runs in a row", test: (h) => h.some((r, i) => i && r.acc >= 98 && h[i-1].acc >= 98) },
  { id: "streak3", name: "On a Roll", desc: "Practice 3 days in a row", test: (h) => currentDayStreakMax(h) >= 3 },
  { id: "streak7", name: "Week Warrior", desc: "Practice 7 days in a row", test: (h) => currentDayStreakMax(h) >= 7 },
  { id: "streak30", name: "Monthly Habit", desc: "Practice 30 days in a row", test: (h) => currentDayStreakMax(h) >= 30 },
  { id: "comeback", name: "Comeback", desc: "Pass right after a failed run", test: (h) => h.some((r, i) => i && r.passed && !h[i-1].passed) },
  { id: "marathon", name: "Marathon", desc: "Practice for 60 total minutes", test: (h) => h.reduce((a, r) => a + (r.secs || 0), 0) >= 3600 },
  { id: "fivea", name: "Five a Day", desc: "5 runs in one day", test: (h) => Object.values(dayCounts(h)).some(c => c >= 5) },
  { id: "improve", name: "Better Every Time", desc: "Beat your previous WPM 3 runs in a row", test: (h) => h.some((r, i) => i >= 3 && r.wpm > h[i-1].wpm && h[i-1].wpm > h[i-2].wpm && h[i-2].wpm > h[i-3].wpm) },
];
function currentDayStreakMax(h) {
  const days = Object.keys(dayCounts(h)).sort(); let best = 0, cur = 0, prev = null;
  for (const d of days) { const t = new Date(d + "T12:00:00").getTime(); cur = prev && Math.round((t - prev) / 864e5) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = t; }
  return best;
}
const ALL_RUNS = new Set(["streak3", "streak7", "streak30", "marathon", "fivea", "first"]);
export const unlockedIds = (h) => { const real = h.filter(r => r.level !== -2); return ACHIEVEMENTS.filter(a => a.test(ALL_RUNS.has(a.id) ? h : real)).map(a => a.id); };

const akey = (pid) => `ak_ach_${pid || "guest"}`;
// Returns achievements newly unlocked since last call (and remembers them).
export function newlyUnlocked(pid, h) {
  let seen = []; try { seen = JSON.parse(localStorage.getItem(akey(pid)) || "[]"); } catch {}
  const now = unlockedIds(h), fresh = now.filter(id => !seen.includes(id));
  if (fresh.length) { try { localStorage.setItem(akey(pid), JSON.stringify(now)); } catch {} }
  return ACHIEVEMENTS.filter(a => fresh.includes(a.id));
}
export function toCsv(h) {
  return ["date,level,wpm,accuracy,passed,seconds", ...h.map(r => `${new Date(r.t).toISOString()},${r.level === -1 ? "daily" : r.level === -2 ? "practice" : r.level},${r.wpm},${r.acc},${r.passed},${r.secs}`)].join("\n");
}
