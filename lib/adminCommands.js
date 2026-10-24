// Admin command bar: turns a typed line into a previewed action. Parsing is pure; run() performs the writes.
import { adminLookupUser, banUser, tempBanUser, unbanUser, warnUser, clearWarning, addNotification, adminSetKeys, adminSetTrials, adminSkipLevel, grantAdmin, revokeAdmin, setBroadcast, getRewards, setRewards, updateLevelWords, setLevelTargets, deleteLevelOverride, getLevelNameOverrides, getLevelOverrides, getModeration, setModeration, getEconomy, setEconomy, getAnnouncements, setAnnouncements, logActivity, getLocks, setLocks, setMaintenanceMode, getMaintenanceMode } from "./firebase";
import { setSite } from "./siteConfig";
import { adminListSubmissions, adminApprove, adminListPublic, adminDeleteSet, adminSeedStarters, parseWords } from "./wordsets";
import { moderate, cleanBlocked, DEFAULT_MOD } from "./moderation";
import { SYN_ANT } from "../components/SynAntDB";
import { doc, updateDoc } from "firebase/firestore";
import { GAMES } from "../components/GameCatalog";
import { LOCKABLE_FEATURES } from "./locks";

export const COMMAND_HELP = [
  ["event x2 keys until 9pm", "Start a 2x Keys event named “keys” until 9 PM ET"],
  ["event off", "End the Keys event"],
  ["announce !! Title | message", "Notify everyone (urgent). ! = important. Add users/admins first to limit; end with “for 3d”"],
  ["banner Text here until 9pm", "Pin a banner for everyone (banner off to remove)"],
  ["maintenance on Back soon", "Turn maintenance mode on or off"],
  ["lock wordsets for 2h", "Lock a feature or game (timer optional). unlock <name> to undo"],
  ["refresh", "Ask everyone to refresh"],
  ["go tools", "Jump to a tab. Anything else looks up @username / UID"],
  ["ban @user for 7d spamming", "Ban (temporary with “for …”, otherwise permanent). unban @user, warn @user text, unwarn @user"],
  ["msg @user !! Title | text", "Send one person a notification"],
  ["keys @user +500 [profile]", "Add (+), remove (-) or set (=) Keys. trials @user 3, skip @user 12"],
  ["admin grant @user confirm", "Make or remove an admin (admin revoke @user confirm)"],
  ["broadcast Message / broadcast off", "The site-wide broadcast bar"],
  ["reward 5-20 30 / reward clear 5-20", "Keys reward for a range of levels"],
  ["level 12 wpm 40 acc 90", "Level goals. Also: level 12 name New Name, level 12 reset"],
  ["sets approve all", "Approve clean waiting sets. Also: sets seed, sets remove <title>, sets feature <title>"],
  ["blocklist add a,b / remove a", "Edit the moderation blocklist. moderation on|off|reject|warn"],
  ["welcome Text / spotlight word rain / wotd brave", "Site extras (add “off” to turn one off). planned 9pm Note"],
  ["cap 600", "Daily Keys cap"],
  ["task Text / shift Text / note @user Text", "Admin tasks, handoff notes and private account notes"],
];
const VERBS = ["event", "announce", "banner", "maintenance", "lock", "unlock", "refresh", "go", "help", "ban", "unban", "warn", "unwarn", "msg", "keys", "trials", "skip", "admin", "broadcast", "reward", "level", "sets", "blocklist", "moderation", "welcome", "spotlight", "wotd", "planned", "task", "note", "shift", "cap"];
const ET = "America/New_York";
const fmtET = (t) => new Intl.DateTimeFormat("en-US", { timeZone: ET, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(t)) + " ET";

function etParts(t) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: ET, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(t)).filter(x => x.type !== "literal").map(x => [x.type, Number(x.value)]));
  return p;
}
// Epoch for a wall-clock time in New York on the date of `base` (+dayAdd days)
function etWall(base, h, m, dayAdd) {
  const n = etParts(base); const offset = Date.UTC(n.year, n.month - 1, n.day, n.hour, n.minute) - base;
  return Date.UTC(n.year, n.month - 1, n.day + dayAdd, h, m) - offset;
}
// "9", "9pm", "9:30pm", "21:00", "noon", "midnight", "tomorrow 9pm", "2h", "90m", "1d"  ->  epoch ms (or null)
export function parseWhen(text, now = Date.now()) {
  let s = String(text || "").trim().toLowerCase(); if (!s) return null;
  const dur = s.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|h|hr|hrs|hour|hours|d|day|days)$/);
  if (dur) { const n = Number(dur[1]); const u = dur[2][0]; const ms = u === "m" ? 60000 : u === "h" ? 3600000 : 86400000; return n > 0 ? now + n * ms : null; }
  let day = 0; if (/^tomorrow\b/.test(s)) { day = 1; s = s.replace(/^tomorrow\s*/, ""); }
  if (s === "noon") s = "12pm"; if (s === "midnight") s = "12am";
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/); if (!m) return null;
  let h = Number(m[1]); const mi = Number(m[2] || 0); if (mi > 59 || h > 23) return null;
  const cands = [];
  if (m[3]) { if (h < 1 || h > 12) return null; cands.push((h % 12) + (m[3] === "pm" ? 12 : 0)); }
  else if (h >= 13 || h === 0 || m[2] && h > 12) cands.push(h);
  else { cands.push(h % 12, (h % 12) + 12); }
  const times = cands.map(hh => { let t = etWall(now, hh, mi, day); if (t <= now && !day) t = etWall(now, hh, mi, 1); return t; }).filter(t => t > now).sort((a, b) => a - b);
  return times[0] || null;
}
const splitWhen = (rest) => { const m = rest.match(/^(.*?)(?:\s+(?:until|till|til|by|for)\s+|\s+(?=\d+\s*(?:m|min|h|hr|d)$))(.+)$/i); return m ? { head: m[1].trim(), when: m[2].trim() } : { head: rest.trim(), when: "" }; };
const findTarget = (q) => {
  const k = q.trim().toLowerCase().replace(/[\s_-]+/g, "");
  const f = LOCKABLE_FEATURES.find(([id, n]) => id === k || n.toLowerCase().replace(/[\s_&-]+/g, "") === k);
  if (f) return { kind: "features", id: f[0], name: f[1] };
  const g = GAMES.find(x => x.id === k || x.name.toLowerCase().replace(/[\s_-]+/g, "") === k);
  return g ? { kind: "games", id: g.id, name: g.name } : null;
};

