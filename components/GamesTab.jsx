"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { TYPING_BASIC, TYPING_MEDIUM, TYPING_HARD, EASY_ARR, MED_ARR, HARD_ARR, VHARD_ARR, IMPOSSIBLE_ARR, ALL_WORDS, WORD_CATEGORIES, CATEGORY_NAMES, POOL_WORD_RAIN, POOL_SURVIVAL, POOL_SPEED_BURST, POOL_SCRAMBLE, POOL_SUDDEN_DEATH, POOL_ZEN, POOL_LADDER_EASY, POOL_LADDER_MED, POOL_LADDER_HARD, POOL_LADDER_VHARD, POOL_ECHO, POOL_INVADERS, POOL_ASTEROID, POOL_TOWER, POOL_WORD_CHAIN, pickWords, pickByDiff } from "./WordDB";
import { Sniper, Mirror, Flash, Echo, GhostWords, BossBattle } from "./GamesExtra";
import { HundredWords, Endurance, Roulette, WordChain, CategoryBlitz, VocabBuilder, TypingInvaders, AsteroidBelt, TowerDefense, MysteryWords, RhymeTime } from "./GamesNew2";
import { SpeedTest, MissingLetters, Anagram, BrickBreaker, Synonyms, Antonyms, TugOfWar, WordBomb, MemoryEdit, WildcardWords, Freestyle } from "./GamesNew3";
import { GAMES } from "./GameCatalog";
// Word pools
const EASY_WORDS = TYPING_BASIC;
const MED_WORDS = TYPING_MEDIUM;
const HARD_WORDS = TYPING_HARD;

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
// REPLACED BY WORDDB

// pickWords from WordDB handles this now

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


