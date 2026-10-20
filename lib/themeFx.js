// Gameplay perks for shop themes. Themes change how typing FEELS, not just colors.
// Pure client-side cosmetics keyed by theme id; prices stay in lib/firebase.js.
//   caret:  "underline" | "block" | "bar" | "glow"   (current-letter marker)
//   glow:   correct letters get a soft text glow in the theme accent
//   burst:  small particle floated off the caret on each correct key (or null)
//   shake:  card shakes briefly on a mistake
//   bar:    "solid" | "gradient" | "glow"            (progress bar style)
//   combo:  combo counter style: "plain" | "flame" | "glow" | "rainbow"
//   cert:   certificate border/accent override colors
const BASE = { caret: "underline", glow: false, burst: null, shake: false, bar: "solid", combo: "plain" };
const BY_CATEGORY = {
  Classic: { caret: "bar",       bar: "gradient" },
  Nature:  { caret: "underline", burst: "✦", bar: "gradient" },
  Neon:    { caret: "glow",      glow: true, bar: "glow", combo: "glow" },
  Soft:    { caret: "block",     burst: "♡", bar: "gradient" },
  Special: { caret: "glow",      glow: true, burst: "★", bar: "glow", combo: "rainbow", shake: true },
};
const CATEGORY_OF = {
  dark:"Classic", midnight:"Classic", slate:"Classic", carbon:"Classic",
  forest:"Nature", ocean:"Nature", sakura:"Nature", desert:"Nature", aurora:"Nature",
  neon:"Neon", hacker:"Neon", cyberpunk:"Neon", synthwave:"Neon", vaporwave:"Neon",
  lavender:"Soft", peach:"Soft", mint:"Soft", sunset:"Soft",
  galaxy:"Special", obsidian:"Special", bloodmoon:"Special", gold:"Special", coffee:"Soft",
};
const OVERRIDES = {
  dark:      { combo: "plain" },
  forest:    { burst: "🍃" },
  ocean:     { burst: "💧", combo: "glow" },
  sakura:    { burst: "🌸" },
  desert:    { burst: "✦", combo: "flame" },
  aurora:    { burst: "✧", combo: "rainbow", glow: true },
  hacker:    { caret: "block", burst: "1", combo: "glow" },
  cyberpunk: { burst: "⚡", shake: true },
  synthwave: { burst: "♪", combo: "rainbow" },
  vaporwave: { burst: "◆", combo: "rainbow" },
  sunset:    { burst: "☀", combo: "flame" },
  galaxy:    { burst: "✦", combo: "rainbow" },
  obsidian:  { burst: "◈", combo: "glow", shake: false },
  bloodmoon: { burst: "🩸", combo: "flame", shake: true },
  gold:      { burst: "★", combo: "glow", cert: { border: "#eab308", accent: "#fde047", title: "#fff8d0" } },
};
export function getThemeFx(id) {
  const cat = CATEGORY_OF[id] || "Classic";
  return { ...BASE, ...(BY_CATEGORY[cat] || {}), ...(OVERRIDES[id] || {}) };
}
// Human-readable perk list for the shop card.
export function describePerks(id) {
  const f = getThemeFx(id);
  const p = [];
  p.push({ block: "Block caret", bar: "Bar caret", glow: "Glowing caret", underline: "Underline caret" }[f.caret]);
  if (f.glow) p.push("Glowing letters");
  if (f.burst) p.push(`${f.burst} key bursts`);
  if (f.shake) p.push("Mistake shake");
  if (f.combo !== "plain") p.push({ flame: "Flame combo", glow: "Glow combo", rainbow: "Rainbow combo" }[f.combo]);
  if (f.bar !== "solid") p.push(f.bar === "glow" ? "Glow progress bar" : "Gradient progress bar");
  if (f.cert) p.push("Themed certificate");
  return p;
}
