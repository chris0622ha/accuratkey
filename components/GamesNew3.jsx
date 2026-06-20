"use client";
import React, { useState, useRef, useEffect } from "react";
import { TYPING_BASIC, TYPING_MEDIUM, TYPING_HARD, ALL_WORDS, POOL_MYSTERY, pickWords } from "./WordDB";
import { SYN_ANT, SYNONYMS_ONLY, ANTONYMS_ONLY, ALL_SYN_ANT } from "./SynAntDB";

function gSave(id,d){try{localStorage.setItem("ak_gs_"+id,JSON.stringify(d));}catch{}}
function gLoad(id){try{return JSON.parse(localStorage.getItem("ak_gs_"+id)||"null");}catch{return null;}}
function gClear(id){try{localStorage.removeItem("ak_gs_"+id);}catch{}}
function getSfxCtx(){if(typeof window==="undefined")return null;if(!window._akCtx||window._akCtx.state==="closed")window._akCtx=new(window.AudioContext||window.webkitAudioContext)();return window._akCtx;}
function playTone(freq,type="sine",duration=0.15,vol=0.18){const ctx=getSfxCtx();if(!ctx)return;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+duration);o.start();o.stop(ctx.currentTime+duration+0.05);}catch(e){}}

function SoundBtn({muted,toggle,T}){return <button onClick={toggle} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.faint,fontSize:12,padding:"3px 8px",cursor:"pointer",fontFamily:T.font}}>{muted?"🔇":"🔊"}</button>;}
function BackBtn({onBack,onSettings,T}){return(<div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={onBack} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font,padding:0}}>← Back</button>{onSettings&&<button onClick={onSettings} style={{background:"none",border:"1px solid #2a2a4a",borderRadius:6,color:"#555",fontSize:12,padding:"2px 7px",cursor:"pointer"}}>⚙️</button>}</div>);}
function ResultScreen({emoji,title,color,stats,onRetry,T}){return(<div style={{textAlign:"center",padding:"28px 20px",background:T.card,border:`1px solid ${color}55`,borderRadius:12}}><div style={{fontSize:48,marginBottom:8}}>{emoji}</div><div style={{color,fontWeight:800,fontSize:22,marginBottom:12}}>{title}</div>{stats.map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}><span style={{color:T.muted,fontSize:13}}>{l}</span><span style={{color:T.text,fontWeight:700,fontSize:13}}>{v}</span></div>))}<button onClick={onRetry} style={{marginTop:20,padding:"12px 32px",borderRadius:10,border:"none",background:color,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Play Again</button></div>);}

