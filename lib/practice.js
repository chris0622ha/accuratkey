// Practice Lab: text generators + local per-key accuracy tracking (device-only, COPPA-safe).
const skey = (pid) => `ak_keystats_${pid || "guest"}`;
export function getKeyStats(pid) { try { return JSON.parse(localStorage.getItem(skey(pid)) || "{}"); } catch { return {}; } }
export function mergeKeyStats(pid, run) {
  try {
    const all = getKeyStats(pid);
    for (const [k, v] of Object.entries(run)) { const a = all[k] || { n: 0, miss: 0 }; all[k] = { n: a.n + v.n, miss: a.miss + v.miss }; }
    localStorage.setItem(skey(pid), JSON.stringify(all));
  } catch {}
}
// Keys with the highest miss rate (need a minimum sample so one slip doesn't count).
export function weakKeys(pid, limit = 6, minSamples = 12) {
  return Object.entries(getKeyStats(pid)).filter(([k, v]) => /[a-z]/.test(k) && v.n >= minSamples && v.miss > 0)
    .map(([k, v]) => ({ k, rate: v.miss / v.n, n: v.n, miss: v.miss })).sort((a, b) => b.rate - a.rate).slice(0, limit);
}

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
// Lines must be > 20 chars so the game uses each entry as a whole line.
function pack(words, min = 28, max = 46, count = 12) {
  const out = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { if (cur.length >= min) out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); if (out.length >= count) break; }
  if (cur.length > 20 && out.length < count) out.push(cur);
  return out;
}
export function fromText(text) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines = pack(words, 22, 50, 40);
  return lines.length ? lines : (text.trim().length > 20 ? [text.trim().slice(0, 60)] : []);
}
export function weakKeyDrill(keys, wordPool) {
  const set = keys.map(k => k.toLowerCase());
  const scored = wordPool.filter(w => w.length >= 3 && w.length <= 9 && /^[a-z]+$/.test(w)).map(w => ({ w, s: set.reduce((a, k) => a + (w.split(k).length - 1), 0) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  const top = shuffle(scored.slice(0, 300).map(x => x.w));
  return pack(top.length >= 20 ? top : shuffle(wordPool.filter(w => w.length <= 8)), 28, 46, 14);
}
export const PRESETS = {
  numbers: () => Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => String(rnd(9000) + 100)).join(" ")),
  numpad: () => Array.from({ length: 12 }, () => Array.from({ length: 4 }, () => `${rnd(90) + 10}${pick(["+", "-", "*", "/"])}${rnd(90) + 10}`).join(" ") ),
  symbols: () => { const s = "!@#$%^&*()-_=+[]{};:,.<>?/"; return Array.from({ length: 12 }, () => Array.from({ length: 6 }, () => Array.from({ length: 3 + rnd(3) }, () => pick(s.split(""))).join("")).join(" ")); },
  bigrams: () => { const b = "th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le ve co me de hi ri ro ic ne ea ra ce li ch ll be ma si om ur".split(" "); return Array.from({ length: 12 }, () => Array.from({ length: 8 }, () => pick(b) + pick(b)).join(" ")); },
  punctuation: () => shuffle([
    "Well, it's true: practice makes perfect.", "\"Stop,\" she said; \"think before you type.\"", "Is this the end? No — it's the beginning!",
    "Apples, oranges, and pears (all fresh) cost $4.50.", "He asked, \"Why? Because it's worth it.\"", "Items: pens, paper, tape; also a stapler.",
    "Re-read it twice — then fix what's wrong.", "Accuracy first... speed will follow, I promise.", "Don't rush; rhythm wins over bursts, every time.",
    "Order #42 shipped on 10/21 for $19.99 total.", "It's 5 o'clock somewhere, isn't it?", "Use quotes (\"like this\") and dashes - carefully."]),
  code: () => shuffle([
    "const total = items.reduce((a, b) => a + b, 0);", "for (let i = 0; i < arr.length; i++) {", "function add(a, b) { return a + b; }",
    "if (user && user.active) { save(user); }", "const [count, setCount] = useState(0);", "fetch(url).then(r => r.json()).then(console.log);",
    "def greet(name): return f\"Hello, {name}!\"", "for i in range(10): print(i * 2)", "SELECT name, age FROM users WHERE age > 18;",
    "items = [x for x in data if x % 2 == 0]", "<div className=\"card\"><h1>{title}</h1></div>", "git commit -m \"fix typo\" && git push origin main",
    "UPDATE orders SET status = 'done' WHERE id = 7;", "const sleep = ms => new Promise(r => setTimeout(r, ms));"]),
};
