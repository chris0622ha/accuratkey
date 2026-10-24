// Admin command bar: turns a typed line into a previewed action. Parsing is pure; run() performs the writes.
import { getEconomy, setEconomy, getAnnouncements, setAnnouncements, logActivity, getLocks, setLocks, setMaintenanceMode, getMaintenanceMode } from "./firebase";
import { setSite } from "./siteConfig";
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
];
const VERBS = ["event", "announce", "banner", "maintenance", "lock", "unlock", "refresh", "go", "help"];
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
  return { isCommand: false };
}