// ─── SPEED TEST ───────────────────────────────────────────────────────────────
export function SpeedTest({ T, onBack, onSettings, settings={} }) {
  const DURATION = (settings.duration || 1) * 60;
  const diff2 = settings.difficulty||"medium";
  const [words] = useState(()=>pickWords(300, diff2==="easy"?TYPING_BASIC:diff2==="hard"?TYPING_HARD:TYPING_MEDIUM));
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const target = words.join(" ");

  useEffect(()=>{
    if(!started||done) return;
    const iv=setInterval(()=>setTimeLeft(t=>{if(t<=1){setDone(true);clearInterval(iv);return 0;}return t-1;}),1000);
    return ()=>clearInterval(iv);
  },[started,done]);

  const handleType=e=>{
    const v=e.target.value;
    if(!started&&v.length>0)setStarted(true);
    setTyped(v);
  };

  const correct = typed.split("").filter((c,i)=>c===target[i]).length;
  const errors = typed.length - correct;
  const elapsed = (DURATION-timeLeft)/60||0.001;
  const wpm = Math.round((typed.length/5)/Math.max(elapsed,0.001));
  const acc = typed.length>0?Math.round(correct/typed.length*100):100;
  const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;

  const windowStart = Math.max(0, typed.length-80);
  const shown = target.slice(windowStart, windowStart+200);

  if(done) return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>⏱️ Speed Test Results</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[["WPM",wpm,T.purple],["Accuracy",acc+"%","#34d399"],["Words",wordsTyped,"#facc15"],["Errors",errors,"#ef4444"],["Characters",typed.length,T.muted],["Duration",settings.duration||1+" min",T.muted]].map(([l,v,c])=>(
          <div key={l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px 16px",textAlign:"center"}}>
            <div style={{color:T.faint,fontSize:10,letterSpacing:2,marginBottom:4}}>{l}</div>
            <div style={{color:c,fontWeight:800,fontSize:22}}>{v}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>{setTyped("");setTimeLeft(DURATION);setStarted(false);setDone(false);setTimeout(()=>ref.current?.focus(),50);}} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Try Again</button>
    </div>
  );

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>⏱️ Speed Test</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
      <span style={{color:T.purple,fontWeight:700}}>{started?wpm:0} WPM · {acc}%</span>
      <span style={{color:timeLeft<=10?"#ef4444":"#f59e0b",fontWeight:700}}>⏱ {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}</span>
    </div>
    <div style={{height:4,background:T.border,borderRadius:2,marginBottom:10,overflow:"hidden"}}>
      <div style={{height:"100%",width:(timeLeft/DURATION*100)+"%",background:timeLeft<=10?"#ef4444":"#f59e0b",transition:"width 1s linear"}}/>
    </div>
    <div onClick={()=>ref.current?.focus()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:15,lineHeight:1.9,cursor:"text",userSelect:"none",minHeight:80}}>
      {shown.split("").map((ch,i)=>{const ai=windowStart+i;let color=T.faint;if(ai<typed.length)color=typed[ai]===ch?"#34d399":"#ef4444";else if(ai===typed.length)color=T.purple;return<span key={ai} style={{color,borderBottom:ai===typed.length?"2px solid "+T.purple:"2px solid transparent"}}>{ch}</span>;})}
    </div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{position:"absolute",opacity:0,pointerEvents:"none"}}/>
    {!started&&<div style={{textAlign:"center",color:T.faint,fontSize:12,marginTop:4}}>Start typing to begin the timer</div>}
  </div>);
}

// ─── MISSING LETTERS ──────────────────────────────────────────────────────────
export function MissingLetters({ T, onBack, onSettings, settings={} }) {
  const diff = settings.difficulty||"medium";
  const pool = diff==="easy"?TYPING_BASIC:diff==="hard"?TYPING_HARD:TYPING_MEDIUM;
  const sv = gLoad("missing");
  const [words] = useState(()=>sv?.words||pickWords(count,pool));
  const [idx, setIdx] = useState(()=>sv?.idx||0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(()=>sv?.correct||0);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [wrong, setWrong] = useState(false);
  const ref = useRef(null);
  const target = words[idx]||"";
  const hideRateMap = {low:0.25, medium:0.45, high:0.65};
  const hideRate = hideRateMap[settings.hideRate||"medium"] || (diff==="easy"?0.3:diff==="hard"?0.6:0.45);
  const count = settings.count || 20;
  useEffect(()=>{if(!done)gSave("missing",{words,idx,correct});},[idx,correct,done]);

  // Generate consistent mask for this word
  const mask = React.useMemo(()=>{
    const m=[];
    // Always show first and last letter
    for(let i=0;i<target.length;i++){
      if(i===0||i===target.length-1) m.push(true);
      else m.push(Math.random()>hideRate);
    }
    return m;
  },[target]);

  const displayed = target.split("").map((ch,i)=>mask[i]?ch:"_").join(" ");

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
      if(!muted)playTone(220,"sawtooth",.15,.2);
      setWrong(true);setTyped("");setTimeout(()=>setWrong(false),500);
    }
  };

  if(done) return <ResultScreen emoji="🔡" title="Gaps Filled!" color="#34d399" stats={[["Correct",`${correct}/${words.length}`],["Score",Math.round(correct/words.length*100)+"%"]]} onRetry={()=>{gClear("missing");setIdx(0);setTyped("");setCorrect(0);setDone(false);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🔡 Missing Letters</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#34d39911",border:"1px solid #34d39933",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#34d399",textAlign:"center"}}>Fill in the missing letters</div>
    <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1} / {words.length} · {correct} correct</div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:26,textAlign:"center",letterSpacing:6,minHeight:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:T.text}}>{displayed}</span>
    </div>
    <div style={{background:T.card,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:12,padding:"14px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:22,textAlign:"center",letterSpacing:2,transition:"border-color .15s"}}>
      {target.split("").map((ch,i)=><span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?T.purple:T.faint,borderBottom:i===typed.length?"2px solid "+T.purple:"2px solid transparent"}}>{i<typed.length?typed[i]:"_"}</span>)}
    </div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the complete word..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── ANAGRAM ──────────────────────────────────────────────────────────────────
