"use client";
import React, { useState, useRef, useEffect } from "react";
import { TYPING_BASIC, TYPING_MEDIUM, TYPING_HARD, ALL_WORDS, POOL_MYSTERY, pickWords, pickByDiff, RHYMES } from "./WordDB";
import { SYN_ANT, SYNONYMS_ONLY, ANTONYMS_ONLY, ALL_SYN_ANT } from "./SynAntDB";
import { subscribeToChallenge, updateGameLiveState, setGameWinner } from "../lib/firebase";

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
// ─── MEMORY EDIT ────────────────────────────────────────────────────────────
// A real, different memory mechanic from anything else in this app: instead
// of recalling a sequence or a flashed word, you study a full sentence,
// it's hidden, then a SLIGHTLY ALTERED version reappears with specific
// words swapped or blanked. You have to remember exactly what the original
// said and type the correct word back into each changed spot - testing
// memory of specific content against a near-identical decoy, not pure
// sequence recall.
const MEMORY_SENTENCES = [
  "the quick brown fox jumps over the lazy dog",
  "she sells seashells by the seashore every summer",
  "practice makes perfect when you type every single day",
  "the early bird catches the worm before sunrise",
  "a journey of a thousand miles begins with one step",
  "actions speak louder than words in every situation",
  "the pen is mightier than the sword in many debates",
  "where there is a will there is always a way",
  "honesty is the best policy in business and life",
  "every cloud has a silver lining if you look closely",
  "the squeaky wheel gets the grease from the mechanic",
  "better late than never when finishing a project",
  "all that glitters is not gold in this world",
  "a picture is worth a thousand words to most people",
  "do not judge a book by its cover too quickly",
  "the grass is always greener on the other side",
  "when in rome do as the romans do every time",
  "rome was not built in a day according to history",
  "two wrongs do not make a right in any argument",
  "the apple does not fall far from the tree usually",
];

