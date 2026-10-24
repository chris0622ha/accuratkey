'use client';
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "@fontsource/jetbrains-mono/latin-800.css";
import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import LogoMark from "@/components/LogoMark";
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
  { id:7,  emoji:'🌊', name:'Flow State',        color:'#14b8a6' },
  { id:8,  emoji:'🤲', name:'Steady Hands',      color:'#a78bfa' },
  { id:9,  emoji:'🎯', name:'The Zone',          color:'#f472b6' },
  { id:10, emoji:'🔥', name:'Turbo Typist',      color:'#ef4444' },
  { id:11, emoji:'🎓', name:'Precision Pro',     color:'#fbbf24' },
];

const FEATURES = [
  { icon:'📈', t:'180 levels', d:'A real curriculum from home row to long passages. Pass each level on speed and accuracy to unlock the next.', c:'#34d399' },
  { icon:'🎮', t:'32 typing games', d:'Arcade, memory, puzzle, speed and spelling games. Every one builds a different skill.', c:'#f59e0b' },
  { icon:'📅', t:'Daily Challenge', d:'Everyone types the same words each day. Keep your streak alive and climb the leaderboard.', c:'#f472b6' },
  { icon:'🔑', t:'Keys & Shop', d:'Earn Keys for every session, then spend them on themes, fonts and sound packs.', c:'#fb923c' },
  { icon:'👥', t:'Friends & duels', d:'Add friends, send challenges and compare streaks. Optional, and off for kids.', c:'#a78bfa' },
  { icon:'🧰', t:'Practice Lab', d:'Drills, warm-ups, a keyboard heat map, common-slip tracking, focus sounds and goals.', c:'#14b8a6' },
  { icon:'🧩', t:'Community word sets', d:'Make your own word lists. Every set is checked before it goes public.', c:'#60a5fa' },
  { icon:'🛡️', t:'Built for families', d:'No ads and no tracking cookies. Under-13 profiles stay private and local to the device.', c:'#94a3b8' },
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


const DEMO = ['accurate','steady','rhythm','focus','precise','flow'];

function TypingDemo({ C }) {
  const [w, setW] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const word = DEMO[w % DEMO.length];
    const id = setTimeout(() => {
      if (n < word.length) setN(n + 1);
      else { setW(w + 1); setN(0); }
    }, n < word.length ? 150 : 900);
    return () => clearTimeout(id);
  }, [n, w]);
  const word = DEMO[w % DEMO.length];
  return (
    <div aria-hidden style={{ background:'#0f0f1a', border:`1px solid ${C.border}`, borderRadius:16, padding:'22px 26px', maxWidth:420, margin:'0 auto', textAlign:'left' }}>
      <div style={{ fontSize:11, color:C.faint, marginBottom:10, letterSpacing:2 }}>LEVEL 1 · HOME ROW HERO</div>
      <div style={{ fontSize:34, fontWeight:800, letterSpacing:'.08em', minHeight:46 }}>
        <span style={{ color:C.accent }}>{word.slice(0, n)}</span><span style={{ color:'#3a3a55' }}>{word.slice(n)}</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:14, fontSize:12, color:C.muted }}>
        <span>No Backspace. Every key counts.</span><span style={{ color:C.accent }}>100% accuracy</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [visible, setVisible] = useState(false);
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
    purple:'#7c6af7', text:'#e0e0ff', muted:'#8b8ba7',
    faint:'#5b5b78', accent:'#34d399', accent2:'#fb923c',
    font:'"JetBrains Mono","Fira Code",monospace',
  };
  const fi = (d=0) => ({ className:`fi ${visible ? 'v' : ''}`, style:{ transitionDelay:`${d}ms` } });
  const wrap = { maxWidth:1100, margin:'0 auto', padding:'0 5%' };
  const h2 = { fontSize:'clamp(26px,4vw,34px)', fontWeight:800, letterSpacing:'-.03em', marginBottom:8 };
  const sub = { color:C.muted, fontSize:15, marginBottom:30, fontFamily:"'Space Grotesk',sans-serif" };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:C.font, overflowX:'hidden' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit}
        .fi{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease}
        .fi.v{opacity:1;transform:translateY(0)}
        .card{background:#13131e;border:1px solid #1e1e2e;border-radius:16px;transition:border-color .2s,transform .2s}
        .card:hover{border-color:#7c6af766;transform:translateY(-2px)}
        .cta{background:#7c6af7;color:#fff;border:none;border-radius:12px;padding:16px 44px;font-size:17px;font-family:"JetBrains Mono",monospace;font-weight:800;cursor:pointer;letter-spacing:.04em;transition:all .2s}
        .cta:hover{background:#6655e0;transform:translateY(-2px);box-shadow:0 8px 30px #7c6af755}
        .cta-ghost{background:transparent;color:#e0e0ff;border:1px solid #2a2a3e;border-radius:12px;padding:15px 32px;font-size:16px;font-family:"JetBrains Mono",monospace;font-weight:700;cursor:pointer;transition:all .2s}
        .cta-ghost:hover{border-color:#7c6af7;color:#a89bff}
        .key{display:inline-flex;align-items:center;justify-content:center;border-radius:6px;font-size:11px;font-weight:700;margin:2px;min-width:30px;height:30px;padding:0 6px;border-bottom-width:3px;border-style:solid;position:relative}
        .bump::after{content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.5)}
        html{scroll-behavior:smooth}
        .lv{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;border:1px solid #1e1e2e;background:#0d0d18;transition:all .15s}
        .lv:hover{border-color:#7c6af744;background:#101028}
        .navl{color:#8b8ba7;text-decoration:none;font-size:13px}
        .navl:hover{color:#e0e0ff}
        @media (max-width:640px){.navl{display:none}.stats{grid-template-columns:repeat(2,1fr)!important}}
        @media (prefers-reduced-motion:reduce){.fi{transition:none;opacity:1;transform:none}}
      `}</style>

      <nav style={{ borderBottom:`1px solid ${C.border}`, padding:'0 5%', position:'sticky', top:0, background:C.bg+'ee', backdropFilter:'blur(12px)', zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:60, gap:16 }}>
          <span style={{ fontWeight:800, fontSize:18, display:'inline-flex', alignItems:'center' }}><LogoMark size={28} /><span style={{ color:C.purple }}>Accurat</span>Key</span>
          <div style={{ display:'flex', gap:22, alignItems:'center' }}>
            <a className="navl" href="#features">Features</a>
            <a className="navl" href="#levels">Levels</a>
            <a className="navl" href="/help">Help</a>
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

      {/* Hero */}
      <section style={{ ...wrap, padding:'72px 5% 56px', textAlign:'center', position:'relative' }}>
        <div aria-hidden style={{ position:'absolute', left:'50%', top:-80, width:700, height:420, transform:'translateX(-50%)', background:'radial-gradient(closest-side,#7c6af733,transparent)', pointerEvents:'none' }} />
        <div {...fi()}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.card, border:`1px solid ${C.border}`, borderRadius:100, padding:'6px 16px', fontSize:13, color:'#a89bff', marginBottom:26 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:C.accent, display:'inline-block' }} />
            Free · No ads · 180 levels · 32 games
          </div>
          <h1 style={{ fontSize:'clamp(38px,7vw,74px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-.04em', marginBottom:20 }}>
            Type fast by typing<br /><span style={{ color:C.purple }}>accurately first.</span>
          </h1>
          <p style={{ fontSize:18, color:C.muted, maxWidth:580, lineHeight:1.65, margin:'0 auto 34px', fontFamily:"'Space Grotesk',sans-serif" }}>
            There is no Backspace here, so your fingers learn to hit the right key the first time. Climb 180 levels, play 32 games, and build real speed on a real keyboard. For every age.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/game"><button className="cta">START TYPING →</button></a>
            <a href="#features"><button className="cta-ghost">See what's inside</button></a>
          </div>
          <div style={{ color:C.faint, fontSize:12, marginTop:14, fontFamily:"'Space Grotesk',sans-serif" }}>No account needed to try it. Needs a physical keyboard.</div>
        </div>
        <div {...fi(140)} style={{ transitionDelay:'140ms', marginTop:44 }}><TypingDemo C={C} /></div>
      </section>

      {/* Stats */}
      <section style={{ ...wrap, paddingBottom:70 }}>
        <div {...fi(200)} className={`stats fi ${visible ? 'v' : ''}`} style={{ transitionDelay:'200ms', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[['180','Levels'],['32','Games'],['10','Keyboard layouts'],['0','Ads or trackers']].map(([v,l]) => (
            <div key={l} style={{ background:'#0f0f1a', border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 16px', textAlign:'center' }}>
              <div style={{ fontSize:30, fontWeight:800, color:C.purple, marginBottom:4 }}>{v}</div>
              <div style={{ fontSize:13, color:C.muted, fontFamily:"'Space Grotesk',sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ ...wrap, paddingBottom:80 }}>
        <div {...fi(240)}>
          <h2 style={h2}>Everything in one place</h2>
          <p style={sub}>More than a typing test. A whole practice routine.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14 }}>
            {FEATURES.map(f => (
              <div key={f.t} className="card" style={{ padding:'22px', background:`linear-gradient(160deg,${f.c}18,#13131e 60%)` }}>
                <div style={{ width:44, height:44, borderRadius:12, background:f.c+'2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14 }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{f.t}</div>
                <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, fontFamily:"'Space Grotesk',sans-serif" }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ ...wrap, paddingBottom:80 }}>
        <div {...fi(260)}>
          <h2 style={h2}>How it works</h2>
          <p style={sub}>Up and typing in a minute.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
            {[
              ['1','Connect a keyboard','Any physical keyboard works: desktop, laptop, or Bluetooth/USB on a tablet or phone.','#7c6af7'],
              ['2','Pick a profile','Play as a guest, or sign in to save progress. One account can hold a profile for everyone at home.','#34d399'],
              ['3','Pass levels, earn Keys','Hit the speed and accuracy target to unlock the next level and earn Keys.','#fb923c'],
              ['4','Keep the streak','Come back daily for the Daily Challenge and watch your stats improve.','#3b82f6'],
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

      {/* Keyboard visual */}
      <section style={{ ...wrap, paddingBottom:80, textAlign:'center' }}>
        <div {...fi(280)} style={{ userSelect:'none' }}>
          <h2 style={h2}>Learn the finger map</h2>
          <p style={sub}>Each finger owns its keys. The dots mark the home row.</p>
          <div style={{ background:'#0f0f1a', border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 22px', display:'inline-block', maxWidth:'100%', overflowX:'auto' }}>
            {KB_ROWS.map((row, ri) => (
              <div key={ri} style={{ display:'flex', justifyContent:'center', marginLeft: ri===1?8:ri===2?16:0 }}>
                {row.map(k => {
                  const c = FINGER_COLORS[k] || '#2a2a40';
                  return <span key={k} className={`key${HOME_KEYS.includes(k) ? ' bump' : ''}`} style={{ background:c+'22', borderColor:c+'55', borderBottomColor:c+'44', color:c }}>{k}</span>;
                })}
              </div>
            ))}
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

      {/* Levels */}
      <section id="levels" style={{ ...wrap, paddingBottom:80 }}>
        <div {...fi(300)}>
          <h2 style={h2}>180 levels to conquer</h2>
          <p style={sub}>Start at Home Row Hero and keep climbing.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:10 }}>
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
                <div style={{ fontSize:11, color:C.faint, marginBottom:1 }}>LEVELS 12–180</div>
                <div style={{ fontSize:14, fontWeight:700, color:C.faint }}>& much more inside…</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layouts */}
      <section style={{ ...wrap, paddingBottom:80 }}>
        <div {...fi(320)}>
          <h2 style={h2}>10 keyboard layouts</h2>
          <p style={sub}>Train on the layout you actually use.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
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

      {/* Questions */}
      <section style={{ ...wrap, paddingBottom:80 }}>
        <div {...fi(340)}>
          <h2 style={h2}>Quick answers</h2>
          <p style={sub}>More in the <a href="/help" style={{ color:C.purple }}>Help Center</a>.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
            {[
              ['Is it free?','Yes. No ads, and you can play without an account.'],
              ['Why no Backspace?','So accuracy is built in from the start, instead of fixing mistakes after they happen.'],
              ['Can kids use it?','Yes. Under-13 profiles are private, stay on the device, and have no public pages or leaderboards.'],
              ['Does it work on a phone?','With a physical keyboard connected over Bluetooth or USB.'],
            ].map(([q,a]) => (
              <div key={q} className="card" style={{ padding:'18px 20px' }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{q}</div>
                <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, fontFamily:"'Space Grotesk',sans-serif" }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop:`1px solid ${C.border}`, padding:'80px 5%', textAlign:'center', background:'radial-gradient(60% 100% at 50% 100%,#7c6af722,transparent)' }}>
        <h2 style={{ fontSize:'clamp(28px,5vw,38px)', fontWeight:800, letterSpacing:'-.03em', marginBottom:12 }}>Ready to type better?</h2>
        <p style={{ color:C.muted, fontSize:16, marginBottom:32, fontFamily:"'Space Grotesk',sans-serif" }}>Your first level takes about a minute.</p>
        <a href="/game"><button className="cta" style={{ fontSize:18, padding:'18px 52px' }}>START TYPING →</button></a>
      </section>

      <footer style={{ borderTop:`1px solid ${C.border}`, padding:'22px 5%', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontSize:13, color:C.faint, display:'inline-flex', alignItems:'center' }}><LogoMark size={18} /><span style={{ color:C.purple }}>Accurat</span>Key</span>
        <span style={{ display:'flex', gap:16, fontSize:12, flexWrap:'wrap' }}>
          <a href="/help" style={{ color:C.muted }}>Help</a>
          <a href="/privacy" style={{ color:C.muted }}>Privacy</a>
          <a href="/childrens-privacy" style={{ color:C.muted }}>Children&apos;s privacy</a>
          <a href="https://trivquic.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color:C.muted }}>TrivQuic</a>
          <a href="https://tqak.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color:C.muted }}>tqak</a>
          <a href="/tos" style={{ color:C.muted }}>Terms</a>
        </span>
      </footer>
    </div>
  );
}
