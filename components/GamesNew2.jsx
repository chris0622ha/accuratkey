"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { TYPING_BASIC, TYPING_MEDIUM, TYPING_HARD, EASY_ARR, MED_ARR, HARD_ARR, VHARD_ARR, IMPOSSIBLE_ARR, WORD_CATEGORIES, CATEGORY_NAMES, ALL_WORDS, SPELLING_BEE_WORDS, POOL_100_WORDS, POOL_ENDURANCE, POOL_WORD_CHAIN, POOL_VOCAB, POOL_MYSTERY, POOL_INVADERS, POOL_ASTEROID, POOL_TOWER, pickWords, pickByDiff, RHYMES } from "./WordDB";
const WORDS_EASY=TYPING_BASIC, WORDS_MED=TYPING_MEDIUM, WORDS_HARD=TYPING_HARD, WORDS_ANIMALS=WORD_CATEGORIES.animals, WORDS_COUNTRIES=WORD_CATEGORIES.countries;

function gSave(id, data) { try { localStorage.setItem("ak_gs_"+id, JSON.stringify(data)); } catch{} }
function speakWord(word, rate=0.8) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.rate = rate; u.pitch = 1; u.lang = "en-US";
  window.speechSynthesis.speak(u);
}
function gLoad(id) { try { return JSON.parse(localStorage.getItem("ak_gs_"+id)||"null"); } catch{return null;} }
function gClear(id) { try { localStorage.removeItem("ak_gs_"+id); } catch{} }
function getSfxCtx() { if(typeof window==="undefined") return null; if(!window._akCtx||window._akCtx.state==="closed") window._akCtx=new(window.AudioContext||window.webkitAudioContext)(); return window._akCtx; }
function playTone(freq,type="sine",duration=0.15,vol=0.18){const ctx=getSfxCtx();if(!ctx)return;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+duration);o.start();o.stop(ctx.currentTime+duration+0.05);}catch(e){}}

function SoundBtn({muted,toggle,T}){return <button onClick={toggle} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.faint,fontSize:12,padding:"3px 8px",cursor:"pointer",fontFamily:T.font}}>{muted?"🔇":"🔊"}</button>;}
function BackBtn({onBack,onSettings,T}){return(<div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={onBack} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font,padding:0}}>← Back</button>{onSettings&&<button onClick={onSettings} style={{background:"none",border:"1px solid #2a2a4a",borderRadius:6,color:"#555",fontSize:12,padding:"2px 7px",cursor:"pointer"}}>⚙️</button>}</div>);}
function ResultScreen({emoji,title,color,stats,onRetry,T}){return(<div style={{textAlign:"center",padding:"28px 20px",background:T.card,border:`1px solid ${color}55`,borderRadius:12}}><div style={{fontSize:48,marginBottom:8}}>{emoji}</div><div style={{color,fontWeight:800,fontSize:22,marginBottom:12}}>{title}</div>{stats.map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}><span style={{color:T.muted,fontSize:13}}>{l}</span><span style={{color:T.text,fontWeight:700,fontSize:13}}>{v}</span></div>))}<button onClick={onRetry} style={{marginTop:20,padding:"12px 32px",borderRadius:10,border:"none",background:color,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Play Again</button></div>);}

// ─── 100 WORDS ────────────────────────────────────────────────────────────────
export function HundredWords({ T, onBack, onSettings, settings={} }) {
  const sv = gLoad("hundred");
  const diff = settings.difficulty || "med";
  const pool = diff==="easy"?TYPING_BASIC:diff==="hard"?TYPING_HARD:POOL_100_WORDS;
  const [words] = useState(()=> sv?.words || pickWords(100, pool));
  const [typed, setTyped] = useState(()=> sv?.typed || "");
  const [start, setStart] = useState(()=> sv?.start || null);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const target = words.join(" ");
  useEffect(()=>{ if(!done) gSave("hundred",{words,typed,start}); },[typed,done]);
  const elapsed = start ? (Date.now()-start)/60000 : 0;
  const wpm = elapsed>0 ? Math.round((typed.length/5)/elapsed) : 0;
  const acc = typed.length>0 ? Math.round(typed.split("").filter((c,i)=>c===target[i]).length/typed.length*100) : 100;
  const pct = Math.round((typed.length/target.length)*100);

  const handleType = e => {
    const v = e.target.value;
    if(!start&&v.length>0) setStart(Date.now());
    setTyped(v);
    if(v.length>=target.length){setDone(true);gClear("hundred");if(!muted) [0,.2,.4].forEach(t=>setTimeout(()=>playTone(880,"sine",.15,.2),t*1000));}
  };

  if(done) return <ResultScreen emoji="💯" title="100 Words Done!" color={T.purple} stats={[["WPM",wpm],["Accuracy",acc+"%"],["Time",elapsed.toFixed(1)+"m"]]} onRetry={()=>{gClear("hundred");setTyped("");setStart(null);setDone(false);setTimeout(()=>ref.current?.focus(),50);}} T={T}/>;

  const windowStart = Math.max(0,typed.length-50);
  const shown = target.slice(windowStart,windowStart+150);

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>💯 100 Words</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12,color:T.muted}}>
      <span style={{color:T.purple,fontWeight:700}}>{wpm} WPM · {acc}%</span>
      <span>{typed.length}/{target.length} chars · {pct}%</span>
    </div>
    <div style={{height:6,background:T.border,borderRadius:3,marginBottom:10,overflow:"hidden"}}>
      <div style={{height:"100%",width:pct+"%",background:T.purple,borderRadius:3,transition:"width .2s"}}/>
    </div>
    <div onClick={()=>ref.current?.focus()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:15,lineHeight:1.9,cursor:"text",userSelect:"none",minHeight:90}}>
      {shown.split("").map((ch,i)=>{const ai=windowStart+i;let color=T.faint;if(ai<typed.length)color=typed[ai]===ch?"#34d399":"#ef4444";else if(ai===typed.length)color=T.purple;return<span key={ai} style={{color,borderBottom:ai===typed.length?"2px solid "+T.purple:"2px solid transparent"}}>{ch}</span>;})}
    </div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{position:"absolute",opacity:0,pointerEvents:"none"}}/>
  </div>);
}

