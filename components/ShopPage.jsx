"use client";
import { useState, useEffect, useRef } from "react";
import { auth, getProfile, getProfiles, purchaseTheme, setActiveTheme, purchaseFont, setActiveFont } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KKey } from "./icons/KKey";
import { formatKeys } from "@/lib/format";

// ─── ALL THEMES ──────────────────────────────────────────────────────────────
export const ALL_THEMES = [
  // FREE
  { id:"dark",      label:"Dark",       cost:0,   category:"Classic",
    bg:"#0a0a0f", card:"#13131f", border:"#1e1e30", text:"#e0e0ff", muted:"#555", faint:"#444",
    accent:"#fb923c", purple:"#7c6af7", preview:["#0a0a0f","#7c6af7","#fb923c"] },

  // CLASSIC (50🔑)
  { id:"midnight",  label:"Midnight",   cost:50,  category:"Classic",
    bg:"#060614", card:"#0d0d24", border:"#14143a", text:"#c8d0ff", muted:"#4a4a7a", faint:"#333360",
    accent:"#a78bfa", purple:"#818cf8", preview:["#060614","#818cf8","#a78bfa"] },
  { id:"slate",     label:"Slate",      cost:50,  category:"Classic",
    bg:"#0b0f1a", card:"#111827", border:"#1f2937", text:"#e2e8f0", muted:"#64748b", faint:"#374151",
    accent:"#38bdf8", purple:"#818cf8", preview:["#0b0f1a","#818cf8","#38bdf8"] },
  { id:"carbon",    label:"Carbon",     cost:50,  category:"Classic",
    bg:"#0a0a0a", card:"#111111", border:"#222222", text:"#e8e8e8", muted:"#666666", faint:"#333333",
    accent:"#ff6b35", purple:"#cc5500", preview:["#0a0a0a","#cc5500","#ff6b35"] },

  // NATURE (75🔑)
  { id:"forest",    label:"Forest",     cost:75,  category:"Nature",
    bg:"#0a1410", card:"#0f1f18", border:"#1a3020", text:"#d4f0d0", muted:"#4a7060", faint:"#2a4a38",
    accent:"#86efac", purple:"#34d399", preview:["#0a1410","#34d399","#86efac"] },
  { id:"ocean",     label:"Ocean",      cost:75,  category:"Nature",
    bg:"#050d14", card:"#0a1820", border:"#0f2535", text:"#bae6fd", muted:"#2a6080", faint:"#0f3a55",
    accent:"#38bdf8", purple:"#06b6d4", preview:["#050d14","#06b6d4","#38bdf8"] },
  { id:"sakura",    label:"Sakura",     cost:75,  category:"Nature",
    bg:"#160a10", card:"#201218", border:"#3a1a28", text:"#ffd6e8", muted:"#804060", faint:"#501a30",
    accent:"#f9a8d4", purple:"#f472b6", preview:["#160a10","#f472b6","#f9a8d4"] },
  { id:"desert",    label:"Desert",     cost:75,  category:"Nature",
    bg:"#120d08", card:"#1e1408", border:"#2e2010", text:"#fde68a", muted:"#785028", faint:"#4a3018",
    accent:"#fbbf24", purple:"#d97706", preview:["#120d08","#d97706","#fbbf24"] },
  { id:"aurora",    label:"Aurora",     cost:75,  category:"Nature",
    bg:"#070d12", card:"#0c1620", border:"#122030", text:"#d0f0e0", muted:"#2a6050", faint:"#0f3030",
    accent:"#5eead4", purple:"#2dd4bf", preview:["#070d12","#2dd4bf","#5eead4"] },

  // NEON (100🔑)
  { id:"neon",      label:"Neon",       cost:100, category:"Neon",
    bg:"#050505", card:"#0a0f0a", border:"#0a2010", text:"#e0ffe0", muted:"#00aa44", faint:"#004422",
    accent:"#00ff88", purple:"#00ff88", preview:["#050505","#00ff88","#00dd66"] },
  { id:"hacker",    label:"Hacker",     cost:100, category:"Neon",
    bg:"#000000", card:"#001200", border:"#003300", text:"#00ff41", muted:"#007a1f", faint:"#003d0f",
    accent:"#00ff41", purple:"#00cc33", font:"'Courier New',Courier,monospace", preview:["#000000","#00ff41","#00cc33"] },
  { id:"cyberpunk", label:"Cyberpunk",  cost:100, category:"Neon",
    bg:"#0a0010", card:"#130020", border:"#1e0035", text:"#f0e0ff", muted:"#7a3090", faint:"#3d0060",
    accent:"#f0abfc", purple:"#e879f9", preview:["#0a0010","#e879f9","#f0abfc"] },
  { id:"synthwave", label:"Synthwave",  cost:100, category:"Neon",
    bg:"#0a0018", card:"#100025", border:"#200040", text:"#f8d8ff", muted:"#9a30c0", faint:"#4d0070",
    accent:"#f472b6", purple:"#c084fc", preview:["#0a0018","#c084fc","#f472b6"] },
  { id:"vaporwave", label:"Vaporwave",  cost:125, category:"Neon",
    bg:"#0f0520", card:"#1a0a30", border:"#2d1050", text:"#ffe8ff", muted:"#9050a0", faint:"#4a1060",
    accent:"#ff70d0", purple:"#d070ff", preview:["#0f0520","#d070ff","#ff70d0"] },

  // PASTEL / SOFT (100🔑)
  { id:"lavender",  label:"Lavender",   cost:100, category:"Soft",
    bg:"#0e0b18", card:"#180f28", border:"#281840", text:"#ede0ff", muted:"#7060a0", faint:"#3a2860",
    accent:"#c4b5fd", purple:"#a78bfa", preview:["#0e0b18","#a78bfa","#c4b5fd"] },
  { id:"peach",     label:"Peach",      cost:100, category:"Soft",
    bg:"#140a08", card:"#201410", border:"#342018", text:"#ffe8d8", muted:"#906040", faint:"#4a2818",
    accent:"#fdba74", purple:"#fb923c", preview:["#140a08","#fb923c","#fdba74"] },
  { id:"mint",      label:"Mint",       cost:100, category:"Soft",
    bg:"#080e10", card:"#0e1a1c", border:"#162830", text:"#d0f4e8", muted:"#306860", faint:"#143830",
    accent:"#6ee7b7", purple:"#34d399", preview:["#080e10","#34d399","#6ee7b7"] },

  // SPECIAL (150🔑)
  { id:"sunset",    label:"Sunset",     cost:150, category:"Special",
    bg:"#150a0f", card:"#201018", border:"#301820", text:"#ffeedd", muted:"#9a4060", faint:"#4d1430",
    accent:"#fda4af", purple:"#f472b6", preview:["#150a0f","#f472b6","#fda4af"] },
  { id:"galaxy",    label:"Galaxy",     cost:150, category:"Special",
    bg:"#040410", card:"#08081c", border:"#10102e", text:"#e0e8ff", muted:"#404088", faint:"#202050",
    accent:"#818cf8", purple:"#6366f1", preview:["#040410","#6366f1","#818cf8"] },
  { id:"obsidian",  label:"Obsidian",   cost:150, category:"Special",
    bg:"#030305", card:"#07070c", border:"#100f1c", text:"#d8d8f0", muted:"#404060", faint:"#1c1c30",
    accent:"#8b5cf6", purple:"#7c3aed", preview:["#030305","#7c3aed","#8b5cf6"] },
  { id:"bloodmoon", label:"Blood Moon", cost:150, category:"Special",
    bg:"#0f0000", card:"#1a0000", border:"#2e0000", text:"#ffe8e8", muted:"#8a2020", faint:"#4a0808",
    accent:"#f87171", purple:"#ef4444", preview:["#0f0000","#ef4444","#f87171"] },
  { id:"gold",      label:"Gold",       cost:200, category:"Special",
    bg:"#0a0800", card:"#140e00", border:"#241800", text:"#fff8d0", muted:"#9a7000", faint:"#4a3000",
    accent:"#fde047", purple:"#eab308", preview:["#0a0800","#eab308","#fde047"] },
];

