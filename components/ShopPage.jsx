"use client";
import { useState, useEffect } from "react";
import { auth, getProfile, getProfiles, purchaseTheme, setActiveTheme, purchaseFont, setActiveFont, isProfileRestricted, updateProfileLocal } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function ShopPage() {
  const router = useRouter();
  const [user, setUser]               = useState(null);
  const [profiles, setProfiles]       = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [tab, setTab]                 = useState("themes"); // "themes" | "fonts"
  const [catFilter, setCatFilter]     = useState("all");
  const [msg, setMsg]                 = useState("");
  const [loading, setLoading]         = useState(true);

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

  const handleBuyTheme = async (th) => {
    if (!activeProfile) return;
    // Restricted (under-13) profiles never write to the real account doc -
    // same pattern used everywhere else in the app for COPPA compliance.
    // purchaseTheme no longer accepts a cost parameter - the real price is
    // looked up server-side now, closing the price-tampering gap this file
    // had when it was first built.
    try {
      if (isProfileRestricted(activeProfile)) {
        const newKeys = (activeProfile.keys||0) - th.cost;
        if (newKeys < 0) { showMsg("Not enough 🔑 Keys"); return; }
        updateProfileLocal(activeProfile.id, activeProfile, { keys:newKeys, ownedThemes:[...(activeProfile.ownedThemes||[]), th.id], activeTheme: th.id });
        setActiveProfile({ ...activeProfile, keys:newKeys, ownedThemes:[...(activeProfile.ownedThemes||[]), th.id], activeTheme: th.id });
      } else {
        await purchaseTheme(user.uid, activeProfile.id, th.id);
        const fresh = await (await import("@/lib/firebase")).getProfile(user.uid, activeProfile.id);
        setActiveProfile(fresh);
      }
      showMsg(`${th.label} unlocked! 🎉`);
    } catch(e) { showMsg(e.message || "Not enough 🔑 Keys"); }
  };

  const handleEquipTheme = async (th) => {
    if (!activeProfile) return;
    await setActiveTheme(user.uid, activeProfile.id, th.id);
    const fresh = await (await import("@/lib/firebase")).getProfile(user.uid, activeProfile.id);
    setActiveProfile(fresh);
    showMsg(`${th.label} equipped!`);
  };

  const handleBuyFont = async (f) => {
    if (!activeProfile) return;
    try {
      if (isProfileRestricted(activeProfile)) {
        const newKeys = (activeProfile.keys||0) - f.cost;
        if (newKeys < 0) { showMsg("Not enough 🔑 Keys"); return; }
        updateProfileLocal(activeProfile.id, activeProfile, { keys:newKeys, ownedFonts:[...(activeProfile.ownedFonts||[]), f.id], activeFont: f.id });
        setActiveProfile({ ...activeProfile, keys:newKeys, ownedFonts:[...(activeProfile.ownedFonts||[]), f.id], activeFont: f.id });
      } else {
        await purchaseFont(user.uid, activeProfile.id, f.id);
        const fresh = await (await import("@/lib/firebase")).getProfile(user.uid, activeProfile.id);
        setActiveProfile(fresh);
      }
      showMsg(`${f.label} unlocked! 🎉`);
    } catch(e) { showMsg(e.message || "Not enough 🔑 Keys"); }
  };

  const handleEquipFont = async (f) => {
    if (!activeProfile) return;
    await setActiveFont(user.uid, activeProfile.id, f.id);
    const fresh = await (await import("@/lib/firebase")).getProfile(user.uid, activeProfile.id);
    setActiveProfile(fresh);
    showMsg(`${f.label} equipped!`);
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

  const cats = tab === "themes" ? CATEGORIES_THEMES : CATEGORIES_FONTS;

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
          <span style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 12px",fontSize:13,color:T.accent,fontWeight:700}}>
            🔑 {keys >= 1e6 ? Math.round(keys/1e6)+"M" : keys >= 1e3 ? Math.round(keys/1e3)+"k" : keys}
          </span>
        </div>
      </div>

      {/* Toast */}
      {msg && <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:T.purple,color:"#fff",padding:"8px 20px",borderRadius:20,fontSize:13,fontWeight:700,zIndex:999,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{msg}</div>}

      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 16px"}}>
        {/* Tab bar */}
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[["themes","🎨 Themes"],["fonts","✏️ Fonts"]].map(([k,l])=>(
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
                    <div style={{fontSize:10,color:th.muted,marginBottom:8}}>{th.category} · {th.cost===0?"Free":`${th.cost} 🔑`}</div>
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
                      <button onClick={()=>handleBuyTheme(th)} style={{width:"100%",padding:"6px 0",background:th.purple+"22",border:`1px solid ${th.purple}`,borderRadius:6,color:th.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        Buy {th.cost} 🔑
                      </button>
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
                  <div style={{fontSize:10,color:T.muted,marginBottom:10}}>{f.category} · {f.cost===0?"Free":`${f.cost} 🔑`}</div>
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
                    <button onClick={()=>handleBuyFont(f)} style={{width:"100%",padding:"6px 0",background:T.purple+"22",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      Buy {f.cost} 🔑
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
