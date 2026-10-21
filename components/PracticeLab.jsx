"use client";
import React, { useState, useMemo } from "react";
import { UiIcon } from "./icons/UiIcons";
import { PRESETS, fromText, weakKeyDrill, weakKeys } from "@/lib/practice";
import { ALL_WORDS } from "./WordDB";
import { getPublicWordSets, submitWordSet, parseWords, validateSubmission, badgeInfo, LIMITS } from "@/lib/wordsets";
import { isFeatureLocked } from "@/lib/locks";

export default function PracticeLab({ T, profile, onStart, onClose, canSubmit }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [sets, setSets] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [sTitle, setSTitle] = useState("");
  const [sWords, setSWords] = useState("");
  const [sMsg, setSMsg] = useState("");
  const [sBusy, setSBusy] = useState(false);
  const community = !isFeatureLocked("wordsets");
  React.useEffect(() => { if (community) getPublicWordSets().then(setSets); }, [community]);
  const practiceSet = (w) => { const pool = []; while (pool.length < 60) pool.push(...[...w.words].sort(() => Math.random() - 0.5)); go(fromText(pool.slice(0, Math.max(60, w.words.length)).join(" ")), w.title); };
  const submit = async () => {
    const words = parseWords(sWords); const err = validateSubmission(sTitle, words);
    if (err) { setSMsg(err); return; }
    setSBusy(true);
    try { await submitWordSet(sTitle, words); setSMsg("Thanks! Your word set is waiting for review. If approved it will appear here for everyone, with no name attached."); setSTitle(""); setSWords(""); }
    catch (e) { setSMsg("Couldn't submit: " + (e.code === "permission-denied" ? "you may already have one waiting for review." : e.message)); }
    setSBusy(false);
  };
  const weak = useMemo(() => weakKeys(profile?.id), [profile?.id]);
  const go = (lines, name) => { if (!lines || lines.length < 3) { setMsg("Not enough text — add a bit more (at least a couple of sentences)."); return; } onClose(); onStart(lines, name); };
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
          <Card icon="keyboard" title="Numbers" desc="Number-row digits in groups" onClick={()=>go(PRESETS.numbers(), "Numbers")} />
          <Card icon="stats" title="Numpad math" desc="Digits with + - * / like a 10-key" onClick={()=>go(PRESETS.numpad(), "Numpad")} />
          <Card icon="lock" title="Symbols" desc="!@#$%^&* and brackets" onClick={()=>go(PRESETS.symbols(), "Symbols")} />
          <Card icon="friends" title="Letter pairs" desc="Common two-letter combos: th, er, on, an…" onClick={()=>go(PRESETS.bigrams(), "Letter pairs")} />
          <Card icon="feedback" title="Punctuation" desc="Commas, quotes, dashes and numbers in real sentences" onClick={()=>go(PRESETS.punctuation(), "Punctuation")} />
          <Card icon="settings" title="Code" desc="JavaScript, Python, SQL and shell snippets" onClick={()=>go(PRESETS.code(), "Code")} />
        </div>

        {community && <>
          <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,margin:"16px 0 6px"}}>COMMUNITY WORD SETS</div>
          {sets === null ? <div style={{color:T.muted,fontSize:11}}>Loading…</div> : sets.length === 0 ? <div style={{color:T.muted,fontSize:11}}>No community sets yet.</div> :
            <div style={{display:"grid",gap:6,maxHeight:190,overflowY:"auto"}}>{sets.map(w => { const b = badgeInfo(w.badge); return (
              <button key={w.id} onClick={()=>practiceSet(w)} style={{display:"flex",alignItems:"center",gap:8,textAlign:"left",padding:"9px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bg,color:T.text,cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{flex:1,fontWeight:700,fontSize:12}}>{w.title}</span>
                {b && <span style={{color:b.color,fontSize:10,fontWeight:800,border:`1px solid ${b.color}55`,borderRadius:99,padding:"1px 8px"}}>{b.label}</span>}
              </button>); })}</div>}
          {canSubmit && (!showSubmit ? <button onClick={()=>setShowSubmit(true)} style={{marginTop:8,padding:"7px 12px",borderRadius:8,border:`1px dashed ${T.border}`,background:"transparent",color:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>+ Submit your own word set</button> :
            <div style={{marginTop:8,padding:10,border:`1px solid ${T.border}`,borderRadius:10}}>
              <input value={sTitle} onChange={e=>{setSTitle(e.target.value.slice(0,LIMITS.titleMax));setSMsg("");}} placeholder="Set title" style={{width:"100%",boxSizing:"border-box",background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:8,padding:8,fontSize:12,fontFamily:"inherit",marginBottom:6}} />
              <textarea value={sWords} onChange={e=>{setSWords(e.target.value.slice(0,2500));setSMsg("");}} rows={3} placeholder={`${LIMITS.minWords}-${LIMITS.maxWords} words separated by spaces or commas`} style={{width:"100%",boxSizing:"border-box",background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:8,padding:8,fontSize:12,fontFamily:"inherit",resize:"vertical"}} />
              <div style={{color:T.muted,fontSize:10,margin:"4px 0"}}>Only the title and words are shared, and only after an admin approves them. Your name is never shown. Don't include personal information.</div>
              {sMsg && <div style={{color:sMsg.startsWith("Thanks")?"#10b981":"#ef4444",fontSize:11,marginBottom:4}}>{sMsg}</div>}
              <button disabled={sBusy} onClick={submit} style={{padding:"7px 14px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{sBusy?"Sending…":"Submit for review"}</button>
            </div>)}
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
