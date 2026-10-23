"use client";
import React, { useState, useMemo } from "react";
import { UiIcon } from "./icons/UiIcons";
import { PRESETS, fromText, weakKeyDrill, weakKeys, getMissedWords, missedDrill, clearMissedWords } from "@/lib/practice";
import { ALL_WORDS } from "./WordDB";
import WordSetsPanel from "./WordSetsPanel";
import { isFeatureLocked } from "@/lib/locks";

export default function PracticeLab({ T, profile, onStart, onClose, canSubmit }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const community = !isFeatureLocked("wordsets");
  const weak = useMemo(() => weakKeys(profile?.id), [profile?.id]);
  const missed = useMemo(() => Object.keys(getMissedWords(profile?.id)), [profile?.id]);
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
