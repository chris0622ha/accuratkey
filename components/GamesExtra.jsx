"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── Shared utils ──────────────────────────────────────────────────────────────
function getSfxCtx() {
  if (typeof window === "undefined") return null;
  if (!window._akCtx || window._akCtx.state === "closed") window._akCtx = new (window.AudioContext || window.webkitAudioContext)();
  return window._akCtx;
}
function playTone(freq, type = "sine", duration = 0.15, vol = 0.18) {
  const ctx = getSfxCtx(); if (!ctx) return;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    o.start(); o.stop(ctx.currentTime + duration + 0.05);
  } catch(e) {}
}

const EASY_WORDS = ["the","and","you","for","with","that","this","from","have","they","will","your","time","make","look","come","like","then","over","also","back","after","only","them","well","been","were","each","many","much","such","long","good","very","most","even","does","know","just","some","into","take","than","here","both","where","when","what","how","all","say","get","use","him","his","her","its","had","but","not","are","was","can","may","new","now","old","one","our","out","own","put","run","see","set","too","two","way","who","why","yet","any","ask","big","bit","cut","day","did","end","few","got","let","lot","man","men","off","per","put","red","top","try","use","yet"];
const MED_WORDS = ["about","above","after","again","along","among","asked","being","below","bring","built","cause","chair","clean","clear","close","color","could","count","cover","cross","doors","doubt","dream","drive","early","earth","eight","empty","enter","every","exact","exist","extra","faces","facts","field","fight","final","first","floor","focus","force","found","front","given","given","glass","going","great","group","guard","guide","happy","heard","heart","heavy","hence","homes","horse","human","ideas","image","inner","issue","large","later","laugh","learn","level","light","liked","limit","lines","local","looks","lower","means","model","money","month","moved","music","named","never","night","north","noted","occur","often","order","other","ought","pages","paper","parts","place","plain","plane","plant","plans","point","power","press","price","print","prior","proof","prove","quite","raise","range","reach","ready","right","roads","rocks","round","ruled","rules","scene","sense","serve","seven","shall","share","short","shown","sides","since","sixth","skill","sleep","small","smile","solve","sound","south","space","speed","spend","split","staff","stage","stand","start","state","stays","steel","steps","still","stone","store","storm","story","style","super","taken","teach","teams","their","there","think","those","three","threw","throw","tidal","tired","today","total","touch","towns","track","trade","train","treat","trees","trial","tried","truth","twice","under","union","until","upper","usual","valid","value","video","views","visit","voice","voter","walls","wants","watch","water","weeks","where","which","while","whole","whose","wider","winds","would","write","years","young"];

function pickN(n, pool) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return out;
}

function SoundBtn({ muted, toggle, T }) {
  return (
    <button onClick={toggle} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.faint,fontSize:12,padding:"3px 8px",cursor:"pointer",fontFamily:T.font}}>
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

function BackBtn({ onBack, onSettings, T }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font,padding:0}}>← Back</button>
      {onSettings && <button onClick={onSettings} style={{background:"none",border:"1px solid #2a2a4a",borderRadius:6,color:"#555",fontSize:12,padding:"2px 7px",cursor:"pointer"}}>⚙️</button>}
    </div>
  );
}