// ─── ENDURANCE ────────────────────────────────────────────────────────────────
export function Endurance({ T, onBack, onSettings, settings={} }) {
  const PAUSE_LIMIT_MS = (settings.pauseMs || 2) * 1000;
  const [words, setWords] = useState(()=>pickWords(200, POOL_ENDURANCE));
  const [typed, setTyped] = useState("");
  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [dead, setDead] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pauseBar, setPauseBar] = useState(100);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const ref = useRef(null);
  const lastKeyRef = useRef(Date.now());
  const pauseRef = useRef(null);
  const target = words[idx] || "";

  useEffect(()=>{
    if(!started||dead) return;
    pauseRef.current = setInterval(()=>{
      const since = Date.now()-lastKeyRef.current;
      const pct = Math.max(0,100-(since/PAUSE_LIMIT_MS)*100);
      setPauseBar(pct);
      if(since>=PAUSE_LIMIT_MS){setDead(true);clearInterval(pauseRef.current);if(!muted)playTone(120,"sawtooth",.5,.3);}
    },50);
    return ()=>clearInterval(pauseRef.current);
  },[started,dead,muted,PAUSE_LIMIT_MS]);

  const handleType = e=>{
    const v=e.target.value;
    if(!started){setStarted(true);setStartTime(Date.now());}
    lastKeyRef.current=Date.now();
    setTyped(v);
    if(v===target){
      if(!muted)playTone(660,"sine",.08,.15);
      const ns=score+1;setScore(ns);
      setIdx(i=>{const ni=i+1;if(ni>=words.length)setWords(w=>[...w,...pickWords(100,POOL_ENDURANCE)]);return ni;});
      setTyped("");
    }
  };

  const elapsed = startTime?(Date.now()-startTime)/60000:0;
  const wpm = elapsed>0?Math.round((score)/elapsed):0;
  const reset=()=>{setWords(pickWords(200,WORDS_MED));setTyped("");setIdx(0);setStarted(false);setDead(false);setScore(0);setStartTime(null);setPauseBar(100);setTimeout(()=>ref.current?.focus(),50);};

  if(dead) return <ResultScreen emoji="⏸️" title="You paused!" color="#f59e0b" stats={[["Words Typed",score],["WPM",wpm],["Survived",elapsed.toFixed(1)+"min"]]} onRetry={reset} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🏃 Endurance</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#1a1000",border:"1px solid #f59e0b33",borderRadius:8,padding:"6px 12px",marginBottom:8,fontSize:11,color:"#f59e0b",textAlign:"center"}}>Stop typing for {settings.pauseMs||2}s and it's over</div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
      <span style={{color:T.purple,fontWeight:700}}>{score} words · {wpm} WPM</span>
      <span style={{color:started?pauseBar<30?"#ef4444":"#f59e0b":T.faint,fontWeight:700}}>{started?"⏱ Keep going!":"Start typing!"}</span>
    </div>
    <div style={{height:8,background:T.border,borderRadius:4,marginBottom:10,overflow:"hidden"}}>
      <div style={{height:"100%",width:pauseBar+"%",background:pauseBar<30?"#ef4444":pauseBar<60?"#f59e0b":"#34d399",borderRadius:4,transition:"width .05s"}}/>
    </div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:22,textAlign:"center",letterSpacing:2,minHeight:60,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {target.split("").map((ch,i)=><span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?T.purple:T.faint,borderBottom:i===typed.length?"2px solid "+T.purple:"none"}}>{ch}</span>)}
    </div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── ROULETTE ─────────────────────────────────────────────────────────────────
export function Roulette({ T, onBack, onSettings, settings={} }) {
  const ALL_GAME_IDS = ["rain","survival","burst","scramble","suddendeath","zen","ladder","sniper","mirror","flash","echo","ghost","coderain","boss","story","journal","poetry","hundred","endurance","wordchain","categoryblitz","vocabbuilder","spellingbee"];
  const GAME_NAMES = {rain:"🌧️ Word Rain",survival:"💀 Survival",burst:"⚡ Speed Burst",scramble:"🔀 Word Scramble",suddendeath:"☠️ Sudden Death",zen:"🧘 Zen Mode",ladder:"🪜 Speed Ladder",sniper:"🎯 Sniper",mirror:"🪞 Mirror",flash:"⚡ Flash",echo:"🔁 Echo",ghost:"👻 Ghost Words",coderain:"💻 Code Rain",boss:"👾 Boss Battle",story:"🎭 Typewriter Story",journal:"📝 Journal",poetry:"📜 Poetry",hundred:"💯 100 Words",endurance:"🏃 Endurance",wordchain:"🔗 Word Chain",categoryblitz:"⚡ Category Blitz",vocabbuilder:"📚 Vocab Builder",spellingbee:"🐝 Spelling Bee"};
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState(null);
  const [spinItems, setSpinItems] = useState([]);
  const [spinPos, setSpinPos] = useState(0);

  const spin = () => {
    setSpinning(true); setPicked(null);
    const items = [...ALL_GAME_IDS,...ALL_GAME_IDS,...ALL_GAME_IDS].sort(()=>Math.random()-.5).slice(0,20);
    setSpinItems(items); setSpinPos(0);
    let i=0;
    const iv = setInterval(()=>{
      i++; setSpinPos(p=>p+1);
      if(i>=20){clearInterval(iv);setSpinning(false);const winner=items[items.length-1];setPicked(winner);playTone(880,"sine",.3,.25);}
    },100);
  };

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🎰 Roulette</span></div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px 20px",marginBottom:16,textAlign:"center",minHeight:120,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      {spinning?(
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,color:T.purple,fontWeight:700,animation:"none"}}>
          {spinItems.slice(-3).map((id,i)=><div key={i} style={{opacity:i===2?1:i===1?.5:.2,marginBottom:4}}>{GAME_NAMES[id]||id}</div>)}
        </div>
      ):picked?(
        <div>
          <div style={{fontSize:42,marginBottom:8}}>🎯</div>
          <div style={{color:T.purple,fontWeight:800,fontSize:22,marginBottom:4}}>{GAME_NAMES[picked]}</div>
          <div style={{color:T.muted,fontSize:13}}>Go play it!</div>
        </div>
      ):(
        <div style={{color:T.faint,fontSize:14}}>Press Spin to get a random game</div>
      )}
    </div>
    <button onClick={spin} disabled={spinning} style={{width:"100%",padding:"14px",borderRadius:10,border:"none",background:spinning?"#333":T.purple,color:"#fff",fontSize:16,fontWeight:800,cursor:spinning?"wait":"pointer",fontFamily:T.font}}>
      {spinning?"🎰 Spinning...":"🎰 Spin!"}
    </button>
  </div>);
}

