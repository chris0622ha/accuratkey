// Original SVG icon set for games, shop themes, sounds and common UI.
// All icons are drawn on a 24x24 grid, stroke-based, and take a `color` (and optional
// `accent` for a second tone) so they follow the active theme.
import React from "react";

const S = (props) => ({ fill: "none", stroke: props.color || "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" });
const Wrap = ({ size = 24, children, title }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title} style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>{children}</svg>
);

// ─── GAMES ───────────────────────────────────────────────────────────────────
const GAME_GLYPHS = {
  rain: (c, a) => <><path {...c} d="M6 13a4 4 0 0 1 1-7.8A5 5 0 0 1 17 6a3.5 3.5 0 0 1 0 7z"/><path {...a} d="M8 16l-1 3M12 16l-1 4M16 16l-1 3"/></>,
  survival: (c, a) => <><path {...c} d="M12 3a7 7 0 0 0-4 12.7V19h8v-3.3A7 7 0 0 0 12 3z"/><circle {...a} cx="9.5" cy="11" r="1"/><circle {...a} cx="14.5" cy="11" r="1"/><path {...a} d="M10.5 19v2M13.5 19v2"/></>,
  burst: (c, a) => <><path {...c} d="M13 2L5 13h6l-1 9 8-12h-6z"/></>,
  scramble: (c, a) => <><path {...c} d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4"/><path {...a} d="M19 5l2 2-2 2M19 15l2 2-2 2"/></>,
  suddendeath: (c, a) => <><path {...c} d="M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3z"/><path {...a} d="M9 9l2.5 2.5M11.5 9L9 11.5M12.5 9l2.5 2.5M15 9l-2.5 2.5M5 21l14-3M19 21L5 18"/></>,
  ladder: (c, a) => <><path {...c} d="M7 3v18M17 3v18"/><path {...a} d="M7 7h10M7 12h10M7 17h10"/></>,
  tugofwar: (c, a) => <><path {...c} d="M2 12h20"/><path {...a} d="M9 8v8M15 8v8"/><circle {...a} cx="12" cy="12" r="2"/></>,
  wordbomb: (c, a) => <><circle {...c} cx="11" cy="14" r="7"/><path {...a} d="M15 8l3-3M18 5l1-2M18 5l2 1M18 5l2-1"/></>,
  sniper: (c, a) => <><circle {...c} cx="12" cy="12" r="8"/><circle {...a} cx="12" cy="12" r="3"/><path {...c} d="M12 1v5M12 18v5M1 12h5M18 12h5"/></>,
  mirror: (c, a) => <><path {...c} d="M12 3v18"/><path {...a} d="M4 8l5 4-5 4zM20 8l-5 4 5 4z"/></>,
  flash: (c, a) => <><circle {...c} cx="12" cy="12" r="4"/><path {...a} d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></>,
  echo: (c, a) => <><circle {...c} cx="12" cy="12" r="2.5"/><path {...a} d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15"/></>,
  memoryedit: (c, a) => <><path {...c} d="M12 4a4 4 0 0 0-7 2.5A3.5 3.5 0 0 0 5 13a3.5 3.5 0 0 0 4 5 3 3 0 0 0 3 2zM12 4a4 4 0 0 1 7 2.5A3.5 3.5 0 0 1 19 13a3.5 3.5 0 0 1-4 5 3 3 0 0 1-3 2z"/><path {...a} d="M12 4v16"/></>,
  ghost: (c, a) => <><path {...c} d="M5 21V11a7 7 0 0 1 14 0v10l-2.3-2-2.3 2-2.4-2-2.4 2-2.3-2z"/><circle {...a} cx="9.5" cy="11" r="1"/><circle {...a} cx="14.5" cy="11" r="1"/></>,
  boss: (c, a) => <><path {...c} d="M5 4l3 4h8l3-4v9a7 7 0 0 1-14 0z"/><path {...a} d="M9 12h2M13 12h2M10 16h4"/></>,
  hundred: (c, a) => <><path {...c} d="M3 8v8M3 8l-1.5 1.5"/><circle {...c} cx="10" cy="12" r="2.5"/><circle {...a} cx="18" cy="12" r="2.5"/></>,
  endurance: (c, a) => <><path {...c} d="M4 19c0-6 3-10 8-10s8 4 8 10"/><path {...a} d="M12 9V5M9 6l3-3 3 3"/></>,
  roulette: (c, a) => <><circle {...c} cx="12" cy="12" r="9"/><circle {...a} cx="12" cy="12" r="3"/><path {...a} d="M12 3v6M12 15v6M3 12h6M15 12h6"/></>,
  wildcard: (c, a) => <><rect {...c} x="4" y="4" width="16" height="16" rx="3"/><circle {...a} cx="9" cy="9" r="1.2"/><circle {...a} cx="15" cy="15" r="1.2"/><circle {...a} cx="12" cy="12" r="1.2"/></>,
  wordchain: (c, a) => <><rect {...c} x="2" y="9" width="11" height="6" rx="3"/><rect {...a} x="11" y="9" width="11" height="6" rx="3"/></>,
  blitz: (c, a) => <><rect {...c} x="3" y="4" width="18" height="16" rx="3"/><path {...a} d="M13 7l-4 6h3l-1 4 4-6h-3z"/></>,
  vocab: (c, a) => <><path {...c} d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2z"/><path {...a} d="M8 8h7M8 12h5"/></>,
  spellingbee: (c, a) => <><path {...c} d="M12 3l7 4v6l-7 4-7-4V7z"/><path {...a} d="M9.5 10h5M9.5 13h5"/><path {...c} d="M12 17v4"/></>,
  invaders: (c, a) => <><path {...c} d="M6 8h12v6l-2 2v3h-2v-3h-4v3H8v-3l-2-2z"/><path {...a} d="M4 5l2 3M20 5l-2 3"/><rect x="9" y="10" width="2" height="2" fill={a.stroke}/><rect x="13" y="10" width="2" height="2" fill={a.stroke}/></>,
  asteroid: (c, a) => <><path {...c} d="M8 4l6-1 5 5 1 6-5 5-7 1-5-5 1-7z"/><circle {...a} cx="10" cy="10" r="1.3"/><circle {...a} cx="15" cy="14" r="1"/></>,
  tower: (c, a) => <><path {...c} d="M4 21V9l3 2V6l2 1V4h6v3l2-1v5l3-2v12z"/><path {...a} d="M10 21v-5a2 2 0 0 1 4 0v5"/></>,
  mystery: (c, a) => <><circle {...c} cx="12" cy="10" r="7"/><path {...a} d="M9.5 8.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7M12 14.5v.01"/><path {...c} d="M7 19h10M9 22h6"/></>,
  rhyme: (c, a) => <><path {...c} d="M9 18V6l10-2v12"/><circle {...a} cx="6.5" cy="18" r="2.5"/><circle {...a} cx="16.5" cy="16" r="2.5"/></>,
  freestyle: (c, a) => <><path {...c} d="M4 20l1-4L17 4l3 3L8 19z"/><path {...a} d="M14 7l3 3M4 20h6"/></>,
  speedtest: (c, a) => <><circle {...c} cx="12" cy="13" r="8"/><path {...a} d="M12 13l4-4M12 3v2M9 2h6"/></>,
  missing: (c, a) => <><path {...c} d="M3 19h5M16 19h5"/><path {...c} d="M5.5 15V6l2.500 0M18.500 15V6"/><path {...a} d="M10 19h4M12 15v-1M12 11.500a2 2 0 1 0-2-2"/></>,
  anagram: (c, a) => <><path {...c} d="M4 8h13l-3-3M20 16H7l3 3"/><path {...a} d="M4 12h16"/></>,
  bricks: (c, a) => <><rect {...c} x="3" y="4" width="18" height="16" rx="2"/><path {...a} d="M3 9.3h18M3 14.6h18M9 4v5.3M15 9.3v5.3M9 14.6V20"/></>,
  synonyms: (c, a) => <><path {...c} d="M4 6h16M4 10h16"/><path {...a} d="M4 15h10M4 19h10M17 15l3 2-3 2"/></>,
  antonyms: (c, a) => <><path {...c} d="M4 8h13M14 4l4 4-4 4"/><path {...a} d="M20 16H7M10 12l-4 4 4 4"/></>,
};
// category colors so the games grid reads at a glance
const GAME_CAT_COLOR = { arcade: "#f472b6", speed: "#facc15", puzzle: "#38bdf8", accuracy: "#ef4444", challenge: "#fb923c", memory: "#a78bfa", random: "#34d399", educational: "#2dd4bf" };
export function GameIcon({ id, size = 28, color, accent, cat }) {
  const base = color || GAME_CAT_COLOR[cat] || "#a78bfa";
  const c = S({ color: base }), a = S({ color: accent || "#e0e0ff" });
  const g = GAME_GLYPHS[id];
  return <Wrap size={size} title={id}>{g ? g(c, a) : <circle {...c} cx="12" cy="12" r="8" />}</Wrap>;
}

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEME_GLYPHS = {
  dark: (c, a) => <><circle {...c} cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill={c.stroke}/></>,
  midnight: (c, a) => <><path {...c} d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z"/><path {...a} d="M17 4v3M15.5 5.5h3"/></>,
  slate: (c, a) => <><path {...c} d="M12 3l9 5-9 5-9-5z"/><path {...a} d="M3 12l9 5 9-5M3 16l9 5 9-5"/></>,
  carbon: (c, a) => <><path {...c} d="M12 3l7 4v10l-7 4-7-4V7z"/><path {...a} d="M12 3v18M5 7l14 10M19 7L5 17"/></>,
  forest: (c, a) => <><path {...c} d="M12 3l5 7h-3l4 6H6l4-6H7z"/><path {...a} d="M12 16v5"/></>,
  ocean: (c, a) => <><path {...c} d="M2 9c3-3 5 3 8 0s5 3 8 0 3 0 4 0M2 15c3-3 5 3 8 0s5 3 8 0 3 0 4 0"/><path {...a} d="M2 20c3-3 5 3 8 0s5 3 8 0"/></>,
  sakura: (c, a) => <><path {...c} d="M12 11c-3-2-3-7 0-8 3 1 3 6 0 8zM12 11c3-2 8-1 8 3-2 3-6 2-8-3zM12 11c3 2 2 7-2 8-3-2-2-6 2-8zM12 11c-3 2-8 1-8-3 2-3 6-2 8 3z"/><circle {...a} cx="12" cy="12" r="1.2"/></>,
  desert: (c, a) => <><circle {...a} cx="16" cy="7" r="3"/><path {...c} d="M2 20c3-6 6-6 9-2s6 2 11-4v6z"/></>,
  aurora: (c, a) => <><path {...c} d="M3 18c3-9 6-9 9-4s6 0 9-8"/><path {...a} d="M3 21c3-7 6-7 9-3s6 0 9-6"/></>,
  neon: (c, a) => <><path {...c} d="M13 2L5 13h6l-1 9 8-12h-6z"/><path {...a} d="M3 5l2 1M21 17l-2-1"/></>,
  hacker: (c, a) => <><rect {...c} x="3" y="4" width="18" height="16" rx="2"/><path {...a} d="M7 10l3 2-3 2M12 15h5"/></>,
  cyberpunk: (c, a) => <><rect {...c} x="6" y="6" width="12" height="12" rx="2"/><path {...a} d="M9 6V3M15 6V3M9 21v-3M15 21v-3M6 9H3M6 15H3M21 9h-3M21 15h-3"/><rect {...a} x="10" y="10" width="4" height="4"/></>,
  synthwave: (c, a) => <><path {...c} d="M4 15a8 8 0 0 1 16 0"/><path {...a} d="M3 18h18M5 21h14"/><path {...a} d="M7 12.5h10M6 14.5h12"/></>,
  vaporwave: (c, a) => <><path {...c} d="M12 4l7 8-7 8-7-8z"/><path {...a} d="M5 12h14M12 4v16"/></>,
  lavender: (c, a) => <><path {...c} d="M12 21V8"/><path {...a} d="M12 8c-2-1-2-4 0-5 2 1 2 4 0 5zM12 12c-3-1-4-3-3-5M12 12c3-1 4-3 3-5M12 16c-3-1-4-3-3-5M12 16c3-1 4-3 3-5"/></>,
  peach: (c, a) => <><path {...c} d="M12 6c5-2 9 2 7 8-1.5 4-5 6-7 6s-5.500-2-7-6c-2-6 2-10 7-8z"/><path {...a} d="M12 6c0-2 1-3 3-3M12 6v14"/></>,
  mint: (c, a) => <><path {...c} d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path {...a} d="M5 19L14 10"/></>,
  sunset: (c, a) => <><path {...c} d="M5 17a7 7 0 0 1 14 0"/><path {...a} d="M2 17h20M5 21h14M12 4v3M4.500 8l2 2M19.500 8l-2 2"/></>,
  galaxy: (c, a) => <><path {...c} d="M12 12c0-3 4-3 4 0s-6 3-6-1 8-5 10-1"/><circle {...a} cx="5" cy="6" r="1"/><circle {...a} cx="19" cy="18" r="1"/><circle {...a} cx="6" cy="18" r=".8"/></>,
  obsidian: (c, a) => <><path {...c} d="M7 4h10l4 6-9 11L3 10z"/><path {...a} d="M3 10h18M9 4l3 6 3-6M12 10v11"/></>,
  bloodmoon: (c, a) => <><circle {...c} cx="12" cy="11" r="7"/><path {...a} d="M12 14c-1.500 2-1.500 3.500 0 4.500 1.500-1 1.500-2.500 0-4.500z"/></>,
  gold: (c, a) => <><path {...c} d="M3 18l2-10 4.500 4L12 5l2.500 7L19 8l2 10z"/><path {...a} d="M3 21h18"/></>,
  coffee: (c, a) => <><path {...c} d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 11h2a2.500 2.500 0 0 1 0 5h-2"/><path {...a} d="M8 3c-1 1.500 1 2 0 4M12 3c-1 1.500 1 2 0 4"/></>,
};
export function ThemeIcon({ id, size = 28, color = "#a78bfa", accent = "#e0e0ff" }) {
  const c = S({ color }), a = S({ color: accent });
  const g = THEME_GLYPHS[id];
  return <Wrap size={size} title={id + " theme"}>{g ? g(c, a) : <circle {...c} cx="12" cy="12" r="8" />}</Wrap>;
}

