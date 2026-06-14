"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Sound Engine ─────────────────────────────────────────────────────────────
let _sfxCtx = null;
function getSfxCtx() {
  if (!_sfxCtx) _sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_sfxCtx.state === "suspended") _sfxCtx.resume();
  return _sfxCtx;
}
function playTone(freq, type, duration, vol = 0.18, startFreq = null, endFreq = null) {
  try {
    const ctx = getSfxCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    if (startFreq && endFreq) {
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    } else {
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
    }
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

const SFX = {
  correct: () => { playTone(880, "sine", 0.08, 0.15); setTimeout(() => playTone(1100, "sine", 0.1, 0.12), 60); },
  wrong:   () => { playTone(180, "sawtooth", 0.15, 0.12); },
  miss:    () => { playTone(220, "square", 0.2, 0.1, 300, 100); },
  gameover:() => { playTone(300, "sawtooth", 0.15, 0.2); setTimeout(() => playTone(220, "sawtooth", 0.15, 0.2), 160); setTimeout(() => playTone(150, "sawtooth", 0.4, 0.25), 320); },
  win:     () => {
    [0,80,160,240,320].forEach((t,i) => setTimeout(() => playTone([523,659,784,1047,1319][i], "sine", 0.18, 0.18), t));
  },
};

// ─── Sound Button ─────────────────────────────────────────────────────────────
function SoundBtn({ muted, toggle, T }) {
  return (
    <button onClick={toggle} title={muted ? "Sound off" : "Sound on"}
      style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:6, color:T.muted, fontSize:14, padding:"3px 8px", cursor:"pointer", fontFamily:T.font }}>
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

// ─── Word pools ───────────────────────────────────────────────────────────────
const EASY_WORDS = ["the","and","you","for","with","that","this","from","have","they","will","your","time","make","look","come","like","then","over","also","back","after","only","them","well","been","were","each","many","much","such","long","good","very","most","even","does","know","just","some","into","take","than","here","both","next","last","same","used","turn","said","did","get","way","may","day","who","its","how","all","new","out","use","can","now","our","see","two","has","but","set","put","end","why","let","big","few","run","far","off","car","eat","low","ask","own","boy","yet","age","due"];
const MED_WORDS  = ["people","before","should","between","through","because","without","another","against","thought","looking","children","problem","school","always","found","three","still","world","never","right","where","every","might","place","state","small","large","often","along","since","until","while","point","house","again","away","hand","light","city","high","need","home","water","more","game","play","work","life","form","help","feel","talk","turn","each","face","show","move","live","hold","days","line","side","open","keep","read","mind","head","stop","left","real","near","book","land","thing","kind","mean","same","tell","want","seem","call","come","give","than","when","them","then","look"];
const HARD_WORDS = ["strength","keyboard","through","beautiful","challenge","wonderful","important","different","available","carefully","excellent","sometimes","knowledge","necessary","community","following","according","something","together","mountain","whatever","remember","question","probably","absolute","previous","solution","position","language","practice","describe","continue","personal","students","consider","although","happened","thousand","everyone","anything","building","business","however","evening","already","medical","natural","culture","serious"];

function pickWords(count = 20, level = "easy") {
  const pool = level === "hard" ? HARD_WORDS : level === "med" ? MED_WORDS : EASY_WORDS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const result = [];
  while (result.length < count) result.push(...shuffled);
  return result.slice(0, count);
}

// ─── Option Row helper ─────────────────────────────────────────────────────────
function OptionRow({ label, options, value, onChange, T }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: T.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: T.font }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{ padding: "6px 14px", borderRadius: 7, border: `2px solid ${value === o.value ? T.purple : T.border}`, background: value === o.value ? T.purple : "transparent", color: value === o.value ? "#fff" : T.muted, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.font }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Game list ────────────────────────────────────────────────────────────────
const GAMES = [
  { id:"rain",     emoji:"🌧️", name:"Word Rain",    desc:"Type falling words before they hit the bottom" },
  { id:"survival", emoji:"💀", name:"Survival",      desc:"Endless typing — mistakes cost you time" },
  { id:"burst",    emoji:"⚡", name:"Speed Burst",   desc:"Sprint for WPM — how fast are you?" },
  { id:"scramble", emoji:"🔀", name:"Word Scramble", desc:"Unscramble jumbled words against the clock" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// WORD RAIN
// ═══════════════════════════════════════════════════════════════════════════════
function WordRain({ T, onBack }) {
  const [status, setStatus]   = useState("idle");
  const [difficulty, setDiff] = useState("easy");
  const [maxLives, setMaxLives] = useState(5);
  const [muted, setMuted]     = useState(() => localStorage.getItem("ak_sfx_muted") === "1");
  const [drops, setDrops]     = useState([]);
  const [typed, setTyped]     = useState("");
  const [score, setScore]     = useState(0);
  const [missed, setMissed]   = useState(0);
  const [best, setBest]       = useState(0);
  const inputRef  = useRef(null);
  const frameRef  = useRef(null);
  const dropsRef  = useRef([]);
  const scoreRef  = useRef(0);
  const missedRef = useRef(0);
  const idRef     = useRef(0);
  const wordQRef  = useRef([]);
  const lastSpawn = useRef(0);
  const maxLivesRef = useRef(maxLives);
  useEffect(() => { maxLivesRef.current = maxLives; }, [maxLives]);

  const sfx = useCallback((name) => { if (!muted) SFX[name]?.(); }, [muted]);
  const toggleMute = () => { const v = !muted; setMuted(v); localStorage.setItem("ak_sfx_muted", v ? "1" : "0"); };

  const SPEED = { easy: 0.14, med: 0.24, hard: 0.38 };
  const SPAWN  = { easy: 2400, med: 1600, hard: 950 };
  const CONTAINER_H = 340;

  const start = () => {
    cancelAnimationFrame(frameRef.current);
    dropsRef.current = [];
    scoreRef.current = 0;
    missedRef.current = 0;
    idRef.current = 0;
    wordQRef.current = pickWords(100, difficulty);
    lastSpawn.current = 0;
    setDrops([]); setScore(0); setMissed(0); setTyped("");
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const spawnWord = useCallback((now) => {
    if (!wordQRef.current.length) wordQRef.current = pickWords(100, difficulty);
    const word = wordQRef.current.shift();
    const x = 4 + Math.random() * 72;
    dropsRef.current = [...dropsRef.current, { id: idRef.current++, word, x, y: 0 }];
    lastSpawn.current = now;
  }, [difficulty]);

  useEffect(() => {
    if (status !== "playing") return;
    let last = performance.now();
    const loop = (now) => {
      const dt = now - last; last = now;
      const speed = SPEED[difficulty];
      const updated = dropsRef.current.map(d => ({ ...d, y: d.y + speed * dt / 10 }));
      // words are missed when y > 88 (just before 100% container height, inside the zone)
      const alive  = updated.filter(d => d.y < 88);
      const fallen = updated.filter(d => d.y >= 88);
      if (fallen.length) {
        missedRef.current += fallen.length;
        setMissed(missedRef.current);
        fallen.forEach(() => sfx("miss"));
        if (missedRef.current >= maxLivesRef.current) {
          dropsRef.current = [];
          setDrops([]);
          sfx("gameover");
          setStatus("dead");
          setBest(b => Math.max(b, scoreRef.current));
          cancelAnimationFrame(frameRef.current);
          return;
        }
      }
      dropsRef.current = alive;
      setDrops([...alive]);
      if (now - lastSpawn.current > SPAWN[difficulty]) spawnWord(now);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [status, difficulty, spawnWord]);

  const handleType = (e) => {
    const val = e.target.value;
    setTyped(val);
    const match = dropsRef.current.find(d => d.word === val.trim().toLowerCase());
    if (match) {
      dropsRef.current = dropsRef.current.filter(d => d.id !== match.id);
      setDrops([...dropsRef.current]);
      scoreRef.current++;
      setScore(scoreRef.current);
      setTyped("");
      sfx("correct");
    }
  };

  const hearts = Array.from({ length: maxLives }, (_, i) => i < maxLives - missed ? "❤️" : "🖤");

  // word color by y position
  const wordColor = (y) => y > 72 ? "#ef4444" : y > 52 ? "#f59e0b" : T.text;

  return (
    <div style={{ fontFamily: T.font }}>
      {status === "idle" && (
        <div style={{ padding: "10px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:20 }}>🌧️ Word Rain</div>
            <SoundBtn muted={muted} toggle={toggleMute} T={T} />
          </div>
          <div style={{ color:T.muted, fontSize:13, marginBottom:20 }}>Type falling words before they hit the bottom!</div>
          <OptionRow label="Difficulty" T={T} value={difficulty} onChange={setDiff}
            options={[{label:"Easy",value:"easy"},{label:"Medium",value:"med"},{label:"Hard",value:"hard"}]} />
          <OptionRow label="Lives" T={T} value={maxLives} onChange={setMaxLives}
            options={[{label:"3 ❤️",value:3},{label:"5 ❤️",value:5},{label:"7 ❤️",value:7}]} />
          {best > 0 && <div style={{ color:T.muted, fontSize:12, marginBottom:14 }}>🏆 Best: {best} words</div>}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={start} style={{ flex:1, padding:"12px 0", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:T.font }}>Play</button>
            <button onClick={onBack} style={{ padding:"12px 18px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>← Back</button>
          </div>
        </div>
      )}

      {status === "dead" && (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:48, marginBottom:10 }}>☠️</div>
          <div style={{ color:T.text, fontWeight:800, fontSize:22, marginBottom:4 }}>Game Over</div>
          <div style={{ color:T.purple, fontWeight:800, fontSize:44, lineHeight:1 }}>{score}</div>
          <div style={{ color:T.muted, fontSize:14, marginBottom:4 }}>words typed</div>
          {score > 0 && score >= best && <div style={{ color:"#fbbf24", fontSize:13, marginBottom:10 }}>🏆 New Best!</div>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:20 }}>
            <button onClick={start} style={{ padding:"12px 28px", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Play Again</button>
            <button onClick={onBack} style={{ padding:"12px 28px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Back</button>
          </div>
        </div>
      )}

      {status === "playing" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ color:T.purple, fontWeight:800, fontSize:18 }}>{score} <span style={{ color:T.muted, fontSize:12, fontWeight:400 }}>words</span></div>
            <div style={{ fontSize:15 }}>{hearts.join(" ")}</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <SoundBtn muted={muted} toggle={toggleMute} T={T} />
              <button onClick={() => { cancelAnimationFrame(frameRef.current); setStatus("idle"); }}
                style={{ background:"none", border:"none", color:T.faint, cursor:"pointer", fontSize:13, fontFamily:T.font }}>✕</button>
            </div>
          </div>
          <div style={{ position:"relative", height:CONTAINER_H, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", marginBottom:10 }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, background:`${T.purple}18`, borderTop:`2px dashed ${T.purple}44` }} />
            {drops.map(d => (
              <div key={d.id} style={{ position:"absolute", left:`${d.x}%`, top:`${(d.y / 88) * (CONTAINER_H - 40)}px`, transform:"translateX(-50%)", background:T.bg, border:`1px solid ${wordColor(d.y)}44`, borderRadius:6, padding:"3px 8px", fontSize:14, fontWeight:700, color:wordColor(d.y), fontFamily:T.font, whiteSpace:"nowrap", userSelect:"none", transition:"color 0.15s" }}>
                {d.word}
              </div>
            ))}
          </div>
          <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type the falling word…"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            onClick={() => inputRef.current?.focus()}
            style={{ width:"100%", background:T.bg, border:`2px solid ${T.purple}`, borderRadius:8, color:T.text, fontFamily:T.font, fontSize:16, padding:"10px 14px", outline:"none", boxSizing:"border-box" }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SURVIVAL
// ═══════════════════════════════════════════════════════════════════════════════
function Survival({ T, onBack }) {
  const [status, setStatus]     = useState("idle");
  const [startTime, setStartTime] = useState(30);
  const [muted, setMuted]       = useState(() => localStorage.getItem("ak_sfx_muted") === "1");
  const [wordList, setWordList]  = useState([]);
  const [current, setCurrent]   = useState(0);
  const [typed, setTyped]       = useState("");
  const [timeLeft, setTimeLeft]  = useState(30);
  const [score, setScore]        = useState(0);
  const [best, setBest]          = useState(0);
  const [flash, setFlash]        = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const timeRef  = useRef(30);
  const scoreRef = useRef(0);
  const currentRef = useRef(0);
  const wordListRef = useRef([]);

  const sfx = useCallback((name) => { if (!muted) SFX[name]?.(); }, [muted]);
  const toggleMute = () => { const v = !muted; setMuted(v); localStorage.setItem("ak_sfx_muted", v ? "1" : "0"); };

  const mkList = () => [...MED_WORDS, ...EASY_WORDS].sort(() => Math.random() - 0.5).slice(0, 150);

  const start = () => {
    clearInterval(timerRef.current);
    const wl = mkList();
    wordListRef.current = wl;
    currentRef.current = 0;
    scoreRef.current = 0;
    timeRef.current = startTime;
    setWordList(wl); setCurrent(0); setTyped(""); setScore(0);
    setTimeLeft(startTime); setFlash(null); setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.1;
      setTimeLeft(Math.max(0, timeRef.current));
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        sfx("gameover");
        setBest(b => Math.max(b, scoreRef.current));
        setStatus("dead");
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleType = (e) => {
    const val = e.target.value;
    setTyped(val);
    if (!val.endsWith(" ")) return;
    const attempt = val.trim();
    const target  = wordListRef.current[currentRef.current] || "";
    if (attempt === target) {
      sfx("correct");
      timeRef.current = Math.min(timeRef.current + 2, startTime * 2);
      setTimeLeft(timeRef.current);
      scoreRef.current++;
      setScore(scoreRef.current);
      setFlash("+2s ✓");
    } else {
      sfx("wrong");
      timeRef.current = Math.max(0.1, timeRef.current - 3);
      setTimeLeft(timeRef.current);
      setFlash("-3s ✗");
    }
    setTimeout(() => setFlash(null), 700);
    currentRef.current++;
    setCurrent(currentRef.current);
    setTyped("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const timerCol = timeLeft < 8 ? "#ef4444" : timeLeft < 15 ? "#f59e0b" : T.accent2 || "#34d399";
  const bar = Math.max(0, Math.min(1, timeLeft / startTime));
  const target = wordList[current] || "";

  return (
    <div style={{ fontFamily:T.font }}>
      {status === "idle" && (
        <div style={{ padding:"10px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:20 }}>💀 Survival</div>
            <SoundBtn muted={muted} toggle={toggleMute} T={T} />
          </div>
          <div style={{ color:T.muted, fontSize:13, marginBottom:20 }}>Correct word = <span style={{ color:"#34d399" }}>+2s</span>. Wrong = <span style={{ color:"#ef4444" }}>-3s</span>. Don't let the clock hit zero!</div>
          <OptionRow label="Starting Time" T={T} value={startTime} onChange={setStartTime}
            options={[{label:"15s",value:15},{label:"30s",value:30},{label:"60s",value:60}]} />
          {best > 0 && <div style={{ color:T.muted, fontSize:12, marginBottom:14 }}>🏆 Best: {best} words</div>}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={start} style={{ flex:1, padding:"12px 0", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:T.font }}>Survive</button>
            <button onClick={onBack} style={{ padding:"12px 18px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>← Back</button>
          </div>
        </div>
      )}

      {status === "dead" && (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:48, marginBottom:10 }}>💀</div>
          <div style={{ color:T.text, fontWeight:800, fontSize:22, marginBottom:4 }}>You survived</div>
          <div style={{ color:T.purple, fontWeight:800, fontSize:44, lineHeight:1 }}>{score}</div>
          <div style={{ color:T.muted, fontSize:14, marginBottom:4 }}>words</div>
          {score > 0 && score >= best && <div style={{ color:"#fbbf24", fontSize:13, marginBottom:10 }}>🏆 New Best!</div>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:20 }}>
            <button onClick={start} style={{ padding:"12px 28px", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Again</button>
            <button onClick={onBack} style={{ padding:"12px 28px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Back</button>
          </div>
        </div>
      )}

      {status === "playing" && (
        <div>
          <div style={{ height:8, background:T.card, borderRadius:4, marginBottom:14, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${bar*100}%`, background:timerCol, borderRadius:4, transition:"width 0.1s linear, background 0.3s" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ color:timerCol, fontWeight:800, fontSize:28, minWidth:80 }}>
              {timeLeft.toFixed(1)}s
              {flash && <span style={{ color: flash.includes("✓") ? "#34d399" : "#ef4444", fontSize:13, marginLeft:8, fontWeight:700 }}>{flash}</span>}
            </div>
            <div style={{ color:T.purple, fontWeight:800, fontSize:22 }}>{score} <span style={{ color:T.muted, fontSize:12, fontWeight:400 }}>words</span></div>
            <div style={{ display:"flex", gap:8 }}>
              <SoundBtn muted={muted} toggle={toggleMute} T={T} />
              <button onClick={() => { clearInterval(timerRef.current); setStatus("idle"); }}
                style={{ background:"none", border:"none", color:T.faint, cursor:"pointer", fontSize:13 }}>✕</button>
            </div>
          </div>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:11, color:T.faint, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>type this word:</div>
            <div style={{ fontSize:34, fontWeight:800, color:T.text, letterSpacing:2, marginBottom:8 }}>
              {target.split("").map((ch, i) => {
                let col = T.text;
                if (i < typed.length) col = typed[i] === ch ? "#34d399" : "#ef4444";
                else if (i === typed.length) col = T.purple;
                return <span key={i} style={{ color:col, borderBottom: i===typed.length ? `2px solid ${T.purple}` : "2px solid transparent" }}>{ch}</span>;
              })}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              {wordList.slice(current+1, current+4).map((w,i) => <span key={i} style={{ color:T.faint, fontSize:14 }}>{w}</span>)}
            </div>
          </div>
          <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type + Space to submit…"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            style={{ width:"100%", background:T.bg, border:`2px solid ${T.purple}`, borderRadius:8, color:T.text, fontFamily:T.font, fontSize:16, padding:"10px 14px", outline:"none", boxSizing:"border-box" }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEED BURST
// ═══════════════════════════════════════════════════════════════════════════════
function SpeedBurst({ T, onBack }) {
  const [duration, setDuration] = useState(15);
  const [status, setStatus]     = useState("idle");
  const [muted, setMuted]       = useState(() => localStorage.getItem("ak_sfx_muted") === "1");
  const [words, setWords]        = useState([]);
  const [typed, setTyped]        = useState("");
  const [timeLeft, setTimeLeft]  = useState(15);
  const [correct, setCorrect]    = useState(0);
  const [chars, setChars]        = useState(0);
  const [best, setBest]          = useState({ wpm:0, acc:0 });
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const timeRef   = useRef(15);
  const charsRef  = useRef(0);
  const correctRef= useRef(0);
  const totalRef  = useRef(0);
  const wordIdxRef= useRef(0);
  const durationRef = useRef(15);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  const sfx = useCallback((name) => { if (!muted) SFX[name]?.(); }, [muted]);
  const toggleMute = () => { const v = !muted; setMuted(v); localStorage.setItem("ak_sfx_muted", v ? "1" : "0"); };

  const start = () => {
    clearInterval(timerRef.current);
    const wl = pickWords(200, "med");
    setWords(wl); wordIdxRef.current = 0;
    charsRef.current = 0; correctRef.current = 0; totalRef.current = 0;
    timeRef.current = durationRef.current;
    setTyped(""); setTimeLeft(durationRef.current); setCorrect(0); setChars(0);
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.05;
      setTimeLeft(t => Math.max(0, t - 0.05));
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        const wpm = Math.round((charsRef.current / 5) / (durationRef.current / 60));
        const acc  = totalRef.current > 0 ? Math.round((correctRef.current / totalRef.current) * 100) : 100;
        setBest(b => wpm > b.wpm ? { wpm, acc } : b);
        sfx(wpm > 60 ? "win" : "gameover");
        setStatus("done");
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleType = (e) => {
    const val = e.target.value;
    setTyped(val);
    if (!val.endsWith(" ")) return;
    const attempt = val.trim();
    const target  = words[wordIdxRef.current] || "";
    totalRef.current++;
    if (attempt === target) {
      sfx("correct");
      correctRef.current++;
      charsRef.current += target.length + 1;
      setChars(charsRef.current); setCorrect(correctRef.current);
    } else {
      sfx("wrong");
    }
    wordIdxRef.current++;
    setTyped("");
  };

  const elapsed = durationRef.current - timeLeft;
  const wpm = Math.round((chars / 5) / Math.max(elapsed / 60, 0.01));
  const bar = Math.max(0, timeLeft / durationRef.current);
  const target = words[wordIdxRef.current] || "";

  return (
    <div style={{ fontFamily:T.font }}>
      {status === "idle" && (
        <div style={{ padding:"10px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:20 }}>⚡ Speed Burst</div>
            <SoundBtn muted={muted} toggle={toggleMute} T={T} />
          </div>
          <div style={{ color:T.muted, fontSize:13, marginBottom:20 }}>Sprint for raw WPM! Type as many words as you can before time runs out.</div>
          <OptionRow label="Duration" T={T} value={duration} onChange={setDuration}
            options={[{label:"10s",value:10},{label:"15s",value:15},{label:"30s",value:30},{label:"60s",value:60}]} />
          {best.wpm > 0 && <div style={{ color:T.muted, fontSize:12, marginBottom:14 }}>🏆 Best: {best.wpm} WPM ({best.acc}% acc)</div>}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={start} style={{ flex:1, padding:"12px 0", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:T.font }}>GO</button>
            <button onClick={onBack} style={{ padding:"12px 18px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>← Back</button>
          </div>
        </div>
      )}

      {status === "done" && (() => {
        const finalWpm = Math.round((chars / 5) / (durationRef.current / 60));
        const finalAcc = totalRef.current > 0 ? Math.round((correctRef.current / totalRef.current)*100) : 100;
        return (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:10 }}>⚡</div>
            <div style={{ color:T.purple, fontWeight:800, fontSize:56, lineHeight:1 }}>{finalWpm}</div>
            <div style={{ color:T.muted, fontSize:16, marginBottom:6 }}>WPM</div>
            <div style={{ color: finalAcc >= 90 ? "#34d399" : finalAcc >= 70 ? "#f59e0b" : "#ef4444", fontWeight:700, fontSize:24 }}>{finalAcc}%</div>
            <div style={{ color:T.muted, fontSize:13, marginBottom:6 }}>accuracy</div>
            {finalWpm > 0 && finalWpm >= best.wpm && <div style={{ color:"#fbbf24", fontSize:13, marginBottom:10 }}>🏆 New Best!</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:20 }}>
              <button onClick={start} style={{ padding:"12px 28px", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Again</button>
              <button onClick={onBack} style={{ padding:"12px 28px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Back</button>
            </div>
          </div>
        );
      })()}

      {status === "playing" && (
        <div>
          <div style={{ height:6, background:T.card, borderRadius:3, marginBottom:12, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${bar*100}%`, background: timeLeft < 5 ? "#ef4444" : T.purple, borderRadius:3, transition:"width 0.05s linear, background 0.3s" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color: timeLeft < 5 ? "#ef4444" : T.text, fontWeight:800, fontSize:26 }}>{Math.ceil(timeLeft)}s</div>
            <div style={{ color:T.purple, fontWeight:800, fontSize:20 }}>{wpm} <span style={{ color:T.muted, fontSize:11, fontWeight:400 }}>wpm</span></div>
            <div style={{ color:T.accent2||"#34d399", fontWeight:700, fontSize:16 }}>{correct} <span style={{ color:T.muted, fontSize:11, fontWeight:400 }}>words</span></div>
            <div style={{ display:"flex", gap:8 }}>
              <SoundBtn muted={muted} toggle={toggleMute} T={T} />
              <button onClick={() => { clearInterval(timerRef.current); setStatus("idle"); }}
                style={{ background:"none", border:"none", color:T.faint, cursor:"pointer", fontSize:13 }}>✕</button>
            </div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 18px", marginBottom:10, lineHeight:2, fontSize:17, fontFamily:T.font, minHeight:80 }}>
            {words.slice(wordIdxRef.current, wordIdxRef.current + 10).map((w, i) => {
              if (i === 0) return (
                <span key={i} style={{ marginRight:10 }}>
                  {w.split("").map((ch, ci) => {
                    let col = T.text;
                    if (ci < typed.length) col = typed[ci] === ch ? "#34d399" : "#ef4444";
                    else if (ci === typed.length) col = T.purple;
                    return <span key={ci} style={{ color:col, borderBottom: ci===typed.length ? `2px solid ${T.purple}` : "2px solid transparent" }}>{ch}</span>;
                  })}
                </span>
              );
              return <span key={i} style={{ color: i < 3 ? T.muted : T.faint, marginRight:10 }}>{w}</span>;
            })}
          </div>
          <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type + Space…"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            style={{ width:"100%", background:T.bg, border:`2px solid ${T.purple}`, borderRadius:8, color:T.text, fontFamily:T.font, fontSize:16, padding:"10px 14px", outline:"none", boxSizing:"border-box" }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORD SCRAMBLE
// ═══════════════════════════════════════════════════════════════════════════════
function WordScramble({ T, onBack }) {
  const POOL = [...MED_WORDS, ...HARD_WORDS];

  const scramble = (w) => {
    if (w.length <= 2) return w;
    let arr = w.split(""), tries = 0;
    do { arr.sort(() => Math.random() - 0.5); tries++; } while (arr.join("") === w && tries < 20);
    return arr.join("");
  };

  const [timeLimit, setTimeLimit] = useState(60);
  const [maxSkips, setMaxSkips]   = useState(3);
  const [status, setStatus]       = useState("idle");
  const [muted, setMuted]         = useState(() => localStorage.getItem("ak_sfx_muted") === "1");
  const [words, setWords]          = useState([]);
  const [idx, setIdx]              = useState(0);
  const [scrambled, setScrambled]  = useState("");
  const [typed, setTyped]          = useState("");
  const [timeLeft, setTimeLeft]    = useState(60);
  const [score, setScore]          = useState(0);
  const [best, setBest]            = useState(0);
  const [skips, setSkips]          = useState(3);
  const [flash, setFlash]          = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const timeRef  = useRef(60);
  const scoreRef = useRef(0);
  const idxRef   = useRef(0);
  const wordsRef = useRef([]);
  const timeLimitRef = useRef(60);
  const maxSkipsRef  = useRef(3);
  useEffect(() => { timeLimitRef.current = timeLimit; maxSkipsRef.current = maxSkips; }, [timeLimit, maxSkips]);

  const sfx = useCallback((name) => { if (!muted) SFX[name]?.(); }, [muted]);
  const toggleMute = () => { const v = !muted; setMuted(v); localStorage.setItem("ak_sfx_muted", v ? "1" : "0"); };

  const start = () => {
    clearInterval(timerRef.current);
    const wl = [...POOL].sort(() => Math.random() - 0.5).slice(0, 40);
    wordsRef.current = wl; idxRef.current = 0; scoreRef.current = 0;
    timeRef.current = timeLimitRef.current;
    setWords(wl); setIdx(0); setScrambled(scramble(wl[0]||"")); setTyped("");
    setScore(0); setSkips(maxSkipsRef.current); setFlash(null);
    setTimeLeft(timeLimitRef.current); setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.1;
      setTimeLeft(t => Math.max(0, t - 0.1));
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        sfx(scoreRef.current > 5 ? "win" : "gameover");
        setBest(b => Math.max(b, scoreRef.current));
        setStatus("done");
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [status]);

  const advance = (newScore, fb) => {
    setFlash(fb); setTimeout(() => setFlash(null), 700);
    const next = idxRef.current + 1;
    idxRef.current = next; setIdx(next); setScore(newScore); scoreRef.current = newScore;
    if (next >= wordsRef.current.length) {
      clearInterval(timerRef.current); sfx("win");
      setBest(b => Math.max(b, newScore)); setStatus("done"); return;
    }
    setScrambled(scramble(wordsRef.current[next]||"")); setTyped("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleType = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z]/g,"");
    setTyped(val);
    const target = wordsRef.current[idxRef.current] || "";
    if (val === target) {
      sfx("correct");
      const pts = timeRef.current > timeLimitRef.current * 0.75 ? 3 : 2;
      advance(scoreRef.current + pts, `+${pts}pts ✓`);
    }
  };

  const handleSkip = () => {
    setSkips(s => {
      if (s <= 0) return 0;
      sfx("wrong");
      advance(scoreRef.current, "skipped");
      return s - 1;
    });
  };

  const bar = Math.max(0, timeLeft / timeLimitRef.current);
  const target = words[idx] || "";

  return (
    <div style={{ fontFamily:T.font }}>
      {status === "idle" && (
        <div style={{ padding:"10px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:20 }}>🔀 Word Scramble</div>
            <SoundBtn muted={muted} toggle={toggleMute} T={T} />
          </div>
          <div style={{ color:T.muted, fontSize:13, marginBottom:20 }}>Unscramble words! Fast answers = +3pts, slower = +2pts.</div>
          <OptionRow label="Time Limit" T={T} value={timeLimit} onChange={setTimeLimit}
            options={[{label:"30s",value:30},{label:"60s",value:60},{label:"90s",value:90}]} />
          <OptionRow label="Skips" T={T} value={maxSkips} onChange={setMaxSkips}
            options={[{label:"1",value:1},{label:"3",value:3},{label:"5",value:5},{label:"∞",value:999}]} />
          {best > 0 && <div style={{ color:T.muted, fontSize:12, marginBottom:14 }}>🏆 Best: {best} pts</div>}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={start} style={{ flex:1, padding:"12px 0", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:T.font }}>Start</button>
            <button onClick={onBack} style={{ padding:"12px 18px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>← Back</button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🔀</div>
          <div style={{ color:T.purple, fontWeight:800, fontSize:52, lineHeight:1 }}>{score}</div>
          <div style={{ color:T.muted, fontSize:16, marginBottom:4 }}>points</div>
          <div style={{ color:T.muted, fontSize:13 }}>{idx} words unscrambled</div>
          {score > 0 && score >= best && <div style={{ color:"#fbbf24", fontSize:13, marginTop:6 }}>🏆 New Best!</div>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:20 }}>
            <button onClick={start} style={{ padding:"12px 28px", borderRadius:10, border:"none", background:T.purple, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Again</button>
            <button onClick={onBack} style={{ padding:"12px 28px", borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:T.font }}>Back</button>
          </div>
        </div>
      )}

      {status === "playing" && (
        <div>
          <div style={{ height:6, background:T.card, borderRadius:3, marginBottom:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${bar*100}%`, background: timeLeft < 10 ? "#ef4444" : T.purple, borderRadius:3, transition:"width 0.1s linear" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ color: timeLeft < 10 ? "#ef4444" : T.text, fontWeight:800, fontSize:22 }}>{Math.ceil(timeLeft)}s</div>
            <div style={{ color:T.purple, fontWeight:800, fontSize:22 }}>
              {score}pts
              {flash && <span style={{ color: flash.includes("✓") ? "#34d399" : "#f59e0b", fontSize:13, marginLeft:8 }}>{flash}</span>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ color:T.muted, fontSize:12 }}>skips: {maxSkips === 999 ? "∞" : skips}</span>
              <SoundBtn muted={muted} toggle={toggleMute} T={T} />
              <button onClick={() => { clearInterval(timerRef.current); setStatus("idle"); }}
                style={{ background:"none", border:"none", color:T.faint, cursor:"pointer", fontSize:13 }}>✕</button>
            </div>
          </div>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:11, color:T.faint, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>unscramble this</div>
            <div style={{ fontSize:44, fontWeight:800, color:T.purple, letterSpacing:6, marginBottom:6 }}>{scrambled}</div>
            <div style={{ fontSize:11, color:T.faint }}>{target.length} letters</div>
          </div>
          <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type the word…"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            style={{ width:"100%", background:T.bg, border:`2px solid ${T.purple}`, borderRadius:8, color:T.text, fontFamily:T.font, fontSize:16, padding:"10px 14px", outline:"none", boxSizing:"border-box", marginBottom:10 }} />
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => { setScrambled(scramble(words[idx]||"")); setTyped(""); inputRef.current?.focus(); }}
              style={{ flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:T.font }}>🔀 Reshuffle</button>
            <button onClick={handleSkip} disabled={skips <= 0}
              style={{ flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color: skips > 0 ? "#f59e0b" : T.faint, fontWeight:600, fontSize:13, cursor: skips > 0 ? "pointer" : "default", fontFamily:T.font }}>
              Skip ({maxSkips === 999 ? "∞" : skips})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GamesTab
// ═══════════════════════════════════════════════════════════════════════════════
export default function GamesTab({ T }) {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === "rain")     return <div style={{ padding:"4px 0" }}><WordRain T={T} onBack={() => setActiveGame(null)} /></div>;
  if (activeGame === "survival") return <div style={{ padding:"4px 0" }}><Survival T={T} onBack={() => setActiveGame(null)} /></div>;
  if (activeGame === "burst")    return <div style={{ padding:"4px 0" }}><SpeedBurst T={T} onBack={() => setActiveGame(null)} /></div>;
  if (activeGame === "scramble") return <div style={{ padding:"4px 0" }}><WordScramble T={T} onBack={() => setActiveGame(null)} /></div>;

  return (
    <div style={{ padding:"8px 0" }}>
      <div style={{ color:T.text, fontWeight:800, fontSize:18, marginBottom:4, fontFamily:T.font }}>🎮 Games</div>
      <div style={{ color:T.muted, fontSize:12, marginBottom:16, fontFamily:T.font }}>Choose a mini-game</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {GAMES.map(g => (
          <button key={g.id} onClick={() => setActiveGame(g.id)}
            style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, border:`1px solid ${T.border}`, background:T.card, cursor:"pointer", textAlign:"left", fontFamily:T.font, transition:"border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.purple}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <span style={{ fontSize:30 }}>{g.emoji}</span>
            <div>
              <div style={{ color:T.text, fontWeight:700, fontSize:15 }}>{g.name}</div>
              <div style={{ color:T.muted, fontSize:12, marginTop:2 }}>{g.desc}</div>
            </div>
            <span style={{ marginLeft:"auto", color:T.faint, fontSize:18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