// ─── WORD CHAIN ───────────────────────────────────────────────────────────────
export function WordChain({ T, onBack, onSettings, settings={} }) {
  const sv = gLoad("wordchain");
  const timeLimit = settings.timePerWord || 10;
  const [chain, setChain] = useState(()=> sv?.chain || [pickWords(1,TYPING_MEDIUM)[0]]);
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [dead, setDead] = useState(false);
  const [muted, setMuted] = useState(false);
  const [usedWords, setUsedWords] = useState(()=> new Set(sv?.usedWords||[]));
  const ref = useRef(null);
  const timerRef = useRef(null);
  const lastWord = chain[chain.length-1] || "";
  const requiredStart = lastWord.slice(-1);
  useEffect(()=>{ if(!dead) gSave("wordchain",{chain,usedWords:[...usedWords]}); },[chain,dead]);
  useEffect(()=>{
    if(dead) return;
    setTimeLeft(timeLimit);
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);setDead(true);if(!muted)playTone(120,"sawtooth",.4,.3);return 0;}
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[chain.length,dead,muted,timeLimit]);

  const handleType = e=>{
    const v=e.target.value.toLowerCase().replace(/[^a-z]/g,"");
    setTyped(v);
    if(v.length>=2&&v[0]===requiredStart){
      const valid=POOL_WORD_CHAIN;
      if(valid.includes(v)&&!usedWords.has(v)){
        clearInterval(timerRef.current);
        if(!muted)playTone(660+chain.length*20,"sine",.1,.2);
        setChain(c=>[...c,v]);
        setUsedWords(s=>{s.add(v);return new Set(s);});
        setTyped("");
      }
    }
  };

  const reset=()=>{gClear("wordchain");const first=pickWords(1,WORDS_MED)[0];setChain([first]);setTyped("");setDead(false);setTimeLeft(timeLimit);setUsedWords(new Set([first]));setTimeout(()=>ref.current?.focus(),50);};

  if(dead) return <ResultScreen emoji="🔗" title="Chain Broken!" color="#f59e0b" stats={[["Chain Length",chain.length-1],["Last Word",lastWord],["Needed",requiredStart+"..."]]} onRetry={reset} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🔗 Word Chain</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:T.muted,textAlign:"center"}}>Each word must start with the last letter of the previous</div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}>
      <span style={{color:T.purple,fontWeight:700}}>Chain: {chain.length-1}</span>
      <span style={{color:timeLeft<=3?"#ef4444":"#f59e0b",fontWeight:700}}>⏱ {timeLeft}s</span>
    </div>
    <div style={{height:6,background:T.border,borderRadius:3,marginBottom:10,overflow:"hidden"}}>
      <div style={{height:"100%",width:(timeLeft/timeLimit*100)+"%",background:timeLeft<=3?"#ef4444":"#f59e0b",transition:"width 1s linear"}}/>
    </div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 16px",marginBottom:10,maxHeight:80,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:6}}>
      {chain.slice(-8).map((w,i)=><span key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:i===chain.slice(-8).length-1?T.purple:T.faint,fontWeight:i===chain.slice(-8).length-1?800:400}}>{w}</span>)}
    </div>
    <div style={{textAlign:"center",marginBottom:8,color:T.text,fontSize:16}}>Must start with: <span style={{color:T.purple,fontWeight:800,fontSize:24,fontFamily:"'JetBrains Mono',monospace"}}>"{requiredStart}"</span></div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder={`Type a word starting with "${requiredStart}"...`}
      style={{width:"100%",background:T.bg,border:`1px solid ${typed.length>0&&typed[0]!==requiredStart?"#ef4444":T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── CATEGORY BLITZ ───────────────────────────────────────────────────────────
export function CategoryBlitz({ T, onBack, onSettings, settings={} }) {
  const DURATION = settings.duration || 30;
  const CAT = settings.category || "animals";
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [used, setUsed] = useState(new Set());
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [wrong, setWrong] = useState(false);
  const ref = useRef(null);
  const pool = WORD_CATEGORIES[CAT] || WORDS_ANIMALS;
  const catName = CATEGORY_NAMES[CAT] || CAT;

  useEffect(()=>{
    if(!started||done) return;
    const iv=setInterval(()=>setTimeLeft(t=>{if(t<=1){setDone(true);clearInterval(iv);return 0;}return t-1;}),1000);
    return ()=>clearInterval(iv);
  },[started,done]);

  const handleType = e=>{
    const v=e.target.value.toLowerCase().trim();
    if(!started&&v.length>0)setStarted(true);
    setTyped(e.target.value);
    if(e.nativeEvent.data===" "||e.target.value.endsWith(" ")){
      const w=v.trimEnd();
      if(pool.includes(w)&&!used.has(w)){
        if(!muted)playTone(880,"sine",.08,.2);
        setScore(s=>s+1);setUsed(u=>{u.add(w);return new Set(u);});setWrong(false);
      } else if(w.length>0){
        if(!muted)playTone(220,"sawtooth",.15,.2);setWrong(true);setTimeout(()=>setWrong(false),500);
      }
      setTyped("");
    }
  };

  if(done) return <ResultScreen emoji="⚡" title="Time's Up!" color="#facc15" stats={[["Score",score],["Category",catName],["Time",DURATION+"s"]]} onRetry={()=>{setTimeLeft(DURATION);setTyped("");setScore(0);setUsed(new Set());setStarted(false);setDone(false);setTimeout(()=>ref.current?.focus(),50);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>⚡ Category Blitz</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#facc1511",border:"1px solid #facc1533",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#facc15",textAlign:"center"}}>Type as many {catName} as you can! Press Space after each word.</div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}>
      <span style={{color:"#facc15",fontWeight:700}}>⚡ {score} words</span>
      <span style={{color:timeLeft<=5?"#ef4444":"#f59e0b",fontWeight:700}}>⏱ {timeLeft}s</span>
    </div>
    <div style={{height:6,background:T.border,borderRadius:3,marginBottom:10,overflow:"hidden"}}>
      <div style={{height:"100%",width:(timeLeft/DURATION*100)+"%",background:timeLeft<=5?"#ef4444":"#facc15",transition:"width 1s linear"}}/>
    </div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:12,marginBottom:10,minHeight:50,display:"flex",flexWrap:"wrap",gap:6}}>
      {[...used].slice(-12).map(w=><span key={w} style={{background:T.purple+"22",color:T.purple,borderRadius:5,padding:"2px 8px",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{w}</span>)}
    </div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder={`Type a ${catName}...`}
      style={{width:"100%",background:wrong?"#ef444411":T.bg,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box",transition:"all .15s"}}/>
    {!started&&<div style={{textAlign:"center",color:T.faint,fontSize:11,marginTop:6}}>Timer starts when you type</div>}
  </div>);
}

// ─── VOCAB BUILDER ────────────────────────────────────────────────────────────
const VOCAB = [
  {word:"ephemeral",def:"Lasting for a very short time"},
  {word:"serendipity",def:"Finding good things by accident"},
  {word:"eloquent",def:"Fluent and persuasive in speaking"},
  {word:"resilient",def:"Able to recover quickly from difficulty"},
  {word:"paradox",def:"A seemingly contradictory statement that is true"},
  {word:"ambiguous",def:"Open to more than one interpretation"},
  {word:"meticulous",def:"Showing great attention to detail"},
  {word:"ubiquitous",def:"Present, appearing, or found everywhere"},
  {word:"aesthetic",def:"Concerned with beauty or artistic taste"},
  {word:"pragmatic",def:"Dealing with things sensibly and practically"},
  {word:"tenacious",def:"Holding firmly to a purpose or belief"},
  {word:"eccentric",def:"Unconventional and slightly strange"},
  {word:"benevolent",def:"Well meaning and kindly"},
  {word:"contemplate",def:"Think about something carefully"},
  {word:"eloquence",def:"Fluent and expressive speech"},
  {word:"melancholy",def:"A feeling of pensive sadness"},
  {word:"nostalgia",def:"Longing for the past"},
  {word:"obsolete",def:"No longer produced or used"},
  {word:"persevere",def:"Continue in a course of action despite difficulty"},
  {word:"profound",def:"Very great or intense"},
  {word:"sarcastic",def:"Saying the opposite of what you mean mockingly"},
  {word:"spontaneous",def:"Performed without planning"},
  {word:"transparent",def:"Easy to perceive or detect"},
  {word:"vulnerable",def:"Susceptible to physical or emotional attack"},
  {word:"exquisite",def:"Extremely beautiful and delicate"},
];

export function VocabBuilder({ T, onBack, onSettings, settings={} }) {
  const sv = gLoad("vocab");
  const [vocabList] = useState(()=>[...VOCAB].sort(()=>Math.random()-.5));
  const [idx, setIdx] = useState(()=> sv?.idx||0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(()=> sv?.correct||0);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const item = vocabList[idx] || vocabList[0];
  useEffect(()=>{ if(!done) gSave("vocab",{idx,correct}); },[idx,correct,done]);

  const handleType = e=>{
    const v=e.target.value;
    setTyped(v);
    if(v.toLowerCase()===item.word){
      if(!muted)playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);
      const ni=idx+1;
      if(ni>=vocabList.length)setDone(true);
      else{setIdx(ni);setTyped("");}
    } else if(v.length>item.word.length){
      if(!muted)playTone(220,"sawtooth",.15,.2);
      setWrong(true);setTyped("");setTimeout(()=>setWrong(false),500);
    }
  };

  if(done) return <ResultScreen emoji="📚" title="Vocab Complete!" color="#34d399" stats={[["Correct",`${correct}/${vocabList.length}`],["Accuracy",Math.round(correct/vocabList.length*100)+"%"]]} onRetry={()=>{gClear("vocab");setIdx(0);setTyped("");setCorrect(0);setDone(false);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>📚 Vocab Builder</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1} / {vocabList.length}</div>
    <div style={{background:"#0d1a0d",border:"1px solid #1a3a1a",borderRadius:12,padding:"24px 20px",marginBottom:12,textAlign:"center"}}>
      <div style={{color:"#34d399",fontSize:13,letterSpacing:2,marginBottom:8}}>DEFINITION</div>
      <div style={{color:"#e0e0ff",fontSize:18,lineHeight:1.6,fontStyle:"italic"}}>"{item.def}"</div>
    </div>
    <div style={{background:T.card,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:12,padding:"16px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:22,textAlign:"center",letterSpacing:2,transition:"border-color .15s"}}>
      {item.word.split("").map((ch,i)=><span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?T.purple:T.faint,borderBottom:i===typed.length?"2px solid "+T.purple:"2px solid transparent"}}>{ch}</span>)}
    </div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the word..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── SPELLING BEE ─────────────────────────────────────────────────────────────
const BEE_DIFFS = ["super_easy","easy","normal","medium","hard","super_hard","impossible"];
const BEE_LABELS = {super_easy:"⭐ Super Easy",easy:"⭐⭐ Easy",normal:"⭐⭐⭐ Normal",medium:"🔥 Medium",hard:"💀 Hard",super_hard:"☠️ Super Hard",impossible:"👾 Impossible"};

export function SpellingBee({ T, onBack, onSettings, settings = {} }) {
  const diff = settings.difficulty || "normal";
  const wordBank = SPELLING_BEE_WORDS[diff] || SPELLING_BEE_WORDS.normal;
  const sv = gLoad("spellingbee");
  const [words] = useState(()=> sv?.words || [...wordBank].sort(()=>Math.random()-.5));
  const [idx, setIdx] = useState(()=> sv?.idx || 0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(()=> sv?.correct || 0);
  const [wrong, setWrong] = useState(false);
  const [wrongFlash, setWrongFlash] = useState("");
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);
  const item = words[idx] || words[0];
  const target = item?.word || "";
  useEffect(()=>{ if(!done) gSave("spellingbee",{words,idx,correct}); },[idx,correct,done]);
  useEffect(()=>{
    setRevealed(false); setTyped("");
    if(!muted) setTimeout(()=>speakWord(target, 0.7), 300);
    setTimeout(()=>ref.current?.focus(),50);
  },[idx]);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    if (v.toLowerCase() === target) {
      if (!muted) playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);
      const ni = idx+1;
      if (ni >= words.length) setDone(true);
      else setIdx(ni);
    } else if (v.length > target.length) {
      if (!muted) playTone(220,"sawtooth",.15,.2);
      setWrong(true); setWrongFlash(v.trim()); setTyped("");
      setTimeout(()=>{ setWrong(false); setWrongFlash(""); }, 600);
    }
  };

  const skip = () => {
    setRevealed(true);
    setTimeout(()=>{ const ni=idx+1; if(ni>=words.length)setDone(true); else setIdx(ni); }, 1500);
  };

  if (done) return <ResultScreen emoji="🐝" title="Spelling Bee Done!" color="#facc15"
    stats={[["Difficulty",BEE_LABELS[diff]],["Correct",`${correct}/${words.length}`],["Score",Math.round(correct/words.length*100)+"%"]]}
    onRetry={()=>{gClear("spellingbee");setIdx(0);setTyped("");setCorrect(0);setDone(false);setRevealed(false);}} T={T}/>;

  return (<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <BackBtn onBack={onBack} onSettings={onSettings} T={T}/>
      <span style={{color:T.text,fontWeight:800,fontSize:20}}>🐝 Spelling Bee</span>
      <SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:12}}>
      <span style={{color:"#facc15",fontWeight:700}}>{BEE_LABELS[diff]}</span>
      <span style={{color:T.muted}}>{idx+1} / {words.length} · {correct} correct</span>
    </div>
    {/* Definition card */}
    <div style={{background:"#0d1a0d",border:"1px solid #facc1533",borderRadius:12,padding:"20px 24px",marginBottom:12,textAlign:"center",minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"#facc15",fontSize:11,letterSpacing:2,marginBottom:8}}>DEFINITION</div>
      <div style={{color:"#e0e0ff",fontSize:16,lineHeight:1.6,fontStyle:"italic"}}>"{item?.def}"</div>
      {revealed && <div style={{color:"#facc15",fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:800,marginTop:12,letterSpacing:3}}>{target}</div>}
    </div>
    <button onClick={()=>speakWord(target, 0.7)} style={{width:"100%",marginBottom:10,padding:"8px",borderRadius:8,border:"1px solid #facc1533",background:"#1a1500",color:"#facc15",fontSize:13,cursor:"pointer",fontFamily:T.font}}>
      🔊 Hear the word again
    </button>
    {/* Typed display */}
    <div style={{background:T.card,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:12,padding:"16px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:22,textAlign:"center",letterSpacing:3,minHeight:60,transition:"border-color .15s"}}>
      {wrong ? (
        <span style={{color:"#ef4444"}}>{wrongFlash}</span>
      ) : (
        target.split("").map((ch,i)=>(
          <span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?"#facc15":T.faint,borderBottom:i===typed.length?"2px solid #facc15":"2px solid transparent"}}>{i<typed.length?typed[i]:"_"}</span>
        ))
      )}
    </div>
    <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Spell the word..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box",marginBottom:8}}/>
    {!revealed && (
      <button onClick={skip} style={{width:"100%",padding:"8px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:12,cursor:"pointer",fontFamily:T.font}}>
        Give up — show answer
      </button>
    )}
  </div>);
}

// ─── TYPING INVADERS ──────────────────────────────────────────────────────────
export function TypingInvaders({ T, onBack, onSettings, settings={} }) {
  const COLS = 5, ROWS = 3;
  const [invaders, setInvaders] = useState(()=>{
    const grid=[];
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) grid.push({id:`${r}-${c}`,word:pickWords(1,POOL_INVADERS)[0],col:c,row:r,alive:true});
    return grid;
  });
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [yOffset, setYOffset] = useState(0);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [muted, setMuted] = useState(false);
  const [direction, setDirection] = useState(1);
  const ref = useRef(null);
  const frameRef = useRef(null);
  const yRef = useRef(0);
  const dirRef = useRef(1);
  const invRef = useRef(invaders);
  invRef.current = invaders;

  useEffect(()=>{
    ref.current?.focus();
    let last=performance.now();
    const speed = 0.008+wave*0.003;
    const loop=(now)=>{
      const dt=now-last;last=now;
      yRef.current+=speed*dt;
      setYOffset(yRef.current);
      if(yRef.current>70){setDead(true);cancelAnimationFrame(frameRef.current);return;}
      frameRef.current=requestAnimationFrame(loop);
    };
    frameRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(frameRef.current);
  },[wave]);

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    const match=invRef.current.find(inv=>inv.alive&&inv.word===v.trim());
    if(match){
      if(!muted)playTone(660+score*10,"sine",.1,.2);
      const newInv=invRef.current.map(inv=>inv.id===match.id?{...inv,alive:false}:inv);
      setInvaders(newInv);
      setScore(s=>s+1);
      setTyped("");
      if(newInv.every(inv=>!inv.alive)){
        cancelAnimationFrame(frameRef.current);
        yRef.current=0;setYOffset(0);
        setWave(w=>w+1);
        setInvaders(Array.from({length:COLS*ROWS},(_,i)=>({id:`w${wave+1}-${i}`,word:pickWords(1,wave<3?WORDS_EASY:WORDS_MED)[0],col:i%COLS,row:Math.floor(i/COLS),alive:true})));
        if(!muted)[0,.2,.4].forEach(t=>setTimeout(()=>playTone(880,"sine",.1,.2),t*1000));
      }
    }
  };

  const reset=()=>{
    cancelAnimationFrame(frameRef.current);yRef.current=0;setYOffset(0);setScore(0);setWave(1);setDead(false);setWon(false);setTyped("");
    setInvaders(Array.from({length:COLS*ROWS},(_,i)=>({id:`new-${i}`,word:pickWords(1,POOL_INVADERS)[0],col:i%COLS,row:Math.floor(i/COLS),alive:true})));
    setTimeout(()=>ref.current?.focus(),50);
  };

  if(dead) return <ResultScreen emoji="👾" title="Invaded!" color="#ef4444" stats={[["Wave",wave],["Destroyed",score]]} onRetry={reset} T={T}/>;

  const cellW=100/COLS;
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>👾 Typing Invaders</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
      <span style={{color:"#34d399",fontWeight:700}}>Wave {wave} · {score} destroyed</span>
    </div>
    <div style={{position:"relative",height:220,background:"#020208",border:"1px solid #0a0a20",borderRadius:12,overflow:"hidden",marginBottom:10}}>
      {/* Stars */}
      {[...Array(30)].map((_,i)=><div key={i} style={{position:"absolute",width:1,height:1,background:"#fff",opacity:.4,top:`${(i*37)%100}%`,left:`${(i*61)%100}%`}}/>)}
      {/* Player ship */}
      <div style={{position:"absolute",bottom:4,left:"50%",transform:"translateX(-50%)",fontSize:18}}>🚀</div>
      {/* Defense line */}
      <div style={{position:"absolute",bottom:28,left:0,right:0,height:2,background:"#ef444433"}}/>
      {/* Invaders */}
      {invaders.filter(inv=>inv.alive).map(inv=>(
        <div key={inv.id} style={{position:"absolute",left:`${inv.col*cellW+2}%`,top:`${inv.row*22+yOffset}%`,width:`${cellW-4}%`,textAlign:"center"}}>
          <div style={{fontSize:14}}>👾</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:typed&&inv.word.startsWith(typed.trim())?"#88ff88":"#ef4444",fontWeight:typed&&inv.word.startsWith(typed.trim())?800:400,textShadow:typed&&inv.word.startsWith(typed.trim())?"0 0 6px #00ff00":"none"}}>{inv.word}</div>
        </div>
      ))}
    </div>
    <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type invader words to destroy them..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── ASTEROID BELT ────────────────────────────────────────────────────────────
export function AsteroidBelt({ T, onBack, onSettings, settings={} }) {
  const [asteroids, setAsteroids] = useState([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(settings.lives||3);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const astRef = useRef([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(settings.lives||3);
  const frameRef = useRef(null);
  const lastSpawn = useRef(0);
  const idRef = useRef(0);
  const inputRef = useRef(null);

  useEffect(()=>{
    inputRef.current?.focus();
    let last=performance.now();
    const loop=(now)=>{
      const dt=now-last;last=now;
      // Move asteroids
      const updated=astRef.current.map(a=>({...a,x:a.x+a.vx*dt*.05,y:a.y+a.vy*dt*.05,angle:a.angle+a.spin*dt*.02}));
      const alive=updated.filter(a=>{
        const outOfBounds=a.x<-15||a.x>115||a.y<-15||a.y>115;
        if(outOfBounds&&!a.hit){livesRef.current--;setLives(livesRef.current);if(!muted)playTone(120,"sawtooth",.3,.25);if(livesRef.current<=0){setDone(true);cancelAnimationFrame(frameRef.current);}return false;}
        return !outOfBounds;
      });
      // Spawn
      if(now-lastSpawn.current>1500){
        const side=Math.floor(Math.random()*4);
        let x=50,y=50,vx=(Math.random()-.5)*2,vy=(Math.random()-.5)*2;
        if(side===0){x=Math.random()*100;y=-5;vy=Math.abs(vy);}
        else if(side===1){x=105;y=Math.random()*100;vx=-Math.abs(vx);}
        else if(side===2){x=Math.random()*100;y=105;vy=-Math.abs(vy);}
        else{x=-5;y=Math.random()*100;vx=Math.abs(vx);}
        alive.push({id:idRef.current++,word:pickWords(1,POOL_INVADERS)[0],x,y,vx,vy,angle:0,spin:(Math.random()-.5)*.5,hit:false});
        lastSpawn.current=now;
      }
      astRef.current=alive;
      setAsteroids([...alive]);
      frameRef.current=requestAnimationFrame(loop);
    };
    frameRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(frameRef.current);
  },[muted]);

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    const match=astRef.current.find(a=>!a.hit&&a.word===v.trim());
    if(match){
      if(!muted)playTone(880,"sine",.1,.2);
      astRef.current=astRef.current.filter(a=>a.id!==match.id);
      scoreRef.current++;setScore(scoreRef.current);setTyped("");
    }
  };

  const reset=()=>{cancelAnimationFrame(frameRef.current);astRef.current=[];setAsteroids([]);setTyped("");setScore(0);const l=settings.lives||3;setLives(l);livesRef.current=l;setDone(false);lastSpawn.current=0;};

  if(done) return <ResultScreen emoji="☄️" title="Asteroid Hit!" color="#f59e0b" stats={[["Destroyed",score],["Lives",settings.lives||3]]} onRetry={reset} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>☄️ Asteroid Belt</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
      <span style={{color:"#f59e0b",fontWeight:700}}>{score} destroyed</span>
      <span>{"❤️".repeat(lives)}{"🖤".repeat((settings.lives||3)-lives)}</span>
    </div>
    <div style={{position:"relative",height:240,background:"#020208",border:"1px solid #1a1a30",borderRadius:12,overflow:"hidden",marginBottom:10}}>
      {[...Array(40)].map((_,i)=><div key={i} style={{position:"absolute",width:1,height:1,background:"#fff",opacity:.5,top:`${(i*37)%100}%`,left:`${(i*61)%100}%`}}/>)}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:20}}>🚀</div>
      {asteroids.map(a=>(
        <div key={a.id} style={{position:"absolute",left:`${a.x}%`,top:`${a.y}%`,transform:`rotate(${a.angle}rad)`,textAlign:"center"}}>
          <div style={{fontSize:16}}>☄️</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:typed&&a.word.startsWith(typed.trim())?"#88ff88":"#f59e0b",fontWeight:typed&&a.word.startsWith(typed.trim())?800:400,textShadow:typed&&a.word.startsWith(typed.trim())?"0 0 6px #ffff00":"none",whiteSpace:"nowrap"}}>{a.word}</div>
        </div>
      ))}
    </div>
    <input ref={inputRef} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type asteroid words to destroy them..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── TOWER DEFENSE ────────────────────────────────────────────────────────────
export function TowerDefense({ T, onBack, onSettings, settings={} }) {
  const TRACK = [{x:0,y:50},{x:25,y:50},{x:25,y:20},{x:75,y:20},{x:75,y:80},{x:100,y:80}];
  const [enemies, setEnemies] = useState([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const enemyRef = useRef([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(20);
  const frameRef = useRef(null);
  const lastSpawn = useRef(0);
  const idRef = useRef(0);
  const inputRef = useRef(null);
  const waveRef = useRef(1);

  const getPos=(t)=>{
    let rem=t*100,i=0;
    while(i<TRACK.length-1){
      const dx=TRACK[i+1].x-TRACK[i].x,dy=TRACK[i+1].y-TRACK[i].y;
      const len=Math.sqrt(dx*dx+dy*dy);
      if(rem<=len) return {x:TRACK[i].x+dx*(rem/len),y:TRACK[i].y+dy*(rem/len)};
      rem-=len;i++;
    }
    return TRACK[TRACK.length-1];
  };

  useEffect(()=>{
    inputRef.current?.focus();
    let last=performance.now();
    const spawnInterval=Math.max(800,1500-waveRef.current*100);
    const speed=0.0001+waveRef.current*0.00005;
    const loop=(now)=>{
      const dt=now-last;last=now;
      const updated=enemyRef.current.map(e=>({...e,t:e.t+speed*dt}));
      const alive=updated.filter(e=>{
        if(e.t>=1){livesRef.current-=1;setLives(livesRef.current);if(!muted)playTone(150,"sawtooth",.2,.2);if(livesRef.current<=0){setDone(true);cancelAnimationFrame(frameRef.current);}return false;}
        return true;
      });
      if(now-lastSpawn.current>spawnInterval&&alive.length<8){
        alive.push({id:idRef.current++,word:pickWords(1,waveRef.current<=2?POOL_INVADERS:TYPING_MEDIUM)[0],t:0,hp:1+Math.floor(waveRef.current/3)});
        lastSpawn.current=now;
      }
      if(scoreRef.current>0&&scoreRef.current%10===0&&scoreRef.current!==waveRef.current*10){waveRef.current++;setWave(waveRef.current);}
      enemyRef.current=alive;
      setEnemies([...alive]);
      frameRef.current=requestAnimationFrame(loop);
    };
    frameRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(frameRef.current);
  },[muted]);

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    const match=enemyRef.current.find(en=>en.word===v.trim());
    if(match){
      if(!muted)playTone(660,"sine",.08,.2);
      const newEn=enemyRef.current.map(en=>en.id===match.id?{...en,hp:en.hp-1}:en).filter(en=>en.hp>0);
      enemyRef.current=newEn;setEnemies([...newEn]);
      scoreRef.current++;setScore(scoreRef.current);setTyped("");
    }
  };

  const reset=()=>{cancelAnimationFrame(frameRef.current);enemyRef.current=[];setEnemies([]);setTyped("");setScore(0);setLives(20);livesRef.current=20;setWave(1);waveRef.current=1;setDone(false);scoreRef.current=0;lastSpawn.current=0;};

  if(done) return <ResultScreen emoji="🏰" title="Base Destroyed!" color="#ef4444" stats={[["Wave",wave],["Stopped",score]]} onRetry={reset} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🏰 Tower Defense</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
      <span style={{color:"#34d399",fontWeight:700}}>Wave {wave} · {score} stopped</span>
      <span style={{color:lives<=5?"#ef4444":"#34d399",fontWeight:700}}>🏰 {lives} HP</span>
    </div>
    <div style={{position:"relative",height:200,background:"#0a1205",border:"1px solid #1a2a10",borderRadius:12,overflow:"hidden",marginBottom:10}}>
      {/* Track */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.3}} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={TRACK.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke="#8B6914" strokeWidth="8"/>
      </svg>
      {/* Base */}
      <div style={{position:"absolute",right:"2%",top:"72%",fontSize:20}}>🏰</div>
      {/* Enemies */}
      {enemies.map(e=>{
        const pos=getPos(e.t);
        return(<div key={e.id} style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",textAlign:"center"}}>
          <div style={{fontSize:12}}>👿</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:typed&&e.word.startsWith(typed.trim())?"#88ff88":"#ef4444",fontWeight:typed&&e.word.startsWith(typed.trim())?800:400,whiteSpace:"nowrap"}}>{e.word}</div>
        </div>);
      })}
    </div>
    <input ref={inputRef} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type enemy words to stop them..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── MYSTERY WORDS ────────────────────────────────────────────────────────────
export function MysteryWords({ T, onBack, onSettings, settings={} }) {
  const SYMBOLS = "★◆■●▲▼♦♠♣♥◉⬟⬡◈";
  const sv = gLoad("mystery");
  const diff = settings.difficulty||"med";
  const pool = diff==="easy"?TYPING_BASIC:diff==="hard"?TYPING_HARD:POOL_MYSTERY;
  const [words] = useState(()=> sv?.words || pickWords(20,pool));
  const [idx, setIdx] = useState(()=> sv?.idx||0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(()=> sv?.correct||0);
  const [revealed, setRevealed] = useState(0); // how many chars revealed
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const target = words[idx]||"";
  const encoded = target.split("").map((_,i)=>i<revealed?target[i]:SYMBOLS[i%SYMBOLS.length]).join("");
  useEffect(()=>{ if(!done) gSave("mystery",{words,idx,correct}); },[idx,correct,done]);
  useEffect(()=>{setRevealed(0);setTimeout(()=>ref.current?.focus(),50);},[idx]);

  // Reveal one char every 2s
  useEffect(()=>{
    if(revealed>=target.length) return;
    const t=setTimeout(()=>setRevealed(r=>r+1),2000);
    return ()=>clearTimeout(t);
  },[revealed,target]);

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    if(v.toLowerCase()===target){
      if(!muted)playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);
      const ni=idx+1;
      if(ni>=words.length)setDone(true);
      else{setIdx(ni);setTyped("");}
    } else if(v.length>target.length){
      if(!muted)playTone(220,"sawtooth",.1,.15);setTyped("");
    }
  };

  if(done) return <ResultScreen emoji="🔮" title="Mystery Solved!" color="#a78bfa" stats={[["Correct",`${correct}/${words.length}`]]} onRetry={()=>{gClear("mystery");setIdx(0);setTyped("");setCorrect(0);setDone(false);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🔮 Mystery Words</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#0d0020",border:"1px solid #a78bfa33",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#a78bfa",textAlign:"center"}}>Symbols reveal as letters — type the word</div>
    <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1}/{words.length} · {correct} correct</div>
    <div style={{background:"#0d0020",border:"1px solid #a78bfa33",borderRadius:12,padding:"24px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:28,textAlign:"center",letterSpacing:4,minHeight:90,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {encoded.split("").map((ch,i)=>(
        <span key={i} style={{color:i<revealed?"#a78bfa":"#444",fontWeight:i<revealed?800:400,transition:"color .3s"}}>{ch}</span>
      ))}
    </div>
    <div style={{textAlign:"center",color:T.faint,fontSize:11,marginBottom:8}}>{revealed}/{target.length} letters revealed</div>
    <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the mystery word..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── RHYME TIME ───────────────────────────────────────────────────────────────
export function RhymeTime({ T, onBack, onSettings, settings={} }) {
  const pairs = Object.entries(RHYMES);
  const [order] = useState(()=>[...pairs].sort(()=>Math.random()-.5).slice(0,10));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [accepted, setAccepted] = useState([]);
  const ref = useRef(null);
  const [word, rhymes] = order[idx] || ["",[]];

  const handleType=e=>{
    const v=e.target.value.toLowerCase().replace(/[^a-z]/g,"");
    setTyped(v);
    if(rhymes.includes(v)&&!accepted.includes(v)){
      if(!muted)playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);
      const ni=idx+1;
      if(ni>=order.length)setDone(true);
      else{setIdx(ni);setAccepted([]);setTyped("");}
    } else if(v.length>=6&&!rhymes.includes(v)){
      if(!muted)playTone(220,"sawtooth",.1,.15);
      setWrong(true);setTyped("");setTimeout(()=>setWrong(false),400);
    }
  };

  if(done) return <ResultScreen emoji="🎵" title="Rhyme Master!" color="#f472b6" stats={[["Score",correct]]} onRetry={()=>{setIdx(0);setTyped("");setCorrect(0);setDone(false);setAccepted([]);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🎵 Rhyme Time</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#1a0010",border:"1px solid #f472b633",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#f472b6",textAlign:"center"}}>Type a word that rhymes with the one shown</div>
    <div style={{textAlign:"center",marginBottom:10,fontSize:13,color:T.muted}}>{idx+1}/{order.length}</div>
    <div style={{background:T.card,border:"1px solid #f472b633",borderRadius:12,padding:"24px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:32,textAlign:"center",letterSpacing:4,color:"#f472b6",fontWeight:800}}>
      {word}
    </div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder={`Type a word that rhymes with "${word}"...`}
      style={{width:"100%",background:wrong?"#ef444411":T.bg,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box",transition:"all .15s"}}/>
    <div style={{marginTop:8,color:T.faint,fontSize:11,textAlign:"center"}}>Possible: {rhymes.slice(0,3).join(", ")} and more...</div>
  </div>);
}

// ─── MAD LIBS ─────────────────────────────────────────────────────────────────
const MAD_LIBS_TEMPLATES = [
  {story:"One day, a {adj} {noun} went to the {place}. It {verb} very {adv} and everyone was {adj2}.",fields:[{key:"adj",label:"Adjective"},{key:"noun",label:"Noun"},{key:"place",label:"Place"},{key:"verb",label:"Verb (past)"},{key:"adv",label:"Adverb"},{key:"adj2",label:"Adjective"}]},
  {story:"My {adj} teacher told me to {verb} my {noun} every {time}. I {verb2} it was {adj2}.",fields:[{key:"adj",label:"Adjective"},{key:"verb",label:"Verb"},{key:"noun",label:"Noun"},{key:"time",label:"Time period"},{key:"verb2",label:"Verb (past)"},{key:"adj2",label:"Adjective"}]},
  {story:"The {adj} spaceship landed on {planet}. The aliens were very {adj2} and smelled like {noun}. They {verb} back to space.",fields:[{key:"adj",label:"Adjective"},{key:"planet",label:"Planet name"},{key:"adj2",label:"Adjective"},{key:"noun",label:"Noun"},{key:"verb",label:"Verb (past)"}]},
];

export function MadLibs({ T, onBack, onSettings, settings={} }) {
  const [templateIdx] = useState(()=>Math.floor(Math.random()*MAD_LIBS_TEMPLATES.length));
  const template = MAD_LIBS_TEMPLATES[templateIdx];
  const [fieldIdx, setFieldIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const currentField = template.fields[fieldIdx];

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    if(e.nativeEvent.key==="Enter"||v.endsWith("\n")){
      if(!v.trim()) return;
      if(!muted)playTone(660,"sine",.08,.15);
      setAnswers(a=>({...a,[currentField.key]:v.trim()}));
      const ni=fieldIdx+1;
      if(ni>=template.fields.length) setDone(true);
      else{setFieldIdx(ni);setTyped("");}
    }
  };

  const storyFilled = template.story.replace(/\{(\w+)\}/g,(_,k)=>answers[k]?`<b style="color:#a78bfa">${answers[k]}</b>`:k);
  const reset=()=>{setFieldIdx(0);setAnswers({});setTyped("");setDone(false);setTimeout(()=>ref.current?.focus(),50);};

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>😂 Mad Libs</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",marginBottom:12,fontSize:15,lineHeight:1.9,minHeight:80}} dangerouslySetInnerHTML={{__html:storyFilled}}/>
    {done?(
      <div style={{textAlign:"center",padding:"16px 0"}}>
        <div style={{fontSize:36,marginBottom:8}}>😂</div>
        <div style={{color:T.purple,fontWeight:700,marginBottom:12}}>Your Mad Lib is complete!</div>
        <button onClick={reset} style={{padding:"10px 28px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Play Again</button>
      </div>
    ):(
      <>
        <div style={{color:T.faint,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{currentField?.label} ({fieldIdx+1}/{template.fields.length})</div>
        <input ref={ref} autoFocus value={typed} onChange={handleType} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();if(!typed.trim())return;if(!muted)playTone(660,"sine",.08,.15);setAnswers(a=>({...a,[currentField.key]:typed.trim()}));const ni=fieldIdx+1;if(ni>=template.fields.length)setDone(true);else{setFieldIdx(ni);setTyped("");}}}} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder={`Type a ${currentField?.label?.toLowerCase()}...`}
          style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
        <div style={{color:T.faint,fontSize:11,marginTop:4,textAlign:"center"}}>Press Enter to confirm</div>
      </>
    )}
  </div>);
}

export default { HundredWords, Endurance, Roulette, WordChain, CategoryBlitz, VocabBuilder, SpellingBee, TypingInvaders, AsteroidBelt, TowerDefense, MysteryWords, RhymeTime, MadLibs };
