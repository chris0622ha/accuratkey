"use client";
import React from "react";
import { UiIcon } from "./icons/UiIcons";

const Row = ({ T, label, hint, children }) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
    <div><div style={{color:T.text,fontSize:13,fontWeight:600}}>{label}</div>{hint&&<div style={{color:T.muted,fontSize:11,marginTop:2}}>{hint}</div>}</div>
    <div style={{display:"flex",gap:4,flexShrink:0}}>{children}</div>
  </div>
);
const Seg = ({ T, options, value, onChange }) => options.map(([v, l]) => (
  <button key={String(v)} onClick={()=>onChange(v)} style={{padding:"5px 9px",fontSize:11,fontWeight:700,borderRadius:6,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${value===v?T.purple:T.border}`,background:value===v?T.purple+"33":"transparent",color:value===v?T.text:T.muted}}>{l}</button>
));
const Toggle = ({ T, value, onChange }) => <Seg T={T} value={value} onChange={onChange} options={[[false,"Off"],[true,"On"]]} />;

function exportData(profile) {
  const data = { exportedAt: new Date().toISOString(), profile: profile ? { id: profile.id, name: profile.name, keys: profile.keys, highestUnlocked: profile.highestUnlocked, activeTheme: profile.activeTheme, activeFont: profile.activeFont, ownedThemes: profile.ownedThemes, ownedFonts: profile.ownedFonts, streak: profile.streak } : null, localData: {} };
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("ak_") && !/token|secret|uid/i.test(k)) data.localData[k] = localStorage.getItem(k); } } catch {}
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "accuratkey-my-data.json"; document.body.appendChild(a); a.click(); a.remove();
}
export default function PrefsModal({ T, prefs, setPref, onClose, profile, onTour, onWhatsNew }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 22px",width:"100%",maxWidth:460,maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8,color:T.text,fontWeight:800,fontSize:16}}><UiIcon name="settings" size={18} color={T.purple}/>Preferences</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer"}} aria-label="Close">×</button>
        </div>
        <div style={{color:T.muted,fontSize:11,marginBottom:8}}>Saved on this device only. Nothing here is sent to our servers.</div>

        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,marginTop:10}}>TYPING</div>
        <Row T={T} label="Text size"><Seg T={T} value={prefs.textScale} onChange={v=>setPref({textScale:v})} options={[[0.85,"S"],[1,"M"],[1.3,"L"],[1.6,"XL"]]} /></Row>
        <Row T={T} label="Caret style" hint="Auto uses your theme's"><Seg T={T} value={prefs.caret} onChange={v=>setPref({caret:v})} options={[["auto","Auto"],["underline","_"],["bar","|"],["block","█"],["glow","✦"]]} /></Row>
        <Row T={T} label="Ghost pace (vs your best)"><Toggle T={T} value={prefs.ghost} onChange={v=>setPref({ghost:v})} /></Row>
        <Row T={T} label="Show timer"><Toggle T={T} value={prefs.showTimer} onChange={v=>setPref({showTimer:v})} /></Row>
        <Row T={T} label="Focus mode" hint="Hide everything except the text"><Toggle T={T} value={prefs.focusMode} onChange={v=>setPref({focusMode:v})} /></Row>
        <Row T={T} label="Zen mode" hint="Hide WPM, accuracy and combo while typing"><Toggle T={T} value={prefs.zen} onChange={v=>setPref({zen:v})} /></Row>

        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,marginTop:16}}>CHALLENGES & HEALTH</div>
        <Row T={T} label="Blind mode" hint="Letters more than 2 keys ahead are hidden"><Toggle T={T} value={!!prefs.blind} onChange={v=>setPref({blind:v})} /></Row>
        <Row T={T} label="Sudden death" hint="Restart the run after this many mistakes"><Seg T={T} value={prefs.suddenDeath||0} onChange={v=>setPref({suddenDeath:v})} options={[[0,"Off"],[3,"3"],[5,"5"],[10,"10"]]} /></Row>
        <Row T={T} label="Break reminder" hint="A gentle nudge after this many minutes of practice"><Seg T={T} value={prefs.breakEvery||0} onChange={v=>setPref({breakEvery:v})} options={[[0,"Off"],[15,"15m"],[30,"30m"],[45,"45m"]]} /></Row>

        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,marginTop:16}}>SOUND & EFFECTS</div>
        <Row T={T} label="Volume"><Seg T={T} value={prefs.volume} onChange={v=>setPref({volume:v})} options={[[0,"Off"],[0.35,"Low"],[0.7,"Med"],[1,"High"]]} /></Row>
        <Row T={T} label="Confetti"><Toggle T={T} value={prefs.confetti} onChange={v=>setPref({confetti:v})} /></Row>
        <Row T={T} label="Reduce motion" hint="No shaking, bursts or blinking"><Toggle T={T} value={prefs.reducedMotion} onChange={v=>setPref({reducedMotion:v})} /></Row>

        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,marginTop:16}}>ACCESSIBILITY</div>
        <Row T={T} label="High contrast text" hint="Brighter untyped letters and labels"><Toggle T={T} value={prefs.highContrast} onChange={v=>setPref({highContrast:v})} /></Row>
        <Row T={T} label="Dyslexia-friendly font" hint="Uses Lexend for all text"><Toggle T={T} value={prefs.dyslexiaFont} onChange={v=>setPref({dyslexiaFont:v})} /></Row>

        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,marginTop:16}}>YOUR DATA & HELP</div>
        <Row T={T} label="Download my data" hint="A JSON copy of your profile and saved settings">
          <button onClick={()=>exportData(profile)} style={{padding:"5px 10px",fontSize:11,fontWeight:700,borderRadius:6,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${T.border}`,background:"transparent",color:T.text}}>Download</button>
        </Row>
        <Row T={T} label="Clear saved settings" hint="Resets preferences and personal bests on this device">
          <button onClick={()=>{ try{ Object.keys(localStorage).filter(k=>k.startsWith("ak_prefs_")||k.startsWith("ak_best_")).forEach(k=>localStorage.removeItem(k)); }catch{} window.location.reload(); }} style={{padding:"5px 10px",fontSize:11,fontWeight:700,borderRadius:6,cursor:"pointer",fontFamily:"inherit",border:"1px solid #ef444466",background:"transparent",color:"#ef4444"}}>Clear</button>
        </Row>
        <Row T={T} label="Quick tour"><button onClick={()=>{onClose();onTour&&onTour();}} style={{padding:"5px 10px",fontSize:11,fontWeight:700,borderRadius:6,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${T.border}`,background:"transparent",color:T.text}}>Replay</button></Row>
        <Row T={T} label="What's new"><button onClick={()=>{onClose();onWhatsNew&&onWhatsNew();}} style={{padding:"5px 10px",fontSize:11,fontWeight:700,borderRadius:6,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${T.border}`,background:"transparent",color:T.text}}>Open</button></Row>

        <Row T={T} label="Legal"><span style={{display:"flex",gap:10,fontSize:11}}>
          <a href="/help" target="_blank" rel="noopener" style={{color:T.purple,fontWeight:700}}>Help</a><a href="/privacy" style={{color:T.muted}}>Privacy</a><a href="#" onClick={e=>{e.preventDefault();window.dispatchEvent(new CustomEvent("ak-open-cookie-settings"));}} style={{color:T.muted}}>Cookies</a><a href="/childrens-privacy" style={{color:T.muted}}>Children</a><a href="/tos" style={{color:T.muted}}>Terms</a></span></Row>

        <div style={{color:T.purple,fontSize:11,fontWeight:800,letterSpacing:1,marginTop:16}}>SHORTCUTS</div>
        <div style={{color:T.muted,fontSize:12,lineHeight:1.9,marginTop:6}}>
          <b style={{color:T.text}}>Esc</b> pause / resume &nbsp;·&nbsp; <b style={{color:T.text}}>Tab</b> restart level &nbsp;·&nbsp; <b style={{color:T.text}}>?</b> open this panel
        </div>
      </div>
    </div>
  );
}
