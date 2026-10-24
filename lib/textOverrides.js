// Admin-defined text replacements for any visible label (menus, buttons, headings).
// config/site.texts = [{from, to, sub?}] — exact match on a whole text node by default,
// or any occurrence of `from` inside it when sub is true. Text only, never HTML.
// Works on any document (the admin preview applies it to an iframe), and can be re-run to change or undo rules.
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "NOSCRIPT"]);
const ATTRS = ["placeholder", "title", "aria-label"];
const origText = new WeakMap();   // text node -> original text
const written = new WeakMap();    // text node -> text we last wrote
const origAttr = new WeakMap();   // element -> { attr: {orig, written} }
const docs = new Map();           // document -> { obs, raf, rules }

// Only fixed interface text can be changed: menus, buttons, links, tabs, labels and headings.
// Anything that changes by itself (the daily challenge words, game words, names, scores) is never touched,
// so a change can't turn into a different thing tomorrow.
const UI = "button,a,label,h1,h2,h3,h4,h5,h6,summary,th,nav,[role=tab],[role=menuitem],[role=button],[role=heading]";
const NO = "[data-no-text-override],[data-dynamic]";
export function isUiText(n) {
  const p = n.parentElement; if (!p || p.closest(NO) || !p.closest(UI)) return false;
  const t = n.data.trim();
  return t.length > 0 && t.length <= 60 && !/^[\d\s.,:%+\-x/]+$/i.test(t) && !t.startsWith("@");
}

function swap(str, rules) {
  const t = str.trim();
  if (!t) return str;
  for (const r of rules) {
    if (r.sub) { if (str.includes(r.from)) return str.split(r.from).join(r.to); }
    else if (t === r.from) return str.replace(t, r.to);
  }
  return str;
}
export function getOriginalText(n) { return origText.has(n) && written.get(n) === n.data ? origText.get(n) : n.data; }

function fix(n, st) {
  if (n.nodeType === 3) {
    const p = n.parentElement;
    if (!p || SKIP.has(p.tagName) || p.isContentEditable || p.closest("[data-no-text-override]")) return;
    // if the app changed the text since we wrote it, the new text is the original
    const base = written.get(n) === n.data && origText.has(n) ? origText.get(n) : n.data;
    const out = isUiText(n) || origText.has(n) ? swap(base, isUiText(n) ? st.rules : []) : base;
    if (out !== n.data) n.data = out;
    if (out !== base) { origText.set(n, base); written.set(n, out); } else { origText.delete(n); written.delete(n); }
  } else if (n.nodeType === 1) {
    if (n.closest("[data-no-text-override]")) return;
    let rec = origAttr.get(n);
    for (const a of ATTRS) {
      const v = n.getAttribute(a); if (!v) continue;
      const base = rec?.[a] && rec[a].written === v ? rec[a].orig : v;
      const out = swap(base, st.rules);
      if (out !== v) n.setAttribute(a, out);
      if (out !== base) { rec = rec || {}; rec[a] = { orig: base, written: out }; origAttr.set(n, rec); } else if (rec) delete rec[a];
    }
    if (SKIP.has(n.tagName)) return;
    n.childNodes.forEach(c => fix(c, st));
  }
}

export function setTextRules(list, doc) {
  doc = doc || (typeof document !== "undefined" ? document : null);
  if (!doc || !doc.body) return;
  const rules = (Array.isArray(list) ? list : []).filter(r => r && r.from && typeof r.to === "string").map(r => ({ from: String(r.from).slice(0, 200), to: String(r.to).slice(0, 200), sub: !!r.sub }));
  let st = docs.get(doc);
  if (!st) { st = { obs: null, raf: 0, rules: [] }; docs.set(doc, st); }
  st.rules = rules;
  if (st.obs) { st.obs.disconnect(); st.obs = null; }
  fix(doc.body, st);              // also undoes rules that were removed
  if (!rules.length) return;
  const win = doc.defaultView || window;
  st.obs = new win.MutationObserver(ms => {
    win.cancelAnimationFrame(st.raf);
    st.raf = win.requestAnimationFrame(() => { ms.forEach(m => { if (m.type === "characterData") fix(m.target, st); else m.addedNodes.forEach(c => fix(c, st)); }); });
  });
  st.obs.observe(doc.body, { childList: true, subtree: true, characterData: true });
}
