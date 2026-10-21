"use client";
import React, { useState, useMemo } from "react";
import { UiIcon } from "./icons/UiIcons";
import { getHistory, summary, xpInfo, dayCounts, dayKey, currentDayStreak, ACHIEVEMENTS, unlockedIds, getGoal, setGoal, toCsv } from "@/lib/stats";
import { getBest } from "@/lib/prefs";

const Pill = ({ T, on, children, onClick }) => <button onClick={onClick} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${on?T.purple:T.border}`,background:on?T.purple+"33":"transparent",color:on?T.text:T.muted}}>{children}</button>;
const Stat = ({ T, label, value }) => <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px"}}><div style={{color:T.text,fontSize:20,fontWeight:800}}>{value}</div><div style={{color:T.muted,fontSize:11}}>{label}</div></div>;

function LineChart({ T, data, color, label, max = null }) {
  if (data.length < 2) return <div style={{color:T.muted,fontSize:12,padding:"18px 0"}}>Finish at least 2 runs to see a trend.</div>;
  const W = 400, H = 110, P = 8, hi = max || Math.max(...data, 10), lo = 0;
  const pts = data.map((v, i) => [P + (i * (W - 2 * P)) / (data.length - 1), H - P - ((v - lo) / (hi - lo)) * (H - 2 * P)]);
  return <div><div style={{color:T.muted,fontSize:11,marginBottom:4}}>{label} · last {data.length} runs</div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:110,background:T.bg,borderRadius:8,border:`1px solid ${T.border}`}} role="img" aria-label={label}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts.map(p => p.join(",")).join(" ")} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.2" fill={color} />)}
    </svg></div>;
}

function Heatmap({ T, counts }) {
  const weeks = 14, cells = [], today = new Date(); today.setHours(12);
  const start = new Date(today); start.setDate(start.getDate() - (weeks * 7 - 1) - today.getDay());
  for (let i = 0; i < weeks * 7 + today.getDay() + 1; i++) { const d = new Date(start); d.setDate(start.getDate() + i); if (d > today) break; cells.push({ k: dayKey(d.getTime()), dow: d.getDay(), c: counts[dayKey(d.getTime())] || 0 }); }
  const cols = []; cells.forEach(c => { if (c.dow === 0 || !cols.length) cols.push([]); cols[cols.length - 1].push(c); });
  const shade = (n) => n === 0 ? T.border : n < 3 ? T.purple + "66" : n < 6 ? T.purple + "bb" : T.purple;
  return <div style={{display:"flex",gap:3,overflowX:"auto"}}>{cols.map((col, i) => <div key={i} style={{display:"flex",flexDirection:"column",gap:3}}>{col.map(c => <div key={c.k} title={`${c.k}: ${c.c} run${c.c === 1 ? "" : "s"}`} style={{width:13,height:13,borderRadius:3,background:shade(c.c)}} />)}</div>)}</div>;
}

export default function StatsModal({ T, profile, onClose }) {
  const pid = profile?.id;
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [goal, setG] = useState(() => getGoal(pid));
  const hist = useMemo(() => getHistory(pid), [pid]);
  const s = summary(hist), xp = xpInfo(hist), counts = dayCounts(hist), streak = currentDayStreak(hist);
  const unlocked = unlockedIds(hist), todayRuns = counts[dayKey()] || 0;
  const last = hist.slice(-30);
  const download = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toCsv(hist)], { type: "text/csv" })); a.download = "accuratkey-history.csv"; document.body.appendChild(a); a.click(); a.remove(); };
  const rows = hist.filter(r => filter === "all" || (filter === "passed" ? r.passed : !r.passed)).slice().reverse().slice(0, 60);
  const bests = Object.entries((() => { const o = {}; hist.forEach(r => { o[r.level] = o[r.level] || getBest(pid, r.level); }); return o; })()).filter(([, v]) => v).sort((a, b) => b[1].bestWpm - a[1].bestWpm).slice(0, 12);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 22px",width:"100%",maxWidth:560,maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8,color:T.text,fontWeight:800,fontSize:16}}><UiIcon name="stats" size={18} color={T.purple}/>Your stats</div>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <div style={{color:T.muted,fontSize:11,marginBottom:12}}>Saved on this device only — not uploaded anywhere.</div>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {[["overview","Overview"],["history","History"],["badges","Achievements"],["goals","Goals"]].map(([k,l]) => <Pill key={k} T={T} on={tab===k} onClick={()=>setTab(k)}>{l}</Pill>)}
        </div>

        {tab === "overview" && <>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",color:T.text,fontWeight:700,fontSize:14}}><span>Level {xp.level}</span><span style={{color:T.muted,fontSize:12}}>{xp.xp} XP</span></div>
            <div style={{height:6,background:T.border,borderRadius:3,marginTop:8}}><div style={{height:"100%",width:`${Math.min(100,(xp.into/xp.span)*100)}%`,background:`linear-gradient(90deg,${T.purple},${T.accent})`,borderRadius:3}}/></div>
            <div style={{color:T.muted,fontSize:11,marginTop:5}}>{xp.span - xp.into} XP to level {xp.level + 1}. Each run earns XP; passing and speed earn more.</div>
          </div>
          {!s.runs ? <div style={{color:T.muted,fontSize:13,padding:"10px 0"}}>No runs yet. Finish a level and your stats appear here.</div> : <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:14}}>
              <Stat T={T} label="Runs" value={s.runs}/><Stat T={T} label="Best WPM" value={s.bestWpm}/><Stat T={T} label="Avg WPM (last 20)" value={s.avgWpm}/>
              <Stat T={T} label="Avg accuracy" value={s.avgAcc+"%"}/><Stat T={T} label="Day streak" value={streak}/><Stat T={T} label="Minutes typed" value={s.minutes}/>
            </div>
            <LineChart T={T} data={last.map(r=>r.wpm)} color={T.purple} label="WPM" />
            <div style={{height:10}}/>
            <LineChart T={T} data={last.map(r=>r.acc)} color={T.accent2||T.accent} label="Accuracy %" max={100} />
            <div style={{color:T.muted,fontSize:11,margin:"14px 0 6px"}}>Practice calendar (last 14 weeks)</div>
            <Heatmap T={T} counts={counts} />
            {bests.length > 0 && <><div style={{color:T.muted,fontSize:11,margin:"14px 0 6px"}}>Personal bests</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:6}}>{bests.map(([lv,b]) => <div key={lv} style={{fontSize:12,color:T.text,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px"}}>{Number(lv)===-1?"Daily":`Level ${lv}`} · <b>{b.bestWpm}</b> WPM · {b.bestAcc}%</div>)}</div></>}
          </>}
        </>}

        {tab === "history" && <>
          <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",flexWrap:"wrap"}}>
            {[["all","All"],["passed","Passed"],["failed","Failed"]].map(([k,l]) => <Pill key={k} T={T} on={filter===k} onClick={()=>setFilter(k)}>{l}</Pill>)}
            <span style={{flex:1}}/><button onClick={download} disabled={!hist.length} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${T.border}`,background:"transparent",color:T.text}}>Export CSV</button>
          </div>
          {!rows.length ? <div style={{color:T.muted,fontSize:13}}>Nothing here yet.</div> : rows.map((r,i) => <div key={i} style={{display:"flex",justifyContent:"space-between",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:12,color:T.text}}>
            <span style={{color:T.muted,minWidth:110}}>{new Date(r.t).toLocaleDateString()} {new Date(r.t).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
            <span>{r.level===-1?"Daily":r.level===-2?"Practice":`Level ${r.level}`}</span><span><b>{r.wpm}</b> WPM</span><span>{r.acc}%</span><span style={{color:r.passed?"#34d399":"#ef4444",minWidth:44,textAlign:"right"}}>{r.passed?"Pass":"Fail"}</span></div>)}
        </>}

        {tab === "badges" && <>
          <div style={{color:T.muted,fontSize:12,marginBottom:10}}>{unlocked.length} of {ACHIEVEMENTS.length} unlocked</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8}}>
            {ACHIEVEMENTS.map(a => { const on = unlocked.includes(a.id); return <div key={a.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",borderRadius:10,border:`1px solid ${on?T.purple:T.border}`,background:on?T.purple+"18":T.bg,opacity:on?1:.55}}>
              <UiIcon name={on?"star":"lock"} size={22} color={on?T.accent:T.muted}/><div><div style={{color:T.text,fontSize:13,fontWeight:700}}>{a.name}</div><div style={{color:T.muted,fontSize:11}}>{a.desc}</div></div></div>; })}
          </div></>}

        {tab === "goals" && <>
          <div style={{color:T.text,fontSize:14,fontWeight:700,marginBottom:6}}>Daily goal</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {[1,2,3,5,8,10].map(n => <Pill key={n} T={T} on={goal.runsPerDay===n} onClick={()=>{setGoal(pid,{runsPerDay:n});setG({...goal,runsPerDay:n});}}>{n} run{n>1?"s":""}</Pill>)}
          </div>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",color:T.text,fontSize:13,fontWeight:700}}><span>Today</span><span>{Math.min(todayRuns, goal.runsPerDay)}/{goal.runsPerDay}{todayRuns >= goal.runsPerDay ? " ✓" : ""}</span></div>
            <div style={{height:8,background:T.border,borderRadius:4,marginTop:8}}><div style={{height:"100%",width:`${Math.min(100,(todayRuns/goal.runsPerDay)*100)}%`,background:todayRuns>=goal.runsPerDay?"#34d399":T.purple,borderRadius:4}}/></div>
          </div>
          <div style={{color:T.muted,fontSize:12,marginTop:10}}>Practice streak: <b style={{color:T.text}}>{streak} day{streak===1?"":"s"}</b>. Short, regular practice beats long, rare sessions.</div>
        </>}
      </div>
    </div>
  );
}
