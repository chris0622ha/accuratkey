"use client";
import { useState, useEffect } from "react";
import { getPublicProfile } from "@/lib/firebase";

const T = { bg:"#0a0a0f", card:"#0f0f1a", border:"#1e1e30", purple:"#a78bfa", text:"#e0e0ff", muted:"#6b7280", faint:"#2e2e44", accent:"#34d399", font:"'JetBrains Mono',monospace" };
const AV = { key:"⌨️",rocket:"🚀",fire:"🔥",lightning:"⚡",brain:"🧠",trophy:"🏆",cat:"🐱",robot:"🤖",star:"⭐",gem:"💎",target:"🎯",ghost:"👻",dragon:"🐉",unicorn:"🦄",dino:"🦕",penguin:"🐧" };

export default function PublicProfile({ params }) {
  const username = params?.username;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    getPublicProfile(username).then(p => {
      if (!p) setNotFound(true);
      else setProfile(p);
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  if (loading) return <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,color:T.muted}}>Loading...</div>;
  if (notFound) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font}}>
      <div style={{fontSize:48,marginBottom:16}}>🔍</div>
      <div style={{color:T.text,fontWeight:700,fontSize:18,marginBottom:8}}>User not found</div>
      <div style={{color:T.muted,fontSize:13}}>@{username} doesn't exist</div>
      <a href="/" style={{color:T.purple,fontSize:13,marginTop:20,textDecoration:"none"}}>← Home</a>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font,color:T.text,padding:"40px 20px"}}>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <a href="/" style={{color:T.muted,fontSize:12,textDecoration:"none",display:"block",marginBottom:24}}>← AccuratKey</a>
        
        {/* Header */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:8}}>⌨️</div>
          <div style={{color:T.purple,fontWeight:800,fontSize:22,marginBottom:4}}>@{profile.username}</div>
          <div style={{color:T.muted,fontSize:12}}>{profile.profiles?.length||0} profile{profile.profiles?.length!==1?"s":""}</div>
        </div>

        {/* Profiles */}
        {profile.profiles?.map((p, i) => (
          <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <span style={{fontSize:28}}>{AV[p.avatar]||"⌨️"}</span>
              <div>
                <div style={{color:T.text,fontWeight:700,fontSize:15}}>{p.name}</div>
                <div style={{color:T.muted,fontSize:11}}>Level {p.currentLevel||1} · {p.highestUnlocked||1} unlocked</div>
              </div>
              {(p.streak||0)>0&&<div style={{marginLeft:"auto",color:"#f97316",fontSize:13,fontWeight:700}}>🔥{p.streak}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Best WPM",`${p.bestWpm||0} wpm`],["Level",`${p.currentLevel||1} / 165`]].map(([label,val])=>(
                <div key={label} style={{background:T.faint,borderRadius:8,padding:"10px 12px"}}>
                  <div style={{color:T.muted,fontSize:9,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{label}</div>
                  <div style={{color:T.purple,fontWeight:700,fontSize:15}}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
