"use client";
import { useState, useRef, useEffect } from "react";

const TypingTest = ({ T, customWords }) => {
  const DEFAULT_WORDS = ["the","and","you","for","with","that","this","from","have","they","will","your","time","make","look","come","like","then","over","also","back","after","only","them","well","been","were","each","many","much","such","long","good","very","most","even","does","know","just","some","into","take","than","here","both"];

  const getPool = () => (customWords && customWords.length > 0) ? customWords : DEFAULT_WORDS;

  const buildWords = (pool, count = 60) => {
    const src = pool;
    const arr = [];
    for (let i = 0; i < count; i++) arr.push(src[Math.floor(Math.random() * src.length)]);
    return arr;
  };

  const [words, setWords] = useState(() => buildWords(getPool()));
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [acc, setAcc] = useState(100);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const ref = useRef(null);
  const containerRef = useRef(null);

  // When customWords changes, reset
  useEffect(() => {
    reset();
  }, [customWords]);

  const target = words.join(" ");

  const handleType = e => {
    const v = e.target.value;
    if (!start && v.length > 0) setStart(Date.now());
    setTyped(v);
    const elapsed = start ? (Date.now() - start) / 60000 : 0.001;
    const correct = v.split("").filter((c, i) => c === target[i]).length;
    if (elapsed > 0) setWpm(Math.round((v.length / 5) / elapsed));
    setAcc(v.length ? Math.round((correct / v.length) * 100) : 100);

    // When approaching end of word pool, append more words silently
    if (v.length > target.length - 80) {
      const pool = getPool();
      const extra = buildWords(pool, 40);
      setWords(w => [...w, ...extra]);
    }
  };

  const reset = () => {
    setWords(buildWords(getPool()));
    setTyped(""); setStart(null); setWpm(0); setAcc(100);
    setTotalCorrect(0); setTotalTyped(0);
    setTimeout(() => ref.current?.focus(), 50);
  };

  // Visible window — show chars around cursor
  const WINDOW = 200;
  const cursorPos = typed.length;
  const windowStart = Math.max(0, cursorPos - 60);
  const shown = target.slice(windowStart, windowStart + WINDOW);
  const shownOffset = windowStart;

  return (
    <div style={{ padding: "10px 0" }}>
      <div ref={containerRef} onClick={() => ref.current?.focus()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 10, cursor: "text", fontFamily: "'JetBrains Mono',monospace", fontSize: 16, letterSpacing: 1, lineHeight: 1.8, userSelect: "none", minHeight: 80, overflowX: "hidden" }}>
        {shown.split("").map((ch, i) => {
          const absIdx = shownOffset + i;
          let color = T.faint;
          if (absIdx < typed.length) color = typed[absIdx] === ch ? "#34d399" : "#ef4444";
          else if (absIdx === typed.length) color = T.purple;
          return <span key={absIdx} style={{ color, borderBottom: absIdx === typed.length ? `2px solid ${T.purple}` : "2px solid transparent" }}>{ch}</span>;
        })}
      </div>
      <input ref={ref} value={typed} onChange={handleType} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} autoFocus />
      <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center" }}>
        <span style={{ color: T.purple, fontWeight: 700 }}>{start ? wpm : 0} WPM</span>
        <span style={{ color: T.accent2, fontWeight: 700 }}>{acc}%</span>
        <span style={{ color: T.muted, fontSize: 12 }}>{start ? `${typed.length} chars` : "Click text to start"}</span>
        {start && <button onClick={reset} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, color: T.faint, fontSize: 11, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}>↺ Reset</button>}
      </div>
    </div>
  );
};

export default TypingTest;
