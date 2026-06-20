import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, browserPopupRedirectResolver } from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, addDoc,
  collection, query, orderBy, limit, getDocs, deleteDoc,
  serverTimestamp, writeBatch, onSnapshot, where, Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDRVjdj7VbgOQLdHIM_zUKhkLEunX_dZNM",
  authDomain: "accuratkey.firebaseapp.com",
  projectId: "accuratkey",
  storageBucket: "accuratkey.firebasestorage.app",
  messagingSenderId: "1078720684864",
  appId: "1:1078720684864:web:ba923d63db84ba977d90a5",
  measurementId: "G-2C3P7B6KZK"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// ─── Isolated admin login ───────────────────────────────────────────────────
// The admin page has its own completely separate Firebase Auth session AND
// its own Firestore connection, bound to a second named app instance.
// Firestore's auth context is tied to whichever app instance it was created
// from, so admin functions must use adminDb (not db) for every read/write —
// that's what actually makes signing in/out on the admin page leave the
// game's session in any tab untouched.
//
// IMPORTANT: initializeAuth() with browser-specific persistence/resolver
// options throws if it ever runs outside a real browser. Next.js prerenders
// the initial shell of every page (even "use client" pages) on the server
// at build time, so anything at module scope runs there too. We guard
// creation behind `typeof window !== 'undefined'` and only build the real
// instances the first time they're actually requested — which in practice
// only happens client-side, from useEffect/event handlers in admin/page.jsx.
const ADMIN_APP_NAME = "accuratkey-admin";
let _adminApp = null;
let _adminAuthInstance = null;
let _adminDbInstance = null;

function ensureAdminApp() {
  if (_adminApp) return _adminApp;
  _adminApp = getApps().find(a => a.name === ADMIN_APP_NAME) || initializeApp(firebaseConfig, ADMIN_APP_NAME);
  return _adminApp;
}