// ─── SOUNDS ──────────────────────────────────────────────────────────────────
const SOUND_GLYPHS = {
  default: (c, a) => <><path {...c} d="M4 9v6h4l5 4V5L8 9z"/><path {...a} d="M16 9a4.500 4.500 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11"/></>,
  mechanical: (c, a) => <><rect {...c} x="3" y="6" width="18" height="12" rx="2"/><path {...a} d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/></>,
  typewriter: (c, a) => <><path {...c} d="M6 10V4h12v6M4 10h16v8H4z"/><path {...a} d="M8 14h8M7 21h10"/></>,
  soft: (c, a) => <><path {...c} d="M9 18V6l10-2v12"/><circle {...a} cx="6.500" cy="18" r="2.500"/><circle {...a} cx="16.500" cy="16" r="2.500"/></>,
  arcade: (c, a) => <><path {...c} d="M12 4v8"/><circle {...a} cx="12" cy="4" r="2"/><path {...c} d="M4 16a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4z"/><circle {...a} cx="16" cy="17" r=".8"/></>,
  nature: (c, a) => <><path {...c} d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path {...a} d="M5 19L14 10"/></>,
};
export function SoundIcon({ id, size = 36, color = "#a78bfa", accent = "#e0e0ff" }) {
  const c = S({ color }), a = S({ color: accent });
  const g = SOUND_GLYPHS[id] || SOUND_GLYPHS.default;
  return <Wrap size={size} title={id + " sound"}>{g(c, a)}</Wrap>;
}

