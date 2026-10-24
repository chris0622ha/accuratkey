// Version numbers for the changelog and the app.
// MAJOR.MINOR.PATCH, worked out from the changelog itself so it can never drift:
//   MAJOR  = bumped by hand below for a big redesign or breaking change
//   MINOR  = which release day this is (1 for the first day in the changelog, 2 for the next...)
//   PATCH  = nth update on that same day, starting at 0
// An entry may set its own `v` to override. Adding a changelog entry is what releases a new version.
export const MAJOR = 1;
const dayOf = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

// Returns the same list (same order) with a `v` on every entry.
export function versionize(list) {
  const asc = [...list].sort((a, b) => new Date(a.at) - new Date(b.at));
  const v = new Map(); let minor = 0, day = "", patch = 0;
  for (const e of asc) {
    const d = dayOf(e.at);
    if (d !== day) { day = d; minor++; patch = 0; } else patch++;
    v.set(e.id, e.v || `${MAJOR}.${minor}.${patch}`);
  }
  return list.map(e => ({ ...e, v: v.get(e.id) }));
}
export const latestVersion = (list) => (versionize(list).sort((a, b) => new Date(b.at) - new Date(a.at))[0] || {}).v || `${MAJOR}.0.0`;
export const BUILD = process.env.NEXT_PUBLIC_BUILD || "";
