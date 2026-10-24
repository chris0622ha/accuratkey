// Admin-defined text replacements for any visible label (menus, buttons, headings).
// config/site.texts = [{from, to, sub?}] — exact match on a whole text node by default,
// or any occurrence of `from` inside it when sub is true. Text only, never HTML.
let rules = [];
const written = new WeakMap();
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "NOSCRIPT"]);
const ATTRS = ["placeholder", "title", "aria-label"];

function swap(str) {
  const t = str.trim();
  if (!t) return str;
  for (const r of rules) {
    if (r.sub) { if (str.includes(r.from)) return str.split(r.from).join(r.to); }
    else if (t === r.from) return str.replace(t, r.to);
  }
  return str;
}
function fixNode(n) {
  if (n.nodeType === 3) {
    if (written.get(n) === n.data) return;
    const p = n.parentElement;
    if (!p || SKIP.has(p.tagName) || p.isContentEditable || p.closest("[data-no-text-override]")) return;
    const out = swap(n.data);
    if (out !== n.data) { n.data = out; written.set(n, out); }
  } else if (n.nodeType === 1) {
    if (n.closest("[data-no-text-override]")) return;
    for (const a of ATTRS) { const v = n.getAttribute(a); if (v) { const o = swap(v); if (o !== v) n.setAttribute(a, o); } }
    if (SKIP.has(n.tagName)) return;
    n.childNodes.forEach(fixNode);
  }
}
let obs = null, raf = 0;
export function setTextRules(list) {
  rules = (Array.isArray(list) ? list : []).filter(r => r && r.from && typeof r.to === "string").map(r => ({ from: String(r.from).slice(0, 200), to: String(r.to).slice(0, 200), sub: !!r.sub }));
  if (typeof document === "undefined") return;
  if (obs) { obs.disconnect(); obs = null; }
  if (!rules.length) return;
  fixNode(document.body);
  obs = new MutationObserver(ms => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { ms.forEach(m => { if (m.type === "characterData") fixNode(m.target); else m.addedNodes.forEach(fixNode); }); });
  });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
}
