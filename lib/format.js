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

  const tierFormat = (val, div, suffix) => {
    const rounded = Math.round((val / div) * 10) / 10;
    return (rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)) + suffix;
  };

  if (k >= 1e9) return tierFormat(k, 1e9, "B");
  if (k >= 1e6) {
    // Guard against rounding up into B territory (e.g. 999999999 -> "1000.0M")
    if (Math.round((k / 1e6) * 10) / 10 >= 1000) return tierFormat(k, 1e9, "B");
    return tierFormat(k, 1e6, "M");
  }
  if (k >= 1e3) {
    // Same guard, one tier down (e.g. 999999 -> "1000.0k")
    if (Math.round((k / 1e3) * 10) / 10 >= 1000) return tierFormat(k, 1e6, "M");
    return tierFormat(k, 1e3, "k");
  }
  return String(Math.round(k));
}
