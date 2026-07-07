"use client";
import { useState, useEffect } from "react";

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// Cache and in-flight promises live OUTSIDE the component entirely so they
// survive unmount/remount cycles. When the result screen re-renders multiple
// times (keys earned, progress saved, etc.), the component unmounts and
// remounts but the fetch is already in progress and the result gets stored
// here so the next mount picks it up instantly without a new API call.
const coachCache = new Map();
const inFlight = new Map();

function fetchTip(sessionKey, wpm, accuracy, passed, levelName, worstKeys) {
  if (coachCache.has(sessionKey)) return Promise.resolve(coachCache.get(sessionKey));
  if (inFlight.has(sessionKey)) return inFlight.get(sessionKey);

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

  const promise = fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 120, temperature: 0.7 }
    })
  })
    .then(r => r.json())
    .then(data => {
      // Handle different failure modes
      if (data?.error) {
        console.error('Gemini error:', data.error.code, data.error.message?.slice(0, 100));
        inFlight.delete(sessionKey);
        const fallback = passed
          ? `${wpm} WPM at ${accuracy}% — keep building consistency across all key positions.`
          : `${accuracy}% accuracy needs work. Slow down and focus on hitting each key correctly before worrying about speed.`;
        coachCache.set(sessionKey, fallback);
        return fallback;
      }
      // Safety block
      if (data?.promptFeedback?.blockReason) {
        console.warn('Gemini blocked:', data.promptFeedback.blockReason);
        inFlight.delete(sessionKey);
        return "Keep practicing — consistency is key to improvement.";
      }
      const candidate = data?.candidates?.[0];
      // Stopped for safety
      if (candidate?.finishReason === 'SAFETY') {
        inFlight.delete(sessionKey);
        return "Keep practicing — consistency is key to improvement.";
      }
      const text = candidate?.content?.parts?.[0]?.text?.trim();
      const fallback = passed
        ? `${wpm} WPM at ${accuracy}% accuracy — solid work. Focus on maintaining consistency across all your key positions.`
        : `${accuracy}% accuracy needs work before worrying about speed. Slow down and prioritize hitting each key correctly first.`;
      const result = text || fallback;
      coachCache.set(sessionKey, result);
      inFlight.delete(sessionKey);
      return result;
    })
    .catch((e) => {
      console.error('Gemini fetch failed:', e?.message);
      inFlight.delete(sessionKey);
      const fallback = passed
        ? `${wpm} WPM at ${accuracy}% — keep building consistency across all key positions.`
        : `${accuracy}% accuracy needs work. Slow down and focus on hitting each key correctly before worrying about speed.`;
      coachCache.set(sessionKey, fallback);
      return fallback;
    });

  inFlight.set(sessionKey, promise);
  return promise;
}

export function AICoach({ wpm, accuracy, passed, levelName, worstKeys, T }) {
  const sessionKey = `${levelName}|${wpm}|${accuracy}`;
  const [tip, setTip] = useState(() => coachCache.get(sessionKey) || null);
  const [loading, setLoading] = useState(!coachCache.has(sessionKey));
  const [debugMsg, setDebugMsg] = useState("");

  useEffect(() => {
    if (!GEMINI_KEY) {
      setDebugMsg("No API key");
      setLoading(false);
      return;
    }
    if (coachCache.has(sessionKey)) {
      setTip(coachCache.get(sessionKey));
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTip(sessionKey, wpm, accuracy, passed, levelName, worstKeys)
      .then(text => {
        if (text) setTip(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionKey]);

  if (!loading && !tip) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0d0b1e 0%, #1a0d2e 100%)",
      border: "1px solid #7c6af744",
      borderRadius: 12, padding: "14px 16px", marginBottom: 14,
      textAlign: "left", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: "#7c6af722", pointerEvents: "none"
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>🤖</span>
        <span style={{ color: "#a78bfa", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>AI Coach</span>
      </div>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid #7c6af744", borderTopColor: "#a78bfa",
            animation: "spin 0.8s linear infinite"
          }} />
          <span style={{ color: "#666", fontSize: 13 }}>Analyzing your session…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : tip ? (
        <p style={{ color: "#c4b5fd", fontSize: 13, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
          "{tip}"
        </p>
      ) : null}
    </div>
  );
}
// rebuilt: module-level cache