// Call this to get the real admin Auth instance. Only safe/meaningful in the
// browser — admin/page.jsx only ever calls this from useEffect or event
// handlers, never at module scope, so this is fine in practice.
export function getAdminAuth() {
  if (typeof window === 'undefined') {
    throw new Error('getAdminAuth() can only be called in the browser');
  }
  if (_adminAuthInstance) return _adminAuthInstance;
  _adminAuthInstance = initializeAuth(ensureAdminApp(), {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  return _adminAuthInstance;
}

// Call this to get the real admin Firestore instance.
export function getAdminDb() {
  if (_adminDbInstance) return _adminDbInstance;
  _adminDbInstance = getFirestore(ensureAdminApp());
  return _adminDbInstance;
}

// ─── Account helpers ──────────────────────────────────────────────────────────

export async function getAccount(uid) {
  const snap = await getDoc(doc(db, 'accounts', uid));
  return snap.exists() ? snap.data() : null;
}

export async function createAccount(uid, email) {
  const ref = doc(db, 'accounts', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { email, createdAt: serverTimestamp() });
  }
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function getProfiles(uid) {
  const snap = await getDocs(collection(db, 'accounts', uid, 'profiles'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProfile(uid, profileId) {
  const snap = await getDoc(doc(db, 'accounts', uid, 'profiles', profileId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createProfile(uid, data) {
  const age = calcAge(data.birthday);
  const ref = await addDoc(collection(db, 'accounts', uid, 'profiles'), {
    name: data.name || 'Player',
    birthday: data.birthday,
    age,
    avatar: data.avatar || 'key',
    photoURL: data.photoURL || null,
    currentLevel: data.startLevel || 1,
    highestUnlocked: data.startLevel || 1,
    keys: 0,
    totalSessions: 0,
    totalCharsTyped: 0,
    bestWpm: 0,
    avgAccuracy: 0,
    favoriteLayout: data.layout || 'qwerty',
    layoutCounts: {},
    createdAt: serverTimestamp(),
    birthdayWished: null,
  });
  return ref.id;
}

export async function updateProfile(uid, profileId, fields) {
  await updateDoc(doc(db, 'accounts', uid, 'profiles', profileId), fields);
}

export async function deleteProfile(uid, profileId) {
  await deleteDoc(doc(db, 'accounts', uid, 'profiles', profileId));
}

// ─── Session helpers ──────────────────────────────────────────────────────────

// Shared daily Keys cap logic — max 500 Keys/day per profile to prevent farming.
// Used by both normal session rewards and bonus-key grants (combo multipliers, etc.)
// so no earning path can bypass the cap.
const DAILY_KEYS_CAP = 500;
function applyDailyKeysCap(profileData, requestedAmount) {
  const todayET = getETDateStr();
  const dailyReset = profileData.dailyKeysDate !== todayET;
  const dailyKeysToday = dailyReset ? 0 : (profileData.dailyKeysEarned || 0);
  const actualEarned = Math.max(0, Math.min(requestedAmount, DAILY_KEYS_CAP - dailyKeysToday));
  return {
    actualEarned,
    newDailyKeys: dailyKeysToday + actualEarned,
    todayET,
  };
}

// Grants bonus Keys (e.g. combo multipliers) outside the normal session flow,
// while still respecting the daily earning cap. Re-reads the profile server-side
// so the cap can't be bypassed by stale client state.
export async function addBonusKeys(uid, profileId, amount) {
  if (!amount || amount <= 0) return 0;
  const profileRef = doc(db, 'accounts', uid, 'profiles', profileId);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) return 0;
  const p = snap.data();
  const { actualEarned, newDailyKeys, todayET } = applyDailyKeysCap(p, amount);
  if (actualEarned <= 0) return 0;
  await updateDoc(profileRef, {
    keys: (p.keys || 0) + actualEarned,
    dailyKeysEarned: newDailyKeys,
    dailyKeysDate: todayET,
  });
  return actualEarned;
}

export async function saveSession(uid, profileId, session) {
  await addDoc(collection(db, 'accounts', uid, 'profiles', profileId, 'sessions'), {
    ...session,
    createdAt: serverTimestamp(),
  });

  const profileRef = doc(db, 'accounts', uid, 'profiles', profileId);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) return;

  const p = snap.data();
  const newSessions = (p.totalSessions || 0) + 1;
  const newChars = (p.totalCharsTyped || 0) + (session.chars || 0);
  const newBest = Math.max(p.bestWpm || 0, session.wpm);
  const newAvgAcc = Math.round(
    ((p.avgAccuracy || 0) * (newSessions - 1) + session.accuracy) / newSessions
  );
  const layoutCounts = { ...(p.layoutCounts || {}) };
  layoutCounts[session.layout] = (layoutCounts[session.layout] || 0) + 1;
  const favoriteLayout = Object.entries(layoutCounts).sort((a, b) => b[1] - a[1])[0][0];

  const keysEarned = session.passed ? 10 + Math.floor(session.wpm / 10) : 3;
  const { actualEarned, newDailyKeys, todayET } = applyDailyKeysCap(p, keysEarned);
  const newKeys = (p.keys || 0) + actualEarned;

  let newHighest = p.highestUnlocked || 1;
  let newCurrent = p.currentLevel || 1;
  if (session.passed && session.level >= newHighest) {
    newHighest = session.level + 1;
    newCurrent = session.level + 1;
  }

  await updateDoc(profileRef, {
    bestWpm: newBest,
    totalSessions: newSessions,
    totalCharsTyped: newChars,
    avgAccuracy: newAvgAcc,
    favoriteLayout,
    layoutCounts,
    keys: newKeys,
    dailyKeysEarned: (newDailyKeys || 0),
    dailyKeysDate: todayET,
    highestUnlocked: newHighest,
    currentLevel: newCurrent,
  });

  return actualEarned;
}

export async function getRecentSessions(uid, profileId, n = 10) {
  const q = query(
    collection(db, 'accounts', uid, 'profiles', profileId, 'sessions'),
    orderBy('createdAt', 'desc'),
    limit(n)
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── COPPA: local-only progress for restricted (under-13) profiles ────────────
// Mirrors saveSession()/addBonusKeys() exactly, but reads/writes a localStorage
// blob instead of Firestore. Used whenever isProfileRestricted(activeProfile)
// is true, so a child can still earn Keys, unlock levels, and see their best
// WPM — none of it is ever sent to a server. Cleared if the browser/profile
// storage is cleared, same as any other local-only app state.
const LOCAL_PROGRESS_PREFIX = 'ak_local_progress_';

function readLocalProgress(profileId) {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_PREFIX + profileId);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeLocalProgress(profileId, data) {
  try { localStorage.setItem(LOCAL_PROGRESS_PREFIX + profileId, JSON.stringify(data)); } catch {}
}

export function getProfileLocal(profileId, fallback) {
  const local = readLocalProgress(profileId);
  // Merge over the original profile doc (name/avatar/birthday/etc. came from
  // Firestore at creation time and don't change here) so the rest of the UI
  // can keep reading activeProfile the same way regardless of mode.
  return { ...(fallback || {}), ...local };
}

export function saveSessionLocal(profileId, profileSnapshot, session) {
  const p = getProfileLocal(profileId, profileSnapshot);

  const newSessions = (p.totalSessions || 0) + 1;
  const newChars = (p.totalCharsTyped || 0) + (session.chars || 0);
  const newBest = Math.max(p.bestWpm || 0, session.wpm);
  const newAvgAcc = Math.round(
    ((p.avgAccuracy || 0) * (newSessions - 1) + session.accuracy) / newSessions
  );
  const layoutCounts = { ...(p.layoutCounts || {}) };
  layoutCounts[session.layout] = (layoutCounts[session.layout] || 0) + 1;
  const favoriteLayout = Object.entries(layoutCounts).sort((a, b) => b[1] - a[1])[0][0];

  const keysEarned = session.passed ? 10 + Math.floor(session.wpm / 10) : 3;
  const { actualEarned, newDailyKeys, todayET } = applyDailyKeysCap(p, keysEarned);
  const newKeys = (p.keys || 0) + actualEarned;

  let newHighest = p.highestUnlocked || 1;
  let newCurrent = p.currentLevel || 1;
  if (session.passed && session.level >= newHighest) {
    newHighest = session.level + 1;
    newCurrent = session.level + 1;
  }

  const recentSessions = [{ ...session, createdAt: new Date().toISOString() }, ...(p.recentSessions || [])].slice(0, 10);

  const updated = {
    ...p,
    bestWpm: newBest,
    totalSessions: newSessions,
    totalCharsTyped: newChars,
    avgAccuracy: newAvgAcc,
    favoriteLayout,
    layoutCounts,
    keys: newKeys,
    dailyKeysEarned: (newDailyKeys || 0),
    dailyKeysDate: todayET,
    highestUnlocked: newHighest,
    currentLevel: newCurrent,
    recentSessions,
  };
  writeLocalProgress(profileId, updated);
  return { actualEarned, updatedProfile: updated };
}

export function addBonusKeysLocal(profileId, profileSnapshot, amount) {
  if (!amount || amount <= 0) return { actualEarned: 0, updatedProfile: getProfileLocal(profileId, profileSnapshot) };
  const p = getProfileLocal(profileId, profileSnapshot);
  const { actualEarned, newDailyKeys, todayET } = applyDailyKeysCap(p, amount);
  const updated = { ...p, keys: (p.keys || 0) + actualEarned, dailyKeysEarned: newDailyKeys, dailyKeysDate: todayET };
  writeLocalProgress(profileId, updated);
  return { actualEarned, updatedProfile: updated };
}

export function updateProfileLocal(profileId, profileSnapshot, fields) {
  const p = getProfileLocal(profileId, profileSnapshot);
  const updated = { ...p, ...fields };
  writeLocalProgress(profileId, updated);
  return updated;
}

export function getRecentSessionsLocal(profileId, profileSnapshot, n = 10) {
  const p = getProfileLocal(profileId, profileSnapshot);
  return (p.recentSessions || []).slice(0, n);
}

// ─── Birthday check ────────────────────────────────────────────────────────────

export function calcAge(birthday) {
  if (!birthday) return 0;
  const today = new Date();
  const bday = new Date(birthday);
  let age = today.getFullYear() - bday.getFullYear();
  const m = today.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--;
  return Math.max(0, age);
}

export function isBirthdayToday(birthday) {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
}

// ─── COPPA: profile-level restriction ──────────────────────────────────────────
// A profile is "restricted" once its birthday indicates the person is under 13.
// Once restricted, that profile cannot have a public username, cannot appear
// on the leaderboard/u/[username] page, and gameplay progress must not sync
// to Firebase beyond what's already on the profile doc at the time of
// restriction — going forward it runs in local-only mode. Profile-admin
// profiles (the account owner acting as themselves) are never restricted,
// since they represent the adult who created the account, not a child.
export function isProfileRestricted(profile) {
  if (!profile) return false;
  if (profile.isProfileAdmin) return false;
  if (!profile.birthday) return false;
  return calcAge(profile.birthday) < 13;
}

export async function checkAndUpdateBirthday(uid, profileId, profile) {
  if (!isBirthdayToday(profile.birthday)) return false;
  const thisYear = new Date().getFullYear();
  if (profile.birthdayWished === thisYear) return false;
  const newAge = calcAge(profile.birthday);
  await updateDoc(doc(db, 'accounts', uid, 'profiles', profileId), {
    age: newAge,
    birthdayWished: thisYear,
  });
  return true;
}

// ─── QR Photo Upload helpers ──────────────────────────────────────────────────
// Creates a temp doc in photoUploads/{token} that the phone writes to.
// Desktop polls via onSnapshot until photo arrives (max 5 min TTL).

export async function createPhotoUploadToken() {
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  await setDoc(doc(db, 'photoUploads', token), {
    createdAt: serverTimestamp(),
    photoURL: null,
    done: false,
  });
  return token;
}

export function listenForPhotoUpload(token, onPhoto, onTimeout) {
  const ref = doc(db, 'photoUploads', token);
  const unsub = onSnapshot(ref, (snap) => {
    const data = snap.data();
    if (data?.done && data?.photoURL) {
      unsub();
      onPhoto(data.photoURL);
    }
  });
  // Auto-cancel after 5 minutes
  const timer = setTimeout(() => {
    unsub();
    onTimeout();
  }, 5 * 60 * 1000);
  return () => { unsub(); clearTimeout(timer); };
}

export async function submitPhotoUpload(token, photoURL) {
  await updateDoc(doc(db, 'photoUploads', token), { photoURL, done: true });
}

export async function deletePhotoUploadToken(token) {
  await deleteDoc(doc(db, 'photoUploads', token)).catch(() => {});
}

// ─── Anti-cheat thresholds ──────────────────────────────────────────────────────
// Shared by both the per-level leaderboard and the daily challenge leaderboard.
const MAX_LEGIT_WPM = 350;
const MIN_LEGIT_ACCURACY = 50;

// ─── Leaderboard ──────────────────────────────────────────────────────────────
// leaderboard/{levelId}/scores/{uid} — one doc per user per level (best score)

export async function submitLeaderboardEntry(levelId, { wpm, accuracy, name, avatar, uid }) {
  const ref = doc(db, 'leaderboard', String(levelId), 'scores', uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().wpm >= wpm) return { suspicious: false };
  const suspicious = wpm > MAX_LEGIT_WPM || accuracy < MIN_LEGIT_ACCURACY || accuracy > 100;
  await setDoc(ref, { wpm, accuracy, name, avatar, uid, updatedAt: serverTimestamp(), removed: suspicious, suspicious });
  if (suspicious) {
    await addDoc(collection(db, 'flaggedScores'), { type: 'level', uid, username: name, wpm, accuracy, levelId: String(levelId), reason: `WPM ${wpm} exceeds maximum`, status: 'pending', createdAt: serverTimestamp() });
  }
  return { suspicious };
}

export async function getLeaderboard(levelId) {
  const q = query(
    collection(db, 'leaderboard', String(levelId), 'scores'),
    orderBy('wpm', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data()).filter(s => !s.removed);
}

// ─── Admin system ─────────────────────────────────────────────────────────────
// admins/{uid} → { uid, grantedBy, grantedAt }
// bans/{uid}   → { uid, reason, bannedBy, bannedAt, permanent }

export async function isAdmin(uid, firestoreDb = db) {
  const snap = await getDoc(doc(firestoreDb, 'admins', uid));
  return snap.exists();
}

// Checks whether ANY profile under this account has Profile Admin status.
// Used by the /admin page's sign-in gate, alongside the account-level
// isAdmin() check above — either one is sufficient to enter the panel.
export async function hasAnyProfileAdmin(uid, firestoreDb = db) {
  const profiles = await getProfilesForAdmin(uid, firestoreDb);
  return (profiles || []).some(p => p.isProfileAdmin === true);
}

export async function getAllAdmins(firestoreDb = db) {
  const snap = await getDocs(collection(firestoreDb, 'admins'));
  return snap.docs.map(d => d.data());
}

export async function grantAdmin(uid, grantedByUid, firestoreDb = db) {
  await setDoc(doc(firestoreDb, 'admins', uid), { uid, grantedBy: grantedByUid, grantedAt: serverTimestamp() });
}

export async function revokeAdmin(uid, firestoreDb = db) {
  await deleteDoc(doc(firestoreDb, 'admins', uid));
}

export async function banUser(uid, { reason, bannedBy }, firestoreDb = db) {
  await setDoc(doc(firestoreDb, 'bans', uid), { uid, reason: reason || 'No reason given', bannedBy, bannedAt: serverTimestamp() });
}

export async function unbanUser(uid, firestoreDb = db) {
  await deleteDoc(doc(firestoreDb, 'bans', uid));
}

export async function getBan(uid) {
  const snap = await getDoc(doc(db, 'bans', uid));
  return snap.exists() ? snap.data() : null;
}

export async function getAllBans(firestoreDb = db) {
  const snap = await getDocs(collection(firestoreDb, 'bans'));
  return snap.docs.map(d => d.data());
}

export async function getAllUsers(firestoreDb = db) {
  const snap = await getDocs(collection(firestoreDb, 'accounts'));
  const users = [];
  for (const d of snap.docs) {
    const profiles = await getDocs(collection(firestoreDb, 'accounts', d.id, 'profiles'));
    users.push({
      uid: d.id,
      email: d.data().email,
      createdAt: d.data().createdAt,
      profiles: profiles.docs.map(p => ({ id: p.id, ...p.data() })),
    });
  }
  return users;
}

// ─── Username system ───────────────────────────────────────────────────────────
// usernames/{lowercase_username} → { uid, username, createdAt }
// accounts/{uid} → adds: username field

export async function checkUsernameAvailable(username) {
  const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  return !snap.exists();
}

export async function claimUsername(uid, username) {
  const lower = username.toLowerCase();
  const taken = await getDoc(doc(db, 'usernames', lower));
  if (taken.exists() && taken.data().uid !== uid) throw new Error('Username already taken');
  const batch = writeBatch(db);
  batch.set(doc(db, 'usernames', lower), { uid, username: lower, createdAt: serverTimestamp() });
  batch.update(doc(db, 'accounts', uid), { username: lower });
  await batch.commit();
}

export async function getUserByUsername(username) {
  const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!snap.exists()) return null;
  const uid = snap.data().uid;
  const acc = await getDoc(doc(db, 'accounts', uid));
  return acc.exists() ? { uid, ...acc.data() } : null;
}

export async function getUserByUid(uid) {
  const acc = await getDoc(doc(db, 'accounts', uid));
  return acc.exists() ? { uid, ...acc.data() } : null;
}

export async function changeUsername(uid, oldUsername, newUsername, keys) {
  if (keys < 5) throw new Error('Not enough keys (need 5)');
  const lower = newUsername.toLowerCase();
  const available = await checkUsernameAvailable(lower);
  if (!available) throw new Error('Username already taken');
  const batch = writeBatch(db);
  if (oldUsername) batch.delete(doc(db, 'usernames', oldUsername.toLowerCase()));
  batch.set(doc(db, 'usernames', lower), { uid, username: lower, createdAt: serverTimestamp() });
  batch.update(doc(db, 'accounts', uid), { username: lower });
  await batch.commit();
}

export async function getUsername(uid) {
  const snap = await getDoc(doc(db, 'accounts', uid));
  return snap.exists() ? snap.data().username || null : null;
}

// ─── Admin notes ───────────────────────────────────────────────────────────────
export async function setAdminNote(uid, note, adminUid, firestoreDb = db) {
  await setDoc(doc(firestoreDb, 'adminNotes', uid), { uid, note, updatedBy: adminUid, updatedAt: serverTimestamp() });
}

export async function getAdminNote(uid, firestoreDb = db) {
  const snap = await getDoc(doc(firestoreDb, 'adminNotes', uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Activity log ─────────────────────────────────────────────────────────────
export async function logActivity(action, { adminUid, targetUid, targetUsername, detail } = {}, firestoreDb = db) {
  await addDoc(collection(firestoreDb, 'activityLog'), {
    action, adminUid, targetUid: targetUid || null,
    targetUsername: targetUsername || null,
    detail: detail || null,
    createdAt: serverTimestamp(),
  });
}

export async function getActivityLog(limitN = 50, firestoreDb = db) {
  const q = query(collection(firestoreDb, 'activityLog'), orderBy('createdAt', 'desc'), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Maintenance mode ─────────────────────────────────────────────────────────
export async function setMaintenanceMode(enabled, message = '', triggers = {owner:true,admins:false,users:false}, firestoreDb = db) {
  await setDoc(doc(firestoreDb, 'config', 'maintenance'), { enabled, message, triggers, updatedAt: serverTimestamp() });
}

export async function getMaintenanceMode() {
  const snap = await getDoc(doc(db, 'config', 'maintenance'));
  return snap.exists() ? snap.data() : { enabled: false, message: '' };
}

// ─── Skip level (admin) ───────────────────────────────────────────────────────
export async function adminSkipLevel(targetUid, profileId, levelId, firestoreDb = db) {
  const ref = doc(firestoreDb, 'accounts', targetUid, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Profile not found');
  await updateDoc(ref, {
    highestUnlocked: Math.max(snap.data().highestUnlocked || 1, levelId),
    currentLevel: levelId,
  });
}
// ─── Add keys (admin) ─────────────────────────────────────────────────────────
export async function adminSetKeys(targetUid, profileId, amount, firestoreDb = db) {
  const ref = doc(firestoreDb, 'accounts', targetUid, 'profiles', profileId);
  await updateDoc(ref, { keys: amount });
  return amount;
}

export async function adminSetTrials(targetUid, profileId, count, firestoreDb = db) {
  // Set the trial count for a profile's current week
  const d = new Date(), jan1 = new Date(d.getFullYear(),0,1);
  const weekKey = `${d.getFullYear()}-w${Math.ceil((((d-jan1)/86400000)+jan1.getDay()+1)/7)}`;
  const ref = doc(firestoreDb, 'accounts', targetUid, 'profiles', profileId);
  await updateDoc(ref, { trialCount: count, trialWeek: weekKey });
  return count;
}

// Grants or revokes Profile Admin status on a specific profile. This is
// separate from account-level admin (admins/{uid}) — Profile Admin unlocks
// parental-gated features for one profile under an account, and (once
// granted) also lets that profile sign into the /admin panel.
export async function adminSetProfileAdmin(targetUid, profileId, isProfileAdmin, firestoreDb = db) {
  const ref = doc(firestoreDb, 'accounts', targetUid, 'profiles', profileId);
  await updateDoc(ref, { isProfileAdmin: !!isProfileAdmin });
  return !!isProfileAdmin;
}

export async function getProfilesForAdmin(targetUid, firestoreDb = db) {
  const snap = await getDocs(collection(firestoreDb, 'accounts', targetUid, 'profiles'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Admin expanded features ───────────────────────────────────────────────────

// Send password reset email
export async function adminSendPasswordReset(email) {
  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(auth, email);
}

// Get user's full session history
export async function getUserSessions(uid, firestoreDb = db) {
  const profiles = await getDocs(collection(firestoreDb, 'accounts', uid, 'profiles'));
  const allSessions = [];
  for (const p of profiles.docs) {
    const sessions = await getDocs(query(
      collection(firestoreDb, 'accounts', uid, 'profiles', p.id, 'sessions'),
      orderBy('createdAt', 'desc'), limit(50)
    ));
    sessions.docs.forEach(s => allSessions.push({ ...s.data(), profileName: p.data().name, profileId: p.id }));
  }
  return allSessions.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// Get last seen (most recent session)
export async function getUserLastSeen(uid, firestoreDb = db) {
  const profiles = await getDocs(collection(firestoreDb, 'accounts', uid, 'profiles'));
  let latest = null;
  for (const p of profiles.docs) {
    const q = query(collection(firestoreDb, 'accounts', uid, 'profiles', p.id, 'sessions'), orderBy('createdAt', 'desc'), limit(1));
    const s = await getDocs(q);
    if (!s.empty) {
      const t = s.docs[0].data().createdAt?.seconds || 0;
      if (!latest || t > latest) latest = t;
    }
  }
  return latest ? new Date(latest * 1000) : null;
}

// Warn user — shows popup on next login
export async function warnUser(uid, { message, warnedBy }, firestoreDb = db) {
  await setDoc(doc(firestoreDb, 'warnings', uid), { uid, message, warnedBy, warnedAt: serverTimestamp(), seen: false });
}

export async function clearWarning(uid) {
  await deleteDoc(doc(db, 'warnings', uid));
}

export async function getWarning(uid) {
  const snap = await getDoc(doc(db, 'warnings', uid));
  return snap.exists() ? snap.data() : null;
}

// Temp ban with expiry
export async function tempBanUser(uid, { reason, bannedBy, expiresAt }, firestoreDb = db) {
  await setDoc(doc(firestoreDb, 'bans', uid), { uid, reason: reason || 'No reason given', bannedBy, bannedAt: serverTimestamp(), expiresAt });
}

// App-wide stats
export async function getAppStats(firestoreDb = db) {
  const [accounts, sessions, bans, admins] = await Promise.all([
    getDocs(collection(firestoreDb, 'accounts')),
    getDocs(collection(firestoreDb, 'activityLog')),
    getDocs(collection(firestoreDb, 'bans')),
    getDocs(collection(firestoreDb, 'admins')),
  ]);
  return {
    totalUsers: accounts.size,
    totalBans: bans.size,
    totalAdmins: admins.size,
    totalLogEntries: sessions.size,
  };
}

// Broadcast message to all users
export async function setBroadcast(message, adminUid) {
  await setDoc(doc(db, 'config', 'broadcast'), { message, sentBy: adminUid, sentAt: serverTimestamp(), active: !!message });
}

export async function getBroadcast() {
  const snap = await getDoc(doc(db, 'config', 'broadcast'));
  return snap.exists() ? snap.data() : null;
}

// Level editor — update words for a level
export async function updateLevelWords(levelId, words, firestoreDb = db) {
  await setDoc(doc(firestoreDb, 'levelOverrides', String(levelId)), { words, updatedAt: serverTimestamp() });
}

export async function getLevelOverrides() {
  const snap = await getDocs(collection(db, 'levelOverrides'));
  const overrides = {};
  snap.docs.forEach(d => { overrides[d.id] = d.data().words; });
  return overrides;
}

// ─── Friends system ────────────────────────────────────────────────────────────
// friendRequests/{uid}/incoming/{fromUid} → { fromUid, fromUsername, sentAt }
// friendRequests/{uid}/outgoing/{toUid}   → { toUid, toUsername, sentAt }
// friends/{uid}/list/{friendUid}          → { uid, username, addedAt }

export async function sendFriendRequest(fromUid, fromUsername, toUid, toUsername) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'friendRequests', toUid, 'incoming', fromUid), { fromUid, fromUsername, sentAt: serverTimestamp() });
  batch.set(doc(db, 'friendRequests', fromUid, 'outgoing', toUid), { toUid, toUsername, sentAt: serverTimestamp() });
  await batch.commit();
}

export async function acceptFriendRequest(uid, username, fromUid, fromUsername) {
  const batch = writeBatch(db);
  // Add to both friends lists
  batch.set(doc(db, 'friends', uid, 'list', fromUid), { uid: fromUid, username: fromUsername, addedAt: serverTimestamp() });
  batch.set(doc(db, 'friends', fromUid, 'list', uid), { uid, username, addedAt: serverTimestamp() });
  // Remove requests
  batch.delete(doc(db, 'friendRequests', uid, 'incoming', fromUid));
  batch.delete(doc(db, 'friendRequests', fromUid, 'outgoing', uid));
  await batch.commit();
}

export async function declineFriendRequest(uid, fromUid) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'friendRequests', uid, 'incoming', fromUid));
  batch.delete(doc(db, 'friendRequests', fromUid, 'outgoing', uid));
  await batch.commit();
}

export async function removeFriend(uid, friendUid) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'friends', uid, 'list', friendUid));
  batch.delete(doc(db, 'friends', friendUid, 'list', uid));
  await batch.commit();
}

export async function getFriends(uid) {
  const snap = await getDocs(collection(db, 'friends', uid, 'list'));
  return snap.docs.map(d => d.data());
}

export async function getIncomingRequests(uid) {
  const snap = await getDocs(collection(db, 'friendRequests', uid, 'incoming'));
  return snap.docs.map(d => d.data());
}

export async function getOutgoingRequests(uid) {
  const snap = await getDocs(collection(db, 'friendRequests', uid, 'outgoing'));
  return snap.docs.map(d => d.data());
}

export async function getFriendStatus(uid, otherUid) {
  const [friend, incoming, outgoing] = await Promise.all([
    getDoc(doc(db, 'friends', uid, 'list', otherUid)),
    getDoc(doc(db, 'friendRequests', uid, 'incoming', otherUid)),
    getDoc(doc(db, 'friendRequests', uid, 'outgoing', otherUid)),
  ]);
  if (friend.exists()) return 'friends';
  if (incoming.exists()) return 'incoming';
  if (outgoing.exists()) return 'outgoing';
  return 'none';
}

// ─── Daily challenge ───────────────────────────────────────────────────────────
// Get current date in ET (Eastern Time) — handles DST automatically
export function getETDateStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

export async function getDailyChallenge() {
  const today = getETDateStr();
  const snap = await getDoc(doc(db, 'dailyChallenge', today));
  if (snap.exists()) return snap.data();
  // Generate deterministic words from date seed
  const seed = today.replace(/-/g, '');
  return { date: today, words: null, seed };
}

export async function submitDailyScore(uid, username, avatar, { wpm, accuracy }) {
  const today = getETDateStr();
  const ref = doc(db, 'dailyScores', today, 'scores', uid);
  const existing = await getDoc(ref);
  if (existing.exists() && existing.data().wpm >= wpm) return;
  const suspicious = wpm > MAX_LEGIT_WPM || accuracy < MIN_LEGIT_ACCURACY || accuracy > 100;
  await setDoc(ref, { uid, username, avatar, wpm, accuracy, submittedAt: serverTimestamp(), removed: suspicious, suspicious });
  if (suspicious) {
    await addDoc(collection(db, 'flaggedScores'), { type: 'daily', uid, username, wpm, accuracy, date: today, reason: `WPM ${wpm} exceeds maximum`, status: 'pending', createdAt: serverTimestamp() });
  }
  return { suspicious };
}

export async function removeLeaderboardScore(uid, date) {
  await updateDoc(doc(db, 'dailyScores', date || getETDateStr(), 'scores', uid), { removed: true });
}

export async function requestScoreRestore(uid, context, reason) {
  // context: { type: 'daily', date } | { type: 'level', levelId }
  await addDoc(collection(db, 'restoreRequests'), { uid, context, reason: reason || null, status: 'pending', createdAt: serverTimestamp() });
}

export async function getDailyLeaderboard() {
  const today = getETDateStr();
  const q = query(collection(db, 'dailyScores', today, 'scores'), orderBy('wpm', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ─── Admin: anti-cheat review ──────────────────────────────────────────────────

// Returns all flagged scores (any status) across both daily and per-level leaderboards,
// newest first. Admins use this to review auto-removed scores.
export async function getFlaggedScores(firestoreDb = db) {
  const q = query(collection(firestoreDb, 'flaggedScores'), orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Returns pending user-submitted restore requests, newest first.
export async function getRestoreRequests(firestoreDb = db) {
  const q = query(collection(firestoreDb, 'restoreRequests'), orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Admin approves a flagged score: clears the removed flag on the underlying score doc
// (daily or per-level) and marks the flaggedScores entry resolved.
export async function approveFlaggedScore(flaggedScoreId, { type, uid, date, levelId }, firestoreDb = db) {
  if (type === 'daily') {
    await updateDoc(doc(firestoreDb, 'dailyScores', date, 'scores', uid), { removed: false });
  } else if (type === 'level') {
    await updateDoc(doc(firestoreDb, 'leaderboard', String(levelId), 'scores', uid), { removed: false });
  }
  await updateDoc(doc(firestoreDb, 'flaggedScores', flaggedScoreId), { status: 'approved', resolvedAt: serverTimestamp() });
}

// Admin dismisses a flagged score (confirms it should stay removed).
export async function dismissFlaggedScore(flaggedScoreId, firestoreDb = db) {
  await updateDoc(doc(firestoreDb, 'flaggedScores', flaggedScoreId), { status: 'dismissed', resolvedAt: serverTimestamp() });
}

// Admin marks a user's restore request as handled.
export async function resolveRestoreRequest(requestId, status, firestoreDb = db) {
  await updateDoc(doc(firestoreDb, 'restoreRequests', requestId), { status, resolvedAt: serverTimestamp() });
}

// ─── Streak system ─────────────────────────────────────────────────────────────
export async function updateStreak(uid, profileId) {
  const ref = doc(db, 'accounts', uid, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const today = getETDateStr();
  const lastPlayed = data.lastPlayed || '';
  const yDate = new Date(); yDate.setDate(yDate.getDate() - 1);
  const yesterday = yDate.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  let streak = data.streak || 0;
  if (lastPlayed === today) return streak; // already played today
  if (lastPlayed === yesterday) streak += 1; // consecutive day
  else streak = 1; // reset
  await updateDoc(ref, { streak, lastPlayed: today });
  return streak;
}

// ─── Public profile ────────────────────────────────────────────────────────────
export async function getPublicProfile(username) {
  const usnap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!usnap.exists()) return null;
  const uid = usnap.data().uid;
  const profiles = await getDocs(collection(db, 'accounts', uid, 'profiles'));
  const pub = profiles.docs.map(p => {
    const d = p.data();
    return { name: d.name, avatar: d.avatar, currentLevel: d.currentLevel, highestUnlocked: d.highestUnlocked, bestWpm: d.bestWpm, streak: d.streak || 0 };
  });
  return { uid, username: username.toLowerCase(), profiles: pub };
}

// ─── Shop / themes ─────────────────────────────────────────────────────────────
export async function purchaseTheme(uid, profileId, themeId, cost) {
  const ref = doc(db, 'accounts', uid, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Profile not found');
  const data = snap.data();
  if ((data.keys || 0) < cost) throw new Error('Not enough keys');
  const owned = data.ownedThemes || [];
  if (owned.includes(themeId)) throw new Error('Already owned');
  await updateDoc(ref, { keys: (data.keys || 0) - cost, ownedThemes: [...owned, themeId] });
}

export async function setActiveTheme(uid, profileId, themeId) {
  await updateDoc(doc(db, 'accounts', uid, 'profiles', profileId), { activeTheme: themeId });
}

export async function purchaseFont(uid, profileId, fontId, cost) {
  const ref = doc(db, 'accounts', uid, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Profile not found');
  const data = snap.data();
  if ((data.keys || 0) < cost) throw new Error('Not enough keys');
  const owned = data.ownedFonts || [];
  if (owned.includes(fontId)) throw new Error('Already owned');
  await updateDoc(ref, { keys: (data.keys || 0) - cost, ownedFonts: [...owned, fontId] });
}

export async function setActiveFont(uid, profileId, fontId) {
  await updateDoc(doc(db, 'accounts', uid, 'profiles', profileId), { activeFont: fontId });
}

// ─── Challenge a friend ────────────────────────────────────────────────────────
export async function sendChallenge(fromUid, fromUsername, toUid, levelId) {
  await addDoc(collection(db, 'challenges'), {
    fromUid, fromUsername, toUid, levelId,
    sentAt: serverTimestamp(), status: 'pending'
  });
}

export async function getChallenges(uid) {
  const q = query(collection(db, 'challenges'), orderBy('sentAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.toUid === uid || c.fromUid === uid);
}

// ─── Admin stats ───────────────────────────────────────────────────────────────
export async function getLevelFailStats(firestoreDb = db) {
  const accounts = await getDocs(collection(firestoreDb, 'accounts'));
  const failCounts = {};
  for (const acc of accounts.docs) {
    const profiles = await getDocs(collection(firestoreDb, 'accounts', acc.id, 'profiles'));
    for (const p of profiles.docs) {
      const sessions = await getDocs(query(
        collection(firestoreDb, 'accounts', acc.id, 'profiles', p.id, 'sessions'),
        orderBy('createdAt', 'desc'), limit(100)
      ));
      sessions.docs.forEach(s => {
        const d = s.data();
        if (!d.passed) failCounts[d.level] = (failCounts[d.level] || 0) + 1;
      });
    }
  }
  return failCounts;
}

// ─── Session dates for streak calendar ────────────────────────────────────────
export async function getSessionDates(uid, profileId, days = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const q = query(
    collection(db, 'accounts', uid, 'profiles', profileId, 'sessions'),
    where('createdAt', '>=', Timestamp.fromDate(cutoff)),
    orderBy('createdAt', 'asc')
  );
  const snaps = await getDocs(q);
  // Return map of YYYY-MM-DD -> { count, bestWpm, passed }
  const map = {};
  snaps.docs.forEach(d => {
    const data = d.data();
    const ts = data.createdAt?.toDate?.();
    if (!ts) return;
    const key = new Date(ts.seconds * 1000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    if (!map[key]) map[key] = { count: 0, bestWpm: 0, passed: false };
    map[key].count++;
    if (data.wpm > map[key].bestWpm) map[key].bestWpm = data.wpm;
    if (data.passed) map[key].passed = true;
  });
  return map;
}

// ─── Feedback ────────────────────────────────────────────────────────────────
export async function submitFeedback(uid, profileId, text, username, profileName, screenshot) {
  const payload = {
    uid: uid || null,
    profileId: profileId || null,
    text,
    username: username || null,
    profileName: profileName || null,
    screenshot: screenshot || null,
    createdAt: serverTimestamp(),
  };
  // Try user-scoped path first (auth rules allow this), fall back to root collection
  if (uid) {
    await addDoc(collection(db, 'accounts', uid, 'feedback'), payload);
  } else {
    await addDoc(collection(db, 'feedback'), payload);
  }
}

// ─── Public profile — enriched ────────────────────────────────────────────────
export async function getPublicProfileFull(username) {
  const usnap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!usnap.exists()) return null;
  const uid = usnap.data().uid;
  const profileDocs = await getDocs(collection(db, 'accounts', uid, 'profiles'));

  const profiles = (await Promise.all(profileDocs.docs.map(async p => {
    const d = p.data();
    // COPPA: a profile with a birthday indicating under-13 must never appear
    // on this public, unauthenticated page — no name, photo, stats, or
    // activity history. isProfileRestricted() excludes profile-admin
    // profiles (the account owner), so only actual child sub-profiles are hidden.
    if (isProfileRestricted(d)) return null;
    // Recent sessions (last 5)
    const sessSnap = await getDocs(query(
      collection(db, 'accounts', uid, 'profiles', p.id, 'sessions'),
      orderBy('createdAt', 'desc'), limit(5)
    ));
    const recentSessions = sessSnap.docs.map(s => {
      const sd = s.data();
      return { wpm: sd.wpm, accuracy: sd.accuracy, passed: sd.passed, level: sd.level, createdAt: sd.createdAt?.toDate?.()?.toISOString() || null };
    });
    // Session dates for calendar (last 90 days)
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 90);
    const calSnap = await getDocs(query(
      collection(db, 'accounts', uid, 'profiles', p.id, 'sessions'),
      where('createdAt', '>=', Timestamp.fromDate(cutoff)),
      orderBy('createdAt', 'asc')
    ));
    const sessionDates = {};
    calSnap.docs.forEach(s => {
      const sd = s.data();
      const ts = sd.createdAt?.toDate?.();
      if (!ts) return;
      const key = ts.toISOString().slice(0,10);
      if (!sessionDates[key]) sessionDates[key] = { count: 0, bestWpm: 0 };
      sessionDates[key].count++;
      if (sd.wpm > sessionDates[key].bestWpm) sessionDates[key].bestWpm = sd.wpm;
    });
    return {
      id: p.id, name: d.name, avatar: d.avatar, photo: d.photo || null,
      currentLevel: d.currentLevel || 1, highestUnlocked: d.highestUnlocked || 1,
      bestWpm: (d.privacy?.showWpm !== false) ? (d.bestWpm || 0) : null,
      streak: (d.privacy?.showStreak !== false) ? (d.streak || 0) : null,
      totalSessions: d.totalSessions || 0, avgAccuracy: d.avgAccuracy || 0,
      recentSessions: (d.privacy?.showSessions !== false) ? recentSessions : [],
      sessionDates: (d.privacy?.showSessions !== false) ? sessionDates : {},
      isPublic: d.privacy?.publicProfile !== false,
    };
  }))).filter(Boolean);

  return { uid, username: username.toLowerCase(), profiles };
}

// ─── Admin: read feedback ─────────────────────────────────────────────────────
export async function getAdminFeedback(limitN = 50, firestoreDb = db) {
  // Read from all user accounts' feedback subcollections
  const accounts = await getDocs(collection(firestoreDb, 'accounts'));
  const all = [];
  for (const acc of accounts.docs) {
    try {
      const snap = await getDocs(query(
        collection(firestoreDb, 'accounts', acc.id, 'feedback'),
        orderBy('createdAt', 'desc'), limit(10)
      ));
      snap.docs.forEach(d => {
        const data = d.data();
        all.push({
          id: d.id, uid: acc.id, text: data.text,
          profileId: data.profileId,
          username: data.username || null,
          profileName: data.profileName || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        });
      });
    } catch(e) { /* skip if no feedback subcollection */ }
  }
  // Sort by date desc
  all.sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));
  return all.slice(0, limitN);
}

// ─── Admin: dismiss feedback ──────────────────────────────────────────────────
export async function dismissFeedback(uid, docId, firestoreDb = db) {
  await deleteDoc(doc(firestoreDb, 'accounts', uid, 'feedback', docId));
}

// ─── Birthday approval requests ───────────────────────────────────────────────
export async function submitBirthdayRequest(uid, profileId, profileName, birthday, reason) {
  await setDoc(doc(db, 'accounts', uid, 'birthdayRequests', profileId), {
    uid, profileId, profileName, birthday, reason: reason || "",
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function getBirthdayRequestStatus(uid, profileId) {
  const snap = await getDoc(doc(db, 'accounts', uid, 'birthdayRequests', profileId));
  return snap.exists() ? snap.data() : null;
}

export async function getAdminBirthdayRequests(firestoreDb = db) {
  const accs = await getDocs(collection(firestoreDb, 'accounts'));
  const all = [];
  for (const acc of accs.docs) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'accounts', acc.id, 'birthdayRequests'));
      snap.docs.forEach(d => all.push({ id: d.id, uid: acc.id, ...d.data() }));
    } catch(e) {}
  }
  return all.filter(r => r.status === 'pending');
}

export async function approveBirthdayRequest(uid, profileId, birthday, firestoreDb = db) {
  // Update the profile's birthday in Firestore
  const snap = await getDocs(collection(firestoreDb, 'accounts', uid, 'profiles'));
  const prof = snap.docs.find(d => d.id === profileId);
  if (prof) {
    const age = Math.floor((Date.now() - new Date(birthday + 'T12:00:00').getTime()) / (365.25*24*3600*1000));
    await updateDoc(doc(firestoreDb, 'accounts', uid, 'profiles', profileId), { birthday, age });
  }
  await updateDoc(doc(firestoreDb, 'accounts', uid, 'birthdayRequests', profileId), { status: 'approved' });
}

export async function rejectBirthdayRequest(uid, profileId, firestoreDb = db) {
  await updateDoc(doc(firestoreDb, 'accounts', uid, 'birthdayRequests', profileId), { status: 'rejected' });
}

// ─── Friend challenges — extended ─────────────────────────────────────────────
export async function sendChallengeEx(fromUid, fromUsername, fromAvatar, toUid, toUsername, levelId, levelName) {
  await addDoc(collection(db, 'challenges'), {
    fromUid, fromUsername, fromAvatar,
    toUid, toUsername,
    levelId, levelName,
    sentAt: serverTimestamp(),
    status: 'pending', // pending | accepted | declined | completed
    fromResult: null,  // {wpm, accuracy, passed}
    toResult: null,
  });
}

export async function declineChallenge(challengeId) {
  await updateDoc(doc(db, 'challenges', challengeId), { status: 'declined' });
}

export async function submitChallengeResult(challengeId, uid, wpm, accuracy, passed) {
  const ref = doc(db, 'challenges', challengeId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const isFrom = data.fromUid === uid;
  const field = isFrom ? 'fromResult' : 'toResult';
  const otherField = isFrom ? 'toResult' : 'fromResult';
  const result = { wpm, accuracy, passed };
  const update = { [field]: result };
  // If both results in, mark completed
  if (data[otherField]) update.status = 'completed';
  else update.status = 'accepted';
  await updateDoc(ref, update);
}

export async function getPendingChallenges(uid) {
  const q = query(collection(db, 'challenges'), orderBy('sentAt', 'desc'), limit(30));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c => (c.toUid === uid || c.fromUid === uid) && c.status !== 'declined');
}

// ─── Weekly summary ────────────────────────────────────────────────────────────
export async function getWeeklySessions(uid, profileId, weeksBack = 0) {
  // Get sessions from the target week (0=this week, 1=last week...)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0,0,0,0);
  const weekStart = new Date(startOfThisWeek);
  weekStart.setDate(weekStart.getDate() - weeksBack * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const q = query(
    collection(db, 'accounts', uid, 'profiles', profileId, 'sessions'),
    where('createdAt', '>=', Timestamp.fromDate(weekStart)),
    where('createdAt', '<', Timestamp.fromDate(weekEnd)),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Feedback replies (admin → user) ─────────────────────────────────────────
export async function replyToFeedback(feedbackId, uid, replyText, adminName, firestoreDb = db) {
  // Store reply on user's account so they get it on next load
  if (uid) {
    await setDoc(doc(firestoreDb, 'accounts', uid, 'notifications', feedbackId), {
      type: 'feedback_reply',
      feedbackId,
      reply: replyText,
      adminName: adminName || 'AccuratKey Team',
      createdAt: serverTimestamp(),
      read: false,
    });
  }
  // Also mark feedback as replied
  try {
    await updateDoc(doc(firestoreDb, 'accounts', uid, 'feedback', feedbackId), {
      reply: replyText,
      replyBy: adminName || 'AccuratKey Team',
      repliedAt: serverTimestamp(),
    });
  } catch(e) {}
}

export async function getPendingNotifications(uid) {
  if (!uid) return [];
  const snap = await getDocs(
    query(collection(db, 'accounts', uid, 'notifications'),
    where('read', '==', false))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markNotificationRead(uid, notifId) {
  if (!uid) return;
  await updateDoc(doc(db, 'accounts', uid, 'notifications', notifId), { read: true });
}
