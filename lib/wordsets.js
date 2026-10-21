import { db, auth } from "./firebase";
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";

export const BADGES = [
  { id: "good", label: "Good", color: "#60a5fa" },
  { id: "great", label: "Great", color: "#34d399" },
  { id: "excellent", label: "Excellent", color: "#fbbf24" },
  { id: "outstanding", label: "Outstanding", color: "#f97316" },
  { id: "legendary", label: "Legendary", color: "#c084fc" },
  { id: "staff", label: "Staff pick", color: "#f472b6" },
];
export const badgeInfo = id => BADGES.find(b => b.id === id) || null;

export const LIMITS = { titleMin: 3, titleMax: 40, minWords: 10, maxWords: 100, maxWordLen: 24 };
// Small first-pass filter only — an admin reviews every submission before it is public.
const STRONG = ["fuck","shit","bitch","cunt","nigg","faggot","pussy","whore","nazi"]; // matched anywhere
const EXACT = new Set(["fag","rape","porn","sex","dick","cock","slut","kill","suicide","anal","nude","nudes"]); // whole word only
const bad = s => s.toLowerCase().split(/[^a-z]+/).some(w => EXACT.has(w) || STRONG.some(b => w.includes(b)));


export function parseWords(raw) {
  return [...new Set(String(raw).split(/[\s,;]+/).map(w => w.trim()).filter(Boolean))];
}
// returns an error string, or null when valid
export function validateSubmission(title, words) {
  const t = title.trim();
  if (t.length < LIMITS.titleMin || t.length > LIMITS.titleMax) return `Title must be ${LIMITS.titleMin}-${LIMITS.titleMax} characters.`;
  if (!/^[A-Za-z0-9 '\-!&.,]+$/.test(t)) return "Title can only use letters, numbers and basic punctuation.";
  if (words.length < LIMITS.minWords) return `Add at least ${LIMITS.minWords} different words.`;
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
  await setDoc(doc(db, "wordSetSubmissions", u.uid), { title: title.trim(), words, uid: u.uid, createdAt: serverTimestamp() });
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
export async function adminApprove(adb, sub, { title, words, badge }) {
  const ref = doc(collection(adb, "wordSets"));
  await setDoc(ref, { title: title.trim(), words, badge: badge || null, createdAt: serverTimestamp() }); // no uid, ever
  await deleteDoc(doc(adb, "wordSetSubmissions", sub.id));
}
export const adminReject = (adb, sub) => deleteDoc(doc(adb, "wordSetSubmissions", sub.id));
export const adminSetBadge = (adb, id, badge) => updateDoc(doc(adb, "wordSets", id), { badge: badge || null });
export const adminDeleteSet = (adb, id) => deleteDoc(doc(adb, "wordSets", id));
export async function adminListPublic(adb) {
  const snap = await getDocs(query(collection(adb, "wordSets"), orderBy("createdAt", "desc"), limit(200)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
