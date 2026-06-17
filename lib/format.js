// Shared formatting helpers.

// Safely formats a Keys count for display. Never falls through to JS's
// native exponential notation (e.g. "1.78e+32"), even if fed a corrupted,
// NaN, negative, or absurdly large value from bad data.
export function formatKeys(value) {
  let k = Number(value);
  if (!Number.isFinite(k) || k < 0) k = 0;
  // Clamp to a sane ceiling so corrupted data can never render garbage.
  const MAX_DISPLAYABLE = 1e9; // 1B Keys ceiling
  if (k > MAX_DISPLAYABLE) k = MAX_DISPLAYABLE;

  if (k >= 1e6) return (k / 1e6).toFixed(k % 1e6 === 0 ? 0 : 1) + "M";
  if (k >= 1e3) return (k / 1e3).toFixed(k % 1e3 === 0 ? 0 : 1) + "k";
  return String(Math.round(k));
}