function ResultScreen({ emoji, title, color, stats, onRetry, T }) {
  return (
    <div style={{textAlign:"center",padding:"28px 20px",background:T.card,border:`1px solid ${color}55`,borderRadius:12}}>
      <div style={{fontSize:48,marginBottom:8}}>{emoji}</div>
      <div style={{color,fontWeight:800,fontSize:22,marginBottom:12}}>{title}</div>
      {stats.map(([l,v])=>(
        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{color:T.muted,fontSize:13}}>{l}</span>
          <span style={{color:T.text,fontWeight:700,fontSize:13}}>{v}</span>
        </div>
      ))}
      <button onClick={onRetry} style={{marginTop:20,padding:"12px 32px",borderRadius:10,border:"none",background:color,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Play Again</button>
    </div>
  );
}

// ─── SNIPER ────────────────────────────────────────────────────────────────────
export function Sniper({ T, onBack, onSettings, settings = {} }) {
  const [words] = useState(()=>pickN(50, MED_WORDS));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const target = words[idx] || "";

  const handleType = e => {
    const v = e.target.value;
    // Check for any wrong char
    for (let i = 0; i < v.length; i++) {
      if (v[i] !== target[i]) {
        if (!muted) playTone(180, "sawtooth", 0.3, 0.25);
        setStreak(0); setTyped(""); return;
      }
    }
    setTyped(v);
    if (v === target) {
      if (!muted) playTone(1320, "sine", 0.1, 0.2);
      const ns = streak + 1;
      setStreak(ns); setBest(b => Math.max(b, ns));
      const ni = idx + 1;
      if (ni >= words.length) { setDone(true); return; }
      setIdx(ni); setTyped("");
    }
  };

  if (done) return <ResultScreen emoji="🎯" title="Mission Complete" color="#34d399" stats={[["Words",words.length],["Best Streak",best]]} onRetry={()=>{ setIdx(0);setTyped("");setStreak(0);setBest(0);setDone(false); setTimeout(()=>ref.current?.focus(),50); }} T={T}/>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🎯 Sniper</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{background:"#34d39911",border:"1px solid #34d39933",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#34d399",textAlign:"center"}}>100% accuracy required — any mistake resets the word</div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13}}>
        <span style={{color:T.muted}}>Word {idx+1}/{words.length}</span>
        <span style={{color:"#facc15",fontWeight:700}}>🔥 Streak: {streak} {best>0&&`(best: ${best})`}</span>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:24,textAlign:"center",letterSpacing:3}}>
        {target.split("").map((ch,i)=>(
          <span key={i} style={{color:i<typed.length?"#34d399":i===typed.length?T.purple:T.faint,borderBottom:i===typed.length?"2px solid "+T.purple:"2px solid transparent"}}>{ch}</span>
        ))}
      </div>
      <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─── MIRROR ────────────────────────────────────────────────────────────────────
export function Mirror({ T, onBack, onSettings, settings = {} }) {
  const [words] = useState(()=>pickN(30, EASY_WORDS));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [start, setStart] = useState(null);
  const ref = useRef(null);
  const target = words[idx] || "";
  const reversed = target.split("").reverse().join("");

  const handleType = e => {
    const v = e.target.value;
    if (!start) setStart(Date.now());
    setTyped(v);
    if (v === target) {
      if (!muted) playTone(880, "sine", 0.1, 0.2);
      setCorrect(c=>c+1);
      const ni = idx+1;
      if (ni >= words.length) setDone(true);
      else { setIdx(ni); setTyped(""); }
    }
  };

  const wpm = start && done ? Math.round((words.length / ((Date.now()-start)/60000))) : 0;

  if (done) return <ResultScreen emoji="🪞" title="Mirror Master!" color={T.purple} stats={[["Words",words.length],["WPM",wpm]]} onRetry={()=>{setIdx(0);setTyped("");setCorrect(0);setDone(false);setStart(null);setTimeout(()=>ref.current?.focus(),50);}} T={T}/>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🪞 Mirror</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{background:T.purple+"11",border:`1px solid ${T.purple}33`,borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:T.purple,textAlign:"center"}}>Word appears backwards — type it forwards</div>
      <div style={{textAlign:"center",marginBottom:8,color:T.muted,fontSize:13}}>{idx+1} / {words.length}</div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",marginBottom:8,fontFamily:"'JetBrains Mono',monospace",fontSize:28,textAlign:"center",letterSpacing:4,color:T.muted,opacity:0.7,userSelect:"none"}}>
        {reversed}
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:24,textAlign:"center",letterSpacing:3}}>
        {target.split("").map((ch,i)=>(
          <span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?T.purple:T.faint}}>{ch}</span>
        ))}
      </div>
      <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─── FLASH ─────────────────────────────────────────────────────────────────────
export function Flash({ T, onBack, onSettings, settings = {} }) {
  const FLASH_MS = 1000;
  const [words] = useState(()=>pickN(20, MED_WORDS));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("show"); // show | type
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const target = words[idx] || "";

  useEffect(() => {
    if (phase === "show") {
      const t = setTimeout(() => { setPhase("type"); setTimeout(()=>ref.current?.focus(),50); }, FLASH_MS);
      return () => clearTimeout(t);
    }
  }, [phase, idx]);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    if (v.length === target.length) {
      const ok = v === target;
      if (ok) { if (!muted) playTone(880,"sine",0.1,0.2); setCorrect(c=>c+1); }
      else { if (!muted) playTone(220,"sawtooth",0.2,0.2); }
      const ni = idx+1;
      if (ni >= words.length) setDone(true);
      else { setIdx(ni); setTyped(""); setPhase("show"); }
    }
  };

  if (done) return <ResultScreen emoji="⚡" title="Flash Complete!" color="#facc15" stats={[["Correct",`${correct}/${words.length}`],["Accuracy",Math.round(correct/words.length*100)+"%"]]} onRetry={()=>{setIdx(0);setPhase("show");setTyped("");setCorrect(0);setDone(false);}} T={T}/>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>⚡ Flash</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{background:"#facc1511",border:"1px solid #facc1533",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#facc15",textAlign:"center"}}>Memorize the word — then type it from memory</div>
      <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1} / {words.length} · {correct} correct</div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"30px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:28,textAlign:"center",letterSpacing:4,minHeight:90,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {phase==="show" ? <span style={{color:T.text}}>{target}</span> : <span style={{color:T.faint,fontSize:14}}>Type it from memory...</span>}
      </div>
      {phase==="type" && (
        <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the word..."
          style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
      )}
    </div>
  );
}

