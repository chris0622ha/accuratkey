"use client";
import { useState, useEffect, useRef } from "react";

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const coachCache = new Map();

export function AICoach({ wpm, accuracy, passed, levelName, worstKeys, T }) {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Use a stable key built from the actual session data so the effect only
  // fires once per real session, not on every re-render of the result screen
  // (which causes the "pops up then disappears" bug — the component mounts,
  // starts the API call, then the parent re-renders as keys/progress saves
  // complete, unmounting and remounting the coach mid-call).
  const sessionKey = `${levelName}|${wpm}|${accuracy}`;
  const fetchedKey = useRef(null);

  useEffect(() => {
    // If we've already fetched for this exact session, don't re-fetch
    if (fetchedKey.current === sessionKey) return;
    fetchedKey.current = sessionKey;

    setTip(null);
    setLoading(true);
    setError(false);

    if (coachCache.has(sessionKey)) {
      setTip(coachCache.get(sessionKey));
      setLoading(false);
      return;
    }

    if (!GEMINI_KEY) { setError(true); setLoading(false); return; }

    const worstStr = worstKeys.length > 0
      ? `Their most-missed keys were: ${worstKeys.join(", ")}.`
      : "They made no notable key mistakes.";

    const prompt = `You are a concise, encouraging typing coach inside a typing practice app called AccuratKey. A student just finished a level.

Level: "${levelName}"
Result: ${passed ? "Passed" : "Did not pass"}
WPM: ${wpm}
Accuracy: ${accuracy}%
${worstStr}

Give exactly 2-3 sentences of specific, actionable coaching advice based on these real stats. Be direct and concrete - mention the actual keys or numbers. Don't be generic. Don't use bullet points. Don't start with "Great job" or similar filler. Keep it under 60 words total.`;

    fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.7 }
      })
    })
      .then(r => r.json())
      .then(data => {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) { coachCache.set(sessionKey, text); setTip(text); }
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionKey]);

  if (error) return null;

  return (
    <div style={{
      background:"linear-gradient(135deg, #0d0b1e 0%, #1a0d2e 100%)",
      border:"1px solid #7c6af744",
      borderRadius:12, padding:"14px 16px", marginBottom:14,
      textAlign:"left", position:"relative", overflow:"hidden"
    }}>
      <div style={{
        position:"absolute", top:-20, right:-20, width:80, height:80,
        borderRadius:"50%", background:"#7c6af722", pointerEvents:"none"
      }} />
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
        <span style={{fontSize:14}}>🤖</span>
        <span style={{color:"#a78bfa",fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>AI Coach</span>
      </div>
      {loading ? (
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{
            width:14, height:14, borderRadius:"50%",
            border:"2px solid #7c6af744", borderTopColor:"#a78bfa",
            animation:"spin 0.8s linear infinite"
          }} />
          <span style={{color:"#666",fontSize:13}}>Analyzing your session…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <p style={{color:"#c4b5fd",fontSize:13,lineHeight:1.7,margin:0,fontStyle:"italic"}}>
          "{tip}"
        </p>
      )}
    </div>
  );
}
// env: rebuilt