// ─── ALL FONTS ────────────────────────────────────────────────────────────────
export const ALL_FONTS = [
  // FREE
  { id:"jetbrains",  label:"JetBrains Mono", cost:0,   category:"Monospace", google:"JetBrains+Mono:wght@400;700",
    css:"'JetBrains Mono', monospace", preview:"AaBbCc 123" },

  // MONO (50🔑)
  { id:"firacode",   label:"Fira Code",      cost:50,  category:"Monospace", google:"Fira+Code:wght@400;700",
    css:"'Fira Code', monospace", preview:"AaBbCc 123" },
  { id:"sourcecodepro", label:"Source Code Pro", cost:50, category:"Monospace", google:"Source+Code+Pro:wght@400;700",
    css:"'Source Code Pro', monospace", preview:"AaBbCc 123" },
  { id:"robototmono", label:"Roboto Mono",   cost:50,  category:"Monospace", google:"Roboto+Mono:wght@400;700",
    css:"'Roboto Mono', monospace", preview:"AaBbCc 123" },
  { id:"spacemono",  label:"Space Mono",     cost:50,  category:"Monospace", google:"Space+Mono:wght@400;700",
    css:"'Space Mono', monospace", preview:"AaBbCc 123" },
  { id:"inconsolata",label:"Inconsolata",    cost:50,  category:"Monospace", google:"Inconsolata:wght@400;700",
    css:"'Inconsolata', monospace", preview:"AaBbCc 123" },
  { id:"ptmono",     label:"PT Mono",        cost:50,  category:"Monospace", google:"PT+Mono",
    css:"'PT Mono', monospace", preview:"AaBbCc 123" },
  { id:"cousine",    label:"Cousine",        cost:50,  category:"Monospace", google:"Cousine:wght@400;700",
    css:"'Cousine', monospace", preview:"AaBbCc 123" },

  // SANS (75🔑)
  { id:"inter",      label:"Inter",          cost:75,  category:"Sans-Serif", google:"Inter:wght@400;700",
    css:"'Inter', sans-serif", preview:"AaBbCc 123" },
  { id:"outfit",     label:"Outfit",         cost:75,  category:"Sans-Serif", google:"Outfit:wght@400;700",
    css:"'Outfit', sans-serif", preview:"AaBbCc 123" },
  { id:"nunito",     label:"Nunito",         cost:75,  category:"Sans-Serif", google:"Nunito:wght@400;700",
    css:"'Nunito', sans-serif", preview:"AaBbCc 123" },
  { id:"poppins",    label:"Poppins",        cost:75,  category:"Sans-Serif", google:"Poppins:wght@400;700",
    css:"'Poppins', sans-serif", preview:"AaBbCc 123" },
  { id:"quicksand",  label:"Quicksand",      cost:75,  category:"Sans-Serif", google:"Quicksand:wght@400;700",
    css:"'Quicksand', sans-serif", preview:"AaBbCc 123" },
  { id:"dmsans",     label:"DM Sans",        cost:75,  category:"Sans-Serif", google:"DM+Sans:wght@400;700",
    css:"'DM Sans', sans-serif", preview:"AaBbCc 123" },
  { id:"lexend",     label:"Lexend",         cost:75,  category:"Sans-Serif", google:"Lexend:wght@400;700",
    css:"'Lexend', sans-serif", preview:"AaBbCc 123" },

  // DISPLAY (100🔑)
  { id:"orbitron",   label:"Orbitron",       cost:100, category:"Display", google:"Orbitron:wght@400;700",
    css:"'Orbitron', sans-serif", preview:"AaBbCc 123" },
  { id:"rajdhani",   label:"Rajdhani",       cost:100, category:"Display", google:"Rajdhani:wght@400;700",
    css:"'Rajdhani', sans-serif", preview:"AaBbCc 123" },
  { id:"exo2",       label:"Exo 2",          cost:100, category:"Display", google:"Exo+2:wght@400;700",
    css:"'Exo 2', sans-serif", preview:"AaBbCc 123" },
  { id:"audiowide",  label:"Audiowide",      cost:100, category:"Display", google:"Audiowide",
    css:"'Audiowide', sans-serif", preview:"AaBbCc 123" },
  { id:"nasalization",label:"Nasalization",  cost:100, category:"Display", google:"Russo+One",
    css:"'Russo One', sans-serif", preview:"AaBbCc 123" },
  { id:"ubuntu",     label:"Ubuntu Mono",    cost:100, category:"Monospace", google:"Ubuntu+Mono:wght@400;700",
    css:"'Ubuntu Mono', monospace", preview:"AaBbCc 123" },

  // FUN (125🔑)
  { id:"comicsans",  label:"Comic Neue",     cost:125, category:"Fun", google:"Comic+Neue:wght@400;700",
    css:"'Comic Neue', cursive", preview:"AaBbCc 123" },
  { id:"fredoka",    label:"Fredoka",        cost:125, category:"Fun", google:"Fredoka:wght@400;700",
    css:"'Fredoka', sans-serif", preview:"AaBbCc 123" },
  { id:"boogaloo",   label:"Boogaloo",       cost:125, category:"Fun", google:"Boogaloo",
    css:"'Boogaloo', cursive", preview:"AaBbCc 123" },
  { id:"pressstart", label:"Press Start 2P", cost:125, category:"Fun", google:"Press+Start+2P",
    css:"'Press Start 2P', cursive", preview:"AaBb 12" },
  { id:"vt323",      label:"VT323 (Retro)",  cost:125, category:"Fun", google:"VT323",
    css:"'VT323', monospace", preview:"AaBbCc 123" },
  { id:"silkscreen", label:"Silkscreen",     cost:125, category:"Fun", google:"Silkscreen",
    css:"'Silkscreen', monospace", preview:"AaBbCc 123" },

  // ELEGANT (150🔑)
  { id:"playfair",   label:"Playfair Display", cost:150, category:"Elegant", google:"Playfair+Display:wght@400;700",
    css:"'Playfair Display', serif", preview:"AaBbCc 123" },
  { id:"cormorant",  label:"Cormorant Garamond", cost:150, category:"Elegant", google:"Cormorant+Garamond:wght@400;700",
    css:"'Cormorant Garamond', serif", preview:"AaBbCc 123" },
  { id:"crimsonpro", label:"Crimson Pro",    cost:150, category:"Elegant", google:"Crimson+Pro:wght@400;700",
    css:"'Crimson Pro', serif", preview:"AaBbCc 123" },
  { id:"eb_garamond",label:"EB Garamond",    cost:150, category:"Elegant", google:"EB+Garamond:wght@400;700",
    css:"'EB Garamond', serif", preview:"AaBbCc 123" },
  { id:"lora",       label:"Lora",           cost:150, category:"Elegant", google:"Lora:wght@400;700",
    css:"'Lora', serif", preview:"AaBbCc 123" },

  // MONOSPACE EXTRAS (50🔑)
  { id:"ibmplexmono",label:"IBM Plex Mono",  cost:50,  category:"Monospace", google:"IBM+Plex+Mono:wght@400;700",
    css:"'IBM Plex Mono', monospace", preview:"AaBbCc 123" },
  { id:"cascadia",   label:"Cascadia Code",  cost:50,  category:"Monospace", google:"Roboto+Mono:wght@400;700",
    css:"'Roboto Mono', monospace", preview:"AaBbCc 123" },
  { id:"notosamono", label:"Noto Sans Mono", cost:50,  category:"Monospace", google:"Noto+Sans+Mono:wght@400;700",
    css:"'Noto Sans Mono', monospace", preview:"AaBbCc 123" },
  { id:"overpassmono",label:"Overpass Mono", cost:50,  category:"Monospace", google:"Overpass+Mono:wght@400;700",
    css:"'Overpass Mono', monospace", preview:"AaBbCc 123" },
  { id:"sharetechmono",label:"Share Tech Mono",cost:50,category:"Monospace", google:"Share+Tech+Mono",
    css:"'Share Tech Mono', monospace", preview:"AaBbCc 123" },
  { id:"anonymouspro",label:"Anonymous Pro",  cost:50, category:"Monospace", google:"Anonymous+Pro:wght@400;700",
    css:"'Anonymous Pro', monospace", preview:"AaBbCc 123" },

  // SANS EXTRAS (75🔑)
  { id:"manrope",    label:"Manrope",        cost:75,  category:"Sans-Serif", google:"Manrope:wght@400;700",
    css:"'Manrope', sans-serif", preview:"AaBbCc 123" },
  { id:"plusjakarta",label:"Plus Jakarta Sans",cost:75,category:"Sans-Serif", google:"Plus+Jakarta+Sans:wght@400;700",
    css:"'Plus Jakarta Sans', sans-serif", preview:"AaBbCc 123" },
  { id:"syne",       label:"Syne",           cost:75,  category:"Sans-Serif", google:"Syne:wght@400;700",
    css:"'Syne', sans-serif", preview:"AaBbCc 123" },
  { id:"figtree",    label:"Figtree",        cost:75,  category:"Sans-Serif", google:"Figtree:wght@400;700",
    css:"'Figtree', sans-serif", preview:"AaBbCc 123" },
  { id:"onest",      label:"Onest",          cost:75,  category:"Sans-Serif", google:"Onest:wght@400;700",
    css:"'Onest', sans-serif", preview:"AaBbCc 123" },
  { id:"geist",      label:"Geist",          cost:75,  category:"Sans-Serif", google:"Geist:wght@400;700",
    css:"'Geist', sans-serif", preview:"AaBbCc 123" },

  // DISPLAY EXTRAS (100🔑)
  { id:"jura",       label:"Jura",           cost:100, category:"Display", google:"Jura:wght@400;700",
    css:"'Jura', sans-serif", preview:"AaBbCc 123" },
  { id:"quantico",   label:"Quantico",       cost:100, category:"Display", google:"Quantico:wght@400;700",
    css:"'Quantico', sans-serif", preview:"AaBbCc 123" },
  { id:"oxanium",    label:"Oxanium",        cost:100, category:"Display", google:"Oxanium:wght@400;700",
    css:"'Oxanium', sans-serif", preview:"AaBbCc 123" },
  { id:"tektur",     label:"Tektur",         cost:100, category:"Display", google:"Tektur:wght@400;700",
    css:"'Tektur', sans-serif", preview:"AaBbCc 123" },
  { id:"tourney",    label:"Tourney",        cost:100, category:"Display", google:"Tourney:wght@400;700",
    css:"'Tourney', sans-serif", preview:"AaBbCc 123" },
  { id:"blender",    label:"Blinker",        cost:100, category:"Display", google:"Blinker:wght@400;700",
    css:"'Blinker', sans-serif", preview:"AaBbCc 123" },

  // FUN EXTRAS (125🔑)
  { id:"chewy",      label:"Chewy",          cost:125, category:"Fun", google:"Chewy",
    css:"'Chewy', cursive", preview:"AaBbCc 123" },
  { id:"rubikbubbles",label:"Rubik Bubbles", cost:125, category:"Fun", google:"Rubik+Bubbles",
    css:"'Rubik Bubbles', cursive", preview:"AaBb" },
  { id:"permanentmarker",label:"Permanent Marker",cost:125,category:"Fun",google:"Permanent+Marker",
    css:"'Permanent Marker', cursive", preview:"AaBbCc" },
  { id:"creepster",  label:"Creepster",      cost:125, category:"Fun", google:"Creepster",
    css:"'Creepster', cursive", preview:"AaBbCc 123" },
  { id:"domine",     label:"Domine",         cost:125, category:"Fun", google:"Domine:wght@400;700",
    css:"'Domine', serif", preview:"AaBbCc 123" },
  { id:"ultra",      label:"Ultra",          cost:125, category:"Fun", google:"Ultra",
    css:"'Ultra', serif", preview:"AaBbCc" },
];