// ─── ECHO ──────────────────────────────────────────────────────────────────────
export function Echo({ T, onBack, onSettings, settings = {} }) {
  const POOL = EASY_WORDS;
  const [sequence, setSequence] = useState([POOL[Math.floor(Math.random()*POOL.length)]]);
  const [phase, setPhase] = useState("show"); // show|type
  const [showIdx, setShowIdx] = useState(0);
  const [typeIdx, setTypeIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [lives, setLives] = useState(3);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (phase === "show") {
      if (showIdx < sequence.length) {
        const t = setTimeout(() => setShowIdx(i=>i+1), 800);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => { setPhase("type"); setShowIdx(0); setTimeout(()=>ref.current?.focus(),50); }, 400);
        return () => clearTimeout(t);
      }
    }
  }, [phase, showIdx, sequence]);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    const target = sequence[typeIdx];
    if (v === target) {
      if (!muted) playTone(660+typeIdx*40,"sine",0.08,0.15);
      const ni = typeIdx+1;
      if (ni >= sequence.length) {
        // Level up — add a word
        const next = [...sequence, POOL[Math.floor(Math.random()*POOL.length)]];
        setSequence(next); setTypeIdx(0); setTyped(""); setPhase("show"); setShowIdx(0);
      } else { setTypeIdx(ni); setTyped(""); }
    } else if (v.length > target.length || (v.length===target.length && v!==target)) {
      if (!muted) playTone(180,"sawtooth",0.3,0.25);
      const nl = lives-1;
      setLives(nl);
      if (nl<=0) setDone(true);
      else { setTypeIdx(0); setTyped(""); setPhase("show"); setShowIdx(0); }
    }
  };

  if (done) return <ResultScreen emoji="🔁" title="Echo Broken!" color="#7c6af7" stats={[["Sequence Length",sequence.length],["Lives Lost",3-lives+lives]]} onRetry={()=>{setSequence([POOL[Math.floor(Math.random()*POOL.length)]]);setPhase("show");setShowIdx(0);setTypeIdx(0);setTyped("");setLives(3);setDone(false);}} T={T}/>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🔁 Echo</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13}}>
        <span style={{color:T.muted}}>Sequence: {sequence.length} words</span>
        <span>{"❤️".repeat(lives)}{"🖤".repeat(3-lives)}</span>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",marginBottom:10,minHeight:70,display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
        {phase==="show" ? (
          sequence.map((w,i)=>(
            <span key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,color:i<showIdx?T.text:T.faint,fontWeight:i===showIdx-1?800:400,transition:"color 0.2s"}}>{w}</span>
          ))
        ) : (
          <div style={{textAlign:"center"}}>
            <div style={{color:T.faint,fontSize:12,marginBottom:6}}>Word {typeIdx+1} of {sequence.length}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,color:T.muted}}>{"_ ".repeat(sequence[typeIdx]?.length||0)}</div>
          </div>
        )}
      </div>
      {phase==="type" && (
        <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder={`Type word ${typeIdx+1}...`}
          style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
      )}
    </div>
  );
}

// ─── GHOST WORDS ───────────────────────────────────────────────────────────────
export function GhostWords({ T, onBack, onSettings, settings = {} }) {
  const VISIBLE_MS = 2500;
  const [words] = useState(()=>pickN(25, MED_WORDS));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [visible, setVisible] = useState(true);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const ref = useRef(null);
  const target = words[idx] || "";

  useEffect(() => {
    setVisible(true); setOpacity(1);
    const fade = setTimeout(() => {
      // Fade out over 500ms
      setOpacity(0);
      setTimeout(() => setVisible(false), 500);
    }, VISIBLE_MS - 500);
    return () => clearTimeout(fade);
  }, [idx]);

  useEffect(() => { ref.current?.focus(); }, [idx]);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    if (v === target) {
      if (!muted) playTone(880,"sine",0.1,0.2);
      setCorrect(c=>c+1);
      const ni=idx+1;
      if (ni>=words.length) setDone(true);
      else { setIdx(ni); setTyped(""); }
    }
  };

  if (done) return <ResultScreen emoji="👻" title="Ghost Cleared!" color="#a78bfa" stats={[["Typed",`${correct}/${words.length}`],["Accuracy",Math.round(correct/words.length*100)+"%"]]} onRetry={()=>{setIdx(0);setTyped("");setCorrect(0);setDone(false);setVisible(true);setOpacity(1);}} T={T}/>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>👻 Ghost Words</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{background:"#a78bfa11",border:"1px solid #a78bfa33",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#a78bfa",textAlign:"center"}}>Type the word before it fades away</div>
      <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1} / {words.length}</div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"30px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:28,textAlign:"center",letterSpacing:4,minHeight:90,display:"flex",alignItems:"center",justifyContent:"center",transition:"opacity 0.5s",opacity:visible?opacity:0}}>
        {target}
      </div>
      <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─── CODE RAIN ─────────────────────────────────────────────────────────────────