const CATEGORIES = [
  { id:"all",         label:"All" },
  { id:"speed",       label:"⚡ Speed" },
  { id:"accuracy",    label:"🎯 Accuracy" },
  { id:"memory",      label:"🧠 Memory" },
  { id:"arcade",      label:"🕹️ Arcade" },
  { id:"puzzle",      label:"🔀 Puzzle" },
  { id:"challenge",   label:"🏆 Challenge" },
  { id:"educational", label:"📚 Educational" },
  { id:"creative",    label:"🎨 Creative" },
  { id:"random",      label:"🎲 Random" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// WORD RAIN
// ═══════════════════════════════════════════════════════════════════════════════
function WordRain({ T, onBack, settings = {} }) {
  const sv = gLoad("rain");
  const [status, setStatus]   = useState("idle");
  const [difficulty, setDiff] = useState(()=> settings.difficulty || sv?.difficulty || "easy");
  const [maxLives, setMaxLives] = useState(()=> settings.lives || sv?.maxLives || 5);
  const [muted, setMuted]     = useState(() => localStorage.getItem("ak_sfx_muted") === "1");
  const [drops, setDrops]     = useState([]);
  const [typed, setTyped]     = useState("");
  const [score, setScore]     = useState(0);
  const [missed, setMissed]   = useState(0);
  const [best, setBest]       = useState(()=> sv?.best || 0);
  const [speedMult, setSpeedMult] = useState(1);
  const inputRef  = useRef(null);
  const frameRef  = useRef(null);
  const dropsRef  = useRef([]);
  const scoreRef  = useRef(0);
  const missedRef = useRef(0);
  const idRef     = useRef(0);
  const wordQRef  = useRef([]);
  const lastSpawn = useRef(0);
  const stoppedRef = useRef(false);
  const speedMultRef = useRef(1);
  const maxLivesRef = useRef(maxLives);
  useEffect(() => { maxLivesRef.current = maxLives; }, [maxLives]);

  const sfx = useCallback((name) => { if (!muted) SFX[name]?.(); }, [muted]);
  const toggleMute = () => { const v = !muted; setMuted(v); localStorage.setItem("ak_sfx_muted", v ? "1" : "0"); };

  const SPEED = { easy: 0.14, med: 0.24, hard: 0.38 };
  const SPAWN  = { easy: 2400, med: 1600, hard: 950 };
  const CONTAINER_H = 340;

  const start = () => {
    cancelAnimationFrame(frameRef.current);
    stoppedRef.current = false;
    dropsRef.current = [];
    scoreRef.current = 0;
    missedRef.current = 0;
    idRef.current = 0;
    wordQRef.current = pickWords(100, difficulty==='hard'?TYPING_HARD:difficulty==='med'?POOL_SURVIVAL:POOL_WORD_RAIN);
    lastSpawn.current = 0;
    speedMultRef.current = 1;
    setDrops([]); setScore(0); setMissed(0); setTyped(""); setSpeedMult(1);
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const spawnWord = useCallback((now) => {
    if (!wordQRef.current.length) wordQRef.current = pickWords(100, difficulty==='hard'?TYPING_HARD:difficulty==='med'?POOL_SURVIVAL:POOL_WORD_RAIN);
    const word = wordQRef.current.shift();
    const x = 4 + Math.random() * 72;
    dropsRef.current = [...dropsRef.current, { id: idRef.current++, word, x, y: 0 }];
    lastSpawn.current = now;
  }, [difficulty]);

  useEffect(() => {
    if (status !== "playing") return;
    let last = performance.now();
    const loop = (now) => {
      if (stoppedRef.current) return;
      const dt = now - last; last = now;
      const speed = SPEED[difficulty] * speedMultRef.current;
      const updated = dropsRef.current.map(d => ({ ...d, y: d.y + speed * dt / 10 }));
      // words are missed when y > 88 (just before 100% container height, inside the zone)
      const alive  = updated.filter(d => d.y < 88);
      const fallen = updated.filter(d => d.y >= 88);
      if (fallen.length) {
        missedRef.current += fallen.length;
        setMissed(missedRef.current);
        fallen.forEach(() => sfx("miss"));
        if (missedRef.current >= maxLivesRef.current) {
          stoppedRef.current = true;
          dropsRef.current = [];
          setDrops([]);
          sfx("gameover");
          setStatus("dead");
          const newBest = Math.max(Number(localStorage.getItem("ak_gs_rain_best")||0), scoreRef.current);
          localStorage.setItem("ak_gs_rain_best", newBest);
          setBest(newBest);
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
      // Increase speed 10% every 10 words
      if (scoreRef.current % 10 === 0) {
        speedMultRef.current = Math.round((speedMultRef.current * 1.1) * 100) / 100;
        setSpeedMult(speedMultRef.current);
        if (!muted) playTone(1200, "sine", 0.12, 0.2); // special sound on speed up
      }
    }
  };

  const hearts = Array.from({ length: maxLives }, (_, i) => i < maxLives - missed ? "❤️" : "🖤");
  const speedPct = Math.round((speedMult - 1) * 100);

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
            options={[{label:"Easy",value:"easy"},{label:"Medium",value:"medium"},{label:"Hard",value:"hard"}]} />
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
              <button onClick={() => { stoppedRef.current = true; cancelAnimationFrame(frameRef.current); setStatus("idle"); }}
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
function Survival({ T, onBack, settings = {} }) {
  const sv = gLoad("survival");
  const SURV_POOL = POOL_SURVIVAL;
  const [status, setStatus]     = useState("idle");
  const [startTime, setStartTime] = useState(30);
  const [muted, setMuted]       = useState(() => localStorage.getItem("ak_sfx_muted") === "1");
  const [wordList, setWordList]  = useState([]);
  const [current, setCurrent]   = useState(0);
  const [typed, setTyped]       = useState("");
  const [timeLeft, setTimeLeft]  = useState(30);
  const [score, setScore]        = useState(0);
  const [best, setBest] = useState(()=> sv?.best || 0);
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
    const target  = wordListRef.current[currentRef.current] || "";
    if (val === target) {
      sfx("correct");
      timeRef.current = Math.min(timeRef.current + 2, startTime * 2);
      setTimeLeft(timeRef.current);
      scoreRef.current++;
      setScore(scoreRef.current);
      setFlash("+2s ✓");
      setTimeout(() => setFlash(null), 700);
      currentRef.current++;
      setCurrent(currentRef.current);
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 10);
    } else if (val.length >= target.length) {
      sfx("wrong");
      timeRef.current = Math.max(0.1, timeRef.current - 3);
      setTimeLeft(timeRef.current);
      setFlash("-3s ✗");
      setTimeout(() => setFlash(null), 700);
      currentRef.current++;
      setCurrent(currentRef.current);
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Escape") { setTyped(""); inputRef.current?.focus(); }
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
          <div style={{ color:T.text, fontWeight:800, fontSize:22, marginBottom:4 }}>Time's up</div>
          <div style={{ color:T.purple, fontWeight:800, fontSize:44, lineHeight:1 }}>{score}</div>
          <div style={{ color:T.muted, fontSize:14, marginBottom:4 }}>words typed</div>
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
          <input ref={inputRef} value={typed} onChange={handleType} onKeyDown={handleKey} placeholder="Type the word… (Esc to clear)"
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
function SpeedBurst({ T, onBack, settings = {} }) {
  const sv = gLoad("burst");
  const [duration, setDuration] = useState(()=> settings.duration || 30);
  const [status, setStatus]     = useState("idle");
  const [muted, setMuted]       = useState(() => localStorage.getItem("ak_sfx_muted") === "1");
  const [words, setWords]        = useState([]);
  const [typed, setTyped]        = useState("");
  const [timeLeft, setTimeLeft]  = useState(()=> settings.duration || 30);
  const [correct, setCorrect]    = useState(0);
  const [chars, setChars]        = useState(0);
  const [best, setBest]          = useState(()=> sv?.best || { wpm:0, acc:0 });
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
    const wl = pickByDiff(200, "medium");
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
    const target  = words[wordIdxRef.current] || "";
    if (val === target) {
      totalRef.current++;
      sfx("correct");
      correctRef.current++;
      charsRef.current += target.length + 1;
      setChars(charsRef.current); setCorrect(correctRef.current);
      wordIdxRef.current++;
      setTyped("");
    } else if (val.length >= target.length) {
      totalRef.current++;
      sfx("wrong");
      wordIdxRef.current++;
      setTyped("");
    }
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
function WordScramble({ T, onBack, settings = {} }) {
  const sv = gLoad("scramble");
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

// ─── Game persistence helpers ─────────────────────────────────────────────────
function gSave(id, data) { try { localStorage.setItem("ak_gs_"+id, JSON.stringify(data)); } catch{} }
function gLoad(id) { try { return JSON.parse(localStorage.getItem("ak_gs_"+id)||"null"); } catch{return null;} }
function gClear(id) { try { localStorage.removeItem("ak_gs_"+id); } catch{} }

// ─── Per-game settings definitions ───────────────────────────────────────────
const GAME_SETTINGS = {
  // rain/survival/burst/scramble each have their own built-in settings UI
  // (shown on their own idle screen, with values saved via gLoad/localStorage),
  // predating the shared SettingsPanel below. Leaving these non-empty made the
  // wrapper show ITS settings panel first, then the game's own idle screen
  // showed a second one — two settings screens back to back. Empty arrays
  // here make the wrapper skip straight to the game, same as journal/roulette/tower.
  rain:        [],
  survival:    [],
  burst:       [],
  scramble:    [],
  suddendeath: [{ key:"difficulty", label:"Words",      opts:["easy","medium","hard"], default:"medium" }],
  ladder:      [{ key:"rungs",      label:"Rungs",      opts:[5,8,10,15], default:10 }],
  tugofwar:    [{ key:"difficulty", label:"Difficulty",  opts:["easy","medium","hard"], default:"medium" }],
  wordbomb:    [{ key:"difficulty", label:"Fuse Speed",  opts:["easy","medium","hard"], default:"medium" }, { key:"lives", label:"Lives", opts:[1,3,5], default:3 }],
  memoryedit:  [{ key:"changes", label:"Words Changed", opts:[1,2,3], default:2 }],
  wildcard:    [{ key:"difficulty", label:"Difficulty", opts:["easy","medium","hard"], default:"medium" }],
  sniper:      [{ key:"count",      label:"Words",      opts:[10,25,50], default:25 }, { key:"difficulty", label:"Difficulty", opts:["easy","medium","hard"], default:"medium" }],
  mirror:      [{ key:"count",      label:"Words",      opts:[10,20,30], default:20 }],
  flash:       [{ key:"flashMs",    label:"Flash time", opts:[500,1000,1500,2000], default:1000, suffix:"ms" }, { key:"count", label:"Words", opts:[10,20,30], default:20 }],
  echo:        [{ key:"lives",      label:"Lives",      opts:[1,2,3,5], default:3 }],
  ghost:       [{ key:"visibleMs",  label:"Visible for", opts:[1500,2500,3500], default:2500, suffix:"ms" }, { key:"count", label:"Words", opts:[15,25,40], default:25 }],
  boss:        [{ key:"bossHp",     label:"Boss HP",    opts:[50,100,200], default:100 }, { key:"attackMs", label:"Attack every", opts:[2000,4000,6000], default:4000, suffix:"ms" }],
  hundred:     [{ key:"difficulty", label:"Difficulty", opts:["easy","medium","hard"], default:"medium" }],
  endurance:   [{ key:"pauseMs",    label:"Pause limit", opts:[1,2,3,5], default:2, suffix:"s" }],
  roulette:    [],
  wordchain:   [{ key:"timePerWord", label:"Time per word", opts:[5,10,15,20], default:10, suffix:"s" }],
  blitz:       [{ key:"duration",   label:"Duration",   opts:[15,30,60], default:30, suffix:"s" }, { key:"category", label:"Category", opts:["animals","countries","fruits","food","science","sports","tech","programming"], default:"animals" }],
  vocab:       [{ key:"count",      label:"Words",      opts:[10,15,20,25], default:15 }],
  invaders:    [{ key:"waves",      label:"Waves",      opts:[3,5,10], default:5 }],
  asteroid:    [{ key:"lives",      label:"Lives",      opts:[2,3,5], default:3 }],
  tower:       [],
  mystery:     [{ key:"difficulty", label:"Difficulty", opts:["easy","medium","hard"], default:"medium" }],
  rhyme:       [],
  speedtest:   [{ key:"duration", label:"Duration", opts:[1,2,5], default:1, suffix:" min" }, { key:"difficulty", label:"Words", opts:["easy","medium","hard"], default:"medium" }],
  missing:     [{ key:"difficulty", label:"Difficulty", opts:["easy","medium","hard"], default:"medium" }, { key:"count", label:"Words", opts:[10,15,20,30], default:20 }, { key:"hideRate", label:"Hide amount", opts:["low","medium","high"], default:"medium" }],
  anagram:     [{ key:"difficulty", label:"Difficulty", opts:["easy","medium","hard"], default:"medium" }, { key:"count", label:"Words", opts:[10,15,20], default:20 }],
  bricks:      [{ key:"rows", label:"Rows", opts:[3,4,5,6], default:4 }, { key:"cols", label:"Columns", opts:[4,5,6,8], default:6 }],
  synonyms:    [{ key:"count", label:"Words", opts:[10,20,30,"all"], default:20 }],
  antonyms:    [{ key:"count", label:"Words", opts:[10,20,30,"all"], default:20 }],
};

function loadSettings(id) {
  try { return JSON.parse(localStorage.getItem(`ak_game_settings_${id}`) || "{}"); } catch { return {}; }
}
function saveSettings(id, s) {
  try { localStorage.setItem(`ak_game_settings_${id}`, JSON.stringify(s)); } catch {}
}
function getSettings(id) {
  const saved = loadSettings(id);
  const defs = GAME_SETTINGS[id] || [];
  const out = {};
  defs.forEach(d => { out[d.key] = saved[d.key] !== undefined ? saved[d.key] : d.default; });
  return out;
}

// ─── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ gameId, T, onStart }) {
  const defs = GAME_SETTINGS[gameId] || [];
  const [vals, setVals] = useState(() => getSettings(gameId));

  // Games with no settings auto-start immediately after mount.
  // Previously this called onStart(vals) directly during render, which is
  // a React anti-pattern - updating a parent's state mid-render causes
  // the "Cannot update a component while rendering a different component"
  // warning and produces unpredictable behavior, including the Start button
  // silently doing nothing in games that DO have settings (because the
  // render-time call from a no-settings game's mount was corrupting the
  // parent's state update queue).
  useEffect(() => {
    if (defs.length === 0) onStart(vals);
  }, []);

  if (defs.length === 0) return null;
  const set = (k, v) => {
    const nv = {...vals, [k]: v};
    setVals(nv);
    saveSettings(gameId, nv);
  };
  return (
    <div style={{background:"#13131f",border:"1px solid #1e1e30",borderRadius:12,padding:20,marginBottom:16}}>
      <div style={{color:"#e0e0ff",fontWeight:700,fontSize:14,marginBottom:14}}>⚙️ Settings</div>
      {defs.map(d => (
        <div key={d.key} style={{marginBottom:12}}>
          <div style={{color:"#888",fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{d.label}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {d.opts.map(o => (
              <button key={o} onClick={()=>set(d.key,o)}
                style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${vals[d.key]===o?"#7c6af7":"#2a2a4a"}`,background:vals[d.key]===o?"#7c6af722":"transparent",color:vals[d.key]===o?"#a78bfa":"#666",fontSize:12,fontWeight:vals[d.key]===o?700:400,cursor:"pointer",fontFamily:"inherit"}}>
                {typeof o === "string" ? o.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()) : o}{d.suffix||""}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={()=>{ saveSettings(gameId,vals); onStart(vals); }}
        style={{width:"100%",marginTop:8,padding:"12px",borderRadius:9,border:"none",background:"#7c6af7",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
        ▶ Start Game
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
function SuddenDeath({ T, onBack }) {
  const WORD_POOL = pickByDiff(60, "medium");
  const [words] = useState(WORD_POOL);
  const [typed, setTyped] = useState("");
  const [current, setCurrent] = useState(0);
  const [dead, setDead] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const target = words[current] || "";

  const handleType = e => {
    const v = e.target.value;
    if (dead || done) return;
    if (!startTime) setStartTime(Date.now());
    // Check for wrong key — if any char is wrong, instant death
    for (let i = 0; i < v.length; i++) {
      if (v[i] !== target[i]) {
        if (!muted) playTone(120, "sawtooth", 0.4, 0.3);
        setDead(true);
        const elapsed = (Date.now() - startTime) / 60000;
        setWpm(elapsed > 0 ? Math.round((current * 1) / elapsed) : 0);
        return;
      }
    }
    setTyped(v);
    if (v === target) {
      if (!muted) playTone(880, "sine", 0.1, 0.2);
      const next = current + 1;
      if (next >= words.length) {
        setDone(true);
        const elapsed = (Date.now() - startTime) / 60000;
        setWpm(Math.round(words.length / elapsed));
      } else {
        setCurrent(next);
        setTyped("");
      }
    }
  };

  const reset = () => { setTyped(""); setCurrent(0); setDead(false); setDone(false); setStartTime(null); setWpm(0); setTimeout(()=>ref.current?.focus(),50); };

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>← Back</button>
        <span style={{color:T.text,fontWeight:800,fontSize:20}}>💀 Sudden Death</span>
        <SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/>
      </div>
      {dead ? (
        <div style={{textAlign:"center",padding:32,background:T.card,border:"1px solid #ef4444",borderRadius:12}}>
          <div style={{fontSize:48,marginBottom:8}}>💀</div>
          <div style={{color:"#ef4444",fontWeight:800,fontSize:22,marginBottom:4}}>You died!</div>
          <div style={{color:T.muted,fontSize:14,marginBottom:16}}>Survived {current} word{current!==1?"s":""} · {wpm} WPM</div>
          <button onClick={reset} style={{padding:"12px 32px",borderRadius:10,border:"none",background:"#ef4444",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Try Again</button>
        </div>
      ) : done ? (
        <div style={{textAlign:"center",padding:32,background:T.card,border:`1px solid ${T.purple}`,borderRadius:12}}>
          <div style={{fontSize:48,marginBottom:8}}>🏆</div>
          <div style={{color:T.purple,fontWeight:800,fontSize:22,marginBottom:4}}>Flawless!</div>
          <div style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:16}}>{wpm} WPM · {words.length} words</div>
          <button onClick={reset} style={{padding:"12px 32px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Play Again</button>
        </div>
      ) : (
        <>
          <div style={{background:"#ef444411",border:"1px solid #ef444433",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,color:"#ef4444",textAlign:"center"}}>
            ⚠️ One wrong key = game over
          </div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:20,letterSpacing:2,textAlign:"center",minHeight:60}}>
            {target.split("").map((ch,i) => (
              <span key={i} style={{color: i < typed.length ? "#34d399" : i === typed.length ? T.purple : T.faint, borderBottom: i===typed.length?"2px solid "+T.purple:"2px solid transparent"}}>{ch}</span>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",color:T.muted,fontSize:12,marginBottom:10}}>
            <span>Word {current+1} / {words.length}</span>
            <span>{startTime ? Math.round((Date.now()-startTime)/1000)+"s" : "Start typing..."}</span>
          </div>
          <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}
          />
        </>
      )}
    </div>
  );
}

function SpeedLadder({ T, onBack }) {
  const RUNGS = 10;
  const [rung, setRung] = useState(0);
  const [words] = useState(()=>Array.from({length:RUNGS},(_,i)=>pickByDiff(5+i*2,"easy")));
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [rungStart, setRungStart] = useState(null);
  const [rungWpms, setRungWpms] = useState([]);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const ref = useRef(null);
  const MIN_WPM = rung === 0 ? 0 : rungWpms[rung-1] || 0;
  const target = (words[rung]||[]).join(" ");

  const handleType = e => {
    const v = e.target.value;
    if (failed||done) return;
    if (!startTime) { setStartTime(Date.now()); setRungStart(Date.now()); }
    setTyped(v);
    if (v === target) {
      const elapsed = (Date.now()-rungStart)/60000;
      const w = Math.round((target.length/5)/elapsed);
      if (!muted) playTone(660+rung*55,"sine",0.12,0.2);
      if (rung>0 && w <= MIN_WPM) { setFailed(true); setRungWpms(r=>[...r,w]); return; }
      const newWpms = [...rungWpms, w];
      setRungWpms(newWpms);
      if (rung+1 >= RUNGS) { setDone(true); if(!muted) [0,0.2,0.4].forEach(t=>setTimeout(()=>playTone(880,"sine",0.15,0.25),t*1000)); }
      else { setRung(r=>r+1); setTyped(""); setRungStart(Date.now()); }
    }
  };

  const reset = () => { setRung(0);setTyped("");setStartTime(null);setRungStart(null);setRungWpms([]);setFailed(false);setDone(false);setTimeout(()=>ref.current?.focus(),50); };
  const bestWpm = rungWpms.length ? Math.max(...rungWpms) : 0;

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>← Back</button>
        <span style={{color:T.text,fontWeight:800,fontSize:20}}>🪜 Speed Ladder</span>
        <SoundBtn muted={muted} toggle={()=>setMuted(m=>!m)} T={T}/>
      </div>
      {(failed||done) ? (
        <div style={{textAlign:"center",padding:32,background:T.card,border:`1px solid ${failed?"#ef4444":T.purple}`,borderRadius:12}}>
          <div style={{fontSize:48,marginBottom:8}}>{failed?"💥":"🏆"}</div>
          <div style={{color:failed?"#ef4444":T.purple,fontWeight:800,fontSize:22,marginBottom:4}}>{failed?`Failed on Rung ${rung+1}`:"Ladder Complete!"}</div>
          <div style={{color:T.muted,fontSize:13,marginBottom:16}}>Best: {bestWpm} WPM · {rungWpms.join(" → ")} WPM</div>
          <button onClick={reset} style={{padding:"12px 32px",borderRadius:10,border:"none",background:failed?"#ef4444":T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Try Again</button>
        </div>
      ) : (
        <>
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            {Array.from({length:RUNGS}).map((_,i)=>(
              <div key={i} style={{flex:1,height:6,borderRadius:3,background:i<rung?"#34d399":i===rung?T.purple:T.border,transition:"background 0.3s"}}/>
            ))}
          </div>
          {rung > 0 && <div style={{textAlign:"center",color:T.faint,fontSize:11,marginBottom:8}}>Must beat {MIN_WPM} WPM (your last rung)</div>}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 18px",marginBottom:10,fontFamily:"'JetBrains Mono',monospace",fontSize:17,letterSpacing:1,lineHeight:1.8}}>
            {target.split("").map((ch,i)=>(
              <span key={i} style={{color:i<typed.length?(typed[i]===ch?"#34d399":"#ef4444"):i===typed.length?T.purple:T.faint,borderBottom:i===typed.length?"2px solid "+T.purple:"2px solid transparent"}}>{ch}</span>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",color:T.muted,fontSize:12,marginBottom:10}}>
            <span>Rung {rung+1} / {RUNGS}</span>
            <span>{rung>0?`Last: ${rungWpms[rung-1]} WPM`:"Go!"}</span>
          </div>
          <input ref={ref} autoFocus value={typed} onChange={handleType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:16,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}
          />
        </>
      )}
    </div>
  );
}

export default function GamesTab({ T }) {
  // Restore active game from URL on mount
  const [activeCat, setActiveCat] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const [activeGame, setActiveGame] = useState(() => {
    if (typeof window === "undefined") return null;
    const path = window.location.pathname;
    const match = path.match(/^\/games\/([a-z]+)/);
    const id = match ? match[1] : null;
    if (!id) return null;
    // A direct URL visit, browser back/forward, or a bookmarked link all
    // skip the menu entirely and land straight here - so the same
    // availability check the menu uses has to be re-applied here too, or
    // an unavailable/removed game stays fully playable via its URL even
    // after being hidden from the menu. This is the actual fix for "make
    // sure no one can bypass" - hiding a button alone never closes a
    // direct-navigation path.
    const game = GAMES.find(g => g.id === id);
    if (!game || game.unavailable) {
      if (typeof window !== "undefined") window.history.replaceState({}, "", "/games");
      return null;
    }
    return id;
  });
  const [settings, setSettings] = useState(null); // null = show settings panel
  const [showSettings, setShowSettings] = useState(false);

  const enterGame = (id) => {
    const game = GAMES.find(g => g.id === id);
    if (!game || game.unavailable) return;
    setActiveGame(id);
    setSettings(null); // show settings first
    setShowSettings(true);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/games/${id}`);
      localStorage.setItem("ak_active_game", id);
    }
  };

  const exitGame = () => {
    setActiveGame(null);
    setSettings(null);
    setShowSettings(false);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/game");
      localStorage.removeItem("ak_active_game");
    }
  };

  // On refresh, restore settings too
  useEffect(() => {
    if (activeGame && !settings) {
      const saved = getSettings(activeGame);
      const defs = GAME_SETTINGS[activeGame] || [];
      if (defs.length === 0) setSettings(saved);
      else setShowSettings(true);
    }
  }, []);

  // Browser back while actually playing returns to the settings screen
  // instead of leaving the games tab entirely - previously entering a game
  // and starting play only ever did history.replaceState (never pushState),
  // so there was no real history step between "in the menu," "on the
  // settings screen," and "actively playing" - pressing back from mid-game
  // skipped straight past both and out of the Games tab altogether.
  useEffect(() => {
    const onPop = () => {
      if (activeGame && !showSettings && settings) {
        setShowSettings(true);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [activeGame, showSettings, settings]);

  const startGame = (s) => {
    setSettings(s);
    setShowSettings(false);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/games/${activeGame}/play`);
    }
  };

  const GAME_COMPONENTS = {
    rain: WordRain, survival: Survival, burst: SpeedBurst, scramble: WordScramble,
    suddendeath: SuddenDeath, ladder: SpeedLadder, tugofwar: TugOfWar, wordbomb: WordBomb, memoryedit: MemoryEdit, wildcard: WildcardWords, freestyle: Freestyle,
    sniper: Sniper, mirror: Mirror, flash: Flash, echo: Echo,
    ghost: GhostWords, boss: BossBattle,
    hundred: HundredWords, endurance: Endurance, roulette: Roulette,
    wordchain: WordChain, blitz: CategoryBlitz, vocab: VocabBuilder,
    invaders: TypingInvaders, asteroid: AsteroidBelt,
    tower: TowerDefense, mystery: MysteryWords, rhyme: RhymeTime,
    speedtest: SpeedTest, missing: MissingLetters, anagram: Anagram,
    bricks: BrickBreaker,
    synonyms: Synonyms, antonyms: Antonyms,
  };

  if (activeGame) {
    const Comp = GAME_COMPONENTS[activeGame];
    if (!Comp) { exitGame(); return null; }
    return (
      <div style={{ padding:"4px 0" }}>
        {showSettings || !settings ? (
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <button onClick={exitGame} style={{background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Games</button>
              <span style={{color:"#e0e0ff",fontWeight:800,fontSize:18}}>{GAMES.find(g=>g.id===activeGame)?.emoji} {GAMES.find(g=>g.id===activeGame)?.name}</span>
            </div>
            <SettingsPanel gameId={activeGame} T={T} onStart={startGame}/>
          </>
        ) : (
          <Comp T={T} settings={settings} onBack={exitGame} onSettings={()=>setShowSettings(true)}/>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding:"8px 0" }}>
      <div style={{ color:T.text, fontWeight:800, fontSize:18, marginBottom:4, fontFamily:T.font }}>🎮 Games</div>
      {/* Category filter */}
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={()=>{setActiveCat(c.id);setPage(1);}}
            style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${activeCat===c.id?T.purple:T.border}`, background:activeCat===c.id?T.purple+"22":"transparent", color:activeCat===c.id?T.purple:T.muted, fontSize:12, fontWeight:activeCat===c.id?700:400, cursor:"pointer", fontFamily:T.font }}>
            {c.label}
          </button>
        ))}
      </div>
      {(() => {
        const filtered = GAMES.filter(g => activeCat==="all" || g.cat===activeCat);
        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
        return (<>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {paged.map(g => (
          <div key={g.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, border:`1px solid ${T.border}`, background:T.card, fontFamily:T.font, opacity:g.unavailable?0.5:1 }}>
            <span style={{ fontSize:30, cursor:g.unavailable?"default":"pointer" }} onClick={()=>!g.unavailable&&enterGame(g.id)}>{g.emoji}</span>
            <div style={{flex:1,minWidth:0,cursor:g.unavailable?"default":"pointer"}} onClick={()=>!g.unavailable&&enterGame(g.id)}>
              <div style={{ color:T.text, fontWeight:700, fontSize:15 }}>{g.name}</div>
              <div style={{ color:g.unavailable?"#ef4444":T.muted, fontSize:12, marginTop:2 }}>{g.desc}</div>
              <div style={{ marginTop:4, fontSize:10, color:"#555" }}>{CATEGORIES.find(c=>c.id===g.cat)?.label}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              {!g.unavailable && (GAME_SETTINGS[g.id]||[]).length > 0 && (
                <button onClick={(e)=>{e.stopPropagation();enterGame(g.id);}} title="Settings" style={{background:"none",border:"1px solid #2a2a4a",borderRadius:7,color:"#555",fontSize:13,padding:"4px 8px",cursor:"pointer"}}>⚙️</button>
              )}
              {!g.unavailable && <span style={{color:"#555",fontSize:18}}>›</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:16}}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:page===1?T.faint:T.muted,cursor:page===1?"default":"pointer",fontSize:14,fontFamily:T.font}}>
            ←
          </button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
            <button key={n} onClick={()=>setPage(n)}
              style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${page===n?T.purple:T.border}`,background:page===n?T.purple+"22":"transparent",color:page===n?T.purple:T.muted,cursor:"pointer",fontSize:13,fontWeight:page===n?700:400,fontFamily:T.font}}>
              {n}
            </button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:page===totalPages?T.faint:T.muted,cursor:page===totalPages?"default":"pointer",fontSize:14,fontFamily:T.font}}>
            →
          </button>
        </div>
      )}
        </>);
      })()}
    </div>
  );
}