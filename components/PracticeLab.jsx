"use client";
import React, { useState, useMemo } from "react";
import { UiIcon } from "./icons/UiIcons";
import { PRESETS, fromText, weakKeyDrill, weakKeys, getMissedWords, missedDrill, clearMissedWords } from "@/lib/practice";
import { ALL_WORDS } from "./WordDB";
import WordSetsPanel from "./WordSetsPanel";
import { isFeatureLocked } from "@/lib/locks";
import { SYN_ANT } from "./SynAntDB";
import { wordOfDay } from "@/lib/features";
import { getHistory, dayCounts, dayKey } from "@/lib/stats";

export default function PracticeLab({ T, profile, onStart, onClose, canSubmit }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const community = !isFeatureLocked("wordsets");
  const weak = useMemo(() => weakKeys(profile?.id), [profile?.id]);
  const missed = useMemo(() => Object.keys(getMissedWords(profile?.id)), [profile?.id]);
  const wod = useMemo(() => wordOfDay(SYN_ANT), []);
  const planKey = `ak_plan_${profile?.id || "guest"}_${dayKey()}`;
  const [done, setDone] = useState(() => { try { return JSON.parse(localStorage.getItem(planKey) || "[]"); } catch { return []; } });
  const hist = useMemo(() => getHistory(profile?.id), [profile?.id]);
  const playedToday = (dayCounts(hist)[dayKey()] || 0) > 0;
  const markDone = (id) => { const d = [...new Set([...done, id])]; setDone(d); try { localStorage.setItem(planKey, JSON.stringify(d)); } catch {} };
  const go = (lines, name, meta) => { if (!lines || lines.length < 3) { setMsg("Not enough text — add a bit more (at least a couple of sentences)."); return; } onClose(); onStart(lines, name, meta); };
  const Card = ({ icon, title, desc, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{textAlign:"left",display:"flex",gap:12,alignItems:"center",width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,color:T.text,cursor:disabled?"default":"pointer",opacity:disabled?.5:1,fontFamily:"inherit"}}>
      <UiIcon name={icon} size={22} color={T.purple}/><span><div style={{fontWeight:700,fontSize:13}}>{title}</div><div style={{color:T.muted,fontSize:11,marginTop:2}}>{desc}</div></span>
    </button>);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 22px",width:"100%",maxWidth:520,maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,color:T.text,fontWeight:800,fontSize:16}}><UiIcon name="keyboard" size={18} color={T.purple}/>Practice lab</div>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <div style={{color:T.muted,fontSize:11,margin:"4px 0 12px"}}>Free practice. Runs here don't earn Keys or unlock levels, and nothing is uploaded.</div>

        {(() => {
          const day = new Date().getDay();
          const extra = [["bigrams","Letter pairs"],["punctuation","Punctuation"],["numbers","Numbers"],["code","Code"],["symbols","Symbols"],["numpad","Numpad math"],["bigrams","Letter pairs"]][day];
          const plan = [
            weak.length ? { id: "weak", title: `Drill ${weak.slice(0,3).map(w => w.k.toUpperCase()).join(" ")}`, desc: "Your three weakest keys", run: () => go(weakKeyDrill(weak.map(w=>w.k), ALL_WORDS), "Weak-key drill") }
              : { id: "warm", title: "Warm up", desc: "Common letter pairs to get your fingers moving", run: () => go(PRESETS.bigrams(), "Letter pairs") },
            missed.length >= 4 ? { id: "missed", title: "Fix missed words", desc: `${missed.length} words you slipped on`, run: () => go(missedDrill(missed.slice(0,40)), "Missed words") }
              : { id: "punc", title: "Real sentences", desc: "Punctuation in everyday text", run: () => go(PRESETS.punctuation(), "Punctuation") },
            { id: "x" + day, title: `Today's mix: ${extra[1]}`, desc: "A different skill each day", run: () => go(PRESETS[extra[0]](), extra[1]) },
          ];
          return <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",color:T.text,fontWeight:800,fontSize:13,marginBottom:8}}><span>Today's plan</span><span style={{color:T.muted,fontWeight:600,fontSize:11}}>{done.filter(d => plan.some(p => p.id === d)).length}/3 done{playedToday ? "" : " · no runs yet today"}</span></div>
            {plan.map(p => <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0"}}>
              <span style={{width:18,height:18,borderRadius:9,border:`2px solid ${done.includes(p.id)?"#10b981":T.border}`,background:done.includes(p.id)?"#10b981":"transparent",color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{done.includes(p.id)?"✓":""}</span>
              <span style={{flex:1}}><div style={{color:T.text,fontSize:13,fontWeight:700}}>{p.title}</div><div style={{color:T.muted,fontSize:11}}>{p.desc}</div></span>
              <button onClick={()=>{ markDone(p.id); p.run(); }} style={{padding:"5px 12px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Start</button>
            </div>)}
          </div>; })()}

        {wod && <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
          <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1}}>WORD OF THE DAY</div>
          <div style={{color:T.text,fontSize:20,fontWeight:800,margin:"4px 0"}}>{wod.word}</div>
          <div style={{color:T.muted,fontSize:12}}>Means something like: {wod.syn.slice(0,4).join(", ")}{wod.ant?.length ? ` · opposite: ${wod.ant.slice(0,3).join(", ")}` : ""}</div>
          <button onClick={()=>go(fromText(Array.from({length:8},()=>[wod.word,...wod.syn.slice(0,4)].join(" ")).join(" ")), "Word of the day")} style={{marginTop:8,padding:"6px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.text,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Type these words</button>
        </div>}

        <div style={{display:"grid",gap:8}}>
          <Card icon="target" title="Drill my weak keys" disabled={!weak.length}
            desc={weak.length ? `Focus on: ${weak.map(w => w.k.toUpperCase()).join(" ")} (your highest miss rates)` : "Finish a few level runs first — I track which keys you miss."}
            onClick={()=>go(weakKeyDrill(weak.map(w=>w.k), ALL_WORDS), "Weak-key drill")} />
          <Card icon="feedback" title="Drill my missed words" disabled={missed.length < 4}
            desc={missed.length >= 4 ? `${missed.length} words you've slipped on: ${missed.slice(0,4).join(", ")}…` : "Finish a few level runs first — I remember words you mistype."}
            onClick={()=>go(missedDrill(missed.slice(0,40)), "Missed words")} />
          <Card icon="keyboard" title="Numbers" desc="Number-row digits in groups" onClick={()=>go(PRESETS.numbers(), "Numbers")} />
          <Card icon="stats" title="Numpad math" desc="Digits with + - * / like a 10-key" onClick={()=>go(PRESETS.numpad(), "Numpad")} />
          <Card icon="lock" title="Symbols" desc="!@#$%^&* and brackets" onClick={()=>go(PRESETS.symbols(), "Symbols")} />
          <Card icon="friends" title="Letter pairs" desc="Common two-letter combos: th, er, on, an…" onClick={()=>go(PRESETS.bigrams(), "Letter pairs")} />
          <Card icon="feedback" title="Punctuation" desc="Commas, quotes, dashes and numbers in real sentences" onClick={()=>go(PRESETS.punctuation(), "Punctuation")} />
          <Card icon="settings" title="Code" desc="JavaScript, Python, SQL and shell snippets" onClick={()=>go(PRESETS.code(), "Code")} />
        </div>

        {community && <>
          <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,margin:"16px 0 6px"}}>COMMUNITY WORD SETS</div>
          <WordSetsPanel T={T} canSubmit={canSubmit} onPractice={go} maxListHeight={190} />
        </>}

        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,margin:"16px 0 6px"}}>YOUR OWN TEXT</div>
        <textarea value={text} onChange={e=>{setText(e.target.value.slice(0,2000));setMsg("");}} placeholder="Paste a paragraph, a poem, your own notes…" rows={4}
          style={{width:"100%",boxSizing:"border-box",background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:10,fontSize:13,fontFamily:"inherit",resize:"vertical"}} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
          <span style={{color:msg?"#ef4444":T.muted,fontSize:11}}>{msg || `${text.length}/2000 · letters, numbers and punctuation work; emoji are skipped`}</span>
          <button onClick={()=>go(fromText(text.replace(/[^\x20-\x7E\s]/g,"")), "Custom text")} style={{padding:"8px 16px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Practice this</button>
        </div>
      </div>
    </div>
  );
}