export function CodeRain({ T, onBack, onSettings, settings = {} }) {
  const COLS = 6;
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [typed, setTyped] = useState("");
  const [columns, setColumns] = useState(()=>Array.from({length:COLS},()=>[]));
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const colsRef = useRef(columns);
  const scoreRef = useRef(0);
  const missedRef = useRef(0);
  const inputRef = useRef(null);
  const frameRef = useRef(null);
  const lastSpawn = useRef(0);
  const MAX_MISSED = 8;
  const POOL = MED_WORDS;

  useEffect(() => {
    inputRef.current?.focus();
    let last = performance.now();
    const loop = (now) => {
      const dt = now - last; last = now;
      // Move words down
      const updated = colsRef.current.map(col =>
        col.map(w => ({...w, y: w.y + 0.02 * dt}))
      );
      // Check missed
      let newMissed = 0;
      const filtered = updated.map(col => col.filter(w => {
        if (w.y > 100) { newMissed++; return false; } return true;
      }));
      if (newMissed > 0) {
        missedRef.current += newMissed;
        setMissed(missedRef.current);
        if (missedRef.current >= MAX_MISSED) { setDone(true); cancelAnimationFrame(frameRef.current); return; }
      }
      // Spawn
      if (now - lastSpawn.current > 1200) {
        const col = Math.floor(Math.random() * COLS);
        const word = POOL[Math.floor(Math.random() * POOL.length)];
        filtered[col] = [...filtered[col], {word, y:0, id: now}];
        lastSpawn.current = now;
      }
      colsRef.current = filtered;
      setColumns([...filtered]);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    // Find matching word in any column
    let matched = false;
    const newCols = colsRef.current.map(col => col.filter(w => {
      if (w.word === v.trim()) { matched = true; return false; }
      return true;
    }));
    if (matched) {
      if (!muted) playTone(880,"sine",0.1,0.2);
      scoreRef.current++;
      setScore(scoreRef.current);
      colsRef.current = newCols;
      setColumns([...newCols]);
      setTyped("");
    }
  };

  const reset = () => { setScore(0);setMissed(0);setTyped("");setDone(false);setColumns(Array.from({length:COLS},()=>[]));colsRef.current=Array.from({length:COLS},()=>[]);scoreRef.current=0;missedRef.current=0;lastSpawn.current=0; };

  if (done) return <ResultScreen emoji="💻" title="Matrix Down!" color="#34d399" stats={[["Words Typed",score],["Words Missed",missed]]} onRetry={reset} T={T}/>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>💻 Code Rain</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}>
        <span style={{color:"#34d399",fontWeight:700}}>{score} typed</span>
        <span style={{color:"#ef4444"}}>{missed}/{MAX_MISSED} missed</span>
      </div>
      <div style={{position:"relative",height:280,background:"#050d05",border:"1px solid #1a2a1a",borderRadius:12,overflow:"hidden",marginBottom:10,display:"flex",gap:0}}>
        {columns.map((col,ci)=>(
          <div key={ci} style={{flex:1,position:"relative"}}>
            {col.map(w=>(
              <div key={w.id} style={{position:"absolute",top:`${w.y}%`,left:0,right:0,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color: typed && w.word.startsWith(typed.trim()) ? "#88ff88" : "#00aa00",fontWeight: typed && w.word.startsWith(typed.trim()) ? 800 : 400,textShadow: typed && w.word.startsWith(typed.trim()) ? "0 0 8px #00ff00" : "none",transition:"color 0.1s"}}>
              {w.word}
            </div>
            ))}
          </div>
        ))}
      </div>
      <input ref={inputRef} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type falling words..."
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─── BOSS BATTLE ───────────────────────────────────────────────────────────────
export function BossBattle({ T, onBack, onSettings, settings = {} }) {
  const BOSS_HP = 100;
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [playerHp, setPlayerHp] = useState(100);
  const [words] = useState(()=>pickN(60, MED_WORDS));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("fight"); // fight | dead | win
  const [combo, setCombo] = useState(0);
  const [muted, setMuted] = useState(false);
  const [log, setLog] = useState([]);
  const ref = useRef(null);
  const attackTimer = useRef(null);
  const target = words[idx] || "";

  // Boss attacks every 4s
  useEffect(() => {
    if (phase !== "fight") return;
    attackTimer.current = setInterval(() => {
      if (!muted) playTone(150,"sawtooth",0.3,0.2);
      setPlayerHp(h => {
        const dmg = 8 + Math.floor(Math.random()*7);
        setLog(l=>[`👾 Boss hits for ${dmg}!`,...l.slice(0,4)]);
        const nh = h - dmg;
        if (nh <= 0) { setPhase("dead"); clearInterval(attackTimer.current); return 0; }
        return nh;
      });
    }, 4000);
    return () => clearInterval(attackTimer.current);
  }, [phase, muted]);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    if (v === target) {
      const nc = combo+1;
      const dmg = 10 + nc * 2;
      if (!muted) playTone(660+nc*40,"sine",0.1,0.2);
      setCombo(nc);
      setLog(l=>[`⚔️ You deal ${dmg} damage${nc>3?" 🔥 COMBO!":""}!`,...l.slice(0,4)]);
      setBossHp(h => {
        const nh = h - dmg;
        if (nh <= 0) { setPhase("win"); clearInterval(attackTimer.current); return 0; }
        return nh;
      });
      const ni = idx+1;
      setIdx(ni >= words.length ? 0 : ni);
      setTyped("");
    } else if (v.length > 0 && target[v.length-1] && v[v.length-1] !== target[v.length-1]) {
      setCombo(0); setTyped("");
      setLog(l=>["💔 Missed! Combo reset",...l.slice(0,4)]);
    }
  };

  const reset = () => { setBossHp(BOSS_HP);setPlayerHp(100);setIdx(0);setTyped("");setPhase("fight");setCombo(0);setLog([]); setTimeout(()=>ref.current?.focus(),50); };

  if (phase==="win") return <ResultScreen emoji="🏆" title="Boss Defeated!" color="#facc15" stats={[["Boss HP",`0/${BOSS_HP}`],["Combo",combo]]} onRetry={reset} T={T}/>;
  if (phase==="dead") return <ResultScreen emoji="💀" title="You Died!" color="#ef4444" stats={[["Boss HP Remaining",bossHp],["Dealt",`${BOSS_HP-bossHp} dmg`]]} onRetry={reset} T={T}/>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>👾 Boss Battle</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      {/* Boss */}
      <div style={{background:"#1a0a0a",border:"1px solid #ef444433",borderRadius:10,padding:"12px 16px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{color:"#ef4444",fontSize:13,fontWeight:700}}>👾 BOSS</span>
          <span style={{color:"#ef4444",fontSize:13}}>{bossHp}/{BOSS_HP} HP</span>
        </div>
        <div style={{height:10,background:"#2a0a0a",borderRadius:5,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${bossHp}%`,background:"#ef4444",borderRadius:5,transition:"width 0.3s"}}/>
        </div>
      </div>
      {/* Player */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 16px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{color:"#34d399",fontSize:13,fontWeight:700}}>🧙 YOU {combo>2&&`🔥×${combo}`}</span>
          <span style={{color:"#34d399",fontSize:13}}>{playerHp}/100 HP</span>
        </div>
        <div style={{height:10,background:"#0a1a0a",borderRadius:5,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${playerHp}%`,background:"#34d399",borderRadius:5,transition:"width 0.3s"}}/>
        </div>
      </div>
      {/* Log */}
      <div style={{height:70,overflow:"hidden",marginBottom:8}}>
        {log.map((l,i)=><div key={i} style={{color:i===0?T.text:T.faint,fontSize:12,fontFamily:"'JetBrains Mono',monospace",opacity:1-i*0.2}}>{l}</div>)}
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 18px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:22,textAlign:"center",letterSpacing:2}}>
        {target.split("").map((ch,i)=>(
          <span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?T.purple:T.faint}}>{ch}</span>
        ))}
      </div>
      <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─── TYPEWRITER STORY ──────────────────────────────────────────────────────────
