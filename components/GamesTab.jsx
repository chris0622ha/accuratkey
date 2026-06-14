"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Shared word pool ────────────────────────────────────────────────────────
const EASY_WORDS = ["the","and","you","for","with","that","this","from","have","they","will","your","time","make","look","come","like","then","over","also","back","after","only","them","well","been","were","each","many","much","such","long","good","very","most","even","does","know","just","some","into","take","than","here","both","next","last","same","used","turn","said","did","get","way","may","day","who","its","how","all","new","out","use","can","now","our","see","two","has","but","set","put","end","why","let","big","few","run","far","off","car","eat","low","ask","own","boy","yet","age","due"];
const MED_WORDS = ["people","before","should","between","through","because","without","another","against","thought","looking","children","problem","school","always","found","three","still","world","never","right","where","every","might","place","state","small","large","often","along","since","until","while","point","house","again","away","hand","light","city","high","need","home","water","more","game","play","work","life","form","help","feel","talk","turn","each","face","show","move","live","hold","days","line","side","open","keep","read","mind","head","stop","left","real","near","book","land","thing","kind","mean","same","tell","want","seem","call","come","give","than","when","them","then","look"];
const HARD_WORDS = ["strength","keyboard","through","beautiful","challenge","wonderful","important","different","available","carefully","excellent","sometimes","knowledge","necessary","community","following","according","something","together","mountain","whatever","remember","question","probably","absolute","previous","solution","position","language","practice","describe","continue","personal","students","consider","although","happened","thousand","everyone","anything","building","business","probably","however","evening","already","medical","natural","culture","serious"];

function pickWords(count = 20, level = "easy") {
  const pool = level === "hard" ? HARD_WORDS : level === "med" ? MED_WORDS : EASY_WORDS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const result = [];
  while (result.length < count) result.push(...shuffled);
  return result.slice(0, count);
}

// ─── Game Selector ───────────────────────────────────────────────────────────
const GAMES = [
  { id: "rain",     emoji: "🌧️", name: "Word Rain",    desc: "Type falling words before they hit the bottom" },
  { id: "survival", emoji: "💀", name: "Survival",      desc: "Endless typing — mistakes cost you time" },
  { id: "burst",    emoji: "⚡", name: "Speed Burst",   desc: "15-second raw WPM sprint — how fast are you?" },
  { id: "scramble", emoji: "🔀", name: "Word Scramble", desc: "Unscramble the jumbled words against the clock" },
];