export function parseCommand(input, now = Date.now()) {
  const raw = String(input || "").trim().replace(/^\//, ""); if (!raw) return { isCommand: false };
  const verb = raw.split(/\s+/)[0].toLowerCase(); if (!VERBS.includes(verb)) return { isCommand: false };
  const rest = raw.slice(verb.length).trim();
  const bad = (error) => ({ isCommand: true, ok: false, error });
  const ok = (summary, run) => ({ isCommand: true, ok: true, summary, run });
  if (verb === "help") return ok("Shows the command list", async () => ({ msg: COMMAND_HELP.map(h => h[0]).join("  •  ") }));
  if (verb === "go") return rest ? ok(`Open the “${rest.toLowerCase()}” tab`, async (c) => { if (!c.tabs.includes(rest.toLowerCase())) throw new Error(`No tab called ${rest}`); c.setTab(rest.toLowerCase()); return { msg: `Opened ${rest}` }; }) : bad("go <tab name>");
  if (verb === "refresh") return ok("Ask everyone to refresh", async (c) => { await setSite({ version: String(now) }, c.adminDb); await logActivity("site_update", { adminUid: c.uid, detail: "refresh prompt (command bar)" }, c.adminDb).catch(() => {}); return { msg: "Refresh prompt sent" }; });

  if (verb === "event") {
    if (/^(off|end|stop|cancel)$/i.test(rest)) return ok("End the Keys event now", async (c) => { const e = await getEconomy(); await setEconomy({ ...e, multiplier: 1, endsAt: 0, startsAt: 0 }, c.adminDb); await logActivity("economy_update", { adminUid: c.uid, detail: "event off (command bar)" }, c.adminDb).catch(() => {}); return { msg: "Keys event ended" }; });
    const m = rest.match(/^(?:x|×)?\s*(\d+(?:\.\d+)?)\s*(?:x|×)?\s*(.*)$/i); if (!m) return bad("Try: event x2 keys until 9pm");
    const mult = Number(m[1]); if (!(mult >= 1.1 && mult <= 3)) return bad("Multiplier must be between 1.1 and 3");
    const { head, when } = splitWhen(m[2]); const title = (head || "Keys event").slice(0, 40);
    let endsAt = 0; if (when) { endsAt = parseWhen(when, now) || 0; if (!endsAt) return bad(`I couldn't read the time “${when}”. Try 9pm, 21:00 or 2h`); if (endsAt - now > 14 * 86400000) return bad("Events can last at most 14 days"); }
    return ok(`Start ${mult}x Keys “${title}” now, ${endsAt ? "until " + fmtET(endsAt) : "with NO end time"}`, async (c) => { const e = await getEconomy(); await setEconomy({ ...e, multiplier: mult, name: title, startsAt: now, endsAt }, c.adminDb); await logActivity("economy_update", { adminUid: c.uid, detail: `event ${mult}x ${title} (command bar)`.slice(0, 180) }, c.adminDb).catch(() => {}); return { msg: `${mult}x Keys started` }; });
  }

  if (verb === "announce") {
    let r = rest, aud = "all", level = "none";
    const a = r.match(/^(all|users|admins)\s+/i); if (a) { aud = a[1].toLowerCase(); r = r.slice(a[0].length); }
    const l = r.match(/^(!!|urgent|!|important)\s+/i); if (l) { level = /^(!!|urgent)$/i.test(l[1]) ? "urgent" : "important"; r = r.slice(l[0].length); }
    let days = 7; const ex = r.match(/\s+for\s+(\d+)\s*(d|day|days|h|hr|hours)$/i); if (ex) { days = (Number(ex[1]) * (ex[2][0].toLowerCase() === "h" ? 1 : 24)) / 24; r = r.slice(0, ex.index); }
    const [t, ...b] = r.split("|"); const title = (t || "").trim().slice(0, 80), body = b.join("|").trim().slice(0, 300);
    if (!title) return bad("Try: announce !! Title | message");
    return ok(`Send “${title}” to ${aud === "all" ? "everyone" : aud}${level !== "none" ? " as " + level.toUpperCase() : ""}, disappears in ${days < 1 ? Math.round(days * 24) + "h" : days + "d"}`, async (c) => {
      const cur = await getAnnouncements();
      const item = { id: now.toString(36) + Math.random().toString(36).slice(2, 6), title, body, level, audience: aud, at: now, startsAt: null, expiresAt: now + days * 86400000 };
      await setAnnouncements([item, ...cur], c.adminDb); await logActivity("admin_notification", { adminUid: c.uid, detail: `${aud} ${level}: ${title} (command bar)`.slice(0, 180) }, c.adminDb).catch(() => {}); return { msg: "Notification sent" };
    });
  }

  if (verb === "banner") {
    if (/^(off|remove|clear)$/i.test(rest)) return ok("Remove the site banner", async (c) => { await setSite({ banner: null }, c.adminDb); await logActivity("site_update", { adminUid: c.uid, detail: "banner off (command bar)" }, c.adminDb).catch(() => {}); return { msg: "Banner removed" }; });
    const { head, when } = splitWhen(rest); if (!head) return bad("Try: banner Text here until 9pm");
    let endsAt = 0; if (when) { endsAt = parseWhen(when, now) || 0; if (!endsAt) return bad(`I couldn't read the time “${when}”`); }
    return ok(`Show banner “${head.slice(0, 80)}” ${endsAt ? "until " + fmtET(endsAt) : "with no end"}`, async (c) => { await setSite({ banner: { id: String(now), text: head.slice(0, 160), color: "#a78bfa", link: "", endsAt } }, c.adminDb); await logActivity("site_update", { adminUid: c.uid, detail: "banner on (command bar)" }, c.adminDb).catch(() => {}); return { msg: "Banner published" }; });
  }

  if (verb === "maintenance") {
    const m = rest.match(/^(on|off)\b\s*(.*)$/i); if (!m) return bad("Try: maintenance on Back soon  /  maintenance off");
    const on = m[1].toLowerCase() === "on", msg = m[2].trim().slice(0, 140);
    return ok(`Turn maintenance mode ${on ? "ON" + (msg ? ` (“${msg}”)` : "") : "OFF"}`, async (c) => { const cur = await getMaintenanceMode(); await setMaintenanceMode(on, msg || cur.message || "We'll be right back.", cur.triggers || { admins: false, users: true }, c.adminDb); await logActivity("maintenance", { adminUid: c.uid, detail: (on ? "on" : "off") + " (command bar)" }, c.adminDb).catch(() => {}); return { msg: `Maintenance ${on ? "ON" : "OFF"}` }; });
  }

  if (verb === "lock" || verb === "unlock") {
    const { head, when } = splitWhen(rest); const tg = findTarget(head); if (!tg) return bad(`I don't know “${head}”. Use a feature or game name, like wordsets or word rain`);
    if (verb === "unlock") return ok(`Unlock ${tg.name}`, async (c) => { const l = await getLocks(); const n = { ...l, [tg.kind]: { ...(l[tg.kind] || {}) } }; delete n[tg.kind][tg.id]; await setLocks(n, c.adminDb); await logActivity("locks_update", { adminUid: c.uid, detail: `unlock ${tg.id} (command bar)` }, c.adminDb).catch(() => {}); return { msg: `${tg.name} unlocked` }; });
    let until = 0; if (when) { until = parseWhen(when, now) || 0; if (!until) return bad(`I couldn't read the time “${when}”`); }
    return ok(`Lock ${tg.name} ${until ? "until " + fmtET(until) : "until you unlock it"}`, async (c) => {
      const l = await getLocks(); const n = { ...l, [tg.kind]: { ...(l[tg.kind] || {}), [tg.id]: true }, until: { ...(l.until || {}) } };
      const key = (tg.kind === "games" ? "g:" : "f:") + tg.id; if (until) n.until[key] = until; else delete n.until[key];
      await setLocks(n, c.adminDb); await logActivity("locks_update", { adminUid: c.uid, detail: `lock ${tg.id}${until ? " timed" : ""} (command bar)` }, c.adminDb).catch(() => {}); return { msg: `${tg.name} locked` };
    });
  }
  // ───────── account actions ─────────
  const needUser = (r) => { const m = r.match(/^(@?[A-Za-z0-9_.-]{2,})\s*(.*)$/); return m ? { who: m[1], rest: m[2].trim() } : null; };
  const lookup = async (c, who) => { const u = await adminLookupUser(c.adminDb, who); if (!u) throw new Error(`No account found for ${who}`); return u; };
  const pickProfile = (u, name) => {
    const ps = u.profiles || []; if (!ps.length) throw new Error("That account has no profiles");
    if (name) { const p = ps.find(x => String(x.name || "").toLowerCase() === name.toLowerCase()); if (!p) throw new Error(`No profile named “${name}” (has: ${ps.map(x => x.name).join(", ")})`); return p; }
    if (ps.length > 1) throw new Error(`Which profile? Add its name at the end (${ps.map(x => x.name).join(", ")})`); return ps[0];
  };
  const log = (c, action, extra) => logActivity(action, { adminUid: c.uid, ...extra }, c.adminDb).catch(() => {});
  if (["ban", "unban", "warn", "unwarn", "msg", "keys", "trials", "skip", "note"].includes(verb)) {
    const nu = needUser(rest); if (!nu) return bad(`Try: ${verb} @username …`);
    const { who, rest: r } = nu; const tag = who.startsWith("@") ? who : "@" + who;
    if (verb === "unban") return ok(`Unban ${tag}`, async (c) => { const u = await lookup(c, who); await unbanUser(u.uid, c.adminDb); await log(c, "unban", { targetUid: u.uid, targetUsername: u.username }); return { msg: `${tag} unbanned` }; });
    if (verb === "unwarn") return ok(`Clear the warning on ${tag}`, async (c) => { const u = await lookup(c, who); await clearWarning(u.uid); await log(c, "clear_warn", { targetUid: u.uid, targetUsername: u.username }); return { msg: "Warning cleared" }; });
    if (verb === "ban") {
      const m = r.match(/^(?:for\s+(\S+)\s*)?(.*)$/i); let exp = 0; if (m[1]) { exp = parseWhen(m[1], now) || 0; if (!exp) return bad(`I couldn't read the length “${m[1]}”. Try 7d or 12h`); }
      const reason = m[2].trim().slice(0, 140) || "No reason given";
      return ok(`Ban ${tag} ${exp ? "until " + fmtET(exp) : "PERMANENTLY"} — “${reason}”`, async (c) => { const u = await lookup(c, who); if (u.uid === c.uid) throw new Error("You can't ban yourself"); const data = { reason, bannedBy: c.uid }; if (exp) await tempBanUser(u.uid, { ...data, expiresAt: new Date(exp).toISOString() }, c.adminDb); else await banUser(u.uid, data, c.adminDb); await log(c, "ban", { targetUid: u.uid, targetUsername: u.username, detail: reason + (exp ? ` (until ${new Date(exp).toISOString()})` : "") }); return { msg: `${tag} banned` }; });
    }
    if (verb === "warn") { if (!r) return bad("Try: warn @user message"); return ok(`Warn ${tag}: “${r.slice(0, 120)}”`, async (c) => { const u = await lookup(c, who); await warnUser(u.uid, { message: r.slice(0, 300), warnedBy: c.uid }, c.adminDb); await log(c, "warn", { targetUid: u.uid, targetUsername: u.username, detail: r.slice(0, 180) }); return { msg: `${tag} warned` }; }); }
    if (verb === "msg") {
      let t = r, level = "none"; const l = t.match(/^(!!|urgent|!|important)\s+/i); if (l) { level = /^(!!|urgent)$/i.test(l[1]) ? "urgent" : "important"; t = t.slice(l[0].length); }
      const [ti, ...b] = t.split("|"); const title = (ti || "").trim().slice(0, 80), body = b.join("|").trim().slice(0, 300); if (!title) return bad("Try: msg @user !! Title | text");
      return ok(`Send ${tag} “${title}”${level !== "none" ? " as " + level.toUpperCase() : ""}`, async (c) => { const u = await lookup(c, who); if (!(await addNotification(u.uid, { type: "admin_message", title, body, level }, c.adminDb))) throw new Error("Couldn't deliver"); await log(c, "admin_notification", { targetUid: u.uid, targetUsername: u.username, detail: `${level}: ${title}`.slice(0, 180) }); return { msg: `Sent to ${tag}` }; });
    }
    if (verb === "note") { if (!r) return bad("Try: note @user text"); return ok(`Add a private note on ${tag}`, async (c) => { const u = await lookup(c, who); await log(c, "admin_note", { targetUid: u.uid, targetUsername: u.username, detail: r.slice(0, 400) }); return { msg: "Note added" }; }); }
    if (verb === "keys") {
      const m = r.match(/^([+\-=])\s*(\d+)\s*(.*)$/); if (!m) return bad("Try: keys @user +500  (or -200, or =1000)"); const n = Number(m[2]); if (n > 1000000) return bad("That's too many Keys");
      return ok(`${m[1] === "=" ? "Set" : m[1] === "+" ? "Add" : "Remove"} ${n} Keys ${m[1] === "=" ? "to" : m[1] === "+" ? "to" : "from"} ${tag}${m[3] ? ` (${m[3]})` : ""}`, async (c) => { const u = await lookup(c, who); const p = pickProfile(u, m[3].trim()); const cur = Number(p.keys) || 0; const next = m[1] === "=" ? n : Math.max(0, m[1] === "+" ? cur + n : cur - n); await adminSetKeys(u.uid, p.id, next, c.adminDb); await log(c, "set_keys", { targetUid: u.uid, targetUsername: u.username, detail: `${p.name}: ${cur} → ${next}` }); return { msg: `${p.name}: ${cur} → ${next} Keys` }; });
    }
    if (verb === "trials") { const m = r.match(/^(\d+)\s*(.*)$/); if (!m) return bad("Try: trials @user 3"); return ok(`Set trials for ${tag} to ${m[1]}`, async (c) => { const u = await lookup(c, who); const p = pickProfile(u, m[2].trim()); await adminSetTrials(u.uid, p.id, Number(m[1]), c.adminDb); await log(c, "set_trials", { targetUid: u.uid, targetUsername: u.username, detail: `${p.name}: ${m[1]}` }); return { msg: "Trials set" }; }); }
    if (verb === "skip") { const m = r.match(/^(\d+)\s*(.*)$/); if (!m) return bad("Try: skip @user 12"); return ok(`Unlock up to level ${m[1]} for ${tag}`, async (c) => { const u = await lookup(c, who); const p = pickProfile(u, m[2].trim()); await adminSkipLevel(u.uid, p.id, Number(m[1]), c.adminDb); await log(c, "skip_level", { targetUid: u.uid, targetUsername: u.username, detail: `${p.name} → L${m[1]}` }); return { msg: `${p.name} moved to level ${m[1]}` }; }); }
  }
  if (verb === "admin") {
    const m = rest.match(/^(grant|revoke)\s+(@?\S+)\s+confirm$/i); if (!m) return bad("Try: admin grant @user confirm  (the word “confirm” is required)");
    const grant = m[1].toLowerCase() === "grant";
    return ok(`${grant ? "MAKE" : "REMOVE admin from"} ${m[2]}${grant ? " an ADMIN" : ""}`, async (c) => { const u = await lookup(c, m[2]); if (!grant && u.uid === c.uid) throw new Error("You can't revoke yourself"); if (grant) await grantAdmin(u.uid, c.uid, c.adminDb); else await revokeAdmin(u.uid, c.adminDb); await log(c, grant ? "grant_admin" : "revoke_admin", { targetUid: u.uid, targetUsername: u.username }); return { msg: grant ? "Admin granted" : "Admin revoked" }; });
  }
  if (verb === "broadcast") return /^(off|clear)$/i.test(rest) ? ok("Clear the broadcast", async (c) => { await setBroadcast("", c.uid); await log(c, "broadcast", { detail: "cleared" }); return { msg: "Broadcast cleared" }; }) : rest ? ok(`Broadcast to everyone: “${rest.slice(0, 120)}”`, async (c) => { await setBroadcast(rest.slice(0, 200), c.uid); await log(c, "broadcast", { detail: rest.slice(0, 180) }); return { msg: "Broadcast sent" }; }) : bad("Try: broadcast Message");

  // ───────── economy, levels, rewards ─────────
  if (verb === "cap") { const n = Math.floor(Number(rest)); if (!(n >= 50 && n <= 5000)) return bad("Try: cap 600  (50 to 5000)"); return ok(`Set the daily Keys cap to ${n}`, async (c) => { const e = await getEconomy(); await setEconomy({ ...e, dailyCap: n }, c.adminDb); await log(c, "economy_update", { detail: `cap ${n} (command bar)` }); return { msg: `Daily cap is ${n}` }; }); }
  if (verb === "reward") {
    const m = rest.match(/^(clear\s+)?(\d+)(?:\s*-\s*(\d+))?\s*(\d+)?$/i); if (!m) return bad("Try: reward 5-20 30   or   reward clear 5-20");
    const a = Number(m[2]), b = Number(m[3] || m[2]), clear = !!m[1], v = Number(m[4]);
    if (!(a >= 1 && b >= a && b <= 1000 && b - a <= 300)) return bad("Use a level range of up to 300 levels"); if (!clear && !(v >= 0 && v <= 500)) return bad("Reward must be 0 to 500 Keys");
    return ok(clear ? `Clear custom rewards for levels ${a}-${b}` : `Pay ${v} Keys for levels ${a}-${b}`, async (c) => { const cur = await getRewards(); const levels = { ...(cur.levels || {}) }; for (let i = a; i <= b; i++) { if (clear) delete levels[String(i)]; else levels[String(i)] = v; } await setRewards({ levels }, c.adminDb); await log(c, "rewards_bulk", { detail: `${clear ? "cleared" : v} levels ${a}-${b} (command bar)` }); return { msg: "Rewards updated" }; });
  }
  if (verb === "level") {
    const m = rest.match(/^(\d+)\s+(.*)$/); if (!m) return bad("Try: level 12 wpm 40 acc 90  |  level 12 name New Name  |  level 12 reset"); const id = Number(m[1]), r = m[2].trim();
    if (/^reset$/i.test(r)) return ok(`Reset level ${id} to its original text, name and goals`, async (c) => { await deleteLevelOverride(id, c.adminDb); await log(c, "level_reset", { detail: `L${id} (command bar)` }); return { msg: `Level ${id} reset` }; });
    const nm = r.match(/^name\s+(.+)$/i); if (nm) return ok(`Rename level ${id} to “${nm[1].slice(0, 40)}”`, async (c) => { const o = await getLevelOverrides().catch(() => ({})); await updateLevelWords(id, o[String(id)] || [], c.adminDb, nm[1].trim().slice(0, 40)); await log(c, "level_rename", { detail: `L${id}: ${nm[1]}`.slice(0, 180) }); return { msg: `Level ${id} renamed` }; });
    const w = r.match(/\bwpm\s+(\d+)/i), a2 = r.match(/\b(?:acc|accuracy)\s+(\d+)/i); if (!w && !a2) return bad("Add wpm and/or acc, like: level 12 wpm 40 acc 90");
    return ok(`Level ${id} goals: ${w ? w[1] + " WPM" : "WPM unchanged"}, ${a2 ? a2[1] + "% accuracy" : "accuracy unchanged"}`, async (c) => { await setLevelTargets(id, w ? w[1] : null, a2 ? a2[1] : null, c.adminDb); await log(c, "level_targets", { detail: `L${id} ${w ? "wpm=" + w[1] : ""} ${a2 ? "acc=" + a2[1] : ""} (command bar)` }); return { msg: `Level ${id} goals saved` }; });
  }

  // ───────── word sets and moderation ─────────
  if (verb === "sets") {
    if (/^seed$/i.test(rest)) return ok("Add the six starter sets (skips ones that exist)", async (c) => { const n = await adminSeedStarters(c.adminDb); await log(c, "wordset_seed", { detail: `${n} added` }); return { msg: `${n} starter set(s) added` }; });
    if (/^approve\s+all$/i.test(rest)) return ok("Approve every waiting set that passes auto-moderation", async (c) => {
      const cfg = await getModeration(); const subs = await adminListSubmissions(c.adminDb); let n = 0, skipped = 0;
      for (const sub of subs) { if (moderate(sub.title, sub.words, { ...DEFAULT_MOD, ...cfg }).length) { skipped++; continue; } await adminApprove(c.adminDb, sub, { title: sub.title, words: sub.words, badge: null, rewardKeys: 0 }); n++; }
      await log(c, "wordset_approve_all", { detail: `${n} approved, ${skipped} left (command bar)` }); return { msg: `${n} approved${skipped ? `, ${skipped} flagged left for review` : ""}` };
    });
    const m = rest.match(/^(remove|feature|unfeature)\s+(.+)$/i); if (!m) return bad("Try: sets approve all  |  sets seed  |  sets remove <title>  |  sets feature <title>");
    const act = m[1].toLowerCase(), q = m[2].trim().toLowerCase();
    return ok(`${act === "remove" ? "REMOVE" : act === "feature" ? "Feature" : "Unfeature"} the set titled “${m[2].trim()}”`, async (c) => {
      const all = await adminListPublic(c.adminDb); const hits = all.filter(x => x.title.toLowerCase() === q); const found = hits.length ? hits : all.filter(x => x.title.toLowerCase().includes(q));
      if (found.length !== 1) throw new Error(found.length ? `${found.length} sets match — be more specific` : "No set with that title"); const s0 = found[0];
      if (act === "remove") { await adminDeleteSet(c.adminDb, s0.id, "Removed by an admin", s0.title); await log(c, "wordset_remove", { detail: s0.title }); return { msg: `Removed “${s0.title}”` }; }
      await updateDoc(doc(c.adminDb, "wordSets", s0.id), { featured: act === "feature" }); await log(c, "wordset_feature", { detail: `${act} ${s0.title}` }); return { msg: `${act === "feature" ? "Featured" : "Unfeatured"} “${s0.title}”` };
    });
  }
  if (verb === "blocklist") {
    const m = rest.match(/^(add|remove)\s+(.+)$/i); if (!m) return bad("Try: blocklist add word1, word2  |  blocklist remove word");
    const words = cleanBlocked(m[2]); if (!words.length) return bad("No usable words found"); const add = m[1].toLowerCase() === "add";
    return ok(`${add ? "Add" : "Remove"} ${words.length} word(s) ${add ? "to" : "from"} the blocklist`, async (c) => { const cur = await getModeration(); const have = cur.blocked || []; const next = add ? cleanBlocked([...have, ...words].join(",")) : have.filter(w => !words.includes(w)); await setModeration({ ...DEFAULT_MOD, ...cur, blocked: next }, c.adminDb); await log(c, "moderation_update", { detail: `${add ? "+" : "-"}${words.length} → ${next.length} (command bar)` }); return { msg: `Blocklist has ${next.length} words` }; });
  }
  if (verb === "moderation") {
    const m = rest.match(/^(on|off|reject|warn)$/i); if (!m) return bad("Try: moderation on | off | reject | warn"); const k = m[1].toLowerCase();
    return ok(k === "on" ? "Turn auto-moderation ON" : k === "off" ? "Turn auto-moderation OFF" : k === "reject" ? "Auto-REJECT flagged sets" : "Only WARN about flagged sets", async (c) => { const cur = { ...DEFAULT_MOD, ...(await getModeration()) }; if (k === "on" || k === "off") cur.enabled = k === "on"; else cur.autoReject = k === "reject"; await setModeration(cur, c.adminDb); await log(c, "moderation_update", { detail: `${k} (command bar)` }); return { msg: "Moderation updated" }; });
  }

  // ───────── site extras ─────────
  const siteCmd = (label, patch) => async (c) => { await setSite(patch, c.adminDb); await log(c, "site_update", { detail: `${label} (command bar)` }); return { msg: `${label} saved` }; };
  if (verb === "welcome") return /^(off|clear)$/i.test(rest) ? ok("Turn the welcome message off", siteCmd("Welcome off", { welcome: { enabled: false, title: "", body: "", at: now } })) : rest ? ok(`Show new welcome message: “${rest.slice(0, 80)}”`, siteCmd("Welcome message", { welcome: { enabled: true, title: "Welcome to AccuratKey!", body: rest.slice(0, 300), at: now } })) : bad("Try: welcome Text  |  welcome off");
  if (verb === "spotlight") { if (/^(off|clear|none)$/i.test(rest)) return ok("Remove the spotlight game", siteCmd("Spotlight off", { spotlight: "" })); const g = GAMES.find(x => x.id === rest.toLowerCase().replace(/\s+/g, "") || x.name.toLowerCase() === rest.toLowerCase()); return g ? ok(`Spotlight ${g.name}`, siteCmd("Spotlight", { spotlight: g.id })) : bad("Try: spotlight word rain  |  spotlight off"); }
  if (verb === "wotd") { if (/^(off|clear|auto)$/i.test(rest)) return ok("Use the automatic word of the day", siteCmd("Word of the day auto", { wotd: "" })); const w = rest.toLowerCase().replace(/[^a-z]/g, ""); return SYN_ANT.find(x => x.word === w && x.syn?.length) ? ok(`Force the word of the day: “${w}”`, siteCmd("Word of the day", { wotd: w })) : bad(`“${w}” isn't in the synonym list`); }
  if (verb === "planned") { if (/^(off|clear)$/i.test(rest)) return ok("Clear the planned maintenance notice", siteCmd("Planned maintenance cleared", { planned: null })); const m = rest.match(/^(tomorrow\s+\S+|\S+)\s*(.*)$/i); const at = m ? parseWhen(m[1], now) : null; return at ? ok(`Show a planned-maintenance notice for ${fmtET(at)}${m[2] ? ` — “${m[2].slice(0, 60)}”` : ""}`, siteCmd("Planned maintenance", { planned: { at, text: (m[2] || "").slice(0, 100) } })) : bad("Try: planned 9pm Short note  |  planned off"); }

  // ───────── team notes ─────────
  if (verb === "task" || verb === "shift") return rest ? ok(`Add ${verb === "task" ? "an admin task" : "a shift note"}: “${rest.slice(0, 80)}”`, async (c) => { await log(c, verb === "task" ? "admin_task" : "admin_shift", { detail: rest.slice(0, verb === "task" ? 200 : 400) }); return { msg: verb === "task" ? "Task added" : "Shift note posted" }; }) : bad(`Try: ${verb} Text`);
  return { isCommand: false };
}
