"use client";
import { useState, useRef } from "react";
const TypingTest=({T})=>{
  const WORDS=["the","and","you","for","with","that","this","from","have","they","will","your","time","make","look","come","like","then","over","also","back","after","only","them","well","been","were","each","many","much","such","long","good","very","most","even","does","know","just","some","into","take","than","here","both"];
  const mkWords=()=>{let s="",a=[];while(s.length<300){const w=WORDS[Math.floor(Math.random()*WORDS.length)];a.push(w);s+=w+" ";}return a;};
  const [words,setWords]=useState(()=>mkWords());
  const [typed,setTyped]=useState("");
  const [start,setStart]=useState(null);
  const [done,setDone]=useState(false);
  const [wpm,setWpm]=useState(0);
  const [acc,setAcc]=useState(100);
  const ref=useRef(null);
  const timer=useRef(null);
  const target=words.join(" ");
  const handleType=e=>{
    const v=e.target.value;
    if(!start){setStart(Date.now());timer.current=setTimeout(()=>{setDone(true);},60000);}
    setTyped(v);
    const elapsed=(Date.now()-start)/60000||0.001;
    const correct=v.split("").filter((c,i)=>c===target[i]).length;
    setWpm(Math.round((v.length/5)/Math.max(elapsed,0.001)));
    setAcc(v.length?Math.round((correct/v.length)*100):100);
    if(v.length>=target.length-10)setDone(true);
  };
  const reset=()=>{clearTimeout(timer.current);setWords(mkWords());setTyped("");setStart(null);setDone(false);setWpm(0);setAcc(100);setTimeout(()=>ref.current?.focus(),50);};
  const shown=target.slice(0,typed.length+80);
  return <div style={{padding:"10px 0"}}>
    {done
      ?<div style={{textAlign:"center",padding:24,background:T.card,border:`1px solid ${T.border}`,borderRadius:12}}>
        <div style={{fontSize:40,marginBottom:8}}>🏁</div>
        <div style={{color:T.purple,fontWeight:800,fontSize:28,marginBottom:4}}>{wpm} WPM</div>
        <div style={{color:T.accent2,fontWeight:700,fontSize:18,marginBottom:20}}>{acc}% accuracy</div>
        <button onClick={reset} style={{padding:"12px 32px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Try Again</button>
      </div>
      :<>
        <div onClick={()=>ref.current?.focus()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,cursor:"text",fontFamily:"'JetBrains Mono',monospace",fontSize:16,letterSpacing:1,lineHeight:1.8,userSelect:"none"}}>
          {shown.split("").map((ch,i)=>{
            let color=T.faint;
            if(i<typed.length)color=typed[i]===ch?"#34d399":"#ef4444";
            else if(i===typed.length)color=T.purple;
            return <span key={i} style={{color,borderBottom:i===typed.length?`2px solid ${T.purple}`:"2px solid transparent"}}>{ch}</span>;
          })}
        </div>
        <input ref={ref} value={typed} onChange={handleType} style={{position:"absolute",opacity:0,pointerEvents:"none"}} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}/>
        <div style={{display:"flex",gap:16,justifyContent:"center"}}>
          <span style={{color:T.purple,fontWeight:700}}>{start?wpm:0} WPM</span>
          <span style={{color:T.accent2,fontWeight:700}}>{acc}%</span>
          <span style={{color:T.muted,fontSize:12}}>{start?"⏱ typing...":"Click text to start"}</span>
        </div>
      </>
    }
  </div>;
};

export default TypingTest;
