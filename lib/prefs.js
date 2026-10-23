// Local-only preferences and run history. Stored in the browser (localStorage), keyed
// by profile id. Nothing here is sent to a server, so it is safe for every profile,
// including under-13 profiles (COPPA): no personal data leaves the device.
export const DEFAULT_PREFS = {
  textScale: 1,        // 0.85 | 1 | 1.3 | 1.6
  caret: "auto",       // auto | underline | bar | block | glow
  showTimer: false,
  ghost: false,        // pace indicator vs your personal best on this level
  focusMode: false,    // hides everything except the text while typing
  zen: false,          // hides WPM / accuracy / combo while typing
  volume: 1,           // 0 | 0.35 | 0.7 | 1
  confetti: true,
  reducedMotion: false,
  highContrast: false,
  dyslexiaFont: false,
  breakEvery: 0,       // minutes of practice before a gentle break reminder (0 = off)
  blind: false,        // challenge: letters further ahead than 2 keys are hidden
  suddenDeath: 0,      // challenge: restart the run after this many mistakes (0 = off)
};
const key = (pid) => `ak_prefs_${pid || "guest"}`;
export function getPrefs(pid) {
  try { return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(key(pid)) || "{}")) }; }
  catch { return { ...DEFAULT_PREFS }; }
}
export function setPrefs(pid, patch) {
  const next = { ...getPrefs(pid), ...patch };
  try { localStorage.setItem(key(pid), JSON.stringify(next)); } catch {}
  return next;
}

// Personal best + last run per level, local only.
const bkey = (pid) => `ak_best_${pid || "guest"}`;
export function getBest(pid, levelId) {
  try { return (JSON.parse(localStorage.getItem(bkey(pid)) || "{}"))[levelId] || null; } catch { return null; }
}
export function recordRun(pid, levelId, wpm, accuracy) {
  try {
    const all = JSON.parse(localStorage.getItem(bkey(pid)) || "{}");
    const prev = all[levelId] || {};
    all[levelId] = {
      bestWpm: Math.max(prev.bestWpm || 0, wpm),
      bestAcc: Math.max(prev.bestAcc || 0, accuracy),
      lastWpm: wpm, lastAcc: accuracy, runs: (prev.runs || 0) + 1,
    };
    localStorage.setItem(bkey(pid), JSON.stringify(all));
  } catch {}
}