export function MemoryEdit({ T, onBack, onSettings, settings={} }) {
  const numChanges = settings.changes || 2;
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("study"); // study | altered | done-round
  const [original, setOriginal] = useState("");
  const [altered, setAltered] = useState([]); // array of {word, changed, blank}
  const [typed, setTyped] = useState({});
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [status, setStatus] = useState("playing"); // playing | results
  const [studyTime, setStudyTime] = useState(5);
  const ref = useRef(null);
  const studyTimerRef = useRef(null);

  const buildRound = () => {
    const sentence = MEMORY_SENTENCES[Math.floor(Math.random() * MEMORY_SENTENCES.length)];
    const words = sentence.split(" ");
    const replacementPool = ALL_WORDS.filter(w => w.length >= 3 && w.length <= 8);
    const changeIdxs = new Set();
    while (changeIdxs.size < Math.min(numChanges, words.length - 1) && changeIdxs.size < words.length) {
      changeIdxs.add(Math.floor(Math.random() * words.length));
    }
    const alteredWords = words.map((w, i) => {
      if (changeIdxs.has(i)) {
        const replacement = replacementPool[Math.floor(Math.random() * replacementPool.length)];
        return { word: w, display: replacement, changed: true };
      }
      return { word: w, display: w, changed: false };
    });
    setOriginal(sentence);
    setAltered(alteredWords);
    setTyped({});
    setPhase("study");
    setStudyTime(5 + numChanges); // a bit more time for harder rounds
  };

  useEffect(() => { buildRound(); }, []);

  useEffect(() => {
    if (phase !== "study") return;
    if (studyTime <= 0) { setPhase("altered"); setTimeout(() => ref.current?.focus(), 50); return; }
    studyTimerRef.current = setTimeout(() => setStudyTime(t => t - 1), 1000);
    return () => clearTimeout(studyTimerRef.current);
  }, [phase, studyTime]);

  const handleTypeFor = (idx, value) => {
    setTyped(t => ({ ...t, [idx]: value }));
  };

  const checkAnswers = () => {
    const changedIdxs = altered.map((w, i) => w.changed ? i : null).filter(i => i !== null);
    const allCorrect = changedIdxs.every(i => (typed[i] || "").trim().toLowerCase() === altered[i].word.toLowerCase());
    if (allCorrect) {
      setScore(s => s + 1);
      setWrong(false);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 700);
    }
    const nextRound = round + 1;
    if (nextRound >= 8) {
      setStatus("results");
    } else {
      setRound(nextRound);
      setTimeout(() => buildRound(), allCorrect ? 400 : 900);
    }
  };

  const reset = () => {
    setRound(0); setScore(0); setStatus("playing");
    buildRound();
  };

  if (status === "results") {
    return (
      <div style={{padding:"4px 0"}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <div style={{marginTop:14}}>
          <ResultScreen emoji="🧠" title="Round complete" color="#a78bfa" stats={[["Sentences correct", `${score}/8`]]} onRetry={reset} T={T} />
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <span style={{color:T.muted,fontSize:12}}>Round {round+1}/8 · Score {score}</span>
      </div>

      {phase === "study" ? (
        <div style={{textAlign:"center"}}>
          <div style={{color:T.faint,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Memorize this sentence</div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px 20px",marginBottom:14,fontSize:18,color:T.text,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.6}}>
            {original}
          </div>
          <div style={{color:T.purple,fontWeight:700,fontSize:22}}>{studyTime}</div>
        </div>
      ) : (
        <div>
          <div style={{color:T.faint,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>
            {numChanges} word{numChanges>1?"s":""} changed — type the original word{numChanges>1?"s":""}
          </div>
          <div style={{background:wrong?"#ef444411":T.card,border:`1px solid ${wrong?"#ef4444":T.border}`,borderRadius:12,padding:"20px 16px",marginBottom:16,display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
            {altered.map((w, i) => w.changed ? (
              <input
                key={i}
                value={typed[i] || ""}
                onChange={e => handleTypeFor(i, e.target.value)}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                placeholder={w.display}
                style={{width:Math.max(60, w.display.length*11),background:T.bg,border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"4px 8px",outline:"none",textAlign:"center"}}
                ref={i === altered.findIndex(x=>x.changed) ? ref : null}
              />
            ) : (
              <span key={i} style={{fontSize:18,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{w.display}</span>
            ))}
          </div>
          <button onClick={checkAnswers} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
            Check
          </button>
        </div>
      )}
    </div>
  );
}

// ─── WILDCARD WORDS ─────────────────────────────────────────────────────────
// A real Random-category mechanic where the randomness is IN the typing
// task itself, unlike Roulette (which just spins to a different game to go
// play, with no typing of its own). Each word gets a random modifier shown
// as a small icon: type it backwards, type it in ALL CAPS, race a 2-second
// bonus window, or type an intentionally letter-swapped version exactly as
// shown rather than the dictionary-correct spelling.
const WILDCARDS = [
  { id: "normal",   icon: "📝", label: "Type normally" },
  { id: "backwards", icon: "🔄", label: "Type it BACKWARDS" },
  { id: "caps",      icon: "🔠", label: "Type in ALL CAPS" },
  { id: "speed",     icon: "⚡", label: "Bonus if under 2s!" },
  { id: "swap",      icon: "🔀", label: "Type EXACTLY as shown (it's altered)" },
];

function applyWildcard(word, wildcardId) {
  if (wildcardId === "backwards") return word.split("").reverse().join("");
  if (wildcardId === "caps") return word.toUpperCase();
  if (wildcardId === "swap") {
    if (word.length < 3) return word;
    const pos = 1 + Math.floor(Math.random() * (word.length - 2));
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let replacement = letters[Math.floor(Math.random() * letters.length)];
    while (replacement === word[pos]) replacement = letters[Math.floor(Math.random() * letters.length)];
    return word.slice(0, pos) + replacement + word.slice(pos + 1);
  }
  return word;
}

export function WildcardWords({ T, onBack, onSettings, settings={} }) {
  const diff = settings.difficulty || "medium";
  const [words, setWords] = useState(() => pickByDiff(60, diff));
  const [wordIdx, setWordIdx] = useState(0);
  const [wildcard, setWildcard] = useState(WILDCARDS[0]);
  const [displayWord, setDisplayWord] = useState("");
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [roundsLeft, setRoundsLeft] = useState(15);
  const [status, setStatus] = useState("playing"); // playing | done
  const [flash, setFlash] = useState(null);
  const [muted, setMuted] = useState(()=>{try{return localStorage.getItem("ak_sfx_muted")==="1";}catch{return false;}});
  const ref = useRef(null);
  const roundStartRef = useRef(0);

  const newRound = () => {
    const baseWord = words[wordIdx % words.length] || words[0];
    const wc = WILDCARDS[Math.floor(Math.random() * WILDCARDS.length)];
    setWildcard(wc);
    setDisplayWord(applyWildcard(baseWord, wc.id));
    setTyped("");
    roundStartRef.current = Date.now();
    setWordIdx(i => {
      const next = i + 1;
      if (next >= words.length) setWords(w => [...w, ...pickByDiff(40, diff)]);
      return next;
    });
    setTimeout(() => ref.current?.focus(), 30);
  };

  useEffect(() => { newRound(); }, []);
  useEffect(() => { if (status==="playing") gSave("wildcard", { score, roundsLeft }); }, [score, roundsLeft, status]);

  const handleType = e => {
    const v = e.target.value;
    setTyped(v);
    if (v === displayWord) {
      const elapsed = Date.now() - roundStartRef.current;
      let points = 1;
      let label = "+1";
      if (wildcard.id === "speed" && elapsed < 2000) { points = 3; label = "+3 ⚡"; }
      else if (wildcard.id !== "normal") { points = 2; label = "+2"; }
      setScore(s => s + points);
      setBest(b => Math.max(b, score + points));
      setStreak(s => s + 1);
      setFlash(label);
      if (!muted) playTone(880, "sine", 0.1, 0.16);
      setTimeout(() => setFlash(null), 500);
      const next = roundsLeft - 1;
      if (next <= 0) { setStatus("done"); }
      else { setRoundsLeft(next); newRound(); }
    } else if (v.length >= displayWord.length) {
      setStreak(0);
      if (!muted) playTone(180, "sawtooth", 0.12, 0.13);
      const next = roundsLeft - 1;
      setTyped("");
      if (next <= 0) { setStatus("done"); }
      else { setRoundsLeft(next); newRound(); }
    }
  };

  const reset = () => {
    setWords(pickByDiff(60, diff)); setWordIdx(0); setScore(0); setStreak(0);
    setRoundsLeft(15); setStatus("playing"); gClear("wildcard");
    newRound();
  };

  if (status === "done") {
    return (
      <div style={{padding:"4px 0"}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <div style={{marginTop:14}}>
          <ResultScreen emoji="🎲" title="Round complete" color="#a78bfa" stats={[["Score", score],["Best streak", best]]} onRetry={reset} T={T} />
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <span style={{color:T.muted,fontSize:12}}>Score {score} · {roundsLeft} left</span>
      </div>

      <div style={{textAlign:"center",marginBottom:10}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:T.card,border:`1px solid ${T.purple}`,borderRadius:20,padding:"6px 14px",fontSize:13,color:T.purple,fontWeight:700}}>
          <span style={{fontSize:18}}>{wildcard.icon}</span> {wildcard.label}
        </div>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px 20px",textAlign:"center",marginBottom:14,position:"relative"}}>
        {flash && <div style={{position:"absolute",top:8,right:14,color:"#34d399",fontWeight:800,fontSize:14}}>{flash}</div>}
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:700,letterSpacing:1}}>
          {displayWord.split("").map((ch,i)=>(
            <span key={i} style={{color: i<typed.length ? (typed[i]===ch?"#10b981":"#ef4444") : T.text}}>{ch}</span>
          ))}
        </div>
      </div>

      <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        placeholder="Type exactly what's shown above..."
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}} />
    </div>
  );
}

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
// ─── BRICK BREAKER ──────────────────────────────────────────────────────────
// Real mechanic: an actual ball bounces around the play field. The paddle's
// horizontal position is driven by what you're typing - as you type letters
// matching a brick's word, the paddle slides toward that brick's column.
// A brick only breaks when the ball is actually touching/near it AND you've
// typed its word correctly - typing alone does nothing without the ball
// being there, which is the real fix for "you're just typing, it's not a
// game": the ball's position and physics now matter, not just word order.
export function BrickBreaker({ T, onBack, onSettings, settings={} }) {
  const COLS=6, ROWS=settings.rows||4;
  const FIELD_W=100, FIELD_H=70; // percentage-space playfield
  const BRICK_H=9;
  const PADDLE_W=16, PADDLE_Y=FIELD_H-4;
  const colW = FIELD_W/COLS;

  const makeBricks=()=>Array.from({length:COLS*ROWS},(_,i)=>({id:i,word:pickWords(1,TYPING_BASIC.filter(w=>w.length>=3&&w.length<=5))[0],col:i%COLS,row:Math.floor(i/COLS),alive:true}));
  const [bricks,setBricks]=useState(makeBricks);
  const [typed,setTyped]=useState("");
  const [score,setScore]=useState(0);
  const [wave,setWave]=useState(1);
  const [lives,setLives]=useState(settings.lives||3);
  const [done,setDone]=useState(false);
  const [won,setWon]=useState(false);
  const [muted,setMuted]=useState(false);
  const [ball,setBall]=useState({x:50,y:PADDLE_Y-2,vx:0.55,vy:-0.7});
  const [paddleX,setPaddleX]=useState(50);
  const ref=useRef(null);
  const bricksRef=useRef(bricks);
  const ballRef=useRef(ball);
  const paddleXRef=useRef(50);
  const livesRef=useRef(settings.lives||3);
  const frameRef=useRef(null);
  bricksRef.current=bricks;

  // Find the brick (any alive one) whose word starts with what's currently
  // typed - that's the brick the paddle steers toward. Prefers the lowest
  // remaining row so you're naturally working top-to-bottom-ish, but any
  // match works.
  const targetBrick = typed.length>0
    ? bricksRef.current.filter(b=>b.alive && b.word.startsWith(typed)).sort((a,b)=>a.row-b.row)[0]
    : null;

  useEffect(()=>{ ref.current?.focus(); }, []);

  // Physics loop: ball moves every frame, bounces off walls/paddle, and
  // checks collision against alive bricks. A brick only actually breaks if
  // it's the one the ball is colliding with AND its word has been typed in
  // full at that moment - hitting it without having typed it just bounces
  // the ball off harmlessly, same as a wall.
  useEffect(() => {
    if (done) return;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(now - last, 40); last = now;
      const b = { ...ballRef.current };
      b.x += b.vx * dt * 0.05;
      b.y += b.vy * dt * 0.05;

      // Wall bounces
      if (b.x <= 1) { b.x = 1; b.vx = Math.abs(b.vx); }
      if (b.x >= FIELD_W-1) { b.x = FIELD_W-1; b.vx = -Math.abs(b.vx); }
      if (b.y <= 1) { b.y = 1; b.vy = Math.abs(b.vy); }

      // Paddle bounce - paddle position comes from paddleXRef, which is
      // driven by typing (see the effect below), not arrow keys.
      const px = paddleXRef.current;
      if (b.y >= PADDLE_Y-2 && b.y <= PADDLE_Y+1 && b.x >= px-PADDLE_W/2 && b.x <= px+PADDLE_W/2 && b.vy > 0) {
        b.vy = -Math.abs(b.vy);
        b.vx += (b.x - px) * 0.04; // angle off paddle based on hit position
      }

      // Brick collision - check the row of bricks the ball is currently at
      const brickRowAtY = Math.floor(b.y / BRICK_H);
      const brickColAtX = Math.floor(b.x / colW);
      if (b.vy < 0 && brickRowAtY >= 0 && brickRowAtY < ROWS) {
        const hit = bricksRef.current.find(br => br.alive && br.row === brickRowAtY && br.col === brickColAtX);
        if (hit) {
          const wordTyped = typed === hit.word;
          if (wordTyped) {
            if (!muted) playTone(660+score*5, "sine", 0.08, 0.2);
            const nb = bricksRef.current.map(br => br.id===hit.id ? {...br, alive:false} : br);
            setBricks(nb); bricksRef.current = nb;
            setScore(s=>s+1);
            setTyped("");
            b.vy = Math.abs(b.vy); // bounce away from the broken brick
            if (nb.every(br=>!br.alive)) {
              if (!muted) [0,0.15,0.3].forEach(t=>setTimeout(()=>playTone(880,"sine",0.1,0.2), t*1000));
              const nextWave = wave+1;
              setWave(nextWave);
              const fresh = makeBricks().map(br=>({...br, word: pickWords(1, nextWave>=3?TYPING_MEDIUM.filter(w=>w.length>=4&&w.length<=7):TYPING_BASIC.filter(w=>w.length>=3&&w.length<=5))[0]}));
              setBricks(fresh); bricksRef.current = fresh;
            }
          } else {
            // Ball hits a brick whose word hasn't been typed yet - bounces
            // off like a wall, brick stays intact. This is the real stakes:
            // you have to have the right word ready before the ball gets
            // there, not just type things whenever.
            b.vy = Math.abs(b.vy);
          }
        }
      }

      // Missed - ball fell past the paddle
      if (b.y > FIELD_H) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (!muted) playTone(150, "sawtooth", 0.25, 0.2);
        if (livesRef.current <= 0) {
          setDone(true); setWon(false);
          return;
        }
        b.x = 50; b.y = PADDLE_Y-2; b.vx = 0.55*(Math.random()>0.5?1:-1); b.vy = -0.7;
      }

      ballRef.current = b;
      setBall(b);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [done, wave, typed, score, muted]);

  // Paddle steering: slides toward the column of whichever brick currently
  // matches the typed prefix. With nothing typed, or no match, it drifts
  // back toward center rather than freezing in place.
  useEffect(() => {
    const iv = setInterval(() => {
      const targetX = targetBrick ? (targetBrick.col + 0.5) * colW : 50;
      const next = paddleXRef.current + (targetX - paddleXRef.current) * 0.25;
      paddleXRef.current = next;
      setPaddleX(next);
    }, 30);
    return () => clearInterval(iv);
  }, [targetBrick, colW]);

  const handleType = e => {
    const v = e.target.value;
    // Exact-prefix only - if it stops matching any alive brick's word, reset
    // rather than letting garbage accumulate.
    if (v.length===0 || bricksRef.current.some(b=>b.alive && b.word.startsWith(v))) {
      setTyped(v);
    }
  };

  const reset = () => {
    const fresh = makeBricks();
    setBricks(fresh); bricksRef.current = fresh;
    setTyped(""); setScore(0); setWave(1); setDone(false); setWon(false);
    setLives(settings.lives||3); livesRef.current = settings.lives||3;
    ballRef.current = {x:50,y:PADDLE_Y-2,vx:0.55,vy:-0.7};
    setBall(ballRef.current);
    paddleXRef.current = 50; setPaddleX(50);
    setTimeout(()=>ref.current?.focus(), 50);
  };

  const COLORS=["#ef4444","#f59e0b","#34d399","#60a5fa","#a78bfa","#f472b6"];

  if (done) return <ResultScreen emoji="🧱" title="Out of lives" color="#ef4444" stats={[["Bricks broken", score],["Wave reached", wave]]} onRetry={reset} T={T}/>;

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><BackBtn onBack={onBack} onSettings={onSettings} T={T}/><span style={{color:T.text,fontWeight:800,fontSize:20}}>🧱 Brick Breaker</span><SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}>
      <span style={{color:T.purple,fontWeight:700}}>Score: {score}</span>
      <span style={{color:"#f59e0b",fontWeight:700}}>Wave {wave}</span>
      <span>{"❤️".repeat(Math.max(0,lives))}{"🖤".repeat(Math.max(0,(settings.lives||3)-lives))}</span>
    </div>
    <div style={{position:"relative",width:"100%",paddingBottom:`${FIELD_H}%`,background:"#050510",borderRadius:12,border:"1px solid #1a1a30",overflow:"hidden",marginBottom:10}}>
      {bricks.map(b=>b.alive && (
        <div key={b.id} style={{
          position:"absolute", left:`${b.col*colW}%`, top:`${b.row*BRICK_H}%`, width:`${colW-1}%`, height:`${BRICK_H-1}%`,
          borderRadius:4, background:COLORS[b.col%COLORS.length]+"cc",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#fff",
          outline: targetBrick?.id===b.id ? "2px solid #fff" : "none",
          boxShadow: targetBrick?.id===b.id ? `0 0 10px ${COLORS[b.col%COLORS.length]}` : "none",
        }}>{b.word}</div>
      ))}
      {/* Ball */}
      <div style={{position:"absolute", left:`${ball.x}%`, top:`${(ball.y/FIELD_H)*100}%`, width:10, height:10, marginLeft:-5, marginTop:-5, borderRadius:"50%", background:"#fff", boxShadow:"0 0 8px #fff"}} />
      {/* Paddle */}
      <div style={{position:"absolute", left:`${paddleX}%`, top:`${(PADDLE_Y/FIELD_H)*100}%`, width:`${PADDLE_W}%`, height:6, marginLeft:`-${PADDLE_W/2}%`, borderRadius:3, background:T.purple}} />
    </div>
    <div style={{textAlign:"center",fontSize:11,color:T.faint,marginBottom:8}}>
      {targetBrick ? "Paddle is steering toward your word — keep typing!" : "Start typing a brick's word to steer the paddle"}
    </div>
    <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type a brick's word to steer the paddle..."
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
    if(v.length>=target.length && v===target.slice(0,v.length)){
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
    // Accept the instant it matches, no space needed
    const checkWord = v.replace(/\s+$/,"");
    if(item.syn.includes(checkWord)||checkWord===item.word){
      if(!muted)playTone(880,"sine",.1,.2);
      setCorrect(c=>c+1);setLastAccepted(checkWord);
      const ni=idx+1;
      if(ni>=list.length)setDone(true);
      else setIdx(ni);
      setTyped("");
    } else if(checkWord.length >= (item.syn[0]?.length||4) && checkWord.length>0 && !item.syn.some(s=>s.startsWith(checkWord))){
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
      setTyped("");
    } else if(checkWord.length >= (item.ant[0]?.length||4) && checkWord.length>0 && !item.ant.some(a=>a.startsWith(checkWord))){
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

// ─── TUG OF WAR ─────────────────────────────────────────────────────────────
// Two modes:
//  - Solo: you vs a simulated opponent that actively pulls the rope toward
//    their side at a steady pace. Win by reaching +100 before the CPU
//    reaches -100; lose if it gets there first. This replaces the old
//    version where the rope only ever decayed back toward zero and could
//    never actually cross to a "you lose" state - there was no real way to
//    lose, which is the core reason it didn't make sense.
//  - Multiplayer: challenge a real friend (via the existing challenge
//    system). Both players' correct words pull a SHARED rope toward their
//    own side, synced live through the challenge document. First to reach
//    their target wins for real, against a real person.
export function TugOfWar({ T, onBack, onSettings, settings={}, multiplayer=null }) {
  // multiplayer prop, when present: { challengeId, isFromSide, opponentName, user }
  const diff = settings.difficulty || "medium";
  const TARGET = 100;
  const PULL_PER_WORD = 9;
  const CPU_PULL_PER_TICK = { easy: 1.4, medium: 2.2, hard: 3.2 }[diff] || 2.2;
  const [words, setWords] = useState(() => pickByDiff(60, diff));
  const [wordIdx, setWordIdx] = useState(0);
  const [typed, setTyped] = useState("");
  // rope: -100 = opponent's side fully, +100 = your side fully, 0 = center
  const [rope, setRope] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [status, setStatus] = useState(multiplayer ? "waiting" : "playing"); // waiting | playing | won | lost
  const [muted, setMuted] = useState(()=>{try{return localStorage.getItem("ak_sfx_muted")==="1";}catch{return false;}});
  const ref = useRef(null);
  const target = words[wordIdx % words.length] || words[0];
  const myRope = multiplayer && multiplayer.isFromSide===false ? -rope : rope; // display orientation flips for the "to" side so "your side" is always visually on the right for you

  useEffect(() => { if (status==="playing") ref.current?.focus(); }, [status]);

  // Solo mode: CPU actively pulls toward its own side every tick - this is
  // the actual fix. The old version only ever decayed toward 0, so there
  // was no way to actually lose; this version has a real opposing force
  // that can win on its own if you stop typing.
  useEffect(() => {
    if (multiplayer || status !== "playing") return;
    const iv = setInterval(() => {
      setRope(r => Math.max(-TARGET, r - CPU_PULL_PER_TICK));
    }, 700);
    return () => clearInterval(iv);
  }, [status, multiplayer, CPU_PULL_PER_TICK]);

  // Multiplayer mode: subscribe to the shared challenge doc, mirror the
  // opponent's contribution into the same rope value both sides see.
  useEffect(() => {
    if (!multiplayer) return;
    const unsub = subscribeToChallenge(multiplayer.challengeId, (doc) => {
      if (!doc || !doc.liveState) return;
      const { fromRope, toRope, winnerUid } = doc.liveState;
      // The rope value from MY perspective: my own pulls are positive,
      // opponent's pulls are negative, regardless of which side I am.
      const mine = multiplayer.isFromSide ? (fromRope||0) : (toRope||0);
      const theirs = multiplayer.isFromSide ? (toRope||0) : (fromRope||0);
      setRope(Math.max(-TARGET, Math.min(TARGET, mine - theirs)));
      if (doc.status === "accepted" && status === "waiting") setStatus("playing");
      if (winnerUid) {
        setStatus(winnerUid === multiplayer.user.uid ? "won" : "lost");
      }
    });
    return () => unsub();
  }, [multiplayer, status]);

  useEffect(() => {
    if (status !== "playing") return;
    if (rope >= TARGET) {
      setStatus("won"); gClear("tugofwar");
      if (multiplayer) setGameWinner(multiplayer.challengeId, multiplayer.user.uid).catch(()=>{});
    } else if (rope <= -TARGET) {
      setStatus("lost"); gClear("tugofwar");
      if (multiplayer) setGameWinner(multiplayer.challengeId, multiplayer.opponentUid).catch(()=>{});
    }
  }, [rope, status, multiplayer]);

  useEffect(() => { if (!multiplayer && status==="playing") gSave("tugofwar", { wordIdx, rope, streak, correctCount, wrongCount }); }, [wordIdx, rope, streak, multiplayer]);

  const toggleMute = () => { const v=!muted; setMuted(v); try{localStorage.setItem("ak_sfx_muted", v?"1":"0");}catch{} };

  const handleType = e => {
    if (status !== "playing") return;
    const v = e.target.value;
    setTyped(v);
    if (v === target) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBest(b => Math.max(b, newStreak));
      setCorrectCount(c => c + 1);
      const bonus = Math.min(newStreak, 5) * 0.6;
      const pull = PULL_PER_WORD + bonus;
      if (multiplayer) {
        // Write only my own contribution - the opponent's side updates
        // independently from their own client, both meet in the middle via
        // the subscription above.
        const myCurrent = multiplayer.isFromSide ? (rope>0?rope:0) : (rope<0?-rope:0);
        updateGameLiveState(multiplayer.challengeId, multiplayer.isFromSide, myCurrent + pull).catch(()=>{});
      } else {
        setRope(r => Math.min(TARGET, r + pull));
      }
      setTyped("");
      setWordIdx(i => {
        const next = i + 1;
        if (next >= words.length) setWords(w => [...w, ...pickByDiff(40, diff)]);
        return next;
      });
      if (!muted) playTone(880, "sine", 0.08, 0.12);
    } else if (v.length >= target.length) {
      setStreak(0);
      setWrongCount(c => c + 1);
      if (!multiplayer) setRope(r => Math.max(-TARGET, r - 4));
      setTyped("");
      if (!muted) playTone(180, "sawtooth", 0.15, 0.15);
    }
  };

  const retry = () => {
    if (multiplayer) { onBack(); return; } // rematch flow is handled by re-sending a challenge, not retrying in place
    setWords(pickByDiff(60, diff)); setWordIdx(0); setTyped(""); setRope(0);
    setStreak(0); setCorrectCount(0); setWrongCount(0); setStatus("playing");
    gClear("tugofwar");
    setTimeout(()=>ref.current?.focus(), 50);
  };

  if (status === "waiting") {
    return (
      <div style={{padding:"4px 0"}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <div style={{textAlign:"center",padding:"40px 20px",color:T.muted,fontSize:14}}>
          Waiting for {multiplayer?.opponentName||"opponent"} to accept...
        </div>
      </div>
    );
  }

  if (status === "won" || status === "lost") {
    const won = status === "won";
    return (
      <div style={{padding:"4px 0"}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <div style={{marginTop:14}}>
          <ResultScreen
            emoji={won?"🏆":"💀"}
            title={multiplayer
              ? (won ? `You beat ${multiplayer.opponentName}!` : `${multiplayer.opponentName} won the tug of war`)
              : (won ? "You won the tug of war!" : "Pulled under by the CPU...")}
            color={won?"#10b981":"#ef4444"}
            stats={[["Best streak", best],["Words correct", correctCount],["Words missed", wrongCount]]}
            onRetry={retry}
            T={T}
          />
        </div>
      </div>
    );
  }

  const ropePct = ((rope + TARGET) / (TARGET*2)) * 100;

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        {!multiplayer && <SoundBtn muted={muted} toggle={toggleMute} T={T} />}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12,color:T.muted}}>
        <span>🟢 You</span>
        <span>🔴 {multiplayer ? multiplayer.opponentName : "CPU"}</span>
      </div>
      <div style={{position:"relative",height:24,borderRadius:12,background:T.bg,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:6}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${ropePct}%`,background:"linear-gradient(90deg,#10b981,#34d399)",transition:"width .25s ease-out"}} />
        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:2,background:T.faint}} />
        <div style={{position:"absolute",left:`${ropePct}%`,top:"50%",transform:"translate(-50%,-50%)",fontSize:18}}>🚩</div>
      </div>
      <div style={{textAlign:"center",color:T.faint,fontSize:11,marginBottom:18}}>
        {streak>0 ? `🔥 ${streak} word streak` : (multiplayer ? "Type accurately to pull the rope your way" : "Type accurately — the CPU pulls back every few seconds")}
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px 20px",textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:700,letterSpacing:1}}>
          {target.split("").map((ch,i)=>(
            <span key={i} style={{color: i<typed.length ? (typed[i]===ch?"#10b981":"#ef4444") : T.text}}>{ch}</span>
          ))}
        </div>
      </div>

      <input ref={ref} value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        placeholder="Type the word above..."
        style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}} />
    </div>
  );
}

// ─── WORD BOMB ──────────────────────────────────────────────────────────────
// A bomb appears with a word and a visible countdown. Type the word exactly
// before the timer hits zero to defuse it. Miss the deadline and it
// explodes - lose a life. Each successful defuse shortens the fuse for the
// next bomb, so the pressure ramps up round over round.
export function WordBomb({ T, onBack, onSettings, settings={} }) {
  const diff = settings.difficulty || "medium";
  const STARTING_LIVES = settings.lives || 3;
  const STARTING_FUSE = { easy: 6000, medium: 4500, hard: 3000 }[diff] || 4500;
  const MIN_FUSE = 1200;
  const [words, setWords] = useState(() => pickByDiff(60, diff));
  const [wordIdx, setWordIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [fuseMax, setFuseMax] = useState(STARTING_FUSE);
  const [fuseLeft, setFuseLeft] = useState(STARTING_FUSE);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | exploded | done
  const [exploding, setExploding] = useState(false);
  const [muted, setMuted] = useState(()=>{try{return localStorage.getItem("ak_sfx_muted")==="1";}catch{return false;}});
  const ref = useRef(null);
  const fuseRef = useRef(STARTING_FUSE);
  const livesRef = useRef(STARTING_LIVES);
  const frameRef = useRef(null);
  const target = words[wordIdx % words.length] || words[0];

  useEffect(() => { if (status==="playing") ref.current?.focus(); }, [status, wordIdx]);
  useEffect(() => { if (status==="playing") gSave("wordbomb", { wordIdx, score, lives: livesRef.current }); }, [wordIdx, score, status]);

  // Fuse countdown loop - real elapsed time, not a fixed tick count, so it
  // stays accurate even if the tab briefly loses focus.
  useEffect(() => {
    if (status !== "playing") return;
    let last = performance.now();
    const loop = (now) => {
      const dt = now - last; last = now;
      fuseRef.current = Math.max(0, fuseRef.current - dt);
      setFuseLeft(fuseRef.current);
      if (fuseRef.current <= 0) {
        // Boom - missed the deadline
        setExploding(true);
        if (!muted) playTone(90, "sawtooth", 0.4, 0.25);
        livesRef.current -= 1;
        setLives(livesRef.current);
        setTimeout(() => {
          setExploding(false);
          if (livesRef.current <= 0) {
            setStatus("done");
          } else {
            nextBomb(fuseMax); // same fuse length, didn't earn a shorter one
          }
        }, 500);
        return;
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [status, wordIdx, muted, fuseMax]);

  const nextBomb = (useFuse) => {
    setTyped("");
    setWordIdx(i => {
      const next = i + 1;
      if (next >= words.length) setWords(w => [...w, ...pickByDiff(40, diff)]);
      return next;
    });
    fuseRef.current = useFuse;
    setFuseLeft(useFuse);
    setTimeout(() => ref.current?.focus(), 30);
  };

  const handleType = e => {
    if (status !== "playing" || exploding) return;
    const v = e.target.value;
    setTyped(v);
    if (v === target) {
      if (!muted) playTone(880, "sine", 0.1, 0.18);
      const newScore = score + 1;
      setScore(newScore);
      setBest(b => Math.max(b, newScore));
      // Shorten the fuse a bit each successful defuse, floor at MIN_FUSE,
      // so the game genuinely ramps up rather than staying flat forever.
      const shorter = Math.max(MIN_FUSE, fuseMax - 120);
      setFuseMax(shorter);
      nextBomb(shorter);
    }
  };

  const reset = () => {
    setWords(pickByDiff(60, diff)); setWordIdx(0); setTyped("");
    setFuseMax(STARTING_FUSE); fuseRef.current = STARTING_FUSE; setFuseLeft(STARTING_FUSE);
    livesRef.current = STARTING_LIVES; setLives(STARTING_LIVES);
    setScore(0); setStatus("playing"); setExploding(false);
    gClear("wordbomb");
    setTimeout(() => ref.current?.focus(), 50);
  };

  if (status === "done") {
    return (
      <div style={{padding:"4px 0"}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <div style={{marginTop:14}}>
          <ResultScreen emoji="💥" title="Boom — out of lives" color="#ef4444" stats={[["Bombs defused", score],["Best", best]]} onRetry={reset} T={T} />
        </div>
      </div>
    );
  }

  const fusePct = fuseMax > 0 ? Math.max(0, fuseLeft / fuseMax) : 0;
  const urgent = fusePct < 0.25;

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T} />
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:12}}>
        <span style={{color:T.purple,fontWeight:700}}>Defused: {score}</span>
        <span>{"💣".repeat(Math.max(0,lives))}{"⬛".repeat(Math.max(0,STARTING_LIVES-lives))}</span>
      </div>

      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:64,marginBottom:6,filter: exploding ? "none" : "none", transform: exploding ? "scale(1.4)" : "scale(1)", transition:"transform .15s"}}>
          {exploding ? "💥" : "💣"}
        </div>
        <div style={{height:10,borderRadius:5,background:T.bg,border:`1px solid ${T.border}`,overflow:"hidden",maxWidth:280,margin:"0 auto"}}>
          <div style={{height:"100%",width:`${fusePct*100}%`,background: urgent ? "#ef4444" : "#facc15",transition:"width .05s linear, background .3s"}} />
        </div>
        <div style={{color: urgent ? "#ef4444" : T.faint, fontSize:13,fontWeight:700,marginTop:6}}>{(fuseLeft/1000).toFixed(1)}s</div>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px 20px",textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:700,letterSpacing:1}}>
          {target.split("").map((ch,i)=>(
            <span key={i} style={{color: i<typed.length ? (typed[i]===ch?"#10b981":"#ef4444") : T.text}}>{ch}</span>
          ))}
        </div>
      </div>

      <input ref={ref} value={typed} onChange={handleType} disabled={exploding} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        placeholder="Defuse the bomb — type the word..."
        style={{width:"100%",background:T.bg,border:`1px solid ${urgent?"#ef4444":T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box",transition:"border-color .2s"}} />
    </div>
  );
}

export function Freestyle({ T, onBack, onSettings, settings={} }) {
  const RHYME_KEYS = Object.keys(RHYMES);
  const [targetWord] = useState(() => RHYME_KEYS[Math.floor(Math.random() * RHYME_KEYS.length)]);
  const validRhymes = RHYMES[targetWord] || [];
  const [lines, setLines] = useState(["", "", "", ""]);
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [status, setStatus] = useState("playing"); // playing | done
  const [muted, setMuted] = useState(()=>{try{return localStorage.getItem("ak_sfx_muted")==="1";}catch{return false;}});
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, [lineIdx]);

  const lastWordOf = (line) => {
    const words = line.trim().toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    return words[words.length - 1] || "";
  };

  const handleType = e => {
    if (!startTime) setStartTime(Date.now());
    setTyped(e.target.value);
    setError("");
  };

  const submitLine = () => {
    if (!typed.trim()) return;
    const lastWord = lastWordOf(typed);
    // Real validation against the actual RHYMES dictionary, not just
    // trusting the player - the line must genuinely end in a word from
    // the target's rhyme list (or be the target word itself).
    const validEnding = lastWord === targetWord || validRhymes.includes(lastWord);
    if (!validEnding) {
      setError(`That line needs to end with a word that rhymes with "${targetWord}" (try: ${validRhymes.slice(0,3).join(", ")})`);
      if (!muted) playTone(220, "sawtooth", 0.15, 0.13);
      return;
    }
    if (!muted) playTone(880, "sine", 0.1, 0.16);
    const newLines = [...lines];
    newLines[lineIdx] = typed;
    setLines(newLines);
    setTyped("");
    if (lineIdx >= 3) {
      setStatus("done");
    } else {
      setLineIdx(i => i + 1);
    }
  };

  const handleKey = e => {
    if (e.key === "Enter") { e.preventDefault(); submitLine(); }
  };

  const reset = () => {
    setLines(["", "", "", ""]); setLineIdx(0); setTyped(""); setError("");
    setStartTime(null); setStatus("playing");
    setTimeout(() => ref.current?.focus(), 50);
  };

  const elapsedSec = startTime ? Math.max(1, Math.round((Date.now() - startTime) / 1000)) : 0;
  const totalChars = lines.join(" ").length;
  const wpm = startTime ? Math.round((totalChars / 5) / (elapsedSec / 60)) : 0;

  if (status === "done") {
    return (
      <div style={{padding:"4px 0"}}>
        <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
        <div style={{marginTop:14,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:10}}>✍️</div>
          <div style={{color:T.text,fontWeight:800,fontSize:20,marginBottom:16}}>Your freestyle</div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",marginBottom:16,textAlign:"left"}}>
            {lines.map((l,i) => <div key={i} style={{color:T.text,fontSize:15,lineHeight:1.7,fontFamily:"'JetBrains Mono',monospace"}}>{l}</div>)}
          </div>
          <div style={{color:T.muted,fontSize:13,marginBottom:20}}>~{wpm || 0} WPM</div>
          <button onClick={reset} style={{padding:"12px 28px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:T.font}}>Freestyle Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"4px 0"}}>
      <BackBtn onBack={onBack} onSettings={onSettings} T={T} />
      <div style={{textAlign:"center",margin:"14px 0"}}>
        <div style={{color:T.faint,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Line {lineIdx+1} of 4</div>
        <div style={{color:T.purple,fontSize:15,fontWeight:700}}>Each line must end with a word that rhymes with "{targetWord}"</div>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 18px",marginBottom:14}}>
        {lines.slice(0, lineIdx).map((l,i) => (
          <div key={i} style={{color:T.muted,fontSize:14,lineHeight:1.8,fontFamily:"'JetBrains Mono',monospace",opacity:0.7}}>{l}</div>
        ))}
        <textarea
          ref={ref}
          value={typed}
          onChange={handleType}
          onKeyDown={handleKey}
          placeholder={`Write line ${lineIdx+1}... (Enter to submit)`}
          rows={1}
          style={{width:"100%",background:"transparent",border:"none",color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:15,lineHeight:1.8,outline:"none",resize:"none"}}
        />
      </div>

      {error && <div style={{color:"#ef4444",fontSize:12,marginBottom:12,textAlign:"center"}}>{error}</div>}

      <button onClick={submitLine} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
        Submit Line
      </button>
    </div>
  );
}

export default { SpeedTest, MissingLetters, Anagram, BrickBreaker, Quotes, HaikuMode, Synonyms, Antonyms, TugOfWar, WordBomb, MemoryEdit, WildcardWords, Freestyle };
