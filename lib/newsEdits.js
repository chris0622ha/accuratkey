// Admin edits to the changelog, stored in config/site.news / config/site.adminNews:
// { edits:{[id]:{title?,items?}}, hidden:[id], extra:[{id,at,title,items}] }
import { versionize } from "./version";
export function applyNews(list, cfg) {
  if (!cfg) return versionize(list);
  const hidden = new Set(cfg.hidden || []);
  const edits = cfg.edits || {};
  const merged = versionize([...(cfg.extra || []), ...list].filter(Boolean)).filter(e => !hidden.has(e.id));
  return merged
    .map(e => { const x = edits[e.id]; return x ? { ...e, title: x.title ?? e.title, items: x.items?.length ? x.items : e.items } : e; })
    .filter(e => e.items && e.items.length)
    .sort((a, b) => new Date(b.at) - new Date(a.at));
}
