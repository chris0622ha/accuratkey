"use client";
import React, { useState, useEffect, useRef } from "react";
import { pickByDiff } from "./WordDB";
import { subscribeTugPresence, tugHeartbeat, tugLeave, subscribeTugRoom, tugAdvance, tugPull, TUG_TARGET } from "../lib/firebase";

const TEAM = { red: { name: "Red", color: "#ef4444", emoji: "🔴" }, blue: { name: "Blue", color: "#3b82f6", emoji: "🔵" } };

export default function TugMulti({ T, user }) {
  const [sid] = useState(() => "p" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
  const [pres, setPres] = useState(undefined);   // undefined = loading, null = error
  const [room, setRoom] = useState(undefined);
  const [joined, setJoined] = useState(false);
  const [team, setTeam] = useState(null);
  const [words, setWords] = useState(() => pickByDiff(60, "medium"));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [streak, setStreak] = useState(0);
  const [mine, setMine] = useState(0);
  const inputRef = useRef(null);
  const roundRef = useRef(null);
  const presRef = useRef(null); presRef.current = pres;

  // Live player count + room state
  useEffect(() => {
    const u1 = subscribeTugPresence(setPres);
    const u2 = subscribeTugRoom(setRoom);
    return () => { u1(); u2(); };
  }, []);

  // Heartbeat: shows up in the "playing now" count while this tab is open
  useEffect(() => {
    const beat = () => tugHeartbeat(sid, team, joined).catch(() => {});
    beat();
    const iv = setInterval(beat, 15000);
    return () => { clearInterval(iv); tugLeave(sid); };
  }, [sid, team, joined]);

  // Every client nudges the room state machine (transactional, idempotent)
  useEffect(() => {
    if (!joined) return;
    const run = () => tugAdvance(presRef.current?.inRoom || 0).catch(() => {});
    run();
    const iv = setInterval(run, 2000);
    return () => clearInterval(iv);
  }, [joined]);

  // New round -> fresh words, reset my counters
  useEffect(() => {
    if (!room) return;
    if (roundRef.current !== room.round) {
      roundRef.current = room.round;
      setWords(pickByDiff(60, "medium")); setIdx(0); setTyped(""); setStreak(0); setMine(0);
    }
  }, [room?.round]);

  const playing = joined && room?.status === "playing";
  useEffect(() => { if (playing) inputRef.current?.focus(); }, [playing, room?.round]);

  const join = () => {
    // Balance teams using the live counts
    const t = (pres?.red || 0) <= (pres?.blue || 0) ? "red" : "blue";
    setTeam(t); setJoined(true);
  };
  const leave = () => { setJoined(false); setTeam(null); };

  const target = words[idx % words.length] || "";
  const onType = (e) => {
    if (!playing) return;
    const v = e.target.value; setTyped(v);
    if (v === target) {
      setTyped(""); setStreak(s => s + 1); setMine(m => m + 1);
      setIdx(i => { const n = i + 1; if (n >= words.length) setWords(w => [...w, ...pickByDiff(40, "medium")]); return n; });
      tugPull(team).catch(() => {});
    } else if (v.length >= target.length) { setTyped(""); setStreak(0); }
  };

  const box = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 12 };
  const rope = room?.rope || 0;
  const pct = Math.max(0, Math.min(100, ((rope + TUG_TARGET) / (TUG_TARGET * 2)) * 100));
  const count = pres?.online ?? 0;

  const broken = pres === null || room === undefined && pres !== undefined;
  return (
    <div style={{ padding: "4px 0 20px", color: T.text }}>
      <div style={{ ...box, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>🪢 Tug of War</div>
        <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Live multiplayer — pick a side by joining, then type words to pull the rope.</div>
        <div style={{ marginTop: 10, display: "inline-flex", gap: 8, alignItems: "center", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 999, padding: "6px 14px", fontWeight: 700, color: T.text }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: count > 0 ? "#10b981" : T.faint }} />
          {pres === undefined ? "Checking…" : `${count} ${count === 1 ? "player" : "players"} in Tug of War now`}
        </div>
        {pres && <div style={{ color: T.faint, fontSize: 12, marginTop: 6 }}>{pres.inRoom} in the arena · 🔴 {pres.red} vs 🔵 {pres.blue}</div>}
      </div>

      {broken && (
        <div style={{ ...box, color: "#f87171", fontSize: 13 }}>
          Multiplayer isn't available right now. Please try again later.
        </div>
      )}

      {!joined && !broken && (
        <div style={{ ...box, textAlign: "center" }}>
          <button onClick={join} disabled={pres === undefined}
            style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: T.purple, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            Join the arena
          </button>
          <div style={{ color: T.faint, fontSize: 12, marginTop: 10 }}>No names are shown to other players. A round starts when 2 or more players have joined.</div>
        </div>
      )}

      {joined && !broken && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 6 }}>
            <span>{TEAM.blue.emoji} Blue{team === "blue" ? " (you)" : ""}</span>
            <span>Round {room?.round || 1}</span>
            <span>Red{team === "red" ? " (you)" : ""} {TEAM.red.emoji}</span>
          </div>
          <div style={{ position: "relative", height: 26, borderRadius: 13, background: T.bg, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "linear-gradient(90deg,#3b82f6,#ef4444)", transition: "width .2s" }} />
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: T.faint }} />
            <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%,-50%)", fontSize: 18 }}>🚩</div>
          </div>

          {room?.status === "waiting" && <div style={{ ...box, textAlign: "center", color: T.muted }}>Waiting for another player to join… ({pres?.inRoom || 0}/2)</div>}
          {room?.status === "done" && (
            <div style={{ ...box, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: TEAM[room.winner]?.color }}>{TEAM[room.winner]?.emoji} {TEAM[room.winner]?.name} wins!</div>
              <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{room.winner === team ? "Your team pulled it off." : "Better luck next round."} You typed {mine} words. Next round starting…</div>
            </div>
          )}
          {playing && (
            <>
              <div style={{ ...box, textAlign: "center", padding: "22px 16px" }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>
                  {target.split("").map((ch, i) => <span key={i} style={{ color: i < typed.length ? (typed[i] === ch ? "#10b981" : "#ef4444") : T.text }}>{ch}</span>)}
                </div>
              </div>
              <input ref={inputRef} value={typed} onChange={onType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the word above…"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.card, color: T.text, fontSize: 16, outline: "none" }} />
              <div style={{ textAlign: "center", color: T.faint, fontSize: 12, marginTop: 8 }}>{streak > 0 ? `🔥 ${streak} streak · ` : ""}{mine} words pulled · first to {TUG_TARGET} net wins</div>
            </>
          )}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={leave} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>Leave arena</button>
          </div>
        </>
      )}
    </div>
  );
}
