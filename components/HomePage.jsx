'use client';
import { useState, useEffect } from 'react';

const LAYOUTS = [
  { flag:'🇺🇸', label:'QWERTY',   desc:'Universal standard'     },
  { flag:'🇩🇪', label:'QWERTZ',   desc:'German / Central EU'    },
  { flag:'🇫🇷', label:'AZERTY',   desc:'French standard'        },
  { flag:'🇬🇧', label:'Colemak',  desc:'Optimized for English'  },
  { flag:'⌨️',  label:'Dvorak',   desc:'Finger-travel minimized'},
  { flag:'💪',  label:'Workman',  desc:'Comfort-focused'        },
  { flag:'🔡',  label:'Norman',   desc:'QWERTY-friendly alt'    },
  { flag:'🔬',  label:'Halmak',   desc:'Science-backed design'  },
  { flag:'🇩🇪²',label:'Neo 2',    desc:'German ergonomic'       },
  { flag:'🤚',  label:'Dvorak L', desc:'Left-hand Dvorak'       },
];

const LEVELS_PREVIEW = [
  { id:1,  emoji:'🏠', name:'Home Row Hero',     color:'#10b981' },
  { id:2,  emoji:'🧗', name:'Top Row Climber',   color:'#3b82f6' },
  { id:3,  emoji:'⌨️', name:'Full Board Basics', color:'#8b5cf6' },
  { id:4,  emoji:'🔨', name:'Word Builder',      color:'#f59e0b' },
  { id:5,  emoji:'🚀', name:'Speed Seeker',      color:'#ef4444' },
  { id:6,  emoji:'🎵', name:'Rhythm Rider',      color:'#06b6d4' },
  { id:10, emoji:'🔥', name:'Turbo Typist',      color:'#ef4444' },
  { id:15, emoji:'🏆', name:'Legend',            color:'#fbbf24' },
];