// ─── COMMON UI ───────────────────────────────────────────────────────────────
const UI_GLYPHS = {
  shop: (c, a) => <><path {...c} d="M5 8h14l-1 12H6z"/><path {...a} d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
  flame: (c, a) => <><path {...c} d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3 0-6 1-9z"/></>,
  calendar: (c, a) => <><rect {...c} x="4" y="5" width="16" height="15" rx="2"/><path {...a} d="M4 10h16M9 3v4M15 3v4"/></>,
  keyboard: (c, a) => <><rect {...c} x="2" y="6" width="20" height="12" rx="2"/><path {...a} d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></>,
  feedback: (c, a) => <><path {...c} d="M4 5h16v11H9l-5 4z"/><path {...a} d="M8 9h8M8 12h5"/></>,
  friends: (c, a) => <><circle {...c} cx="9" cy="8" r="3"/><path {...c} d="M3 20a6 6 0 0 1 12 0"/><circle {...a} cx="17" cy="9" r="2.500"/><path {...a} d="M16 14a5 5 0 0 1 5 6"/></>,
  trophy: (c, a) => <><path {...c} d="M7 4h10v5a5 5 0 0 1-10 0z"/><path {...a} d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8"/></>,
  stats: (c, a) => <><path {...c} d="M4 20V4M4 20h16"/><path {...a} d="M8 16v-4M12 16V8M16 16v-6"/></>,
  settings: (c, a) => <><circle {...c} cx="12" cy="12" r="3"/><path {...a} d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></>,
  lock: (c, a) => <><rect {...c} x="5" y="11" width="14" height="10" rx="2"/><path {...a} d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  star: (c, a) => <><path {...c} d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/></>,
};
export function UiIcon({ name, size = 20, color, accent }) {
  const c = S({ color }), a = S({ color: accent || color });
  const g = UI_GLYPHS[name];
  return <Wrap size={size} title={name}>{g ? g(c, a) : <circle {...c} cx="12" cy="12" r="8" />}</Wrap>;
}
