"use client";
import { useState, useEffect } from "react";

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY || "";
const coachCache = new Map();
const inFlight = new Map();

// Call through our own API route to avoid CORS — the browser can't call
// generativelanguage.googleapis.com directly, but our own /api/coach
// endpoint can since it runs server-side.

function generateFallback(wpm, accuracy, passed, levelName, worstKeys) {
  const worst = worstKeys[0]?.split("(")[0]?.trim();
  if (!passed) {
    if (accuracy < 60) return `${accuracy}% accuracy on ${levelName} — that's too many errors to build speed on. Try going half as fast and focus purely on hitting the right key every time.`;
    if (accuracy < 75) return `${accuracy}% on ${levelName}. You're close to the 75% target. ${worst ? `Watch the ${worst.toUpperCase()} key especially` : "Slow down just slightly"} and you should clear it next attempt.`;
    return `${accuracy}% accuracy on ${levelName} — just under the target. ${worst ? `The ${worst.toUpperCase()} key is your main stumble` : "A small slowdown"} should get you over the line.`;
  }
  if (wpm < 30) return `${wpm} WPM on ${levelName} — you passed! Speed comes with repetition. ${worst ? `Clean up the ${worst.toUpperCase()} key` : "Keep practicing this level"} and your WPM will rise naturally.`;
  if (wpm < 60) return `${wpm} WPM at ${accuracy}% on ${levelName}. ${worst ? `The ${worst.toUpperCase()} key cost you some time — isolate it` : "Try to keep your eyes off the keyboard"} to push past ${wpm + 10} WPM.`;
  return `${wpm} WPM at ${accuracy}% on ${levelName} — strong result. ${worst ? `Even the ${worst.toUpperCase()} key trips you up occasionally` : "Consistency across all fingers"} is the next thing to tighten up.`;
}

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

  const promise = fetch("/api/coach", {
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
        const fallback = generateFallback(wpm, accuracy, passed, levelName, worstKeys);
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
      const result = text || generateFallback(wpm, accuracy, passed, levelName, worstKeys);
      coachCache.set(sessionKey, result);
      inFlight.delete(sessionKey);
      return result;
    })
    .catch((e) => {
      console.error('Gemini fetch failed:', e?.message);
      inFlight.delete(sessionKey);
      const fallback = passed
generateFallback(wpm, accuracy, passed, levelName, worstKeys);
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
