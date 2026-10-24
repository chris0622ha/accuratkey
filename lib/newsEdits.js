// Admin edits to the changelog, stored in config/site.news / config/site.adminNews:
// { edits:{[id]:{title?,items?}}, hidden:[id], extra:[{id,at,title,items}] }
export function applyNews(list, cfg) {
  if (!cfg) return list;
  const hidden = new Set(cfg.hidden || []);
  const edits = cfg.edits || {};
  const merged = [...(cfg.extra || []), ...list].filter(e => e && !hidden.has(e.id));
  return merged
    .map(e => { const x = edits[e.id]; return x ? { ...e, title: x.title ?? e.title, items: x.items?.length ? x.items : e.items } : e; })
    .filter(e => e.items && e.items.length)
    .sort((a, b) => new Date(b.at) - new Date(a.at));
}
