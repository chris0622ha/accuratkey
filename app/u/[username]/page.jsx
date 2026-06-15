"use client";
import { useState, useEffect } from "react";
import { getPublicProfileFull } from "@/lib/firebase";

const T = { bg:"#0a0a0f", card:"#0f0f1a", card2:"#111122", border:"#1e1e30", purple:"#a78bfa", purpleDim:"#a78bfa22", text:"#e0e0ff", muted:"#6b7280", faint:"#1e1e30", accent:"#34d399", accent2:"#f59e0b", font:"'JetBrains Mono',monospace" };
const AV = { key:"⌨️",rocket:"🚀",fire:"🔥",lightning:"⚡",brain:"🧠",trophy:"🏆",cat:"🐱",robot:"🤖",star:"⭐",gem:"💎",target:"🎯",ghost:"👻",dragon:"🐉",unicorn:"🦄",dino:"🦕",penguin:"🐧" };

function getBadges(profile) {
  const badges = [];
  if ((profile.streak||0) >= 7) badges.push({ icon:"🔥", label:"Week Streak", desc:"7+ day streak" });
  if ((profile.streak||0) >= 30) badges.push({ icon:"💎", label:"Month Streak", desc:"30+ day streak" });
  if ((profile.bestWpm||0) >= 60) badges.push({ icon:"⚡", label:"Speed Typist", desc:"60+ WPM best" });
  if ((profile.bestWpm||0) >= 100) badges.push({ icon:"🚀", label:"Speed God", desc:"100+ WPM best" });
  if ((profile.highestUnlocked||1) >= 10) badges.push({ icon:"🗺️", label:"Explorer", desc:"10+ levels unlocked" });
  if ((profile.highestUnlocked||1) >= 50) badges.push({ icon:"🏆", label:"Champion", desc:"50+ levels unlocked" });
  if ((profile.totalSessions||0) >= 100) badges.push({ icon:"🧠", label:"Dedicated", desc:"100+ sessions" });
  return badges;
}

