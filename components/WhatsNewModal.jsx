"use client";
import React from "react";
import { WHATS_NEW } from "@/lib/whatsNew";
import { groupByDay } from "@/lib/newsGroup";
import { applyNews } from "@/lib/newsEdits";
import { getGlobalSite } from "@/lib/siteConfig";
export default function WhatsNewModal({ T, onClose }) {
  const DAYS = groupByDay(applyNews(WHATS_NEW, getGlobalSite().news));
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 22px",width:"100%",maxWidth:460,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{color:T.text,fontWeight:800,fontSize:16}}>What's new</div>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        {DAYS.map(e => (
          <div key={e.id} style={{padding:"12px 0",borderTop:`1px solid ${T.border}`}}>
            <div style={{color:T.purple,fontSize:11,fontWeight:700}}>{e.date}</div>
            <div style={{color:T.text,fontWeight:700,fontSize:14,margin:"3px 0 6px"}}>{e.title}</div>
            <ul style={{margin:0,paddingLeft:18,color:T.muted,fontSize:13,lineHeight:1.7}}>{e.items.map(i=><li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
