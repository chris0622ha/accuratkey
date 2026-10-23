// What's new for ADMIN tools. Shown only inside the admin panel. Newest first; bump the top id when adding an entry.
export const ADMIN_NEWS = [
  { id: "a-2026-10-23g", at: "2026-10-23T20:30:00-04:00", title: "Tools tab and admin shortcuts (batch 1 of the 50)", items: [
    "New Tools tab with 10 sections: Site, Audit, Notes, Tasks, Backup, Health, Level QA, Set stats, Blocklist, Admin prefs",
    "Site: bottom banner with color, link and expiry; welcome message; 'New update available' refresh prompt for everyone; ⭐ Spotlight game; forced word of the day",
    "Audit: per-action and per-admin counts with action, admin and date filters",
    "Notes: private staff notes on an account. Tasks: shared to-do list plus shift handoff notes",
    "Backup: download all settings as JSON and restore from one, with a preview of what will change",
    "Health: read-only checks of config and collections with timings",
    "Level QA scans every level for empty, spaced, duplicate or odd text, plus a level preview",
    "Set stats: totals, ratings and top creators, with Remove all sets from a creator",
    "Blocklist: paste to add words, export as .txt",
    "Ctrl/Cmd+K command palette (jump to a tab or look up @username/UID), Alt+1-9 tab shortcuts, pinned tabs, and optional auto sign-out when idle",
  ]},
  { id: "a-2026-10-23f", at: "2026-10-23T19:45:00-04:00", title: "Safer user lookup, admin news", items: [
    "Users tab and the top search now look up ONE account by @username or UID and never show emails",
    "This Admin news tab. A red dot appears on it when there is something new",
  ]},
  { id: "a-2026-10-23e", at: "2026-10-23T19:30:00-04:00", title: "Economy, growth and log tools", items: [
    "Economy tab: Keys events (1.5x-3x with a timer), daily Keys cap, bulk level rewards by range, and a gift-Keys-to-everyone button (13+ only)",
    "Stats tab: signups chart for the last 30 days (reads only account creation dates)",
    "Activity log: search box and CSV export",
    "Red count badges on tabs that need attention (Word sets: pending sets and revert requests)",
    "Notify tab: save and reuse message templates",
    "Moderation tab: test the filter on sample text, sort and copy the blocked list",
    "Word sets: Approve all clean sets in one tap",
  ]},
  { id: "a-2026-10-23d", at: "2026-10-23T18:30:00-04:00", title: "Notify tab", items: [
    "Send in-game notifications to everyone, regular users, admins or specific usernames",
    "Priority: Nothing, Important (!! on the profile) or Urgent (popup on next open)",
    "Group messages can expire after 1, 7 or 30 days and can be removed for everyone",
  ]},
  { id: "a-2026-10-23c", at: "2026-10-23T17:15:00-04:00", title: "Word set history and revert requests", items: [
    "Editing a published set saves the old version. Use History to restore any of the last 10 versions",
    "Creators are notified of edits and can request a revert, which shows on the set as 'Revert requested'",
    "Level editor can now rename any level as well as change its words",
  ]},
  { id: "a-2026-10-23b", at: "2026-10-23T16:45:00-04:00", title: "Moderation tab", items: [
    "Auto-moderation for word sets: blocked words, personal info (emails, links, phone numbers) and spam checks",
    "Choose whether flagged sets are only warned about or auto-rejected. Scan already-published sets and remove them",
    "Rejecting or removing a set lets you add a reason that is sent to the creator",
  ]},
  { id: "a-2026-10-23a", at: "2026-10-23T15:30:00-04:00", title: "Locks, Rewards and Word sets", items: [
    "Locks tab: switch off features and games for everyone except admins",
    "Rewards tab: choose the Keys each level gives",
    "Word sets tab: approve or reject community sets, give badges and per-set Keys rewards",
  ]},
];