const STORIES = [
  { title:"The Raven — Poe", text:"Once upon a midnight dreary while I pondered weak and weary over many a quaint and curious volume of forgotten lore while I nodded nearly napping suddenly there came a tapping as of someone gently rapping rapping at my chamber door" },
  { title:"Frost — The Road", text:"Two roads diverged in a yellow wood and sorry I could not travel both and be one traveler long I stood and looked down one as far as I could to where it bent in the undergrowth" },
  { title:"Dickens — Tale of Two Cities", text:"It was the best of times it was the worst of times it was the age of wisdom it was the age of foolishness it was the epoch of belief it was the epoch of incredulity" },
  { title:"Austen — Pride and Prejudice", text:"It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife however little known the feelings or views of such a man may be" },
  { title:"Orwell — 1984", text:"It was a bright cold day in April and the clocks were striking thirteen Winston Smith his chin nuzzled into his breast in an effort to escape the vile wind slipped quickly through the glass doors" },
];

export function TypewriterStory({ T, onBack, onSettings, settings = {} }) {
  const [storyIdx, setStoryIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [start, setStart] = useState(null);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const story = STORIES[storyIdx];
  const target = story.text;
  const wpm = start && done ? Math.round((target.length/5)/((Date.now()-start)/60000)) : 0;

  // Typewriter click sound
  const typeClick = () => { if (!muted) playTone(2200 + Math.random()*200,"square",0.03,0.08); };

  const handleType = e => {
    const v = e.target.value;
    if (!start && v.length > 0) setStart(Date.now());
    if (v.length > typed.length) typeClick();
    setTyped(v);
    if (v.length >= target.length) setDone(true);
  };

  const acc = typed.length > 0 ? Math.round(typed.split("").filter((c,i)=>c===target[i]).length/typed.length*100) : 100;

  const reset = (si=storyIdx) => { setTyped(""); setDone(false); setStart(null); setStoryIdx(si); setTimeout(()=>ref.current?.focus(),50); };

  if (done) return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🎭 {story.title}</span></div>
      <ResultScreen emoji="📜" title="Story Complete!" color="#a78bfa" stats={[["WPM",wpm],["Accuracy",acc+"%"],["Passage",story.title]]} onRetry={()=>reset()} T={T}/>
      <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
        {STORIES.map((s,i)=><button key={i} onClick={()=>reset(i)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${T.border}`,background:i===storyIdx?T.purple:"transparent",color:i===storyIdx?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:T.font}}>{s.title.split("—")[0].trim()}</button>)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🎭 Typewriter Story</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{marginBottom:10,display:"flex",gap:6,flexWrap:"wrap"}}>
        {STORIES.map((s,i)=><button key={i} onClick={()=>reset(i)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,background:i===storyIdx?T.purple+"33":"transparent",color:i===storyIdx?T.purple:T.faint,fontSize:10,cursor:"pointer",fontFamily:T.font}}>{s.title}</button>)}
      </div>
      <div style={{background:"#0d0a07",border:"1px solid #2a2010",borderRadius:12,padding:"18px 20px",marginBottom:10,fontFamily:"'Courier New',monospace",fontSize:15,lineHeight:2,color:"#c8b89a",minHeight:120}}>
        {target.split("").map((ch,i)=>{
          let color="#3a3020";
          if (i<typed.length) color=typed[i]===ch?"#c8b89a":"#ef4444";
          else if (i===typed.length) color="#f59e0b";
          return <span key={i} style={{color,borderBottom:i===typed.length?"2px solid #f59e0b":"none"}}>{ch}</span>;
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",color:T.muted,fontSize:12,marginBottom:8}}>
        <span>{typed.length}/{target.length} chars</span>
        <span>{start?`${wpm} WPM · ${acc}%`:"Start typing..."}</span>
      </div>
      <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'Courier New',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─── WORD DUEL ─────────────────────────────────────────────────────────────────
export function WordDuel({ T, onBack, onSettings, settings = {} }) {
  const WORDS = pickN(30, MED_WORDS);
  const [p1typed, setP1typed] = useState("");
  const [p2typed, setP2typed] = useState("");
  const [p1done, setP1done] = useState(false);
  const [p2done, setP2done] = useState(false);
  const [start, setStart] = useState(null);
  const [p1time, setP1time] = useState(null);
  const [p2time, setP2time] = useState(null);
  const [muted, setMuted] = useState(false);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const target = WORDS.join(" ");

  const handleP1 = e => {
    if (p1done) return;
    const v = e.target.value;
    if (!start && v) setStart(Date.now());
    setP1typed(v);
    if (v.length >= target.length) { setP1done(true); setP1time(Date.now()-start); if (!muted) playTone(880,"sine",0.2,0.25); }
  };

  const handleP2 = e => {
    if (p2done) return;
    const v = e.target.value;
    if (!start && v) setStart(Date.now());
    setP2typed(v);
    if (v.length >= target.length) { setP2done(true); setP2time(Date.now()-start); if (!muted) playTone(880,"sine",0.2,0.25); }
  };

  const reset = () => { setP1typed("");setP2typed("");setP1done(false);setP2done(false);setStart(null);setP1time(null);setP2time(null); };
  const wpm = (ms) => ms ? Math.round((target.length/5)/(ms/60000)) : 0;
  const acc = (t) => t.length>0?Math.round(t.split("").filter((c,i)=>c===target[i]).length/t.length*100):100;

  const bothDone = p1done && p2done;
  const p1wins = p1time && p2time && p1time < p2time;
  const tie = p1time === p2time;

  const PlayerSide = ({player, typed, done, inputRef, onChange, time}) => (
    <div style={{flex:1,minWidth:0}}>
      <div style={{textAlign:"center",fontWeight:700,fontSize:13,color:T.muted,marginBottom:6}}>{player}</div>
      <div style={{background:T.card,border:`1px solid ${done?"#34d399":T.border}`,borderRadius:10,padding:"10px 12px",marginBottom:6,fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:1.8,height:120,overflow:"hidden"}}>
        {target.slice(0,typed.length+60).split("").map((ch,i)=>{
          let color=T.faint;
          if(i<typed.length) color=typed[i]===ch?"#34d399":"#ef4444";
          else if(i===typed.length) color=T.purple;
          return <span key={i} style={{color}}>{ch}</span>;
        })}
      </div>
      {done ? <div style={{textAlign:"center",color:"#34d399",fontSize:12,fontWeight:700}}>✓ {wpm(time)} WPM · {acc(typed)}%</div>
        : <input ref={inputRef} value={typed} onChange={onChange} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:13,padding:"8px 10px",outline:"none",boxSizing:"border-box"}}/>
      }
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>⚔️ Word Duel</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:T.muted,textAlign:"center"}}>Two players · Same device · Race to finish</div>
      {bothDone && (
        <div style={{textAlign:"center",padding:"12px",background:T.card,border:`1px solid ${T.purple}`,borderRadius:10,marginBottom:10}}>
          <div style={{color:T.purple,fontWeight:800,fontSize:18,marginBottom:6}}>{tie?"🤝 Tie!":p1wins?"🏆 Player 1 wins!":"🏆 Player 2 wins!"}</div>
          <button onClick={reset} style={{padding:"8px 24px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Rematch</button>
        </div>
      )}
      <div style={{display:"flex",gap:10}}>
        <PlayerSide player="Player 1" typed={p1typed} done={p1done} inputRef={ref1} onChange={handleP1} time={p1time}/>
        <div style={{width:1,background:T.border}}/>
        <PlayerSide player="Player 2" typed={p2typed} done={p2done} inputRef={ref2} onChange={handleP2} time={p2time}/>
      </div>
    </div>
  );
}

// ─── TYPING JOURNAL ────────────────────────────────────────────────────────────
export function TypingJournal({ T, onBack, onSettings, settings = {} }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(()=>{ try { return JSON.parse(localStorage.getItem("ak_journal")||"[]"); } catch{return[];} });
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const wpm = React.useMemo(()=>{
    return text.length > 10 ? null : null; // just a freeform editor
  },[text]);

  const save = () => {
    if (!text.trim()) return;
    setSaving(true);
    const entry = { id: Date.now(), title: title.trim()||`Entry ${saved.length+1}`, text, date: new Date().toLocaleDateString() };
    const newSaved = [entry, ...saved].slice(0,20);
    setSaved(newSaved);
    localStorage.setItem("ak_journal", JSON.stringify(newSaved));
    setText(""); setTitle("");
    setTimeout(()=>setSaving(false), 800);
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>📝 Typing Journal</span></div>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Entry title (optional)" maxLength={50}
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:13,padding:"8px 12px",outline:"none",boxSizing:"border-box",marginBottom:8}}/>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type anything... notes, thoughts, practice passages. Saved locally on this device."
        rows={7} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box",resize:"vertical",lineHeight:1.7}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,marginBottom:16}}>
        <span style={{color:T.faint,fontSize:11}}>{text.length} chars · {text.trim().split(/\s+/).filter(Boolean).length} words</span>
        <button onClick={save} disabled={!text.trim()||saving} style={{padding:"8px 20px",borderRadius:8,border:"none",background:text.trim()?T.purple:"#333",color:"#fff",fontSize:13,fontWeight:700,cursor:text.trim()?"pointer":"default",fontFamily:T.font,opacity:saving?0.7:1}}>
          {saving?"Saved ✓":"Save Entry"}
        </button>
      </div>
      {saved.length>0&&(
        <>
          <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Past Entries</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
            {saved.map(e=>(
              <div key={e.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer"}} onClick={()=>setText(e.text)}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{color:T.text,fontSize:12,fontWeight:700}}>{e.title}</span>
                  <span style={{color:T.faint,fontSize:10}}>{e.date}</span>
                </div>
                <span style={{color:T.muted,fontSize:11}}>{e.text.slice(0,60)}…</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── POETRY MODE ───────────────────────────────────────────────────────────────
const POEMS = [
  { title:"She Walks in Beauty — Byron", lines:["She walks in beauty like the night","Of cloudless climes and starry skies","And all that is best of dark and bright","Meet in her aspect and her eyes"] },
  { title:"Hope — Emily Dickinson", lines:['"Hope" is the thing with feathers','That perches in the soul','And sings the tune without the words','And never stops at all'] },
  { title:"The Road Not Taken — Frost", lines:["Two roads diverged in a yellow wood","And sorry I could not travel both","And be one traveler long I stood","And looked down one as far as I could"] },
  { title:"O Captain! — Whitman", lines:["O Captain my Captain our fearful trip is done","The ship has weathered every rack the prize we sought is won","The port is near the bells I hear the people all exulting"] },
  { title:"Annabel Lee — Poe", lines:["It was many and many a year ago","In a kingdom by the sea","That a maiden there lived whom you may know","By the name of Annabel Lee"] },
];

function ambientTone(ctx, freq, vol=0.04) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type="sine"; o.frequency.value=freq;
  g.gain.setValueAtTime(0,ctx.currentTime);
  g.gain.linearRampToValueAtTime(vol,ctx.currentTime+2);
  o.start(); return {o,g};
}

export function PoetryMode({ T, onBack, onSettings, settings = {} }) {
  const [poemIdx, setPoemIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [completedLines, setCompletedLines] = useState([]);
  const ref = useRef(null);
  const ambientRef = useRef(null);
  const poem = POEMS[poemIdx];
  const target = poem.lines[lineIdx] || "";

  // Ambient synthesized tones (NOT copyrighted music — purely generated)
  useEffect(() => {
    if (muted) { ambientRef.current?.forEach(({o})=>o.stop()); ambientRef.current=null; return; }
    const ctx = getSfxCtx(); if (!ctx) return;
    const nodes = [
      ambientTone(ctx, 220, 0.03),
      ambientTone(ctx, 330, 0.02),
      ambientTone(ctx, 440, 0.015),
    ];
    ambientRef.current = nodes;
    return () => { nodes.forEach(({o})=>{try{o.stop();}catch(e){}}); };
  }, [muted, poemIdx]);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    if (v === target) {
      if (!muted) playTone(660,"sine",0.3,0.1);
      setCompletedLines(l=>[...l,target]);
      const ni = lineIdx+1;
      if (ni >= poem.lines.length) { setDone(true); ambientRef.current?.forEach(({g,o})=>{try{g.gain.linearRampToValueAtTime(0,getSfxCtx().currentTime+2);setTimeout(()=>o.stop(),2100);}catch(e){}}); }
      else { setLineIdx(ni); setTyped(""); }
    }
  };

  const reset = (pi=poemIdx) => { setPoemIdx(pi);setLineIdx(0);setTyped("");setDone(false);setCompletedLines([]); setTimeout(()=>ref.current?.focus(),50); };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:18}}>📜 Poetry Mode</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        {POEMS.map((p,i)=><button key={i} onClick={()=>reset(i)} style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${T.border}`,background:i===poemIdx?T.purple+"22":"transparent",color:i===poemIdx?T.purple:T.faint,fontSize:10,cursor:"pointer",fontFamily:T.font}}>{p.title.split("—")[0].trim()}</button>)}
      </div>
      <div style={{background:"#080810",border:"1px solid #1a1a30",borderRadius:12,padding:"20px 24px",marginBottom:12,minHeight:160}}>
        <div style={{color:"#444",fontSize:11,marginBottom:12,letterSpacing:2}}>{poem.title.toUpperCase()}</div>
        {completedLines.map((l,i)=><div key={i} style={{fontFamily:"'Georgia',serif",fontSize:15,color:"#666",marginBottom:8,fontStyle:"italic"}}>{l}</div>)}
        {!done && (
          <div style={{fontFamily:"'Georgia',serif",fontSize:16,lineHeight:1.8}}>
            {target.split("").map((ch,i)=>{
              let color="#2a2a40";
              if(i<typed.length) color=typed[i]===ch?"#a78bfa":"#ef4444";
              else if(i===typed.length) color="#e0e0ff";
              return <span key={i} style={{color,borderBottom:i===typed.length?"1px solid #7c6af7":"none"}}>{ch}</span>;
            })}
          </div>
        )}
        {done && <div style={{color:"#a78bfa",fontStyle:"italic",fontSize:14,marginTop:8}}>~ fin ~</div>}
      </div>
      {done ? (
        <div style={{textAlign:"center"}}>
          <button onClick={()=>reset()} style={{padding:"10px 28px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginRight:8}}>Again</button>
          {poemIdx<POEMS.length-1&&<button onClick={()=>reset(poemIdx+1)} style={{padding:"10px 28px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:13,cursor:"pointer"}}>Next poem →</button>}
        </div>
      ) : (
        <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the line..."
          style={{width:"100%",background:"#080810",border:"1px solid #1a1a30",borderRadius:8,color:"#a78bfa",fontFamily:"'Georgia',serif",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
      )}
    </div>
  );
}
