import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, addDoc,
  collection, query, orderBy, limit, getDocs, deleteDoc,
  serverTimestamp, writeBatch, onSnapshot,
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
  const newKeys = (p.keys || 0) + keysEarned;

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
    highestUnlocked: newHighest,
    currentLevel: newCurrent,
  });

  return keysEarned;
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

// ─── Leaderboard ──────────────────────────────────────────────────────────────
// leaderboard/{levelId}/scores/{uid} — one doc per user per level (best score)

export async function submitLeaderboardEntry(levelId, { wpm, accuracy, name, avatar, uid }) {
  const ref = doc(db, 'leaderboard', String(levelId), 'scores', uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().wpm >= wpm) return; // only update if better
  await setDoc(ref, { wpm, accuracy, name, avatar, uid, updatedAt: serverTimestamp() });
}

export async function getLeaderboard(levelId) {
  const q = query(
    collection(db, 'leaderboard', String(levelId), 'scores'),
    orderBy('wpm', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ─── Admin system ─────────────────────────────────────────────────────────────
// admins/{uid} → { uid, grantedBy, grantedAt }
// bans/{uid}   → { uid, reason, bannedBy, bannedAt, permanent }

export async function isAdmin(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

export async function getAllAdmins() {
  const snap = await getDocs(collection(db, 'admins'));
  return snap.docs.map(d => d.data());
}

export async function grantAdmin(uid, grantedByUid) {
  await setDoc(doc(db, 'admins', uid), { uid, grantedBy: grantedByUid, grantedAt: serverTimestamp() });
}

export async function revokeAdmin(uid) {
  await deleteDoc(doc(db, 'admins', uid));
}

export async function banUser(uid, { reason, bannedBy }) {
  await setDoc(doc(db, 'bans', uid), { uid, reason: reason || 'No reason given', bannedBy, bannedAt: serverTimestamp() });
}

export async function unbanUser(uid) {
  await deleteDoc(doc(db, 'bans', uid));
}

export async function getBan(uid) {
  const snap = await getDoc(doc(db, 'bans', uid));
  return snap.exists() ? snap.data() : null;
}

export async function getAllBans() {
  const snap = await getDocs(collection(db, 'bans'));
  return snap.docs.map(d => d.data());
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'accounts'));
  const users = [];
  for (const d of snap.docs) {
    const profiles = await getDocs(collection(db, 'accounts', d.id, 'profiles'));
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
export async function setAdminNote(uid, note, adminUid) {
  await setDoc(doc(db, 'adminNotes', uid), { uid, note, updatedBy: adminUid, updatedAt: serverTimestamp() });
}

export async function getAdminNote(uid) {
  const snap = await getDoc(doc(db, 'adminNotes', uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Activity log ─────────────────────────────────────────────────────────────
export async function logActivity(action, { adminUid, targetUid, targetUsername, detail } = {}) {
  await addDoc(collection(db, 'activityLog'), {
    action, adminUid, targetUid: targetUid || null,
    targetUsername: targetUsername || null,
    detail: detail || null,
    createdAt: serverTimestamp(),
  });
}

export async function getActivityLog(limitN = 50) {
  const q = query(collection(db, 'activityLog'), orderBy('createdAt', 'desc'), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Maintenance mode ─────────────────────────────────────────────────────────
export async function setMaintenanceMode(enabled, message = '') {
  await setDoc(doc(db, 'config', 'maintenance'), { enabled, message, updatedAt: serverTimestamp() });
}

export async function getMaintenanceMode() {
  const snap = await getDoc(doc(db, 'config', 'maintenance'));
  return snap.exists() ? snap.data() : { enabled: false, message: '' };
}

// ─── Skip level (admin) ───────────────────────────────────────────────────────
export async function adminSkipLevel(targetUid, profileId, levelId) {
  const ref = doc(db, 'accounts', targetUid, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Profile not found');
  await updateDoc(ref, {
    highestUnlocked: Math.max(snap.data().highestUnlocked || 1, levelId),
    currentLevel: levelId,
  });
}
// ─── Add keys (admin) ─────────────────────────────────────────────────────────
export async function adminAddKeys(targetUid, profileId, amount) {
  const ref = doc(db, 'accounts', targetUid, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Profile not found');
  const current = snap.data().keys || 0;
  await updateDoc(ref, { keys: current + amount });
  return current + amount;
}

export async function getProfilesForAdmin(targetUid) {
  const snap = await getDocs(collection(db, 'accounts', targetUid, 'profiles'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Admin expanded features ───────────────────────────────────────────────────

// Send password reset email
export async function adminSendPasswordReset(email) {
  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(auth, email);
}

// Get user's full session history
export async function getUserSessions(uid) {
  const profiles = await getDocs(collection(db, 'accounts', uid, 'profiles'));
  const allSessions = [];
  for (const p of profiles.docs) {
    const sessions = await getDocs(query(
      collection(db, 'accounts', uid, 'profiles', p.id, 'sessions'),
      orderBy('createdAt', 'desc'), limit(50)
    ));
    sessions.docs.forEach(s => allSessions.push({ ...s.data(), profileName: p.data().name, profileId: p.id }));
  }
  return allSessions.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// Get last seen (most recent session)
export async function getUserLastSeen(uid) {
  const profiles = await getDocs(collection(db, 'accounts', uid, 'profiles'));
  let latest = null;
  for (const p of profiles.docs) {
    const q = query(collection(db, 'accounts', uid, 'profiles', p.id, 'sessions'), orderBy('createdAt', 'desc'), limit(1));
    const s = await getDocs(q);
    if (!s.empty) {
      const t = s.docs[0].data().createdAt?.seconds || 0;
      if (!latest || t > latest) latest = t;
    }
  }
  return latest ? new Date(latest * 1000) : null;
}

// Warn user — shows popup on next login
export async function warnUser(uid, { message, warnedBy }) {
  await setDoc(doc(db, 'warnings', uid), { uid, message, warnedBy, warnedAt: serverTimestamp(), seen: false });
}

export async function clearWarning(uid) {
  await deleteDoc(doc(db, 'warnings', uid));
}

export async function getWarning(uid) {
  const snap = await getDoc(doc(db, 'warnings', uid));
  return snap.exists() ? snap.data() : null;
}

// Temp ban with expiry
export async function tempBanUser(uid, { reason, bannedBy, expiresAt }) {
  await setDoc(doc(db, 'bans', uid), { uid, reason: reason || 'No reason given', bannedBy, bannedAt: serverTimestamp(), expiresAt });
}

// App-wide stats
export async function getAppStats() {
  const [accounts, sessions, bans, admins] = await Promise.all([
    getDocs(collection(db, 'accounts')),
    getDocs(collection(db, 'activityLog')),
    getDocs(collection(db, 'bans')),
    getDocs(collection(db, 'admins')),
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
export async function updateLevelWords(levelId, words) {
  await setDoc(doc(db, 'levelOverrides', String(levelId)), { words, updatedAt: serverTimestamp() });
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
export async function getDailyChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const snap = await getDoc(doc(db, 'dailyChallenge', today));
  if (snap.exists()) return snap.data();
  // Generate deterministic words from date seed
  const seed = today.replace(/-/g, '');
  return { date: today, words: null, seed };
}

export async function submitDailyScore(uid, username, avatar, { wpm, accuracy }) {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'dailyScores', today, 'scores', uid);
  const existing = await getDoc(ref);
  if (existing.exists() && existing.data().wpm >= wpm) return;
  await setDoc(ref, { uid, username, avatar, wpm, accuracy, submittedAt: serverTimestamp() });
}

export async function getDailyLeaderboard() {
  const today = new Date().toISOString().split('T')[0];
  const q = query(collection(db, 'dailyScores', today, 'scores'), orderBy('wpm', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ─── Streak system ─────────────────────────────────────────────────────────────
export async function updateStreak(uid, profileId) {
  const ref = doc(db, 'accounts', uid, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const today = new Date().toISOString().split('T')[0];
  const lastPlayed = data.lastPlayed || '';
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
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
export async function getLevelFailStats() {
  const accounts = await getDocs(collection(db, 'accounts'));
  const failCounts = {};
  for (const acc of accounts.docs) {
    const profiles = await getDocs(collection(db, 'accounts', acc.id, 'profiles'));
    for (const p of profiles.docs) {
      const sessions = await getDocs(query(
        collection(db, 'accounts', acc.id, 'profiles', p.id, 'sessions'),
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
