import { db, auth, addNotification, getModeration } from "./firebase";
import { moderate } from "./moderation";
import { collection, doc, addDoc, where, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";

export const BADGES = [
  { id: "good", label: "Good", color: "#60a5fa" },
  { id: "great", label: "Great", color: "#34d399" },
  { id: "excellent", label: "Excellent", color: "#fbbf24" },
  { id: "outstanding", label: "Outstanding", color: "#f97316" },
  { id: "legendary", label: "Legendary", color: "#c084fc" },
  { id: "staff", label: "Staff pick", color: "#f472b6" },
];
// Suggested Keys reward when approving a set with this badge (admins can change it).
export const BADGE_REWARD = { good: 2, great: 4, excellent: 6, outstanding: 8, legendary: 12, staff: 5 };
export const badgeInfo = id => BADGES.find(b => b.id === id) || null;

export const LIMITS = { titleMin: 3, titleMax: 40, minWords: 10, maxWords: 100, maxWordLen: 24 };
// Small first-pass filter only — an admin reviews every submission before it is public.
const STRONG = ["fuck","shit","bitch","cunt","nigg","faggot","pussy","whore","nazi"]; // matched anywhere
const EXACT = new Set(["fag","rape","porn","sex","dick","cock","slut","kill","suicide","anal","nude","nudes"]); // whole word only
const bad = s => s.toLowerCase().split(/[^a-z]+/).some(w => EXACT.has(w) || STRONG.some(b => w.includes(b)));


export function parseWords(raw) {
  // Split on anything that isn't a letter, digit, apostrophe or hyphen (spaces, commas, newlines, periods, etc.),
  // and drop duplicates ignoring case.
  const seen = new Set(), out = [];
  for (const w of String(raw).replace(/[\u2018\u2019]/g, "'").split(/[^A-Za-z0-9'\-]+/)) {
    const t = w.replace(/^['-]+|['-]+$/g, "");
    if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
  }
  return out;
}
// returns an error string, or null when valid
export function validateSubmission(title, words) {
  const t = title.trim();
  if (t.length < LIMITS.titleMin || t.length > LIMITS.titleMax) return `Title must be ${LIMITS.titleMin}-${LIMITS.titleMax} characters.`;
  if (!/^[A-Za-z0-9 '\-!&.,]+$/.test(t)) return "Title can only use letters, numbers and basic punctuation.";
  if (words.length < LIMITS.minWords) return `You have ${words.length} different word${words.length===1?"":"s"} - add at least ${LIMITS.minWords} (repeats are only counted once).`;
  if (words.length > LIMITS.maxWords) return `At most ${LIMITS.maxWords} words.`;
  if (words.some(w => w.length > LIMITS.maxWordLen || !/^[A-Za-z0-9'\-]+$/.test(w))) return `Words can only use letters, numbers, ' and -, up to ${LIMITS.maxWordLen} characters.`;
  if (bad(t) || words.some(bad)) return "That list contains words we can't accept.";
  return null;
}

// Pending submission: doc id = submitter uid, so each person has at most one pending set.
// The uid is stored only so an admin can handle abuse; it is never shown publicly and the
// whole document is deleted on approve/reject.
export async function submitWordSet(title, words) {
  const u = auth.currentUser;
  if (!u) throw new Error("Sign in first");
  const err = validateSubmission(title, words);
  if (err) throw new Error(err);
  const cfg = await getModeration();
  const flags = moderate(title.trim(), words, cfg);
  if (flags.length && cfg.autoReject) {
    // Rejected before it is stored. Tell the user what to fix (without echoing other people's data).
    throw new Error("Auto-moderation: this set can't be accepted (" + flags.join("; ") + "). Please change it and try again.");
  }
  const sub = { title: title.trim(), words, uid: u.uid, createdAt: serverTimestamp() };
  if (flags.length) sub.flags = flags.slice(0, 6);
  await setDoc(doc(db, "wordSetSubmissions", u.uid), sub);
}
export async function getPublicWordSets() {
  try {
    const snap = await getDocs(query(collection(db, "wordSets"), orderBy("createdAt", "desc"), limit(100)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
}
// ── admin (pass adminDb) ──
export async function adminListSubmissions(adb) {
  const snap = await getDocs(query(collection(adb, "wordSetSubmissions"), orderBy("createdAt", "asc"), limit(100)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function adminApprove(adb, sub, { title, words, badge, rewardKeys }) {
  const ref = doc(collection(adb, "wordSets"));
  await setDoc(ref, { title: title.trim(), words, badge: badge || null, rewardKeys: clampReward(rewardKeys), createdAt: serverTimestamp() }); // no uid, ever
  // Admin-only record so the owner can be told if the set is later removed. Never public.
  await setDoc(doc(adb, "wordSetOwners", ref.id), { uid: sub.uid || sub.id, title: title.trim() }).catch(() => {});
  await deleteDoc(doc(adb, "wordSetSubmissions", sub.id));
  const b = badgeInfo(badge);
  return await addNotification(sub.uid || sub.id, { type: "wordset_approved", title: "Your word set was approved!", body: `"${title.trim()}" is now live in the Practice lab for everyone${b ? ` with the ${b.label} badge` : ""}.` }, adb).catch(() => false);
}
const cleanReason = r => String(r || "").replace(/\s+/g, " ").trim().slice(0, 140);
export async function adminReject(adb, sub, reason) {
  await deleteDoc(doc(adb, "wordSetSubmissions", sub.id));
  const why = cleanReason(reason);
  return await addNotification(sub.uid || sub.id, { type: "wordset_rejected", title: "Word set not approved", body: `"${sub.title}" wasn't approved this time.${why ? " Reason: " + why + "." : ""} You're welcome to submit another.` }, adb).catch(() => false);
}
export const clampReward = (n) => { const v = Math.floor(Number(n)); return Number.isFinite(v) && v > 0 ? Math.min(50, v) : 0; };
export const adminSetReward = (adb, id, n) => updateDoc(doc(adb, "wordSets", id), { rewardKeys: clampReward(n) });
export const adminSetBadge = (adb, id, badge) => updateDoc(doc(adb, "wordSets", id), { badge: badge || null });
// Removes a published set. If we know who submitted it (sets approved after owner records were added), notify them.
// Returns true/false for the notification, or null when there was nobody to notify.
export async function adminDeleteSet(adb, id, reason, title) {
  let owner = null;
  try { const o = await getDoc(doc(adb, "wordSetOwners", id)); if (o.exists()) owner = o.data(); } catch {}
  await deleteDoc(doc(adb, "wordSets", id));
  if (!owner || !owner.uid) return null;
  await deleteDoc(doc(adb, "wordSetOwners", id)).catch(() => {});
  const why = cleanReason(reason);
  return await addNotification(owner.uid, { type: "wordset_removed", title: "Your word set was removed", body: `"${owner.title || title || "Your set"}" was removed from the Practice lab.${why ? " Reason: " + why + "." : ""}` }, adb).catch(() => false);
}
export async function adminListPublic(adb) {
  const snap = await getDocs(query(collection(adb, "wordSets"), orderBy("createdAt", "desc"), limit(200)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Once-per-day-per-set Keys reward claims, remembered on this device (the daily Keys cap still applies server-side).
const ckey = (pid) => `ak_setclaim_${pid || "guest"}`;
const today = () => new Date().toISOString().slice(0, 10);
export function setClaimedToday(pid, setId) { try { return (JSON.parse(localStorage.getItem(ckey(pid)) || "{}"))[setId] === today(); } catch { return false; } }
export function markSetClaimed(pid, setId) { try { const o = JSON.parse(localStorage.getItem(ckey(pid)) || "{}"); o[setId] = today(); localStorage.setItem(ckey(pid), JSON.stringify(o)); } catch {} }

// One starter set per rating, so the Sets tab has something at every tier. Admin-only; skips titles that already exist.
export const STARTER_SETS = [
  { badge: "good", title: "Home Row Warmup", words: "ask sad fad dad lad all fall hall glad flask salad shall gas has jag had lag".split(" ") },
  { badge: "great", title: "Everyday Words", words: "table window garden pencil button basket family kitchen morning circle butter simple orange pocket planet".split(" ") },
  { badge: "excellent", title: "Tricky Double Letters", words: "balloon coffee message success tennis village summer different address happen accept support follow letter bubble".split(" ") },
  { badge: "outstanding", title: "Long Word Workout", words: "adventure beautiful celebrate dangerous education important knowledge permanent wonderful particular environment temperature".split(" ") },
  { badge: "legendary", title: "Typist Tongue Twisters", words: "rhythm sixth twelfth strengths schedule necessary questionnaire exaggerate occurrence conscientious bureaucracy pronunciation".split(" ") },
  { badge: "staff", title: "Staff Pick - Calm Focus", words: "quiet steady breathe gentle patience balance focus smooth steps slowly clear mindful rhythm flow ground".split(" ") },
];
export async function adminSeedStarters(adb) {
  const existing = new Set((await adminListPublic(adb)).map(p => p.title));
  let added = 0;
  for (const st of STARTER_SETS) {
    if (existing.has(st.title)) continue;
    const words = parseWords(st.words.join(" "));
    if (validateSubmission(st.title, words)) continue;
    await setDoc(doc(collection(adb, "wordSets")), { title: st.title, words, badge: st.badge, rewardKeys: BADGE_REWARD[st.badge] || 0, createdAt: serverTimestamp() });
    added++;
  }
  return added;
}

// ── Set history (admin-only, stored on the owner record) ──
const HIST_MAX = 10;
async function readOwner(adb, id) {
  try { const o = await getDoc(doc(adb, "wordSetOwners", id)); return o.exists() ? o.data() : null; } catch { return null; }
}
const pushHistory = (hist, entry) => [entry, ...(Array.isArray(hist) ? hist : [])].slice(0, HIST_MAX);

// Admin: edit a published community set's title and words (same rules as a submission).
// The version being replaced is saved to the set's history, and the creator (if known) is told.
// Returns true/false for the notification, or null when the creator isn't known.
export async function adminUpdateSet(adb, id, title, words, prev) {
  const err = validateSubmission(title, words);
  if (err) throw new Error(err);
  const owner = await readOwner(adb, id);
  await updateDoc(doc(adb, "wordSets", id), { title: title.trim(), words });
  if (prev) await setDoc(doc(adb, "wordSetOwners", id), { history: pushHistory(owner?.history, { title: prev.title, words: prev.words, at: Date.now() }) }, { merge: true }).catch(() => {});
  if (!owner || !owner.uid) return null;
  const was = prev?.title || owner.title || title;
  return await addNotification(owner.uid, { type: "wordset_edited", setId: id, title: "An admin edited your word set", body: `"${was}" was edited${was !== title.trim() ? ` and is now "${title.trim()}"` : ""}. If you'd like the original back, you can request a revert.` }, adb).catch(() => false);
}
export async function adminGetHistory(adb, id) {
  const o = await readOwner(adb, id);
  return Array.isArray(o?.history) ? o.history : [];
}
// Admin: restore a saved version. The current version is saved to history first, so this can be undone.
export async function adminRestoreVersion(adb, id, index, current) {
  const owner = await readOwner(adb, id);
  const v = owner?.history?.[index];
  if (!v) throw new Error("That version no longer exists");
  const err = validateSubmission(v.title, v.words);
  if (err) throw new Error(err);
  await updateDoc(doc(adb, "wordSets", id), { title: v.title, words: v.words });
  const rest = owner.history.filter((_, i) => i !== index);
  await setDoc(doc(adb, "wordSetOwners", id), { history: pushHistory(rest, { title: current.title, words: current.words, at: Date.now() }) }, { merge: true });
  await adminClearRevertRequests(adb, id);
  if (!owner.uid) return null;
  return await addNotification(owner.uid, { type: "wordset_reverted", title: "Your word set was restored", body: `"${v.title}" was put back to an earlier version.` }, adb).catch(() => false);
}

// ── Revert requests: any signed-in creator can file one; only admins can read them (activityLog rules) ──
export async function requestSetRevert(uid, setId, note) {
  await addDoc(collection(db, "activityLog"), { action: "wordset_revert_request", adminUid: null, targetUid: uid, setId: String(setId).slice(0, 40), detail: String(note || "").slice(0, 200), createdAt: serverTimestamp() });
}
export async function adminListRevertRequests(adb) {
  const snap = await getDocs(query(collection(adb, "activityLog"), where("action", "==", "wordset_revert_request"), limit(100)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function adminClearRevertRequests(adb, setId) {
  const all = await adminListRevertRequests(adb);
  await Promise.all(all.filter(r => r.setId === setId).map(r => deleteDoc(doc(adb, "activityLog", r.id)).catch(() => {})));
}
