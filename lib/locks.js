// Global admin locks (config/locks). Module-level so non-React helpers like canUse can read it.
let _locks = { games: {}, features: {}, message: "" };
export const LOCKABLE_FEATURES = [
  ["shop", "Shop"], ["friends", "Friends"], ["challenges", "Challenges"],
  ["daily", "Daily challenge"], ["test", "Typing test"], ["practice", "Practice lab"],
  ["stats", "Stats & achievements"], ["coach", "AI coach"], ["sounds", "Sounds"],
  ["wordsets", "Community word sets"],
];
export function setGlobalLocks(l) {
  _locks = { games: l?.games || {}, features: l?.features || {}, message: l?.message || "" };
}
export const getGlobalLocks = () => _locks;
export const isFeatureLocked = (f) => !!_locks.features[f];
export const isGameLocked = (id) => !!_locks.games[id];
export const lockMessage = () => _locks.message || "This is temporarily unavailable.";

// Admin-set Keys rewards (config/rewards): { levels: { "12": 40 } }. A level with no entry uses the default formula.
let _rewards = { levels: {} };
export function setGlobalRewards(r) { _rewards = { levels: (r && r.levels) || {} }; }
export const getGlobalRewards = () => _rewards;
export function levelReward(levelId) { const v = _rewards.levels[String(levelId)]; return typeof v === "number" && v >= 0 ? Math.min(500, Math.floor(v)) : null; }

// Admin economy (config/economy): Keys multiplier event and the daily Keys cap.
let _eco = { multiplier: 1, name: "", startsAt: 0, endsAt: 0, dailyCap: 500 };
export function setGlobalEconomy(e) {
  _eco = { multiplier: Number(e?.multiplier) || 1, name: String(e?.name || ""), startsAt: Number(e?.startsAt) || 0, endsAt: Number(e?.endsAt) || 0, dailyCap: Math.max(50, Math.min(5000, Math.floor(Number(e?.dailyCap)) || 500)) };
}
export const getGlobalEconomy = () => _eco;
export function keysMultiplier(now = Date.now()) {
  const e = _eco; if (!(e.multiplier > 1) || (e.startsAt && now < e.startsAt) || (e.endsAt && now > e.endsAt)) return 1;
  return Math.min(5, e.multiplier);
}
export const dailyKeysCap = () => _eco.dailyCap || 500;