function scramble(word){
  const arr=word.split("");
  let tries=0;
  do{arr.sort(()=>Math.random()-.5);tries++;}while(arr.join("")===word&&tries<20);
  return arr.join("");
}

export function Anagram({ T, onBack, onSettings, settings={} }) {
  const diff = settings.difficulty||"medium";
  const pool = diff==="easy"?TYPING_BASIC.filter(w=>w.length>=4&&w.length<=6):diff==="hard"?TYPING_HARD.filter(w=>w.length>=5&&w.length<=9):TYPING_MEDIUM.filter(w=>w.length>=4&&w.length<=8);
  const sv = gLoad("anagram");
  const [words] = useState(()=>sv?.words||pickWords(count,pool));
  const [idx, setIdx] = useState(()=>sv?.idx||0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(()=>sv?.correct||0);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const ref = useRef(null);
  const target = words[idx]||"";
  const scrambled = React.useMemo(()=>scramble(target),[target]);
  useEffect(()=>{if(!done)gSave("anagram",{words,idx,correct});},[idx,correct,done]);
  useEffect(()=>{setSkipped(false);setTyped("");setTimeout(()=>ref.current?.focus(),50);},[idx]);

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    if(v.toLowerCase()===target){
      if(!muted)playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);
      const ni=idx+1;
      if(ni>=words.length)setDone(true);
      else setIdx(ni);
    } else if(v.length>target.length){
      if(!muted)playTone(220,"sawtooth",.15,.2);
      setWrong(true);setTyped("");setTimeout(()=>setWrong(false),500);
    }
  };

  const skip=()=>{setSkipped(true);setTimeout(()=>{const ni=idx+1;if(ni>=words.length)setDone(true);else setIdx(ni);},1200);};

  if(done) return <ResultScreen emoji="🔀" title="Anagram Master!" color="#a78bfa" stats={[["Solved",`${correct}/${words.length}`],["Score",Math.round(correct/words.length*100)+"%"]]} onRetry={()=>{gClear("anagram");setIdx(0);setTyped("");setCorrect(0);setDone(false);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🔀 Anagram</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#a78bfa11",border:"1px solid #a78bfa33",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#a78bfa",textAlign:"center"}}>Unscramble the letters to form a real word</div>
    <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1}/{words.length} · {correct} correct</div>
    <div style={{background:T.card,border:"1px solid #a78bfa33",borderRadius:12,padding:"24px 20px",marginBottom:10,textAlign:"center"}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:32,letterSpacing:8,color:"#a78bfa",fontWeight:800}}>
        {skipped?<span style={{color:"#facc15"}}>{target}</span>:scrambled.split("").map((ch,i)=>(
          <span key={i} style={{display:"inline-block",background:"#a78bfa22",borderRadius:6,margin:"0 2px",padding:"4px 8px"}}>{ch}</span>
        ))}
      </div>
    </div>
    {!skipped&&<>
      <div style={{background:T.card,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:12,padding:"14px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:22,textAlign:"center",letterSpacing:2}}>
        {target.split("").map((ch,i)=><span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?"#a78bfa":T.faint,borderBottom:i===typed.length?"2px solid #a78bfa":"2px solid transparent"}}>{i<typed.length?typed[i]:"_"}</span>)}
      </div>
      <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Unscramble the letters..."
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box",marginBottom:8}}/>
      <button onClick={skip} style={{width:"100%",padding:"8px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Give up — show answer</button>
    </>}
  </div>);
}

