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
