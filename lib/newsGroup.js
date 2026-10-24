// Combine release-note entries that happened on the same (US Eastern) day into one, and show only the date.
const dayOf = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const label = (iso) => new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
export function groupByDay(list) {
  const out = [];
  for (const e of list) {
    const d = dayOf(e.at);
    let g = out.find(x => x.day === d);
    if (!g) { g = { day: d, id: e.id, v: e.v, date: label(e.at), titles: [], items: [] }; out.push(g); }
    g.titles.push(e.title);
    for (const i of e.items) if (!g.items.includes(i)) g.items.push(i);
  }
  return out.map(g => ({ ...g, title: g.titles.length === 1 ? g.titles[0] : "Updates" }));
}
