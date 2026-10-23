"use client";
import React from "react";
import { UiIcon } from "./icons/UiIcons";

const ICON = { wordset_approved: "star", wordset_rejected: "feedback", wordset_removed: "feedback", wordset_edited: "feedback", wordset_reverted: "star", announcement: "flame", admin_message: "flame", feedback_reply: "feedback" };
const when = (t) => { try { const d = t?.toDate ? t.toDate() : null; return d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""; } catch { return ""; } };

export default function NotificationsModal({ T, items, onClose, onDismiss, onClearAll, onRevert }) {
  const [busyId, setBusyId] = React.useState(null);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 22px",width:"100%",maxWidth:460,maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,color:T.text,fontWeight:800,fontSize:16}}><UiIcon name="flame" size={18} color={T.purple}/>Notifications</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {items.length > 0 && onClearAll && <button onClick={()=>{ if(items.length < 2 || confirm("Close all notifications?")) onClearAll(); }} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:11,fontWeight:700,padding:"4px 9px",cursor:"pointer"}}>Close all</button>}
            <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer"}}>×</button>
          </div>
        </div>
        {items.length === 0 ? <div style={{color:T.muted,fontSize:13,padding:"14px 0"}}>You're all caught up.</div> :
          items.map(n => (
            <div key={n.id} style={{position:"relative",display:"flex",gap:10,background:T.bg,border:`1px solid ${n.level==="urgent"?"#ef4444":n.level==="important"?"#f59e0b":n.wasUnread?T.purple:T.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <UiIcon name={ICON[n.type] || "star"} size={18} color={T.purple}/>
              <div style={{flex:1,minWidth:0}}>
                {(n.level==="urgent"||n.level==="important") && <div style={{color:n.level==="urgent"?"#ef4444":"#f59e0b",fontSize:9,fontWeight:900,letterSpacing:1}}>{n.level.toUpperCase()}</div>}
                <div style={{color:T.text,fontWeight:700,fontSize:13}}>{n.title || (n.type === "feedback_reply" ? "Reply to your feedback" : n.type && n.type.startsWith("wordset_") ? "Word set update" : "Update")}</div>
                <div style={{color:T.muted,fontSize:12,marginTop:2,lineHeight:1.5}}>{n.body || n.reply || ""}</div>
                {n.type === "wordset_edited" && n.setId && onRevert && (n.revertRequested
                  ? <div style={{color:T.faint,fontSize:11,marginTop:6,fontWeight:700}}>Revert requested - an admin will review it</div>
                  : <button disabled={busyId===n.id} onClick={async()=>{ setBusyId(n.id); try { await onRevert(n); } finally { setBusyId(null); } }} style={{marginTop:6,background:"none",border:`1px solid ${T.purple}`,borderRadius:8,color:T.purple,fontSize:11,fontWeight:700,padding:"4px 10px",cursor:"pointer"}}>{busyId===n.id?"Sending...":"Request revert"}</button>)}
              </div>
              <div style={{color:T.faint,fontSize:10,paddingRight:18}}>{when(n.createdAt)}</div>
              {onDismiss && <button onClick={()=>onDismiss(n.id)} aria-label="Dismiss notification" title="Close" style={{position:"absolute",top:4,right:6,background:"none",border:"none",color:T.faint,fontSize:16,lineHeight:1,cursor:"pointer",padding:2}}>×</button>}
            </div>))}
      </div>
    </div>
  );
}