// ─── BRICK BREAKER ────────────────────────────────────────────────────────────
export function BrickBreaker({ T, onBack, onSettings, settings={} }) {
  const COLS=6, ROWS=settings.rows||4;
  const makeBricks=()=>Array.from({length:COLS*ROWS},(_,i)=>({id:i,word:pickWords(1,TYPING_BASIC.filter(w=>w.length>=3&&w.length<=5))[0],col:i%COLS,row:Math.floor(i/COLS),hp:1,alive:true}));
  const [bricks,setBricks]=useState(makeBricks);
  const [typed,setTyped]=useState("");
  const [score,setScore]=useState(0);
  const [wave,setWave]=useState(1);
  const [done,setDone]=useState(false);
  const [muted,setMuted]=useState(false);
  const ref=useRef(null);
  const bricksRef=useRef(bricks);
  bricksRef.current=bricks;

  useEffect(()=>ref.current?.focus(),[]);

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    const match=bricksRef.current.find(b=>b.alive&&b.word===v.trim());
    if(match){
      if(!muted)playTone(660+score*5,"sine",.08,.2);
      const nb=bricksRef.current.map(b=>b.id===match.id?{...b,alive:false}:b);
      setBricks(nb);
      setScore(s=>s+1);
      setTyped("");
      if(nb.every(b=>!b.alive)){
        // New wave
        if(!muted)[0,.15,.3].forEach(t=>setTimeout(()=>playTone(880,"sine",.1,.2),t*1000));
        setWave(w=>w+1);
        setBricks(makeBricks().map(b=>({...b,word:pickWords(1,wave>=3?TYPING_MEDIUM.filter(w=>w.length>=4&&w.length<=7):TYPING_BASIC.filter(w=>w.length>=3&&w.length<=5))[0],hp:Math.min(wave,3)})));
      }
    }
  };

  const COLORS=["#ef4444","#f59e0b","#34d399","#60a5fa","#a78bfa","#f472b6"];

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🧱 Brick Breaker</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}>
      <span style={{color:T.purple,fontWeight:700}}>Score: {score}</span>
      <span style={{color:"#f59e0b",fontWeight:700}}>Wave {wave}</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:`repeat(${COLS},1fr)`,gap:4,marginBottom:10,background:"#050510",padding:8,borderRadius:12,border:"1px solid #1a1a30"}}>
      {bricks.map(b=>(
        <div key={b.id} style={{height:36,borderRadius:6,background:b.alive?COLORS[b.col%COLORS.length]+"cc":"#0a0a1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:b.alive&&typed&&b.word.startsWith(typed.trim())?800:600,color:b.alive?(typed&&b.word.startsWith(typed.trim())?"#fff":"#fff"):"#1a1a2e",textShadow:b.alive&&typed&&b.word.startsWith(typed.trim())?"0 0 8px #fff":"none",transition:"all .15s",transform:b.alive&&typed&&b.word.startsWith(typed.trim())?"scale(1.05)":"scale(1)",boxShadow:b.alive&&typed&&b.word.startsWith(typed.trim())?`0 0 12px ${COLORS[b.col%COLORS.length]}`:"none"}}>
          {b.alive?b.word:""}
        </div>
      ))}
    </div>
    <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type brick words to destroy them..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── QUOTES ───────────────────────────────────────────────────────────────────
const QUOTES = [
  {text:"to be or not to be that is the question",author:"Shakespeare"},
  {text:"the only way to do great work is to love what you do",author:"Steve Jobs"},
  {text:"in the middle of every difficulty lies opportunity",author:"Albert Einstein"},
  {text:"life is what happens when you are busy making other plans",author:"John Lennon"},
  {text:"the future belongs to those who believe in the beauty of their dreams",author:"Eleanor Roosevelt"},
  {text:"it does not matter how slowly you go as long as you do not stop",author:"Confucius"},
  {text:"everything you can imagine is real",author:"Pablo Picasso"},
  {text:"the only impossible journey is the one you never begin",author:"Tony Robbins"},
  {text:"in three words I can sum up everything I have learned about life it goes on",author:"Robert Frost"},
  {text:"you only live once but if you do it right once is enough",author:"Mae West"},
  {text:"be yourself everyone else is already taken",author:"Oscar Wilde"},
  {text:"two things are infinite the universe and human stupidity and I am not sure about the universe",author:"Albert Einstein"},
  {text:"a room without books is like a body without a soul",author:"Marcus Tullius Cicero"},
  {text:"you have brains in your head you have feet in your shoes you can steer yourself in any direction you choose",author:"Dr. Seuss"},
  {text:"if you tell the truth you do not have to remember anything",author:"Mark Twain"},
  {text:"a friend is someone who knows all about you and still loves you",author:"Elbert Hubbard"},
  {text:"to live is the rarest thing in the world most people just exist",author:"Oscar Wilde"},
  {text:"without music life would be a mistake",author:"Friedrich Nietzsche"},
  {text:"we accept the love we think we deserve",author:"Stephen Chbosky"},
  {text:"do one thing every day that scares you",author:"Eleanor Roosevelt"},
  {text:"well behaved women seldom make history",author:"Laurel Thatcher Ulrich"},
  {text:"always forgive your enemies nothing annoys them so much",author:"Oscar Wilde"},
  {text:"live as if you were to die tomorrow learn as if you were to live forever",author:"Mahatma Gandhi"},
  {text:"that which does not kill us makes us stronger",author:"Friedrich Nietzsche"},
  {text:"the unexamined life is not worth living",author:"Socrates"},
  {text:"spread love everywhere you go let no one ever come to you without leaving happier",author:"Mother Teresa"},
  {text:"when you reach the end of your rope tie a knot in it and hang on",author:"Franklin D. Roosevelt"},
  {text:"always remember that you are absolutely unique just like everyone else",author:"Margaret Mead"},
  {text:"do not go where the path may lead go instead where there is no path and leave a trail",author:"Ralph Waldo Emerson"},
  {text:"you will face many defeats in life but never let yourself be defeated",author:"Maya Angelou"},
  {text:"the greatest glory in living lies not in never falling but in rising every time we fall",author:"Nelson Mandela"},
  {text:"in the end it is not the years in your life that count it is the life in your years",author:"Abraham Lincoln"},
  {text:"never let the fear of striking out keep you from playing the game",author:"Babe Ruth"},
  {text:"money and success do not change people they merely amplify what is already there",author:"Will Smith"},
  {text:"your time is limited so do not waste it living someone else's life",author:"Steve Jobs"},
  {text:"if life were predictable it would cease to be life and be without flavor",author:"Eleanor Roosevelt"},
  {text:"if you look at what you have in life you will always have more",author:"Oprah Winfrey"},
  {text:"if you set your goals ridiculously high and it is a failure you will fail above everyone else's success",author:"James Cameron"},
  {text:"life is not measured by the number of breaths we take but by the moments that take our breath away",author:"Maya Angelou"},
];

export function Quotes({ T, onBack, onSettings, settings={} }) {
  const sv = gLoad("quotes");
  const [order] = useState(()=>[...QUOTES].sort(()=>Math.random()-.5));
  const [idx, setIdx] = useState(()=>sv?.idx||0);
  const [typed, setTyped] = useState(()=>sv?.typed||"");
  const [done, setDone] = useState(false);
  const [start, setStart] = useState(()=>sv?.start||null);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const quote = order[idx]||order[0];
  const target = quote.text;
  useEffect(()=>{if(!done)gSave("quotes",{idx,typed,start});},[typed,done]);

  const wpm = start&&done?Math.round((target.length/5)/((Date.now()-start)/60000)):0;
  const acc = typed.length>0?Math.round(typed.split("").filter((c,i)=>c===target[i]).length/typed.length*100):100;

  const handleType=e=>{
    const v=e.target.value;
    if(!start&&v.length>0)setStart(Date.now());
    setTyped(v);
    if(v.length>=target.length){
      setDone(true);gClear("quotes");
      if(!muted)[0,.2,.4].forEach(t=>setTimeout(()=>playTone(880,"sine",.12,.2),t*1000));
    }
  };

  const next=()=>{
    const ni=idx+1;
    if(ni>=order.length){setIdx(0);}else setIdx(ni);
    setTyped("");setDone(false);setStart(null);
    setTimeout(()=>ref.current?.focus(),50);
  };

  const windowStart = Math.max(0,typed.length-60);
  const shown = target.slice(windowStart,windowStart+180);

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>💬 Quotes</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#13131f",border:"1px solid #1e1e30",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
      <div style={{color:"#facc15",fontSize:11,letterSpacing:2,marginBottom:6}}>QUOTE {idx+1} OF {order.length}</div>
      <div style={{color:T.muted,fontSize:12,fontStyle:"italic"}}>— {quote.author}</div>
    </div>
    {done?(
      <div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontSize:36,marginBottom:8}}>✨</div>
        <div style={{color:T.purple,fontWeight:800,fontSize:18,marginBottom:4}}>Quote complete!</div>
        <div style={{color:T.muted,fontSize:13,marginBottom:16}}>{wpm} WPM · {acc}% accuracy</div>
        <button onClick={next} style={{padding:"12px 32px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Next Quote →</button>
      </div>
    ):(
      <>
        <div onClick={()=>ref.current?.focus()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:14,lineHeight:1.9,cursor:"text",userSelect:"none",minHeight:70}}>
          {shown.split("").map((ch,i)=>{const ai=windowStart+i;let color=T.faint;if(ai<typed.length)color=typed[ai]===ch?"#34d399":"#ef4444";else if(ai===typed.length)color="#facc15";return<span key={ai} style={{color,borderBottom:ai===typed.length?"2px solid #facc15":"2px solid transparent"}}>{ch}</span>;})}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",color:T.faint,fontSize:12,marginBottom:8}}>
          <span>{typed.length}/{target.length} chars</span>
          <span>{start?`${Math.round((typed.length/5)/Math.max((Date.now()-start)/60000,.001))} WPM`:"Start typing..."}</span>
        </div>
        <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{position:"absolute",opacity:0,pointerEvents:"none"}}/>
      </>
    )}
  </div>);
}

