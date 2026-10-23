// Auto-moderation for community word sets. Admin-controlled via config/moderation.
export const DEFAULT_MOD = { enabled: true, autoReject: false, checkPII: true, blocked: [] };

const norm = s => String(s || "").toLowerCase().replace(/[@4]/g, "a").replace(/[3]/g, "e").replace(/[1!|]/g, "i").replace(/0/g, "o").replace(/\$/g, "s");

export function cleanBlocked(list) {
  const seen = new Set();
  return (Array.isArray(list) ? list : String(list || "").split(/[\s,]+/))
    .map(w => String(w).toLowerCase().replace(/[^a-z0-9]/g, "")).filter(w => w.length >= 2 && w.length <= 24 && !seen.has(w) && seen.add(w)).slice(0, 300);
}

// Returns an array of reasons (empty = clean). Checks the admin's custom blocked words (whole word, with
// common letter swaps like @ for a), and personal info patterns (emails, phone numbers, links, handles).
export function moderate(title, words, cfg = DEFAULT_MOD) {
  const c = { ...DEFAULT_MOD, ...(cfg || {}) };
  const flags = [];
  if (!c.enabled) return flags;
  const all = [String(title || ""), ...(words || [])];
  const text = all.join(" ");
  const blocked = cleanBlocked(c.blocked);
  if (blocked.length) {
    const set = new Set(blocked);
    const hit = new Set();
    for (const piece of all) {
      for (const tok of [String(piece).toLowerCase(), norm(piece)]) {
        for (const w of tok.split(/[^a-z0-9]+/)) if (w && set.has(w)) hit.add(w);
      }
    }
    if (hit.size) flags.push("Blocked word: " + [...hit].slice(0, 5).join(", "));
  }
  if (c.checkPII) {
    if (/\S+@\S+\.\S+/.test(text) || /@[a-z0-9_]{3,}/i.test(text)) flags.push("Looks like an email or @handle");
    if (/(https?:|www\.|\.com\b|\.net\b|\.org\b|\.gg\b|\.io\b)/i.test(text)) flags.push("Looks like a link");
    if (/\d{7,}/.test(text.replace(/[\s().-]/g, "")) ) flags.push("Looks like a phone number or long ID");
  }
  // spam: one word repeated or very low variety
  if (words && words.length >= 10 && new Set(words.map(w => w.toLowerCase())).size < words.length * 0.6) flags.push("Mostly repeated words");
  if (words && words.some(w => /(.)\1{5,}/.test(w))) flags.push("Keyboard spam");
  return flags;
}