function StreakCalendar({ sessionDates }) {
  const today = new Date();
  const cells = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    cells.push({ key, date: d, data: sessionDates[key] });
  }
  const firstDay = cells[0].date.getDay();
  const padded = Array(firstDay).fill(null).concat(cells);
  const maxCount = Math.max(1, ...cells.map(c => c.data?.count || 0));
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i+7));
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find(c => c);
    if (first) { const m = first.date.getMonth(); if (m !== lastMonth) { monthLabels.push({ wi, label: first.date.toLocaleString("default",{month:"short"}) }); lastMonth = m; } }
  });
  const activeDays = cells.filter(c => c.data).length;
  const totalSess = cells.reduce((s,c) => s + (c.data?.count||0), 0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{color:T.muted,fontSize:10,letterSpacing:2,textTransform:"uppercase"}}>90-Day Activity</div>
        <div style={{display:"flex",gap:10}}>
          <span style={{color:T.muted,fontSize:11}}><span style={{color:T.text,fontWeight:700}}>{activeDays}</span> days active</span>
          <span style={{color:T.muted,fontSize:11}}><span style={{color:T.text,fontWeight:700}}>{totalSess}</span> sessions</span>
        </div>
      </div>
      <div style={{display:"flex",gap:2,marginBottom:2}}>
        {weeks.map((_,wi) => { const lbl = monthLabels.find(m=>m.wi===wi); return <div key={wi} style={{width:11,fontSize:8,color:lbl?T.muted:"transparent",flexShrink:0}}>{lbl?.label||"·"}</div>; })}
      </div>
      <div style={{display:"flex",gap:2,overflowX:"auto"}}>
        {weeks.map((week,wi) => (
          <div key={wi} style={{display:"flex",flexDirection:"column",gap:2}}>
            {week.map((cell,di) => {
              if (!cell) return <div key={di} style={{width:11,height:11,borderRadius:2}} />;
              const intensity = cell.data ? Math.max(0.2, cell.data.count/maxCount) : 0;
              const isToday = cell.key === today.toISOString().slice(0,10);
              const bg = cell.data ? `rgba(139,92,246,${Math.min(1,intensity*0.8+0.2)})` : T.faint;
              return <div key={di} title={cell.data ? `${cell.key}: ${cell.data.count} session${cell.data.count>1?"s":""}, best ${cell.data.bestWpm} WPM` : cell.key}
                style={{width:11,height:11,borderRadius:2,background:bg,border:isToday?`1px solid ${T.purple}`:"1px solid transparent",flexShrink:0,cursor:cell.data?"pointer":"default"}} />;
            })}
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:3,marginTop:5,justifyContent:"flex-end"}}>
        <span style={{fontSize:9,color:T.muted}}>less</span>
        {[0,0.25,0.5,0.75,1].map(v=><div key={v} style={{width:9,height:9,borderRadius:2,background:v===0?T.faint:`rgba(139,92,246,${v*0.8+0.2})`}} />)}
        <span style={{fontSize:9,color:T.muted}}>more</span>
      </div>
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff/60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins/60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

export default function PublicProfile({ params }) {
  const username = params?.username;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeProfile, setActiveProfile] = useState(0);

  useEffect(() => {
    if (!username) return;
    getPublicProfileFull(username).then(p => {
      if (!p || !p.profiles?.length) setNotFound(true);
      else setData(p);
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  if (loading) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,gap:12}}>
      <div style={{color:T.purple,fontSize:28}}>⌨️</div>
      <div style={{color:T.muted,fontSize:13}}>Loading profile…</div>
    </div>
  );
  if (notFound) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font}}>
      <div style={{fontSize:48,marginBottom:16}}>🔍</div>
      <div style={{color:T.text,fontWeight:700,fontSize:18,marginBottom:8}}>User not found</div>
      <div style={{color:T.muted,fontSize:13}}>@{username} doesn't exist</div>
      <a href="/" style={{color:T.purple,fontSize:13,marginTop:20,textDecoration:"none"}}>← AccuratKey</a>
    </div>
  );

  const prof = data.profiles[activeProfile];
  // If all profiles are private, show nothing
  const publicProfiles = data.profiles.filter(p => p.isPublic !== false);
  if (publicProfiles.length === 0) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font}}>
      <div style={{fontSize:48,marginBottom:16}}>🔒</div>
      <div style={{color:T.text,fontWeight:700,fontSize:18,marginBottom:8}}>Profile is private</div>
      <div style={{color:T.muted,fontSize:13}}>@{data.username} has hidden their profile</div>
      <a href="/" style={{color:T.purple,fontSize:13,marginTop:20,textDecoration:"none"}}>← AccuratKey</a>
    </div>
  );
  const badges = getBadges(prof);

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font,color:T.text,padding:"32px 16px"}}>
      <div style={{maxWidth:560,margin:"0 auto"}}>

        {/* Back link */}
        <a href="/" style={{color:T.muted,fontSize:12,textDecoration:"none",display:"flex",alignItems:"center",gap:4,marginBottom:24}}>
          <span style={{color:T.purple,fontWeight:800}}>Accurat</span><span style={{fontWeight:800}}>Key</span>
          <span style={{color:T.faint,margin:"0 4px"}}>·</span>
          <span>Public Profile</span>
        </a>

        {/* Hero card */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:28,marginBottom:14,textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%, ${T.purpleDim} 0%, transparent 70%)`,pointerEvents:"none"}} />
          {prof.photo
            ? <img src={prof.photo} alt={prof.name} style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.border}`,marginBottom:12}} />
            : <div style={{fontSize:56,marginBottom:12,lineHeight:1}}>{AV[prof.avatar]||"⌨️"}</div>
          }
          <div style={{color:T.purple,fontWeight:800,fontSize:22,marginBottom:2}}>@{data.username}</div>
          <div style={{color:T.muted,fontSize:13,marginBottom:16}}>{prof.name}</div>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[
              ["Level",prof.currentLevel||1,T.purple],
              ["Best WPM",prof.bestWpm != null ? `${prof.bestWpm}` : "—",T.accent],
              ["Streak",prof.streak != null ? `🔥${prof.streak}` : "—","#f97316"],
              ["Sessions",prof.totalSessions||0,T.muted],
            ].map(([label,val,color])=>(
              <div key={label} style={{background:T.card2,borderRadius:10,padding:"10px 6px"}}>
                <div style={{color:T.muted,fontSize:9,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{label}</div>
                <div style={{color,fontWeight:700,fontSize:16}}>{val}</div>
              </div>
            ))}
          </div>

          {/* Level progress bar */}
          <div style={{marginTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:T.muted,fontSize:10}}>Level progress</span>
              <span style={{color:T.purple,fontSize:10}}>{prof.highestUnlocked||1} / 65 unlocked</span>
            </div>
            <div style={{height:4,background:T.faint,borderRadius:2}}>
              <div style={{height:"100%",background:T.purple,borderRadius:2,width:`${Math.min(100,((prof.highestUnlocked||1)/65)*100)}%`,transition:"width 0.6s"}} />
            </div>
          </div>
        </div>

        {/* Profile switcher (if multiple) */}
        {data.profiles.length > 1 && (
          <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto"}}>
            {data.profiles.map((p,i) => (
              <button key={i} onClick={()=>setActiveProfile(i)} style={{flexShrink:0,background:i===activeProfile?T.purple+"22":T.card,border:`1px solid ${i===activeProfile?T.purple:T.border}`,borderRadius:8,color:i===activeProfile?T.purple:T.muted,fontSize:12,padding:"6px 12px",cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:6}}>
                <span>{AV[p.avatar]||"⌨️"}</span>{p.name}
              </button>
            ))}
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:T.muted,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Badges</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {badges.map((b,i) => (
                <div key={i} title={b.desc} style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:18}}>{b.icon}</span>
                  <span style={{color:T.text,fontSize:12,fontWeight:700}}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity calendar */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,marginBottom:14}}>
          <StreakCalendar sessionDates={prof.sessionDates||{}} />
        </div>

        {/* Recent sessions */}
        {prof.recentSessions?.length > 0 && (
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:T.muted,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Recent Sessions</div>
            {prof.recentSessions.map((s,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<prof.recentSessions.length-1?`1px solid ${T.faint}`:"none"}}>
                <span style={{fontSize:14}}>{s.passed?"✅":"⏱️"}</span>
                <span style={{color:T.muted,fontSize:11,flex:1}}>Level {s.level}</span>
                <span style={{color:T.purple,fontWeight:700,fontSize:13}}>{s.wpm} WPM</span>
                <span style={{color:T.accent2,fontSize:12}}>{s.accuracy}%</span>
                <span style={{color:T.muted,fontSize:10}}>{timeAgo(s.createdAt)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:"center",color:T.faint,fontSize:11,marginTop:24}}>
          <a href="/" style={{color:T.purple,textDecoration:"none",fontWeight:700}}>AccuratKey</a> · Improve your typing speed
        </div>

      </div>
    </div>
  );
}