// ─── Word Rain ───────────────────────────────────────────────────────────────
function WordRain({ T, onBack }) {
  const [status, setStatus]   = useState("idle"); // idle | playing | dead
  const [difficulty, setDiff] = useState("easy");
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
  const SPEED = { easy: 0.18, med: 0.28, hard: 0.42 };
  const SPAWN  = { easy: 2200, med: 1500, hard: 900 };
  const MAX_MISS = 5;
  const CONTAINER_H = 380;

  const start = () => {
    dropsRef.current = [];
    scoreRef.current = 0;
    missedRef.current = 0;
    idRef.current = 0;
    wordQRef.current = pickWords(80, difficulty);
    lastSpawn.current = 0;
    setDrops([]);
    setScore(0);
    setMissed(0);
    setTyped("");
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const spawnWord = useCallback((now) => {
    if (wordQRef.current.length === 0) wordQRef.current = pickWords(80, difficulty);
    const word = wordQRef.current.shift();
    const x = 5 + Math.random() * 75; // percent
    dropsRef.current = [...dropsRef.current, { id: idRef.current++, word, x, y: 0 }];
    lastSpawn.current = now;
  }, [difficulty]);

  useEffect(() => {
    if (status !== "playing") return;
    let last = performance.now();
    const loop = (now) => {
      const dt = now - last;
      last = now;
      const speed = SPEED[difficulty];
      const updated = dropsRef.current.map(d => ({ ...d, y: d.y + speed * dt / 10 }));
      const alive   = updated.filter(d => d.y < 100);
      const fallen  = updated.filter(d => d.y >= 100);
      if (fallen.length) {
        missedRef.current += fallen.length;
        setMissed(missedRef.current);
        if (missedRef.current >= MAX_MISS) {
          dropsRef.current = [];
          setDrops([]);
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
    const trimmed = val.trim().toLowerCase();
    const match = dropsRef.current.find(d => d.word === trimmed);
    if (match) {
      dropsRef.current = dropsRef.current.filter(d => d.id !== match.id);
      setDrops([...dropsRef.current]);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setTyped("");
    }
  };

  const hearts = Array.from({ length: MAX_MISS }, (_, i) => i < MAX_MISS - missed ? "❤️" : "🖤");

  return (
    <div style={{ fontFamily: T.font }}>
      {status === "idle" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🌧️</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Word Rain</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>Type falling words before they hit the bottom. Miss {MAX_MISS} and it's over!</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            {["easy","med","hard"].map(d => (
              <button key={d} onClick={() => setDiff(d)} style={{ padding: "8px 18px", borderRadius: 8, border: `2px solid ${difficulty===d?T.purple:T.border}`, background: difficulty===d?T.purple:"transparent", color: difficulty===d?"#fff":T.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font, textTransform: "capitalize" }}>{d}</button>
            ))}
          </div>
          {best > 0 && <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>🏆 Best: {best} words</div>}
          <button onClick={start} style={{ padding: "12px 36px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: T.font }}>Play</button>
        </div>
      )}

      {status === "dead" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>☠️</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Game Over</div>
          <div style={{ color: T.purple, fontWeight: 800, fontSize: 36, marginBottom: 4 }}>{score}</div>
          <div style={{ color: T.muted, fontSize: 14, marginBottom: 4 }}>words typed</div>
          {score >= best && score > 0 && <div style={{ color: "#fbbf24", fontSize: 13, marginBottom: 16 }}>🏆 New Best!</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button onClick={start} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Play Again</button>
            <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Back</button>
          </div>
        </div>
      )}

      {status === "playing" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ color: T.purple, fontWeight: 800, fontSize: 18 }}>{score} <span style={{ color: T.muted, fontSize: 12, fontWeight: 400 }}>words</span></div>
            <div style={{ fontSize: 16 }}>{hearts.join(" ")}</div>
            <button onClick={() => { cancelAnimationFrame(frameRef.current); setStatus("idle"); }} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontSize: 13, fontFamily: T.font }}>✕ quit</button>
          </div>
          <div style={{ position: "relative", height: CONTAINER_H, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
            {/* Danger zone line */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: `${T.purple}22`, borderTop: `2px dashed ${T.purple}44` }} />
            {drops.map(d => (
              <div key={d.id} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, transform: "translateX(-50%)", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 14, fontWeight: 700, color: d.y > 85 ? "#ef4444" : d.y > 65 ? "#f59e0b" : T.text, fontFamily: T.font, whiteSpace: "nowrap", transition: "color 0.2s" }}>
                {d.word}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type the word…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 16, padding: "10px 14px", outline: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Survival Mode ──────────────────────────────────────────────────────────
function Survival({ T, onBack }) {
  const WORDS = [...MED_WORDS, ...EASY_WORDS].sort(() => Math.random() - 0.5);
  const [status, setStatus] = useState("idle");
  const [wordList, setWordList] = useState([]);
  const [current, setCurrent]  = useState(0);
  const [typed, setTyped]      = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore]      = useState(0);
  const [best, setBest]        = useState(0);
  const [penalty, setPenalty]  = useState(null); // flash
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const timeRef  = useRef(30);

  const mkWordList = () => [...WORDS, ...WORDS].sort(() => Math.random() - 0.5).slice(0, 100);

  const start = () => {
    const wl = mkWordList();
    setWordList(wl);
    setCurrent(0);
    setTyped("");
    setScore(0);
    timeRef.current = 30;
    setTimeLeft(30);
    setPenalty(null);
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.1;
      setTimeLeft(Math.max(0, timeRef.current));
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        setStatus("dead");
        setBest(b => Math.max(b, score));
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleType = (e) => {
    const val = e.target.value;
    setTyped(val);
    const target = wordList[current] || "";
    if (val.endsWith(" ")) {
      const attempt = val.trim();
      if (attempt === target) {
        // correct
        setCurrent(c => c + 1);
        setScore(s => s + 1);
        timeRef.current = Math.min(timeRef.current + 2, 60);
        setTimeLeft(Math.min(timeRef.current, 60));
      } else {
        // wrong — penalty
        timeRef.current = Math.max(0.1, timeRef.current - 3);
        setTimeLeft(timeRef.current);
        setPenalty("-3s");
        setTimeout(() => setPenalty(null), 700);
      }
      setTyped("");
    }
  };

  const timerColor = timeLeft < 8 ? "#ef4444" : timeLeft < 15 ? "#f59e0b" : T.accent2;
  const bar = Math.max(0, Math.min(1, timeLeft / 30));
  const target = wordList[current] || "";

  return (
    <div style={{ fontFamily: T.font }}>
      {status === "idle" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>💀</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Survival Mode</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>Type words and press Space. Correct = <span style={{ color: "#34d399" }}>+2s</span>. Wrong = <span style={{ color: "#ef4444" }}>-3s</span>. Don't let the timer hit zero!</div>
          {best > 0 && <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>🏆 Best: {best} words</div>}
          <button onClick={start} style={{ padding: "12px 36px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: T.font }}>Survive</button>
        </div>
      )}

      {status === "dead" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💀</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 22, marginBottom: 4 }}>You survived</div>
          <div style={{ color: T.purple, fontWeight: 800, fontSize: 40, marginBottom: 4 }}>{score}</div>
          <div style={{ color: T.muted, fontSize: 14, marginBottom: 4 }}>words</div>
          {score >= best && score > 0 && <div style={{ color: "#fbbf24", fontSize: 13, marginBottom: 12 }}>🏆 New Best!</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button onClick={start} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Again</button>
            <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Back</button>
          </div>
        </div>
      )}

      {status === "playing" && (
        <div>
          {/* Timer bar */}
          <div style={{ height: 8, background: T.card, borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${bar * 100}%`, background: timerColor, borderRadius: 4, transition: "width 0.1s linear, background 0.3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ color: timerColor, fontWeight: 800, fontSize: 28, transition: "color 0.3s" }}>
              {timeLeft.toFixed(1)}s
              {penalty && <span style={{ color: "#ef4444", fontSize: 14, marginLeft: 8, fontWeight: 700 }}>{penalty}</span>}
            </div>
            <div style={{ color: T.purple, fontWeight: 800, fontSize: 22 }}>{score} <span style={{ color: T.muted, fontSize: 12, fontWeight: 400 }}>words</span></div>
            <button onClick={() => { clearInterval(timerRef.current); setStatus("idle"); }} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontSize: 13, fontFamily: T.font }}>✕ quit</button>
          </div>
          {/* Word display */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: T.faint, marginBottom: 8 }}>type this word:</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: 2, marginBottom: 6 }}>
              {target.split("").map((ch, i) => {
                let color = T.text;
                if (i < typed.length) color = typed[i] === ch ? "#34d399" : "#ef4444";
                else if (i === typed.length) color = T.purple;
                return <span key={i} style={{ color, borderBottom: i === typed.length ? `2px solid ${T.purple}` : "2px solid transparent" }}>{ch}</span>;
              })}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
              {wordList.slice(current + 1, current + 4).map((w, i) => (
                <span key={i} style={{ color: T.faint, fontSize: 14 }}>{w}</span>
              ))}
            </div>
          </div>
          <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type + Space to submit…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 16, padding: "10px 14px", outline: "none", boxSizing: "border-box" }} />
        </div>
      )}
    </div>
  );
}

// ─── Speed Burst ────────────────────────────────────────────────────────────
function SpeedBurst({ T, onBack }) {
  const DURATION = 15;
  const [status, setStatus] = useState("idle");
  const [words, setWords]   = useState([]);
  const [typed, setTyped]   = useState("");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [correct, setCorrect]   = useState(0);
  const [chars, setChars]       = useState(0);
  const [best, setBest]         = useState({ wpm: 0, acc: 0 });
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const timeRef  = useRef(DURATION);
  const charsRef = useRef(0);
  const correctRef = useRef(0);
  const totalRef = useRef(0);
  const wordIdxRef = useRef(0);

  const start = () => {
    const wl = pickWords(120, "med");
    setWords(wl);
    wordIdxRef.current = 0;
    charsRef.current = 0;
    correctRef.current = 0;
    totalRef.current = 0;
    timeRef.current = DURATION;
    setTyped("");
    setTimeLeft(DURATION);
    setCorrect(0);
    setChars(0);
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.05;
      setTimeLeft(t => Math.max(0, t - 0.05));
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        const wpm = Math.round((charsRef.current / 5) / (DURATION / 60));
        const acc = totalRef.current > 0 ? Math.round((correctRef.current / totalRef.current) * 100) : 100;
        setBest(b => wpm > b.wpm ? { wpm, acc } : b);
        setStatus("done");
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleType = (e) => {
    const val = e.target.value;
    setTyped(val);
    const target = words[wordIdxRef.current] || "";
    if (val.endsWith(" ")) {
      const attempt = val.trim();
      totalRef.current += 1;
      if (attempt === target) {
        correctRef.current += 1;
        charsRef.current += target.length + 1;
        setChars(charsRef.current);
        setCorrect(correctRef.current);
      }
      wordIdxRef.current += 1;
      setTyped("");
    }
  };

  const wpm = Math.round((chars / 5) / Math.max((DURATION - timeLeft) / 60, 0.01));
  const bar = Math.max(0, timeLeft / DURATION);
  const target = words[wordIdxRef.current] || "";

  return (
    <div style={{ fontFamily: T.font }}>
      {status === "idle" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⚡</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Speed Burst</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>15 seconds. Type as many words as you can. Raw WPM sprint!</div>
          {best.wpm > 0 && <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>🏆 Best: {best.wpm} WPM ({best.acc}% acc)</div>}
          <button onClick={start} style={{ padding: "12px 36px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: T.font }}>GO</button>
        </div>
      )}

      {status === "done" && (() => {
        const finalWpm = Math.round((chars / 5) / (DURATION / 60));
        const finalAcc = totalRef.current > 0 ? Math.round((correctRef.current / totalRef.current) * 100) : 100;
        return (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
            <div style={{ color: T.purple, fontWeight: 800, fontSize: 52, lineHeight: 1 }}>{finalWpm}</div>
            <div style={{ color: T.muted, fontSize: 16, marginBottom: 4 }}>WPM</div>
            <div style={{ color: T.accent2, fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{finalAcc}%</div>
            <div style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>accuracy</div>
            {finalWpm >= best.wpm && finalWpm > 0 && <div style={{ color: "#fbbf24", fontSize: 13, marginBottom: 12 }}>🏆 New Best!</div>}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
              <button onClick={start} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Again</button>
              <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Back</button>
            </div>
          </div>
        );
      })()}

      {status === "playing" && (
        <div>
          <div style={{ height: 6, background: T.card, borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${bar * 100}%`, background: timeLeft < 5 ? "#ef4444" : T.purple, borderRadius: 3, transition: "width 0.05s linear, background 0.3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ color: timeLeft < 5 ? "#ef4444" : T.text, fontWeight: 800, fontSize: 28 }}>{Math.ceil(timeLeft)}s</div>
            <div style={{ color: T.purple, fontWeight: 800, fontSize: 22 }}>{wpm} <span style={{ color: T.muted, fontSize: 12, fontWeight: 400 }}>wpm</span></div>
            <div style={{ color: T.accent2, fontWeight: 700, fontSize: 16 }}>{correct} <span style={{ color: T.muted, fontSize: 12, fontWeight: 400 }}>words</span></div>
          </div>
          {/* Scrolling word display */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12, lineHeight: 2, fontSize: 18, fontFamily: T.font }}>
            {words.slice(wordIdxRef.current, wordIdxRef.current + 12).map((w, i) => {
              if (i === 0) {
                return (
                  <span key={i} style={{ marginRight: 8 }}>
                    {w.split("").map((ch, ci) => {
                      let color = T.text;
                      if (ci < typed.length) color = typed[ci] === ch ? "#34d399" : "#ef4444";
                      else if (ci === typed.length) color = T.purple;
                      return <span key={ci} style={{ color, borderBottom: ci === typed.length ? `2px solid ${T.purple}` : "2px solid transparent" }}>{ch}</span>;
                    })}
                  </span>
                );
              }
              return <span key={i} style={{ color: T.faint, marginRight: 8 }}>{w}</span>;
            })}
          </div>
          <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type + Space…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 16, padding: "10px 14px", outline: "none", boxSizing: "border-box" }} />
        </div>
      )}
    </div>
  );
}

// ─── Word Scramble ──────────────────────────────────────────────────────────
function WordScramble({ T, onBack }) {
  const POOL = [...MED_WORDS, ...HARD_WORDS];
  const ROUND_TIME = 60;
  const PTS = { fast: 3, normal: 2, skip: 0 };

  const scramble = (w) => {
    if (w.length <= 2) return w;
    let arr = w.split("");
    let tries = 0;
    do {
      arr.sort(() => Math.random() - 0.5);
      tries++;
    } while (arr.join("") === w && tries < 20);
    return arr.join("");
  };

  const [status, setStatus]   = useState("idle");
  const [words, setWords]     = useState([]);
  const [idx, setIdx]         = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [typed, setTyped]     = useState("");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore]     = useState(0);
  const [best, setBest]       = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [skips, setSkips]     = useState(3);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const timeRef  = useRef(ROUND_TIME);

  const start = () => {
    const wl = [...POOL].sort(() => Math.random() - 0.5).slice(0, 30);
    setWords(wl);
    setIdx(0);
    setScrambled(scramble(wl[0] || ""));
    setTyped("");
    setScore(0);
    setSkips(3);
    setFeedback(null);
    timeRef.current = ROUND_TIME;
    setTimeLeft(ROUND_TIME);
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.1;
      setTimeLeft(t => Math.max(0, t - 0.1));
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        setBest(b => Math.max(b, score));
        setStatus("done");
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [status]);

  const advance = (newScore, fb) => {
    setFeedback(fb);
    setTimeout(() => setFeedback(null), 600);
    const next = idx + 1;
    if (next >= words.length) {
      clearInterval(timerRef.current);
      setBest(b => Math.max(b, newScore));
      setStatus("done");
      return;
    }
    setIdx(next);
    setScrambled(scramble(words[next]));
    setTyped("");
    setScore(newScore);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleType = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z]/g, "");
    setTyped(val);
    const target = words[idx] || "";
    if (val === target) {
      const pts = timeRef.current > 45 ? PTS.fast : PTS.normal;
      advance(score + pts, `+${pts}pts ✓`);
    }
  };

  const handleSkip = () => {
    if (skips <= 0) return;
    setSkips(s => s - 1);
    advance(score, "skipped");
  };

  const handleReshuffle = () => {
    setScrambled(scramble(words[idx] || ""));
    setTyped("");
    inputRef.current?.focus();
  };

  const bar = Math.max(0, timeLeft / ROUND_TIME);
  const target = words[idx] || "";

  return (
    <div style={{ fontFamily: T.font }}>
      {status === "idle" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🔀</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Word Scramble</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>Unscramble the words! Faster answers = more points. You get 3 skips.</div>
          {best > 0 && <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>🏆 Best: {best} pts</div>}
          <button onClick={start} style={{ padding: "12px 36px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: T.font }}>Start</button>
        </div>
      )}

      {status === "done" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔀</div>
          <div style={{ color: T.purple, fontWeight: 800, fontSize: 52, lineHeight: 1 }}>{score}</div>
          <div style={{ color: T.muted, fontSize: 16, marginBottom: 4 }}>points</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>{idx} words unscrambled</div>
          {score >= best && score > 0 && <div style={{ color: "#fbbf24", fontSize: 13, marginBottom: 12 }}>🏆 New Best!</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button onClick={start} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Again</button>
            <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Back</button>
          </div>
        </div>
      )}

      {status === "playing" && (
        <div>
          <div style={{ height: 6, background: T.card, borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${bar * 100}%`, background: timeLeft < 10 ? "#ef4444" : T.purple, borderRadius: 3, transition: "width 0.1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ color: timeLeft < 10 ? "#ef4444" : T.text, fontWeight: 800, fontSize: 22 }}>{Math.ceil(timeLeft)}s</div>
            <div style={{ color: T.purple, fontWeight: 800, fontSize: 22 }}>
              {score} pts
              {feedback && <span style={{ color: "#34d399", fontSize: 13, marginLeft: 8 }}>{feedback}</span>}
            </div>
            <div style={{ color: T.muted, fontSize: 13 }}>skips: {skips}</div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: T.faint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>unscramble this</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: T.purple, letterSpacing: 6, marginBottom: 8 }}>{scrambled}</div>
            <div style={{ fontSize: 11, color: T.faint }}>{target.length} letters</div>
          </div>

          <input ref={inputRef} value={typed} onChange={handleType} placeholder="Type the word…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 16, padding: "10px 14px", outline: "none", boxSizing: "border-box", marginBottom: 10 }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleReshuffle} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>🔀 Reshuffle</button>
            <button onClick={handleSkip} disabled={skips <= 0} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: skips > 0 ? "#f59e0b" : T.faint, fontWeight: 600, fontSize: 13, cursor: skips > 0 ? "pointer" : "default", fontFamily: T.font }}>Skip ({skips})</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main GamesTab ───────────────────────────────────────────────────────────
export default function GamesTab({ T }) {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === "rain")     return <div style={{ padding: "4px 0" }}><WordRain T={T} onBack={() => setActiveGame(null)} /></div>;
  if (activeGame === "survival") return <div style={{ padding: "4px 0" }}><Survival T={T} onBack={() => setActiveGame(null)} /></div>;
  if (activeGame === "burst")    return <div style={{ padding: "4px 0" }}><SpeedBurst T={T} onBack={() => setActiveGame(null)} /></div>;
  if (activeGame === "scramble") return <div style={{ padding: "4px 0" }}><WordScramble T={T} onBack={() => setActiveGame(null)} /></div>;

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ color: T.text, fontWeight: 800, fontSize: 18, marginBottom: 4, fontFamily: T.font }}>🎮 Games</div>
      <div style={{ color: T.muted, fontSize: 12, marginBottom: 18, fontFamily: T.font }}>Pick a mini-game and play</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {GAMES.map(g => (
          <button key={g.id} onClick={() => setActiveGame(g.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, cursor: "pointer", textAlign: "left", fontFamily: T.font, transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.purple}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <span style={{ fontSize: 32 }}>{g.emoji}</span>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{g.name}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{g.desc}</div>
            </div>
            <span style={{ marginLeft: "auto", color: T.faint, fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