// Load Google Fonts dynamically
function loadFont(font) {
  if (!font?.google || typeof document === "undefined") return;
  const id = `gf-${font.id}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
    document.head.appendChild(link);
  }
}

const CATEGORIES_THEMES = ["Classic","Nature","Neon","Soft","Special"];
const CATEGORIES_FONTS  = ["Monospace","Sans-Serif","Display","Fun","Elegant"];

export const SOUND_THEMES = [
  { id:"default",   label:"Default",     emoji:"🔊", cost:0,   desc:"Synthesized beeps and chimes" },
  { id:"mechanical",label:"Mechanical",  emoji:"⌨️", cost:30,  desc:"Satisfying clicky keyboard sounds" },
  { id:"typewriter",label:"Typewriter",  emoji:"📜", cost:30,  desc:"Classic old-school typewriter" },
  { id:"soft",      label:"Soft",        emoji:"🎵", cost:20,  desc:"Muted, gentle key presses" },
  { id:"arcade",    label:"Arcade",      emoji:"🕹️", cost:40,  desc:"8-bit game sound effects" },
  { id:"nature",    label:"Nature",      emoji:"🌿", cost:50,  desc:"Subtle natural ambient sounds" },
];

export default function ShopPage() {
  const previewSound = (soundId) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime;
      const beep = (freq, start, dur, vol=0.3) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq; g.gain.setValueAtTime(vol, t+start);
        g.gain.exponentialRampToValueAtTime(0.001, t+start+dur);
        o.start(t+start); o.stop(t+start+dur+0.05);
      };
      if (soundId === "default") { beep(880,0,0.08); beep(660,0.15,0.08); beep(1100,0.35,0.2); }
      else if (soundId === "mechanical") { [0,0.12,0.24].forEach(d=>beep(2200+Math.random()*200,d,0.04,0.15)); beep(3000,0.45,0.06,0.2); }
      else if (soundId === "typewriter") { [0,0.1,0.2].forEach(d=>beep(1800,d,0.03,0.2)); beep(2400,0.4,0.12,0.25); }
      else if (soundId === "soft") { beep(660,0,0.15,0.15); beep(440,0.2,0.12,0.1); beep(880,0.4,0.3,0.2); }
      else if (soundId === "arcade") { beep(220,0,0.05); beep(440,0.08,0.05); [0,0.15,0.3,0.45].forEach((d,i)=>beep(220+i*110,0.5+d,0.08)); }
      else if (soundId === "nature") { beep(1200,0,0.2,0.15); beep(900,0.3,0.15,0.1); beep(1600,0.55,0.4,0.18); }
    } catch(e) {}
  };
  const router = useRouter();
  const [user, setUser]               = useState(null);
  const [profiles, setProfiles]       = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [tab, setTab]                 = useState("themes"); // "themes" | "fonts" | "sounds"
  const [catFilter, setCatFilter]     = useState("all");
  const [msg, setMsg]                 = useState("");
  const [loading, setLoading]         = useState(true);
  // Purchase confirmation dialog: { label, cost, onConfirm } | null
  const [confirmPurchase, setConfirmPurchase] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { router.push("/game"); return; }
      setUser(u);
      const ps = await getProfiles(u.uid);
      setProfiles(ps);
      // Try to restore last active profile
      const last = localStorage.getItem(`ak_lastProfile_${u.uid}`);
      const p = ps.find(x => x.id === last) || ps[0];
      if (p) setActiveProfile(p);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Load all font previews
  useEffect(() => { ALL_FONTS.forEach(loadFont); }, []);

  const showMsg = m => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  // ─── Trial system ───────────────────────────────────────────────────────────
  const [trial, setTrial] = useState(null);
  const [trialSecondsLeft, setTrialSecondsLeft] = useState(0);
  const trialTimerRef = useRef(null);
  const TRIAL_SECONDS = 30;
  const MAX_TRIALS = 5; // per week

  const getWeekKey = () => {
    const d=new Date(),jan1=new Date(d.getFullYear(),0,1);
    return `${d.getFullYear()}-w${Math.ceil((((d-jan1)/86400000)+jan1.getDay()+1)/7)}`;
  };
  const getTrialUsage = () => {
    try {
      const weekKey = getWeekKey();
      // Check localStorage usage this week
      const raw = localStorage.getItem("ak_trials");
      const local = raw ? JSON.parse(raw) : {};
      const localUsed = local.week === weekKey ? (local.count || 0) : 0;
      // Check if admin granted extra trials (stored on profile)
      const adminWeek = activeProfile?.trialWeek;
      const adminCount = activeProfile?.trialCount;
      const adminRemaining = adminWeek === weekKey && adminCount > 0 ? adminCount : 0;
      // Effective max = base MAX_TRIALS + admin bonus
      const effectiveMax = MAX_TRIALS + adminRemaining;
      return { count: localUsed, week: weekKey, max: effectiveMax };
    } catch { return { count: 0, week: getWeekKey(), max: MAX_TRIALS }; }
  };

  const startTrial = (themeId, fontId) => {
    // If trial already running, allow swapping theme OR font within same trial
    if (trial) {
      const newT = {
        ...trial,
        themeId: themeId || trial.themeId,
        fontId:  fontId  || trial.fontId,
      };
      setTrial(newT);
      if (themeId) setActiveProfile(p => p ? {...p, activeTheme: themeId} : p);
      if (fontId)  setActiveProfile(p => p ? {...p, activeFont: fontId}  : p);
      showMsg(`Swapped ${themeId ? "theme" : "font"} — ${trialSecondsLeft}s left`);
      return;
    }
    const usage = getTrialUsage();
    if (usage.count >= usage.max) { showMsg(`Trial limit reached (${usage.max}/week)`); return; }
    localStorage.setItem("ak_trials", JSON.stringify({ week: usage.week, count: usage.count + 1 }));
    const prevTheme = activeProfile?.activeTheme || "dark";
    const prevFont  = activeProfile?.activeFont  || "jetbrains";
    const t = { themeId: themeId || prevTheme, fontId: fontId || prevFont, prevTheme, prevFont };
    setTrial(t);
    setTrialSecondsLeft(TRIAL_SECONDS);
    if (themeId) setActiveProfile(p => p ? {...p, activeTheme: themeId} : p);
    if (fontId)  setActiveProfile(p => p ? {...p, activeFont: fontId}  : p);
    showMsg(`⏱ ${TRIAL_SECONDS}s trial! (${usage.max - usage.count - 1} left this week)`);
    if (trialTimerRef.current) clearInterval(trialTimerRef.current);
    trialTimerRef.current = setInterval(() => {
      setTrialSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(trialTimerRef.current);
          setTrial(prev => { if(prev) { setActiveProfile(p => p ? {...p, activeTheme: prev.prevTheme, activeFont: prev.prevFont} : p); } return null; });
          setTrialSecondsLeft(0);
          setMsg("⏱ Trial ended — reverted");
          setTimeout(() => setMsg(""), 2500);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const cancelTrial = () => {
    if (!trial) return;
    clearInterval(trialTimerRef.current);
    setActiveProfile(p => p ? {...p, activeTheme: trial.prevTheme, activeFont: trial.prevFont} : p);
    setTrial(null); setTrialSecondsLeft(0);
    showMsg("Trial cancelled");
  };

  useEffect(() => () => { if (trialTimerRef.current) clearInterval(trialTimerRef.current); }, []);

  // Optimistic update helper — updates UI instantly, syncs to Firestore in background
  const optimistic = (patch) => {
    setActiveProfile(p => ({ ...p, ...patch }));
  };

  const handleBuyTheme = async (th) => {
    if (!activeProfile) return;
    const newKeys = (activeProfile.keys || 0) - th.cost;
    if (newKeys < 0) { showMsg("Not enough Keys"); return; }
    // Instant UI update
    optimistic({ keys: newKeys, ownedThemes: [...(activeProfile.ownedThemes || []), th.id] });
    showMsg(`${th.label} unlocked! 🎉`);
    try {
      await purchaseTheme(user.uid, activeProfile.id, th.id, th.cost);
    } catch(e) {
      // Revert if Firestore says no
      optimistic({ keys: activeProfile.keys, ownedThemes: activeProfile.ownedThemes });
      showMsg("Not enough Keys");
    }
  };

  // Opens the confirmation dialog before spending Keys on a theme
  const requestBuyTheme = (th) => {
    if (!activeProfile) return;
    setConfirmPurchase({ label: th.label, cost: th.cost, onConfirm: () => handleBuyTheme(th) });
  };

  const handleEquipTheme = async (th) => {
    if (!activeProfile) return;
    optimistic({ activeTheme: th.id });
    showMsg(`${th.label} equipped!`);
    setActiveTheme(user.uid, activeProfile.id, th.id); // fire and forget
  };

  const handleBuyFont = async (f) => {
    if (!activeProfile) return;
    const newKeys = (activeProfile.keys || 0) - f.cost;
    if (newKeys < 0) { showMsg("Not enough Keys"); return; }
    optimistic({ keys: newKeys, ownedFonts: [...(activeProfile.ownedFonts || []), f.id] });
    showMsg(`${f.label} unlocked! 🎉`);
    try {
      await purchaseFont(user.uid, activeProfile.id, f.id, f.cost);
    } catch(e) {
      optimistic({ keys: activeProfile.keys, ownedFonts: activeProfile.ownedFonts });
      showMsg("Not enough Keys");
    }
  };

  // Opens the confirmation dialog before spending Keys on a font
  const requestBuyFont = (f) => {
    if (!activeProfile) return;
    setConfirmPurchase({ label: f.label, cost: f.cost, onConfirm: () => handleBuyFont(f) });
  };

  const handleEquipFont = async (f) => {
    if (!activeProfile) return;
    optimistic({ activeFont: f.id });
    showMsg(`${f.label} equipped!`);
    setActiveFont(user.uid, activeProfile.id, f.id); // fire and forget
  };

  const keys       = activeProfile?.keys || 0;
  const ownedThemes = activeProfile?.ownedThemes || [];
  const ownedFonts  = activeProfile?.ownedFonts  || [];
  const activeTheme = activeProfile?.activeTheme  || "dark";
  const activeFont  = activeProfile?.activeFont   || "jetbrains";

  // Get current theme colors for the UI
  const T = ALL_THEMES.find(t => t.id === activeTheme) || ALL_THEMES[0];

  const items = tab === "themes"
    ? ALL_THEMES.filter(t => catFilter === "all" || t.category === catFilter)
    : ALL_FONTS.filter(f => catFilter === "all" || f.category === catFilter);

  const cats = tab === "themes" ? CATEGORIES_THEMES : tab === "fonts" ? CATEGORIES_FONTS : [];

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",color:"#7c6af7",fontFamily:"monospace",fontSize:16}}>
      Loading shop...
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'JetBrains Mono',monospace",transition:"background 0.3s"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:`1px solid ${T.border}`,background:T.card,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <Link href="/game" style={{color:T.muted,textDecoration:"none",fontSize:13}}>← Back</Link>
          <span style={{color:T.text,fontWeight:700,fontSize:18}}>🛍️ Shop</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {/* Profile switcher */}
          <select value={activeProfile?.id||""} onChange={async e=>{
            const p = profiles.find(x=>x.id===e.target.value);
            if(p) setActiveProfile(p);
          }} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:6,padding:"4px 8px",fontSize:12,fontFamily:"inherit"}}>
            {profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <span style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 12px",fontSize:13,color:T.accent,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5}}>
            <KKey size={13}/> {formatKeys(keys)}
          </span>
        </div>
      </div>

      {/* Toast */}
      {msg && <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:T.purple,color:"#fff",padding:"8px 20px",borderRadius:20,fontSize:13,fontWeight:700,zIndex:999,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{msg}</div>}
      {/* Trial banner */}
      {trial && (
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:998,background:"#1a0a30",borderBottom:"2px solid #c084fc",padding:"8px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'JetBrains Mono',monospace"}}>
          <div style={{color:"#c084fc",fontSize:12,fontWeight:700}}>
            ⏱ TRIAL: {trialSecondsLeft}s left
            <span style={{marginLeft:12,color:"#e0e0ff"}}>Theme: {ALL_THEMES.find(t=>t.id===trial.themeId)?.label || trial.themeId}</span>
            <span style={{marginLeft:8,color:"#aaa"}}>·</span>
            <span style={{marginLeft:8,color:"#e0e0ff"}}>Font: {ALL_FONTS.find(f=>f.id===trial.fontId)?.label || trial.fontId}</span>
          </div>
          <button onClick={cancelTrial} style={{background:"none",border:"1px solid #c084fc",borderRadius:6,color:"#c084fc",fontSize:11,padding:"3px 10px",cursor:"pointer",fontFamily:"inherit"}}>End trial</button>
        </div>
      )}

      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 16px"}}>
        {/* Tab bar */}
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[["themes","🎨 Themes"],["fonts","✏️ Fonts"],["sounds","🔊 Sounds"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setTab(k);setCatFilter("all");}} style={{padding:"10px 24px",borderRadius:8,border:"none",background:tab===k?T.purple:"transparent",color:tab===k?"#fff":T.muted,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${tab===k?T.purple:T.border}`}}>
              {l}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24}}>
          {["all",...cats].map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${catFilter===c?T.accent:T.border}`,background:catFilter===c?T.accent+"22":"transparent",color:catFilter===c?T.accent:T.faint,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
              {c==="all"?"All":c}
            </button>
          ))}
        </div>

        {/* THEMES GRID */}
        {tab === "themes" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
            {items.map(th => {
              const owned  = th.cost===0 || ownedThemes.includes(th.id);
              const active = activeTheme === th.id;
              return (
                <div key={th.id} style={{background:th.bg,border:`2px solid ${active?th.purple:th.border}`,borderRadius:12,overflow:"hidden",transition:"transform 0.15s,border-color 0.2s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                  {/* Preview strip */}
                  <div style={{height:6,display:"flex"}}>
                    {th.preview.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
                  </div>
                  <div style={{padding:"12px 14px"}}>
                    <div style={{fontWeight:700,fontSize:13,color:th.text,marginBottom:2}}>{th.label}</div>
                    <div style={{fontSize:10,color:th.muted,marginBottom:8,display:"flex",alignItems:"center",gap:3}}>{th.category} · {th.cost===0?"Free":<>{th.cost} <KKey size={9}/></>}</div>
                    {/* Mini typing preview */}
                    <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:6,padding:"6px 8px",marginBottom:10,fontSize:11,letterSpacing:1,fontFamily:th.font||"'JetBrains Mono',monospace"}}>
                      <span style={{color:th.purple}}>the</span>
                      <span style={{color:th.text}}> quick</span>
                      <span style={{background:th.accent,color:"#000",borderRadius:2,padding:"0 2px"}}> b</span>
                      <span style={{color:th.muted}}>rown fox</span>
                    </div>
                    {active ? (
                      <div style={{textAlign:"center",color:th.purple,fontSize:11,fontWeight:700,padding:"5px 0",border:`1px solid ${th.purple}`,borderRadius:6}}>✓ Active</div>
                    ) : owned ? (
                      <button onClick={()=>handleEquipTheme(th)} style={{width:"100%",padding:"6px 0",background:"transparent",border:`1px solid ${th.purple}`,borderRadius:6,color:th.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        Equip
                      </button>
                    ) : (
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>requestBuyTheme(th)} style={{flex:1,padding:"6px 0",background:th.purple+"22",border:`1px solid ${th.purple}`,borderRadius:6,color:th.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                          Buy {th.cost} <KKey size={10}/>
                        </button>
                        {th.cost > 0 && <button onClick={()=>startTrial(th.id, null)} style={{padding:"6px 8px",background:"transparent",border:`1px solid ${th.border}`,borderRadius:6,color:th.muted,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} title={trial ? "Swap theme in current trial" : "Try for 30s"}>Try</button>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FONTS GRID */}
        {tab === "fonts" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
            {items.map(f => {
              const owned  = f.cost===0 || ownedFonts.includes(f.id);
              const active = activeFont === f.id;
              return (
                <div key={f.id} style={{background:T.card,border:`2px solid ${active?T.purple:T.border}`,borderRadius:12,padding:"14px 16px",transition:"transform 0.15s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                  <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:2}}>{f.label}</div>
                  <div style={{fontSize:10,color:T.muted,marginBottom:10,display:"flex",alignItems:"center",gap:3}}>{f.category} · {f.cost===0?"Free":<>{f.cost} <KKey size={9}/></>}</div>
                  {/* Font preview */}
                  <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:"8px 10px",marginBottom:10}}>
                    <div style={{fontFamily:f.css,fontSize:15,color:T.text,letterSpacing:0.5,marginBottom:4}}>{f.preview}</div>
                    <div style={{fontFamily:f.css,fontSize:11,color:T.muted}}>the quick brown fox</div>
                  </div>
                  {active ? (
                    <div style={{textAlign:"center",color:T.purple,fontSize:11,fontWeight:700,padding:"5px 0",border:`1px solid ${T.purple}`,borderRadius:6}}>✓ Active</div>
                  ) : owned ? (
                    <button onClick={()=>handleEquipFont(f)} style={{width:"100%",padding:"6px 0",background:"transparent",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      Equip
                    </button>
                  ) : (
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>requestBuyFont(f)} style={{flex:1,padding:"6px 0",background:T.purple+"22",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                        Buy {f.cost} <KKey size={10}/>
                      </button>
                      {f.cost > 0 && <button onClick={()=>startTrial(null, f.id)} style={{padding:"6px 8px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} title={trial ? "Swap theme in current trial" : "Try for 30s"}>Try</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* SOUND THEMES GRID */}
        {tab === "sounds" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
            {SOUND_THEMES.map(s => {
              const owned = s.cost===0 || (activeProfile?.ownedSounds||[]).includes(s.id);
              const active = (activeProfile?.activeSound||"default") === s.id;
              const handleEquip = async () => {
                patchProfile({activeSound:s.id});
                try { await updateProfile(user.uid, activeProfile.id, {activeSound:s.id}); showMsg(`${s.label} sound equipped!`); }
                catch(e){ showMsg("Error equipping"); }
              };
              const handleBuy = async () => {
                const newKeys = (activeProfile.keys||0) - s.cost;
                if(newKeys < 0){ showMsg("Not enough Keys"); return; }
                patchProfile({keys:newKeys, ownedSounds:[...(activeProfile.ownedSounds||[]),s.id], activeSound:s.id});
                showMsg(`${s.label} purchased!`);
                try { await updateProfile(user.uid, activeProfile.id, {keys:newKeys, ownedSounds:[...(activeProfile.ownedSounds||[]),s.id], activeSound:s.id}); }
                catch(e){ showMsg("Error purchasing"); }
              };
              const requestBuy = () => setConfirmPurchase({ label: s.label, cost: s.cost, onConfirm: handleBuy });
              return (
                <div key={s.id} style={{background:T.card,border:`2px solid ${active?T.purple:T.border}`,borderRadius:12,padding:"16px",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:32,textAlign:"center"}}>{s.emoji}</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontWeight:700,fontSize:14,color:T.text}}>{s.label}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:3}}>{s.desc}</div>
                    <div style={{fontSize:11,color:T.faint,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>{s.cost===0?"Free":<>{s.cost} <KKey size={9}/></>}</div>
                  </div>
                  <button onClick={()=>previewSound(s.id)} style={{padding:"5px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>▶ Preview</button>
                  {active ? (
                    <div style={{textAlign:"center",color:T.purple,fontSize:11,fontWeight:700,padding:"6px",border:`1px solid ${T.purple}`,borderRadius:6}}>✓ Active</div>
                  ) : owned ? (
                    <button onClick={handleEquip} style={{padding:"7px",background:"transparent",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Equip</button>
                  ) : (
                    <button onClick={requestBuy} style={{padding:"7px",background:T.purple+"22",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>Buy {s.cost} <KKey size={10}/></button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase confirmation dialog */}
      {confirmPurchase && (
        <div style={{position:"fixed",inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setConfirmPurchase(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:24,width:"100%",maxWidth:340,textAlign:"center"}}>
            <div style={{color:T.text,fontWeight:700,fontSize:15,marginBottom:8}}>Confirm Purchase</div>
            <div style={{color:T.muted,fontSize:13,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
              Spend <strong style={{color:T.accent,display:"flex",alignItems:"center",gap:3}}>{confirmPurchase.cost} <KKey size={12}/></strong> on {confirmPurchase.label}?
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{ confirmPurchase.onConfirm(); setConfirmPurchase(null); }} style={{flex:1,padding:"10px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Confirm</button>
              <button onClick={()=>setConfirmPurchase(null)} style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
