"use client";
import React from "react";
const STEPS = [
  { title: "Welcome to AccuratKey", body: "Accuracy first, speed second. Every level has an accuracy target — hit it to unlock the next." },
  { title: "No corrections", body: "Once you type a letter it's locked in. That's on purpose: it trains you to hit the right key the first time." },
  { title: "Earn Keys, customize", body: "Passing levels earns Keys. Spend them in the shop on themes with their own effects, fonts and sounds." },
  { title: "Make it yours", body: "Press ? any time for Preferences: text size, focus mode, volume, and accessibility options. Esc pauses, Tab restarts." },
];
export const TOUR_LENGTH = STEPS.length;
export default function Tour({ T, step, setStep, onClose }) {
  const s = STEPS[step];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"24px 26px",maxWidth:400,width:"100%"}}>
        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1}}>QUICK TOUR · {step+1}/{STEPS.length}</div>
        <div style={{color:T.text,fontSize:20,fontWeight:800,margin:"8px 0"}}>{s.title}</div>
        <div style={{color:T.muted,fontSize:14,lineHeight:1.6}}>{s.body}</div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"space-between"}}>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Skip</button>
          <div style={{display:"flex",gap:8}}>
            {step>0 && <button onClick={()=>setStep(step-1)} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Back</button>}
            <button onClick={()=> step<STEPS.length-1 ? setStep(step+1) : onClose()} style={{padding:"8px 18px",borderRadius:8,border:"none",background:T.purple,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>{step<STEPS.length-1?"Next":"Got it"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