// ─── HAIKU ────────────────────────────────────────────────────────────────────
const HAIKUS = [
  {lines:["an old silent pond","a frog jumps into the pond","splash silence again"],author:"Matsuo Basho"},
  {lines:["over the wintry","forest winds howl in rage","with no leaves to blow"],author:"Natsume Soseki"},
  {lines:["in the cicada's cry","no sign can foretell","how soon it must die"],author:"Matsuo Basho"},
  {lines:["the light of a candle","is transferred to another candle","spring twilight"],author:"Yosa Buson"},
  {lines:["a world of dew","and within every dewdrop","a world of struggle"],author:"Kobayashi Issa"},
  {lines:["temple bells die out","the fragrant blossoms remain","a perfect evening"],author:"Matsuo Basho"},
  {lines:["petals on a wet","black bough in the station","faces in the crowd"],author:"Ezra Pound"},
  {lines:["i write erase rewrite","erase again and then","a poppy blooms"],author:"Katsushika Hokusai"},
  {lines:["the crane calls","far in the sky","longing for its nest"],author:"Matsuo Basho"},
  {lines:["autumn moonlight","a worm digs silently","into the chestnut"],author:"Matsuo Basho"},
  {lines:["lightning gleams","and heron's cry travels","through the darkness"],author:"Matsuo Basho"},
  {lines:["from time to time","the clouds give rest","to the moon gazers"],author:"Matsuo Basho"},
  {lines:["over the sea waves","a mountain path in autumn","the smell of old Japan"],author:"Matsuo Basho"},
  {lines:["the first cold shower","even the monkey seems to want","a little coat of straw"],author:"Matsuo Basho"},
  {lines:["nothing in the cry","of cicadas suggests they","are about to die"],author:"Matsuo Basho"},
];