const FINGER_COLORS = {
  Q:'#a78bfa',A:'#a78bfa',Z:'#a78bfa',
  W:'#60a5fa',S:'#60a5fa',X:'#60a5fa',
  E:'#34d399',D:'#34d399',C:'#34d399',
  R:'#fbbf24',F:'#fbbf24',V:'#fbbf24',T:'#fbbf24',G:'#fbbf24',B:'#fbbf24',
  Y:'#fb923c',H:'#fb923c',N:'#fb923c',U:'#fb923c',J:'#fb923c',M:'#fb923c',
  I:'#34d399',K:'#34d399',
  O:'#60a5fa',L:'#60a5fa',
  P:'#a78bfa',
};
const HOME_KEYS = ['A','S','D','F','J','K','L'];
const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [profileName, setProfileName] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 60);
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("ak_uid");
      const profile = localStorage.getItem("ak_profileName");
      // Auto-redirect if already logged in with a profile selected
      if (uid && profile) {
        window.location.href = "/game";
        return;
      }
      setProfileName(profile || null);
      setUsername(localStorage.getItem("ak_username") || null);
    }
  }, []);

  const C = {
    bg:'#0a0a0f', card:'#13131e', border:'#1e1e2e',
    purple:'#7c6af7', text:'#e0e0ff', muted:'#6b7280',
    faint:'#4b5563', accent:'#34d399', accent2:'#fb923c',
    font:'"JetBrains Mono","Fira Code",monospace',
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:C.font, overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .fi{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease}
        .fi.v{opacity:1;transform:translateY(0)}
        .card{background:#13131e;border:1px solid #1e1e2e;border-radius:14px;transition:border-color .2s,transform .2s}
        .card:hover{border-color:#7c6af744;transform:translateY(-2px)}
        .cta{background:#7c6af7;color:#fff;border:none;border-radius:12px;padding:16px 44px;font-size:17px;font-family:"JetBrains Mono",monospace;font-weight:800;cursor:pointer;letter-spacing:.04em;transition:all .2s}
        .cta:hover{background:#6655e0;transform:translateY(-2px);box-shadow:0 8px 30px #7c6af755}
        .cta-ghost{background:transparent;color:#e0e0ff;border:1px solid #2a2a3e;border-radius:12px;padding:15px 32px;font-size:16px;font-family:"JetBrains Mono",monospace;font-weight:700;cursor:pointer;transition:all .2s}
        .cta-ghost:hover{border-color:#7c6af7;color:#a89bff}
        .key{display:inline-flex;align-items:center;justify-content:center;border-radius:6px;font-size:11px;font-weight:700;margin:2px;min-width:32px;height:32px;padding:0 6px;border-bottom-width:3px;border-style:solid;position:relative}
        .bump::after{content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.5)}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0a0a0f}::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:3px}
        .tab{padding:8px 18px;border-radius:8px;border:1px solid transparent;cursor:pointer;font-family:"JetBrains Mono",monospace;font-size:13px;font-weight:700;transition:all .2s}
        .tab.on{background:#7c6af722;border-color:#7c6af7;color:#c4baff}
        .tab.off{background:transparent;color:#555;border-color:#1e1e2e}
        .tab.off:hover{color:#999;border-color:#2a2a3e}
        .lv{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;border:1px solid #1e1e2e;background:#0d0d18;transition:all .15s}
        .lv:hover{border-color:#7c6af744;background:#101028}
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom:`1px solid ${C.border}`, padding:'0 5%', position:'sticky', top:0, background:C.bg+'ee', backdropFilter:'blur(12px)', zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
          <span style={{ fontWeight:800, fontSize:18 }}>
            <span style={{ color:C.purple }}>Accurat</span>Key
          </span>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {profileName ? (
              <>
                <a href="/game" style={{ color:'#a89bff', fontSize:13, textDecoration:'none' }}>{username ? `@${username}` : profileName}</a>
                <a href="/game?signout=1" onClick={() => { if(typeof window!=="undefined"){localStorage.removeItem("ak_profileName");localStorage.removeItem("ak_uid");} }}>
                  <button className="cta-ghost" style={{ padding:'9px 22px', fontSize:14 }}>Sign out</button>
                </a>
              </>
            ) : (
              <>
                <a href="/game?auth=1"><button className="cta-ghost" style={{ padding:'9px 22px', fontSize:14 }}>Sign in</button></a>
                <a href="/game"><button className="cta" style={{ padding:'9px 22px', fontSize:14 }}>Get started</button></a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'80px 5% 60px', textAlign:'center' }}>
        <div className={`fi ${visible ? 'v' : ''}`}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.card, border:`1px solid ${C.border}`, borderRadius:100, padding:'6px 16px', fontSize:13, color:'#a89bff', marginBottom:28 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:C.purple, display:'inline-block' }} />
            170 levels · 10 layouts · age-adaptive
          </div>
          <h1 style={{ fontSize:'clamp(40px,7vw,78px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-.04em', marginBottom:22 }}>
            Learn to type<br /><span style={{ color:C.purple }}>the right way.</span>
          </h1>
          <p style={{ fontSize:18, color:C.muted, maxWidth:540, lineHeight:1.65, margin:'0 auto 40px', fontFamily:"'Space Grotesk',sans-serif" }}>
            Level-based keyboard training. Earn Keys, unlock levels, and build real speed — for all ages.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/game"><button className="cta">START TYPING →</button></a>
            <a href="#how"><button className="cta-ghost">How it works</button></a>
          </div>
        </div>

        {/* Keyboard visual */}
        <div className={`fi ${visible ? 'v' : ''}`} style={{ transitionDelay:'140ms', marginTop:56, userSelect:'none' }}>
          <div style={{ background:'#0f0f1a', border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 22px', display:'inline-block' }}>
            {KB_ROWS.map((row, ri) => (
              <div key={ri} style={{ display:'flex', justifyContent:'center', marginLeft: ri===1?8:ri===2?16:0 }}>
                {row.map(k => {
                  const c = FINGER_COLORS[k] || '#2a2a40';
                  return <span key={k} className={`key${HOME_KEYS.includes(k) ? ' bump' : ''}`} style={{ background:c+'22', borderColor:c+'55', borderBottomColor:c+'44', color:c }}>{k}</span>;
                })}
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'center', marginTop:4 }}>
              <span style={{ background:'#181828', border:'1px solid #2a2a3e', borderBottom:'3px solid #111', borderRadius:6, padding:'4px 90px', fontSize:10, color:C.faint }}>SPACE</span>
            </div>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'6px 20px', marginTop:14 }}>
            {[['Pinky','#a78bfa'],['Ring','#60a5fa'],['Middle','#34d399'],['L-Index','#fbbf24'],['R-Index','#fb923c']].map(([l,c]) => (
              <span key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.faint, fontFamily:"'Space Grotesk',sans-serif" }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 5% 70px' }}>
        <div className={`fi ${visible ? 'v' : ''}`} style={{ transitionDelay:'200ms', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[['15','Levels to unlock'],['10','Keyboard layouts'],['K','Earn Keys as you go'],['🎂','Age-adaptive UI']].map(([v,l]) => (
            <div key={l} style={{ background:'#0f0f1a', border:`1px solid ${C.border}`, borderRadius:12, padding:'20px 16px', textAlign:'center' }}>
              <div style={{ fontSize:26, fontWeight:800, color:C.purple, marginBottom:4 }}>{v}</div>
              <div style={{ fontSize:13, color:C.muted, fontFamily:"'Space Grotesk',sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="how" style={{ maxWidth:1100, margin:'0 auto', padding:'0 5% 80px' }}>
        <div className={`fi ${visible ? 'v' : ''}`} style={{ transitionDelay:'240ms' }}>
          <h2 style={{ fontSize:32, fontWeight:800, letterSpacing:'-.03em', marginBottom:8 }}>How it works</h2>
          <p style={{ color:C.muted, fontSize:15, marginBottom:36, fontFamily:"'Space Grotesk',sans-serif" }}>Four steps to typing mastery.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
            {[
              ['1','Pick your level','Choose your starting level and keyboard layout. Jump straight in.','#7c6af7'],
              ['2','Play through levels','Complete levels to unlock the next. Each level gets faster and harder.','#34d399'],
              ['3','Earn Keys','Finish a level and earn Keys. Better WPM = more Keys. Try to beat your own record.','#fb923c'],
              ['4','Level up automatically','The app tracks your age and progress. Your difficulty adapts as you improve.','#3b82f6'],
            ].map(([n,title,desc,c]) => (
              <div key={n} className="card" style={{ padding:'22px' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:c+'22', border:`2px solid ${c}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:c, marginBottom:14 }}>{n}</div>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>{title}</div>
                <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, fontFamily:"'Space Grotesk',sans-serif" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Levels preview ──────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 5% 80px' }}>
        <div className={`fi ${visible ? 'v' : ''}`} style={{ transitionDelay:'280ms' }}>
          <h2 style={{ fontSize:32, fontWeight:800, letterSpacing:'-.03em', marginBottom:8 }}>170 levels to conquer</h2>
          <p style={{ color:C.muted, fontSize:15, marginBottom:28, fontFamily:"'Space Grotesk',sans-serif" }}>Start at Home Row Hero and work your way up to Legend.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
            {LEVELS_PREVIEW.map(lv => (
              <div key={lv.id} className="lv">
                <span style={{ fontSize:22 }}>{lv.emoji}</span>
                <div>
                  <div style={{ fontSize:11, color:C.faint, marginBottom:1 }}>LEVEL {lv.id}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{lv.name}</div>
                </div>
                <div style={{ marginLeft:'auto', width:8, height:8, borderRadius:'50%', background:lv.color, flexShrink:0 }} />
              </div>
            ))}
            <div className="lv" style={{ border:`1px dashed ${C.border}`, background:'transparent' }}>
              <span style={{ fontSize:22 }}>✨</span>
              <div>
                <div style={{ fontSize:11, color:C.faint, marginBottom:1 }}>LEVELS 7–9</div>
                <div style={{ fontSize:14, fontWeight:700, color:C.faint }}>& more inside…</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Layouts ─────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 5% 80px' }}>
        <div className={`fi ${visible ? 'v' : ''}`} style={{ transitionDelay:'320ms' }}>
          <h2 style={{ fontSize:32, fontWeight:800, letterSpacing:'-.03em', marginBottom:8 }}>10 keyboard layouts</h2>
          <p style={{ color:C.muted, fontSize:15, marginBottom:28, fontFamily:"'Space Grotesk',sans-serif" }}>Train on the layout you actually use.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:10 }}>
            {LAYOUTS.map(l => (
              <div key={l.label} className="card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>{l.flag}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{l.label}</div>
                  <div style={{ fontSize:12, color:C.faint, fontFamily:"'Space Grotesk',sans-serif" }}>{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ borderTop:`1px solid ${C.border}`, padding:'80px 5%', textAlign:'center' }}>
        <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:'-.03em', marginBottom:12 }}>Ready to start?</h2>
        <p style={{ color:C.muted, fontSize:16, marginBottom:36, fontFamily:"'Space Grotesk',sans-serif" }}>Start practicing today.</p>
        <a href="/game"><button className="cta" style={{ fontSize:18, padding:'18px 52px' }}>START TYPING →</button></a>
      </section>

      <footer style={{ borderTop:`1px solid ${C.border}`, padding:'22px 5%', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:C.faint }}><span style={{ color:C.purple }}>Accurat</span>Key</span>
        <span style={{ fontSize:12, color:C.faint, fontFamily:"'Space Grotesk',sans-serif" }}>Built with Next.js</span>
      </footer>
    </div>
  );
}