export function HaikuMode({ T, onBack, onSettings, settings={} }) {
  const sv = gLoad("haiku");
  const [order] = useState(()=>[...HAIKUS].sort(()=>Math.random()-.5));
  const [haikuIdx, setHaikuIdx] = useState(()=>sv?.haikuIdx||0);
  const [lineIdx, setLineIdx] = useState(()=>sv?.lineIdx||0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [completed, setCompleted] = useState(()=>sv?.completed||0);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const haiku = order[haikuIdx]||order[0];
  const target = haiku.lines[lineIdx]||"";
  useEffect(()=>{if(!done)gSave("haiku",{haikuIdx,lineIdx,completed});},[haikuIdx,lineIdx,done]);

  const handleType=e=>{
    const v=e.target.value;
    setTyped(v);
    if(v===target){
      if(!muted)playTone(660+lineIdx*110,"sine",.15,.2);
      const nl=lineIdx+1;
      if(nl>=haiku.lines.length){
        setCompleted(c=>c+1);
        if(!muted)setTimeout(()=>playTone(880,"sine",.3,.2),200);
        const nh=haikuIdx+1;
        if(nh>=order.length){setDone(true);return;}
        setHaikuIdx(nh);setLineIdx(0);setTyped("");
      } else {setLineIdx(nl);setTyped("");}
    }
  };

  if(done) return <ResultScreen emoji="🌸" title="Haiku Master!" color="#f472b6" stats={[["Haikus",completed],["Total lines",completed*3]]} onRetry={()=>{gClear("haiku");setHaikuIdx(0);setLineIdx(0);setTyped("");setCompleted(0);setDone(false);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🌸 Haiku</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#120010",border:"1px solid #f472b633",borderRadius:12,padding:"20px 24px",marginBottom:12}}>
      <div style={{color:"#f472b6",fontSize:10,letterSpacing:2,marginBottom:10}}>HAIKU {haikuIdx+1} · {haiku.author}</div>
      {haiku.lines.map((l,i)=>(
        <div key={i} style={{fontFamily:"'Georgia',serif",fontSize:16,lineHeight:2,color:i<lineIdx?"#f472b688":i===lineIdx?"#e0e0ff":"#2a2a3e",marginBottom:4,fontStyle:"italic"}}>{l}</div>
      ))}
    </div>
    <div style={{background:T.card,border:`1px solid #f472b633`,borderRadius:12,padding:"14px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:18,letterSpacing:1}}>
      {target.split("").map((ch,i)=><span key={i} style={{color:i<typed.length?(typed[i]===ch?"#f472b6":"#ef4444"):i===typed.length?"#f472b6":T.faint,borderBottom:i===typed.length?"2px solid #f472b6":"2px solid transparent"}}>{ch}</span>)}
    </div>
    <div style={{color:T.faint,fontSize:11,textAlign:"center",marginBottom:8}}>Line {lineIdx+1} of 3 · {["5","7","5"][lineIdx]} syllables</div>
    <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the haiku line..."
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
  </div>);
}

// ─── SYNONYMS ─────────────────────────────────────────────────────────────────
export function Synonyms({ T, onBack, onSettings, settings={} }) {
  const sv = gLoad("synonyms");
  const count = settings.count === "all" ? ALL_SYN_ANT.length : (settings.count || 20);
  const [list] = useState(()=>[...ALL_SYN_ANT].sort(()=>Math.random()-.5).slice(0,count));
  const [idx, setIdx] = useState(()=>sv?.idx||0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(()=>sv?.correct||0);
  const [wrong, setWrong] = useState(false);
  const [wrongWord, setWrongWord] = useState("");
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lastAccepted, setLastAccepted] = useState("");
  const ref = useRef(null);
  const item = list[idx]||list[0];
  useEffect(()=>{if(!done)gSave("synonyms",{idx,correct});},[idx,correct,done]);
  useEffect(()=>{setTyped("");setLastAccepted("");setTimeout(()=>ref.current?.focus(),50);},[idx]);

  const handleType=e=>{
    const v=e.target.value.toLowerCase().trim();
    setTyped(e.target.value);
    // Accept on space or when word matches
    const checkWord = v.replace(/\s+$/,"");
    if(item.syn.includes(checkWord)||checkWord===item.word){
      if(!muted)playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);setLastAccepted(checkWord);
      const ni=idx+1;
      if(ni>=list.length)setDone(true);
      else setIdx(ni);
    } else if(e.target.value.endsWith(" ")&&checkWord.length>0){
      if(!muted)playTone(220,"sawtooth",.15,.2);
      setWrong(true);setWrongWord(checkWord);setTyped("");
      setTimeout(()=>setWrong(false),600);
    }
  };

  if(done) return <ResultScreen emoji="📖" title="Synonym Expert!" color="#34d399" stats={[["Correct",`${correct}/${list.length}`],["Score",Math.round(correct/list.length*100)+"%"]]} onRetry={()=>{gClear("synonyms");setIdx(0);setTyped("");setCorrect(0);setDone(false);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>📖 Synonyms</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#34d39911",border:"1px solid #34d39933",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#34d399",textAlign:"center"}}>Type any word that means the same thing · Press Space to submit</div>
    <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1}/{list.length} · {correct} correct</div>
    <div style={{background:"#0d1a0d",border:"1px solid #34d39933",borderRadius:12,padding:"24px 20px",marginBottom:10,textAlign:"center"}}>
      <div style={{color:"#34d399",fontSize:11,letterSpacing:2,marginBottom:8}}>FIND A SYNONYM FOR</div>
      <div style={{color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",fontSize:32,fontWeight:800,letterSpacing:3}}>{item?.word}</div>
      {lastAccepted&&<div style={{color:"#34d399",fontSize:12,marginTop:8}}>✓ "{lastAccepted}" accepted!</div>}
    </div>
    <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type a synonym and press Space..."
      style={{width:"100%",background:wrong?"#ef444411":T.bg,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box",transition:"all .15s"}}/>
    {wrong&&<div style={{color:"#ef4444",fontSize:12,marginTop:4,textAlign:"center"}}>"{wrongWord}" is not a synonym — try again</div>}
    <div style={{color:T.faint,fontSize:10,marginTop:8,textAlign:"center"}}>Accepted: {item?.syn.slice(0,4).join(", ")}...</div>
  </div>);
}

// ─── ANTONYMS ─────────────────────────────────────────────────────────────────
export function Antonyms({ T, onBack, onSettings, settings={} }) {
  const sv = gLoad("antonyms");
  const count = settings.count === "all" ? ALL_SYN_ANT.length : (settings.count || 20);
  const [list] = useState(()=>[...ALL_SYN_ANT].sort(()=>Math.random()-.5).slice(0,count));
  const [idx, setIdx] = useState(()=>sv?.idx||0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(()=>sv?.correct||0);
  const [wrong, setWrong] = useState(false);
  const [wrongWord, setWrongWord] = useState("");
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lastAccepted, setLastAccepted] = useState("");
  const ref = useRef(null);
  const item = list[idx]||list[0];
  useEffect(()=>{if(!done)gSave("antonyms",{idx,correct});},[idx,correct,done]);
  useEffect(()=>{setTyped("");setLastAccepted("");setTimeout(()=>ref.current?.focus(),50);},[idx]);

  const handleType=e=>{
    const v=e.target.value.toLowerCase().trim();
    setTyped(e.target.value);
    const checkWord=v.replace(/\s+$/,"");
    if(item.ant.includes(checkWord)){
      if(!muted)playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);setLastAccepted(checkWord);
      const ni=idx+1;
      if(ni>=list.length)setDone(true);
      else setIdx(ni);
    } else if(e.target.value.endsWith(" ")&&checkWord.length>0){
      if(!muted)playTone(220,"sawtooth",.15,.2);
      setWrong(true);setWrongWord(checkWord);setTyped("");
      setTimeout(()=>setWrong(false),600);
    }
  };

  if(done) return <ResultScreen emoji="↔️" title="Antonym Expert!" color="#f472b6" stats={[["Correct",`${correct}/${list.length}`],["Score",Math.round(correct/list.length*100)+"%"]]} onRetry={()=>{gClear("antonyms");setIdx(0);setTyped("");setCorrect(0);setDone(false);}} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>↔️ Antonyms</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{background:"#f472b611",border:"1px solid #f472b633",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#f472b6",textAlign:"center"}}>Type the opposite · Any antonym accepted · Press Space to submit</div>
    <div style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:10}}>{idx+1}/{list.length} · {correct} correct</div>
    <div style={{background:"#1a0010",border:"1px solid #f472b633",borderRadius:12,padding:"24px 20px",marginBottom:10,textAlign:"center"}}>
      <div style={{color:"#f472b6",fontSize:11,letterSpacing:2,marginBottom:8}}>TYPE THE OPPOSITE OF</div>
      <div style={{color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",fontSize:32,fontWeight:800,letterSpacing:3}}>{item?.word}</div>
      {lastAccepted&&<div style={{color:"#f472b6",fontSize:12,marginTop:8}}>✓ "{lastAccepted}" accepted!</div>}
    </div>
    <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the opposite and press Space..."
      style={{width:"100%",background:wrong?"#ef444411":T.bg,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box",transition:"all .15s"}}/>
    {wrong&&<div style={{color:"#ef4444",fontSize:12,marginTop:4,textAlign:"center"}}>"{wrongWord}" is not an antonym — try another word</div>}
    <div style={{color:T.faint,fontSize:10,marginTop:8,textAlign:"center"}}>Accepted: {item?.ant.slice(0,4).join(", ")}...</div>
  </div>);
}

export default { SpeedTest, MissingLetters, Anagram, BrickBreaker, Quotes, HaikuMode, Synonyms, Antonyms };
