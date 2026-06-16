'use client';
import Link from 'next/link';
import { useState } from 'react';
import { notFound } from 'next/navigation';

type Section = { heading: string; body: string };
type Topic = { title: string; emoji: string; color: string; intro: string; sections: Section[]; faqs?: [string,string][] };

const TOPICS: Record<string, Topic> = {
  'keyboard': {
    title: 'Keyboard Setup', emoji: '⌨️', color: '#06b6d4',
    intro: 'AccuratKey requires a physical keyboard. Here are all the ways to connect one.',
    sections: [
      { heading: 'Bluetooth keyboard', body: 'Put the keyboard in pairing mode, go to Settings → Bluetooth, and tap it when it appears. Works with any Bluetooth keyboard. Best option for phones and tablets. Full guide at /keyboard/bluetooth.' },
      { heading: 'Wired USB keyboard', body: 'Plug a USB-C to USB-A adapter into your device, then plug the keyboard in. Works on most Android phones and iPads with USB-C. No setup needed. Full guide at /keyboard/usb.' },
      { heading: 'iPad Smart Connector', body: 'Snap an Apple Magic Keyboard or Logitech Combo Touch onto the Smart Connector port. No pairing, no battery — instant connection. See /keyboard/ipad-smart.' },
      { heading: 'Samsung DeX', body: 'Connect your Galaxy phone to a monitor and attach any keyboard. AccuratKey runs as a full desktop app in DeX. See /keyboard/samsung-dex.' },
      { heading: 'Chromebook', body: 'Open AccuratKey in Chrome on any Chromebook. Built-in keyboard works immediately.' },
      { heading: 'Laptop or Desktop (recommended)', body: 'The best experience. Open any browser, go to accuratkey.vercel.app, press any key. Works on Windows, Mac, Linux, ChromeOS.' },
    ],
    faqs: [
      ['Which method is easiest?', 'Bluetooth for phones/tablets. Desktop overall — just open the browser.'],
      ['Does my keyboard work?', 'If it says Bluetooth HID or USB HID (all consumer keyboards), yes. See /keyboard for full compatibility lists.'],
      ['Where is the full guide?', 'At /keyboard — with compatibility lists, detailed steps, and troubleshooting.'],
    ],
  },

  'getting-started': {
    title: 'Getting Started', emoji: '🚀', color: '#7c6af7',
    intro: 'New to AccuratKey? Here\'s everything you need to get up and running in under 5 minutes.',
    sections: [
      { heading: '1. Create an account', body: 'Go to accuratkey.vercel.app and click Sign Up. Use Google (easiest), GitHub, or email/password. You can also tap "Continue as Guest" to try without an account — progress saves locally in your browser.' },
      { heading: '2. Create a profile', body: 'After signing in you\'ll be prompted to create a profile. Choose a name, pick an avatar emoji, and enter your birthday (used to auto-adjust difficulty and font sizes). You can have multiple profiles per account — great for families.' },
      { heading: '3. Connect a keyboard', body: 'AccuratKey requires a physical keyboard. On laptop/desktop you\'re already good. On a phone or tablet you\'ll need to connect a Bluetooth or USB keyboard. See the Keyboard Setup guide for step-by-step instructions.' },
      { heading: '4. Pick a level', body: 'From the Level Map tab, tap Level 1. Each level has a brief tip about a specific typing skill. Read it, then tap Start Typing.' },
      { heading: '5. Type — no Backspace', body: 'Type the words shown on screen. Backspace is disabled — every keystroke is final. This is intentional: it trains accurate fingers, not fast-and-fix habits.' },
      { heading: '6. Pass and progress', body: 'Each level has a WPM target and minimum accuracy. Pass to unlock the next level and earn 🔑 Keys. You can replay levels anytime to improve your personal best.' },
    ],
    faqs: [
      ['Do I need an account?', 'No. Guest mode gives full access to all 15 levels and all 38 games. Progress saves in your browser. Sign up to sync across devices, use friends and daily challenge features.'],
      ['Is AccuratKey free?', 'The core app is free forever. A Pro subscription is available for power users — it unlocks advanced stats, exclusive themes, and extra features. Keys are earned by playing and can also be purchased directly.'],
      ['What browsers are supported?', 'Chrome, Firefox, Safari, and Edge. Chrome is recommended for best performance.'],
      ['What is a streak?', 'A streak 🔥 is the number of consecutive days you have used AccuratKey. Type at least one level or complete the daily challenge each day to keep it going. Shown in the nav bar as 🔥N.'],
      ['Can kids use AccuratKey?', 'Yes. The age-adaptive system adjusts font sizes, word complexity, and level cap based on the birthday you enter. Kids under 10 get larger fonts and simpler words.'],
    ],
  },

  'levels': {
    title: 'Levels & Progress', emoji: '📈', color: '#34d399',
    intro: 'AccuratKey has 15 levels of increasing difficulty, each targeting a specific typing skill.',
    sections: [
      { heading: 'The Level Map', body: 'The Level Map shows all 15 levels as connected nodes. Completed levels show ✓ in their color. Your current level glows with a pulse ring. Locked levels show 🔒. Tap a level to start or replay it.' },
      { heading: 'WPM (Words Per Minute)', body: 'WPM is calculated as (characters typed ÷ 5) ÷ minutes elapsed. Dividing by 5 is the standard industry method to normalize "word" length. Most people type 40–60 WPM normally; touch typists reach 80–120+.' },
      { heading: 'Accuracy', body: 'Accuracy is the percentage of characters you pressed correctly on the first keypress. There is no Backspace — every typo is permanent and counted against your accuracy. This is a stricter measure than most typing sites.' },
      { heading: 'Why no Backspace?', body: 'AccuratKey deliberately disables Backspace. The goal is to train your fingers to press the right key the first time, building genuine muscle memory. Sites that allow Backspace teach speed-and-fix, not accuracy. You\'ll improve faster this way.' },
      { heading: 'Personal Bests', body: 'Your best WPM and accuracy for each level are saved per profile. Replaying a level shows your previous best so you can try to beat it. Replays still earn Keys.' },
      { heading: 'Show More / Show Less', body: 'By default the map shows your current level plus 5 upcoming. Tap Show More to reveal further levels. Tap Show Less to collapse back.' },
      { heading: 'Keys earned', body: 'Completing a level earns 🔑 Keys. Higher levels pay more. A combo multiplier applies if you type 10+ words correctly in a row (1.5×) or 20+ (2×).' },
    ],
    faqs: [
      ['Can I skip levels?', 'You can attempt any unlocked level or the next locked one. But you must pass each level to unlock further ones.'],
      ['What happens if I fail?', 'Nothing — just try again. There are no penalties and no attempt limits.'],
      ['Do guest levels sync if I sign up?', 'No — guest progress stays in the browser. Create an account first, then play to build cloud-synced progress.'],
      ['What\'s the highest level?', 'Level 15 — no age restrictions on level access.'],
    ],
  },

  'games': {
    title: 'Games', emoji: '🎮', color: '#f59e0b',
    intro: '38 game modes across 10 categories. Each one trains a different aspect of typing.',
    sections: [
      { heading: '⚡ Speed Games', body: 'Word Rain, Speed Burst, Speed Ladder, Speed Test. Words appear faster over time or on a timer. Pure WPM training. Great for breaking plateaus.' },
      { heading: '🎯 Accuracy Games', body: 'Survival, Sudden Death, Sniper Mode. One mistake costs a life or ends the game. Forces precision over speed. Best for accuracy under pressure.' },
      { heading: '🧠 Memory Games', body: 'Ghost Words, Echo Mode, Mirror Mode. Words appear briefly then disappear — you type from memory. Builds visual memory and forces touch typing (you can\'t look at the screen).' },
      { heading: '🕹️ Arcade Games', body: 'Typing Invaders, Asteroid Belt, Brick Breaker, Boss Battle, Code Rain. Your typing controls a game element — shoot invaders, destroy asteroids, break bricks. Fun and motivating.' },
      { heading: '🧘 Chill Games', body: 'Zen Mode, Typewriter Story, Typing Journal, Poetry Mode. No timer, no pressure. Type at your own pace. Great for warm-ups, cool-downs, or just relaxing.' },
      { heading: '🔀 Puzzle Games', body: 'Word Scramble, Anagram, Missing Letters. Letters are scrambled or hidden. Tests word recognition speed and pattern matching.' },
      { heading: '📚 Educational Games', body: 'Spelling Bee (with text-to-speech), Vocab Builder, Synonyms, Antonyms. Learn vocabulary while typing. Spelling Bee speaks the word aloud — you type it without seeing it.' },
      { heading: '🎨 Creative Games', body: 'Mad Libs, Haiku Mode, Quotes. Type structured creative content. Mad Libs fills blanks, Haiku has you type 5-7-5 syllable lines, Quotes gives you famous passages.' },
      { heading: '🏆 Challenge Games', body: '100 Words, Endurance, Word Chain, Category Blitz. Complete specific goals. 100 Words = type exactly 100 words. Endurance = type until you drop. Word Chain = each word must start with the last letter of the previous.' },
      { heading: '🎲 Random', body: 'Roulette randomly picks a game mode each session. Good for variety and discovering games you haven\'t tried.' },
    ],
    faqs: [
      ['Do games save progress?', 'Each game saves your last session score locally. Personal bests are tracked per game per profile.'],
      ['Are games in guest mode?', 'Yes — all 38 games are fully playable as a guest.'],
      ['How does Spelling Bee TTS work?', 'Your device\'s built-in text-to-speech reads the word aloud. Tap 🔊 to hear it again. You type without seeing the word — purely from how it sounds.'],
      ['Do games earn Keys?', 'Yes — games earn Keys too, just like levels. Every completed game session rewards Keys based on your performance.'],
    ],
  },

  'keys-shop': {
    title: 'Keys & Shop', emoji: '🔑', color: '#fb923c',
    intro: '🔑 Keys are AccuratKey\'s in-game currency. Earn them by completing levels, spend them on cosmetics.',
    sections: [
      { heading: 'Earning Keys', body: 'Keys are earned every time you complete a typing level. Higher levels pay more Keys. Combo multipliers boost earnings: 1.5× for a 10-word streak, 2× for a 20-word streak. Replaying levels also earns Keys each time.' },
      { heading: 'The Shop', body: 'Access the Shop via the 🛍️ button in the nav bar. Browse Themes, Fonts, and Sound Packs. All items are purely cosmetic — nothing in the shop affects gameplay. Once purchased, items are permanently yours on that profile.' },
      { heading: 'Themes', body: 'Themes change the entire color scheme — background, text, accents, borders. Options include dark, light, neon, retro, pastel, ocean, forest, and more. Preview before buying. Equip from the Shop or Edit Profile.' },
      { heading: 'Fonts', body: 'Change the typeface used throughout the app and during typing tests. Choose from monospace (JetBrains Mono, Fira Code, Cascadia), sans-serif (Inter, Outfit, Poppins), display fonts (Orbitron, Press Start 2P), and more.' },
      { heading: 'Sound Packs', body: 'Each keypress can play a satisfying click, clack, pop, or thock sound. Sound packs change the audio profile. Toggle sounds with the 🔇/🔊 button in the nav bar.' },
      { heading: 'Gifting Keys', body: 'If the Send Keys feature is enabled on your profile, you can gift Keys to friends. Open a friend\'s profile from the Friends panel and tap Gift 🔑.' },
      { heading: 'Keys display', body: 'Your current Key balance shows in the nav bar (if enabled in Feature Access). Tap it to go directly to the Shop.' },
    ],
    faqs: [
      ['Can I buy Keys with real money?', 'No. Keys are earned only by playing. There are no microtransactions or pay-to-win elements.'],
      ['Do Keys carry over between profiles?', 'No — Keys are per profile, not per account.'],
      ['Can I lose Keys?', 'No. Keys only go up (when earned) or down (when you spend them in the Shop).'],
      ['What if I accidentally bought something?', 'Purchases are final. Contact support via the 💬 button in the app.'],
    ],
  },

  'social': {
    title: 'Friends & Challenges', emoji: '👥', color: '#a78bfa',
    intro: 'Add friends, challenge them to typing duels, spectate, and see how you compare.',
    sections: [
      { heading: 'Setting up a username', body: 'You need a username to use friend features. Go to Edit Profile (tap your avatar) → set a username. Usernames are public and unique. Changing costs 5 Keys after the first free change.' },
      { heading: 'Adding friends', body: 'Tap 👥 in the nav bar → search for a username → send a friend request. They\'ll see a notification next time they open the app. Accept or decline from the Friends panel.' },
      { heading: 'Challenges', body: 'Tap ⚔️ in the nav bar → pick a friend → pick a level → send. Both players type the same level independently. The one with the higher WPM × accuracy score wins. Results are shown after both finish.' },
      { heading: 'Spectating', body: 'During an active challenge you can tap Spectate to watch in real time. You\'ll see their progress live — current word, WPM, accuracy, and time remaining.' },
      { heading: 'Friend Leaderboard', body: 'Tap a level on the Level Map → Friend Leaderboard to see how your best WPM compares with friends on that specific level.' },
      { heading: 'Public Profile', body: 'Enable Public Profile in Feature Access to let anyone view your stats at accuratkey.vercel.app/user/[username]. Shows your levels, badges, best WPM, and recent activity.' },
      { heading: 'Removing friends', body: 'Open Friends panel → tap a friend → Remove Friend. This removes them from your list and theirs. Challenges in progress are not affected.' },
    ],
    faqs: [
      ['Do both players need accounts?', 'Yes — guest mode doesn\'t have access to friend features.'],
      ['Are challenges real-time?', 'Both players type independently (not at the same moment). Results compare after both finish.'],
      ['Can I block someone?', 'Not yet — use the feedback button to request this feature.'],
      ['Is there a global leaderboard?', 'Yes — the Daily Challenge has a global leaderboard. Per-level global rankings are coming soon.'],
    ],
  },

  'daily': {
    title: 'Daily Challenge', emoji: '📅', color: '#f472b6',
    intro: 'A fresh typing challenge every day. Complete it to appear on the global daily leaderboard.',
    sections: [
      { heading: 'How it works', body: 'Every day at midnight a new word set is generated. Every player types the exact same words. Your score (WPM × accuracy ÷ 100) goes on the leaderboard. Only your first attempt counts — no retries.' },
      { heading: 'Streaks 🔥', body: 'A streak is the number of consecutive days you have typed at least one level or the daily challenge. Miss a day and it resets to 0. Shown in the nav bar as 🔥N. Streaks reset at midnight ET (Eastern Time).' },
      { heading: 'Daily Leaderboard', body: 'After completing, tap the Daily tab to see today\'s global rankings. The leaderboard updates in real time. Rankings reset every day at midnight.' },
      { heading: 'Availability', body: 'Daily challenge requires a logged-in account. Guest mode does not have access. The challenge becomes available again each day at midnight in your local timezone.' },
      { heading: 'Weekly Summary', body: 'At the end of each week a summary shows your total sessions, average WPM, accuracy trend, and how many daily challenges you completed.' },
    ],
    faqs: [
      ['Can I retry the daily challenge?', 'No — only your first attempt is recorded on the leaderboard.'],
      ['What time does it reset?', 'Midnight ET (Eastern Time) — UTC-4 during daylight saving (March–November), UTC-5 otherwise.'],
      ['What happens if I miss a day?', 'Your streak resets to 0. Nothing else happens — you can start a new streak immediately.'],
      ['Is the daily challenge the same for everyone?', 'Yes — every user worldwide types the same words each day.'],
    ],
  },

  'typing-tips': {
    title: 'Typing Tips', emoji: '✍️', color: '#4ade80',
    intro: 'Practical advice for improving your WPM and accuracy — from beginners to advanced typists.',
    sections: [
      { heading: 'Home Row Position', body: 'Place your left fingers on A S D F and right fingers on J K L ;. Your thumbs rest on the spacebar. This is the starting position — your fingers should always return here after each keystroke. The F and J keys have bumps on most keyboards to help you find home row without looking.' },
      { heading: 'Don\'t look at your hands', body: 'Touch typing means never looking at the keyboard. At first this feels impossible — your WPM will drop. That\'s normal and temporary. After 2–3 weeks of consistent practice your fingers will know where every key is.' },
      { heading: 'Accuracy before speed', body: 'Type slowly and correctly rather than fast and sloppy. Speed comes automatically once accuracy is solid. Typing at 80% accuracy at 60 WPM is worse than 98% accuracy at 40 WPM. AccuratKey\'s no-Backspace rule forces this habit.' },
      { heading: 'Consistent daily practice', body: '10–15 minutes every day beats 2 hours once a week. Muscle memory builds through repetition over time. Even a single level per day is enough to see improvement within two weeks.' },
      { heading: 'Warm up first', body: 'Start each session with Zen Mode or the Level 1 replay to warm your fingers up. Cold typing leads to more mistakes. Most professional typists warm up for 5 minutes before a speed test.' },
      { heading: 'Use all fingers', body: 'Each finger has assigned keys. Don\'t use your index finger for everything. Left index: F, G, R, T, V, B. Right index: J, H, Y, U, N, M. Left middle: D, E, C. Right middle: K, I, comma. Learn the finger map and stick to it.' },
      { heading: 'Relax your hands', body: 'Tension slows you down and causes strain. Your fingers should float lightly over the keys — don\'t press hard. Adjust your chair and desk so your elbows are roughly at 90° and your wrists aren\'t bent.' },
      { heading: 'Specific problem keys', body: 'If you keep mistyping the same key, spend 5 minutes typing words that use it heavily. AccuratKey\'s levels are designed to target specific keys in sequence — follow them in order for maximum benefit.' },
      { heading: 'Dealing with plateaus', body: 'WPM improves in bursts, not linearly. If you\'ve been stuck at the same speed for weeks, try: slower deliberate practice, the Memory games (Ghost Words, Echo), or switching to a different layout temporarily to reset habits.' },
    ],
    faqs: [
      ['How long does it take to get to 60 WPM?', 'With daily 15-min practice: 3–6 weeks from scratch. If you\'re already at 40, expect 2–4 weeks to reach 60.'],
      ['Should I switch to Colemak or Dvorak?', 'Only if you\'re starting from zero. Switching layouts requires 2–3 months of relearning and your WPM will drop to near zero initially. The efficiency gain is real but not dramatic for most people.'],
      ['Do mechanical keyboards help?', 'Tactile feedback can help with accuracy. But plenty of 150+ WPM typists use cheap membrane keyboards. Keyboard choice matters much less than consistent practice.'],
      ['Is it normal to type slower when I stop looking at my hands?', 'Yes — completely normal. WPM often drops by half when learning touch typing. It comes back within a few weeks and then exceeds your old speed.'],
    ],
  },

  'profiles': {
    title: 'Profiles & Account', emoji: '👤', color: '#64748b',
    intro: 'Manage your account, create multiple profiles, and keep everything organized.',
    sections: [
      { heading: 'One account, many profiles', body: 'A single AccuratKey account can have multiple profiles. Each profile has its own name, avatar, birthday, level progress, Keys, purchased themes/fonts, and settings. Great for families sharing a device or separating practice modes.' },
      { heading: 'Creating a profile', body: 'From the profile picker, tap + New Profile. Choose a name (up to 20 characters), pick an avatar from the emoji grid, upload a photo (optional), and enter a birthday. The birthday determines the age-adaptive theme and difficulty.' },
      { heading: 'Profile photo', body: 'Upload a photo from your device or scan a QR code to upload from your phone (on desktop). Photos are resized and stored securely. Remove a photo any time in Edit Profile.' },
      { heading: 'PIN protection', body: 'Set a 4-digit PIN in Edit Profile to protect a profile from being accessed or switched to without the PIN. Good for kids\' profiles on a shared device.' },
      { heading: 'Editing a profile', body: 'Tap your avatar in the nav bar → Edit Profile. Change name, avatar, photo, birthday, keyboard layout, and toggle features on or off. Tap Save at the bottom.' },
      { heading: 'Switching profiles', body: 'Tap Switch in the nav bar (desktop) or the profile avatar (mobile) to go back to the profile picker and choose a different profile.' },
      { heading: 'Deleting a profile', body: 'Edit Profile → scroll to the bottom → Delete Profile. This permanently deletes the profile, all its Keys, level progress, and purchased items. Cannot be undone.' },
      { heading: 'Account sign-in', body: 'Sign in with Google, GitHub, or email/password. All methods work with the same account as long as the email matches. Password reset is available from the sign-in screen.' },
      { heading: 'Deleting your account', body: 'Edit Profile → Delete Account. Deletes all profiles on the account and removes your login from the system. Completely permanent and irreversible.' },
    ],
    faqs: [
      ['How many profiles can I have?', 'There\'s no hard limit. Practically, 4–6 profiles per account is typical.'],
      ['Can I transfer a profile to another account?', 'Not currently.'],
      ['I forgot my PIN', 'Sign out and sign back in — signing in resets PIN protection. This is by design so you\'re never permanently locked out.'],
      ['Can I merge two accounts?', 'Not currently. Contact support via 💬 if this is urgent.'],
    ],
  },

  'features': {
    title: 'Features & Settings', emoji: '⚙️', color: '#e879f9',
    intro: 'AccuratKey has a rich set of per-profile features you can toggle on or off.',
    sections: [
      { heading: 'Feature Access', body: 'Tap your avatar → Feature Access to see and toggle all features for the current profile. Features are grouped: Navigation, Stats & History, Social, Shop & Customization, Advanced. Some features require specific conditions (e.g. having friends added).' },
      { heading: 'Sounds', body: 'Toggle typing sounds with the 🔇 button in the top bar of any game. AccuratKey generates sounds procedurally — each keypress plays a satisfying click. Sound packs from the Shop change the audio style.' },
      { heading: 'Ghost typing', body: 'Ghost typing shows a faint "shadow" of the correct character as you type. Useful for beginners. Toggle in Feature Access.' },

      { heading: 'Session history', body: 'View your past typing sessions from Edit Profile → Session History. Shows WPM, accuracy, level, and date for each session. Toggle visibility in Feature Access.' },
      { heading: 'Public profile', body: 'Enable to make your profile viewable at /user/[username]. Shows your stats, level progress, and recent activity. Disable to keep everything private.' },
      { heading: 'Keyboard layout', body: 'Select your physical keyboard layout in Edit Profile. AccuratKey uses this to correctly map keypresses to characters for non-QWERTY layouts.' },
      { heading: 'Age-adaptive settings', body: 'Entering an accurate birthday enables the age system: larger fonts, simpler words, and adjusted level caps for younger users. The app updates automatically as the profile\'s age changes.' },
    ],
    faqs: [
      ['What is Feature Access?', 'A panel that lets you toggle specific features on/off for a profile. Useful for kids\' profiles (disable shop, friends) or focused practice (disable distractions).'],
      ['Why are some features greyed out?', 'Some features require prerequisites — e.g. friends features require a username. The feature description explains what\'s needed.'],
      ['Do feature settings sync across devices?', 'Yes — feature settings are saved to your profile in the cloud.'],
    ],
  },

  'streaks': {
    title: 'Streaks & Stats', emoji: '🔥', color: '#f97316',
    intro: 'Track your consistency, view your history, and understand your stats.',
    sections: [
      { heading: 'Streaks 🔥', body: 'Complete at least one typing level or the daily challenge each calendar day to maintain your streak. The streak count shows in the nav bar. Missing a single day resets your streak to 0. There is no grace period.' },
      { heading: 'Session History', body: 'Every level you complete is logged as a session. Sessions show WPM, accuracy, level number, keyboard layout, and timestamp. Access from Edit Profile → Session History (requires the feature to be enabled).' },
      { heading: 'Weekly Summary', body: 'At the end of each week a summary card appears showing: total typing sessions, average WPM, accuracy trend (up/down), and daily challenge completion rate. Dismiss it whenever you want.' },
      { heading: 'Profile Stats', body: 'Your profile card (tap avatar → Profile) shows: Best WPM, total sessions, average accuracy, favorite layout, Keys balance, join date, and current streak.' },
      { heading: 'Level Bests', body: 'Each level records your best WPM and accuracy. These are shown when you replay a level so you can try to beat your record. Level bests persist forever even if you replay the level many times.' },
      { heading: 'WPM trend', body: 'The weekly summary shows whether your average WPM went up or down compared to the previous week. This gives you a simple indicator of whether your practice is paying off.' },
    ],
    faqs: [
      ['Does streak reset at midnight exactly?', 'Yes — midnight ET (Eastern Time). UTC-4 during daylight saving (March–November), UTC-5 otherwise.'],
      ['Can I see my all-time stats?', 'Profile stats show cumulative totals. Detailed session-by-session history is available in Session History.'],
      ['Are stats backed up?', 'Yes — stats sync to Firebase for logged-in users. Guest stats are local-only.'],
    ],
  },

  'layouts': {
    title: 'Keyboard Layouts', emoji: '🎹', color: '#38bdf8',
    intro: 'AccuratKey supports all major keyboard layouts. Here\'s what each one is and when to use it.',
    sections: [
      { heading: 'QWERTY', body: 'The universal standard — used by over 95% of English typists worldwide. If you\'re just starting out, use QWERTY. AccuratKey defaults to QWERTY. The layout was designed in the 1870s for typewriters and has stayed dominant ever since.' },
      { heading: 'QWERTZ', body: 'The standard in Germany, Austria, Switzerland, and much of Central Europe. Y and Z are swapped compared to QWERTY. If your physical keyboard has Z and Y in different positions from a US keyboard, you\'re probably using QWERTZ.' },
      { heading: 'AZERTY', body: 'The standard in France and Belgium. A and Q are swapped, Z and W are swapped, M moves to the right of L. French keyboards also have accented characters (é, è, ê) more accessible.' },
      { heading: 'Colemak', body: 'A modern alternative to QWERTY designed in 2006. Moves 17 keys to reduce finger travel and improve comfort. Popular among ergonomics enthusiasts. Keeps ZXCV in place for familiar shortcuts. Requires 2–3 months to relearn.' },
      { heading: 'Colemak-DH', body: 'A variant of Colemak that moves D and H to more comfortable positions for the index fingers. Considered slightly more ergonomic than standard Colemak. Growing in popularity.' },
      { heading: 'Dvorak', body: 'Designed in the 1930s by August Dvorak to put the most common letters on the home row. Vowels on the left, consonants on the right. Requires complete relearning. Controversial — real-world speed gains over QWERTY are debated.' },
      { heading: 'Workman', body: 'A 2010 layout designed to reduce lateral finger movement compared to Colemak. Places emphasis on minimizing the load on the index fingers. Less popular than Colemak but has a dedicated following.' },
      { heading: 'How to switch layouts in AccuratKey', body: 'Go to Edit Profile → Keyboard Layout → select your layout. AccuratKey will then correctly interpret your keypresses for that layout. Make sure your operating system layout matches your selection in AccuratKey.' },
    ],
    faqs: [
      ['Should I switch from QWERTY?', 'Only if you\'re starting from near-zero speed and want to invest 3+ months relearning. For most people, improving QWERTY touch typing gives better ROI.'],
      ['Can I practice two layouts?', 'Not simultaneously. You\'d need separate profiles — one for each layout.'],
      ['What if my OS layout doesn\'t match AccuratKey?', 'You\'ll see wrong characters. Make sure the layout in AccuratKey matches what your OS is set to. Go to Edit Profile to change it.'],
    ],
  },

  'accessibility': {
    title: 'Accessibility & Age', emoji: '♿', color: '#a3e635',
    intro: 'AccuratKey adapts automatically based on the user\'s age and supports a range of accessibility needs.',
    sections: [
      { heading: 'Age-adaptive system', body: 'When you create a profile and enter a birthday, AccuratKey calculates the user\'s current age and applies an age-appropriate experience. The app recalculates on each birthday automatically.' },
      { heading: 'Under 7 years old', body: 'Purple/indigo theme. Comic Sans or Chalkboard font (larger, rounder). Only the simplest 3–4 letter words. Large emoji icons. Simplified navigation.' },
      { heading: '7–9 years old', body: 'Soft purple theme. Slightly larger fonts. Simple words, some medium-length words. Full navigation but with simplified labels.' },
      { heading: '10–12 years old', body: 'Indigo theme. Standard font with slightly larger size. Normal word pool up to 7 letters.' },
      { heading: '13+ years old', body: 'Full dark theme. JetBrains Mono font at standard size. Full word pool. All 15 levels. All features available.' },
      { heading: 'Font size scaling', body: 'The app uses relative sizing throughout. If you find text too small, try a theme with a larger base font, or use your browser\'s zoom (Ctrl/Cmd + on desktop).' },
      { heading: 'Color themes', body: 'Many themes are available in the Shop. High-contrast options are available. Dark mode is the default. Switch to a light theme in the Shop if you prefer.' },
      { heading: 'Keyboard-only navigation', body: 'AccuratKey is primarily keyboard-driven by design. All interactions during typing tests are keyboard-only. Navigation buttons are large and touch-friendly for mobile users with a connected keyboard.' },
    ],
    faqs: [
      ['What if I entered the wrong birthday?', 'Edit Profile → change your birthday → Save. The age-adaptive theme updates immediately.'],
      
      ['Does AccuratKey support screen readers?', 'Partial support. The typing test area is not screen-reader friendly by design, but navigation and menus work with basic screen readers.'],
    ],
  },

  'security': {
    title: 'Privacy & Security', emoji: '🔒', color: '#94a3b8',
    intro: 'How AccuratKey handles your data, what\'s stored, and how to keep your account safe.',
    sections: [
      { heading: 'What data is stored', body: 'For logged-in users: email address, profile names, avatars/photos, birthday, level progress, Keys, purchased items, session history, friend list, and settings. All stored in Firebase (Google Cloud) with standard security.' },
      { heading: 'Guest mode data', body: 'Guest progress is stored only in your browser\'s localStorage. It never leaves your device. Clearing browser data or using a different browser/device loses guest progress. No account means no cloud backup.' },
      { heading: 'Profile photos', body: 'Photos are resized to 200×200px and stored as base64 in Firestore. They\'re only visible to you and anyone you share your public profile with.' },
      { heading: 'Profile PINs', body: 'Set a 4-digit PIN in Edit Profile to protect a profile. The PIN prevents other users of the same device from switching to your profile. It is NOT a cryptographic password — it\'s basic access control for shared devices.' },
      { heading: 'Authentication', body: 'AccuratKey uses Firebase Authentication. Google and GitHub sign-ins use OAuth 2.0. Email/password authentication uses Firebase\'s built-in system with bcrypt hashing. Passwords are never stored in plain text.' },
      { heading: 'Data deletion', body: 'Deleting a profile removes all associated data from Firestore. Deleting your account removes all profiles and your Firebase Auth record. Both operations are permanent.' },
      { heading: 'Third parties', body: 'AccuratKey uses Firebase (Google) for auth and database, and Vercel for hosting. No analytics services, no ad tracking, no third-party cookies. Typing data never leaves AccuratKey\'s Firebase project.' },
      { heading: 'Keeping your account safe', body: 'Use a strong unique password if using email login. Prefer Google sign-in for better security. Don\'t share your account with others — use separate profiles instead. Sign out after using a shared device.' },
    ],
    faqs: [
      ['Is my typing data sold or shared?', 'No. Your typing data stays in AccuratKey\'s Firebase project and is never shared or sold.'],
      ['Can I export my data?', 'Not currently. Contact support via 💬 if you need your data.'],
      ['Is AccuratKey COPPA compliant?', 'AccuratKey collects minimal data and doesn\'t serve ads. The birthday field is used only for age-adaptive features. Parents should supervise account creation for children under 13.'],
      ['What happens to my data if AccuratKey shuts down?', 'Data would be inaccessible. There\'s no automatic export mechanism currently.'],
    ],
  },

  'troubleshooting': {
    title: 'Troubleshooting', emoji: '🔧', color: '#ef4444',
    intro: 'Common problems and how to fix them.',
    sections: [
      { heading: 'App crashes on load', body: 'Hard refresh the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac). Clear browser cache. Try a different browser. If on mobile, make sure your OS and browser are up to date.' },
      { heading: 'Keyboard not detected', body: 'Click anywhere on the AccuratKey page to give it keyboard focus. Check that your physical keyboard is properly connected (Bluetooth: check it\'s paired; USB: check the cable). Try pressing several keys in quick succession.' },
      { heading: 'Wrong characters appearing', body: 'Your OS keyboard layout doesn\'t match your AccuratKey layout setting. Go to Edit Profile → Keyboard Layout and make sure they match. Check your OS input settings too.' },
      { heading: 'Game tab crashes', body: 'This is usually a JavaScript error in a game component. Hard refresh the page. If a specific game keeps crashing, use the 💬 feedback button to report which game and what happened.' },
      { heading: 'Can\'t sign in with Google', body: 'Make sure your browser allows popups from accuratkey.vercel.app. Try disabling popup blockers. If the popup opens but nothing happens after selecting an account, try refreshing and trying again.' },
      { heading: 'Progress not saving', body: 'For guest mode, make sure your browser\'s localStorage isn\'t blocked (some privacy settings block it). For accounts, check your internet connection — progress saves to Firebase in real time.' },
      { heading: 'Shop not opening', body: 'The Shop button requires a logged-in account. Guest mode doesn\'t have Shop access. If logged in, make sure the Shop feature is enabled in Feature Access.' },
      { heading: 'Profile picker appearing randomly', body: 'This can happen if Firebase\'s auth state fires multiple times. Refresh the page. If it keeps happening, sign out and sign back in.' },
      { heading: 'Sound not working', body: 'Check that your device volume is not muted. Check that the 🔊 button in AccuratKey is not toggled to muted (🔇). On iOS, check the silent/ring switch on the side of the device.' },
      { heading: 'Streak reset unexpectedly', body: 'Streaks reset at midnight local time. If you completed a level close to midnight, it may have counted for the wrong day. Check your device\'s timezone is set correctly.' },
    ],
    faqs: [
      ['The app worked yesterday but not today', 'Most likely a cached version is conflicting with a recent update. Hard refresh (Ctrl+Shift+R) and try again.'],
      ['I lost all my progress', 'If you were in guest mode, progress is browser-local. Clearing browser data removes it. For accounts, all progress is cloud-backed and should be there after re-logging-in.'],
      ['A game is behaving strangely', 'Report it via the 💬 feedback button in the app with the game name and what happened. Screenshots help if you can include them.'],
      ['I can\'t find the feedback button', 'It\'s the 💬 icon in the top-right nav bar, next to your avatar. You need to be logged in to send feedback.'],
    ],
  },

  'faq': {
    title: 'Frequently Asked Questions', emoji: '❓', color: '#22d3ee',
    intro: 'The most common questions, answered directly.',
    sections: [],
    faqs: [
      ['Why can\'t I use Backspace?', 'AccuratKey disables Backspace intentionally. The goal is to train accurate typing from the start — pressing the right key the first time, not typing fast and fixing errors. This builds genuine muscle memory faster than any other method.'],
      ['Why does it need a physical keyboard?', 'Touchscreen typing doesn\'t have key travel or tactile feedback. Skills built on a glass screen don\'t transfer to physical keyboard typing. AccuratKey is specifically for physical keyboard training.'],
      ['Is AccuratKey free?', 'The base app is free. A Pro subscription unlocks bonus features for power users. Keys can be earned by playing or purchased directly.'],
      ['What is WPM?', 'Words Per Minute. Calculated as (characters typed ÷ 5) ÷ minutes elapsed. Dividing by 5 is the standard way to normalize "word" length. The average office worker types 40 WPM. Professional typists reach 80–120+. World record is over 200.'],
      ['What does accuracy mean in AccuratKey?', 'The percentage of characters you typed correctly on the first keypress. Unlike most typing sites, there\'s no Backspace — every typo is permanent. Your true accuracy is measured, not your corrected accuracy.'],
      ['Does AccuratKey work offline?', 'You need internet to load the page. Once loaded, most features work offline. Progress syncs to the cloud when you reconnect. Guest mode works fully offline once the page is loaded.'],
      ['How do I improve my WPM?', 'Focus on accuracy first — speed comes naturally. Practice home row position. Use daily 15-minute sessions over weeks rather than long infrequent sessions. Use AccuratKey\'s levels in order — each one targets a specific skill.'],
      ['What keyboard layout should I use?', 'QWERTY for almost everyone. Colemak or Dvorak only if starting from scratch and willing to invest months relearning. The efficiency gain over QWERTY is real but small for most people.'],
      ['Why is my accuracy lower here than on other typing sites?', 'Because AccuratKey measures raw accuracy — no Backspace to hide mistakes. Other sites measure corrected accuracy. Both are valid but they measure different things. Raw accuracy is a stricter and more honest measure.'],
      ['Can I use AccuratKey on my phone?', 'Only with a physical keyboard connected (Bluetooth or USB). Mobile touchscreens are not supported. Once a keyboard is connected, the full app is accessible.'],
      ['How do streaks work?', 'Complete one level or the daily challenge each calendar day to keep your streak. Streaks reset at midnight local time if you miss a day. Streaks show in the nav bar as 🔥N.'],
      ['What is the Daily Challenge?', 'A new set of words generated fresh each day. Everyone types the same words. One attempt only. Scores go on the global daily leaderboard. Requires a logged-in account.'],
      ['How do I change my keyboard layout in AccuratKey?', 'Edit Profile → Keyboard Layout → select your layout (QWERTY, AZERTY, QWERTZ, Colemak, Dvorak, etc.). Make sure it matches your OS keyboard language setting.'],
      ['Can I have multiple profiles?', 'Yes — one account can have unlimited profiles. Each has its own name, progress, Keys, themes, and settings. Great for families.'],
      ['How do I delete my account?', 'Edit Profile → Delete Account. This permanently deletes all profiles, progress, Keys, and your login. Cannot be undone.'],
      ['What are Keys 🔑?', 'The in-game currency. Earned by completing typing levels. Spent in the Shop on themes, fonts, and sound packs. Can be gifted to friends. No real-money involvement.'],
      ['How do I report a bug?', 'Tap the 💬 button in the nav bar (when logged in) and describe what happened. The developer reads every message.'],
      ['Is there a mobile app?', 'Not yet — AccuratKey runs as a web app in any modern browser. It can be added to your home screen as a PWA (Progressive Web App) on both iOS and Android for an app-like experience.'],
      ['Can I use AccuratKey in a classroom?', 'Yes. Create one account per student or use guest mode (no accounts needed). The age-adaptive system adjusts difficulty automatically. Teacher mode / class management is not available yet but is planned.'],
      ['Why is there no autocorrect?', 'AccuratKey is for typing training. Autocorrect would mask your errors and prevent learning. Every keystroke you press is exactly what AccuratKey records.'],
    ],
  },
};

export default function HelpTopicPage({ params }: { params: { id: string } }) {
  const topic = TOPICS[params.id];
  if (!topic) notFound();
  const { title, emoji, color, intro, sections, faqs } = topic;
  const [openFaq, setOpenFaq] = useState<number|null>(null);

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:740,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}>
          <span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span>
        </Link>
        <Link href="/help" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← Help Center</Link>
      </nav>
      <main style={{maxWidth:740,margin:'40px auto 80px'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:8}}>
          <span style={{fontSize:36}}>{emoji}</span>
          <div>
            <h1 style={{fontSize:26,fontWeight:800,marginBottom:4}}>{title}</h1>
            <div style={{width:40,height:3,background:color,borderRadius:2}}/>
          </div>
        </div>
        <p style={{color:'#666',fontSize:14,lineHeight:1.7,marginTop:16,marginBottom:32}}>{intro}</p>

        {sections.map(({heading,body}) => (
          <div key={heading} style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'18px 22px',marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:13,color,marginBottom:8}}>{heading}</div>
            <p style={{color:'#888',fontSize:13,lineHeight:1.8,margin:0}}>{body}</p>
          </div>
        ))}

        {faqs && faqs.length > 0 && (
          <div style={{marginTop:30}}>
            <div style={{fontSize:11,color:'#555',letterSpacing:2,marginBottom:14}}>FREQUENTLY ASKED</div>
            {faqs.map(([q,a],i) => (
              <div key={i} style={{background:'#13131f',border:`1px solid ${openFaq===i?color+'66':'#1e1e30'}`,borderRadius:10,marginBottom:6,overflow:'hidden'}}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',padding:'13px 18px',background:'none',border:'none',color:'#e0e0ff',fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,cursor:'pointer',textAlign:'left',display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                  <span>{q}</span>
                  <span style={{color,fontSize:16,flexShrink:0}}>{openFaq===i?'−':'+'}</span>
                </button>
                {openFaq===i && <div style={{padding:'0 18px 14px',color:'#777',fontSize:13,lineHeight:1.8}}>{a}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:32}}>
          <Link href="/help" style={{padding:'10px 18px',background:'transparent',border:'1px solid #1e1e30',borderRadius:8,color:'#555',fontSize:12,textDecoration:'none'}}>← All topics</Link>
          <Link href="/game" style={{padding:'10px 18px',background:color,border:'none',borderRadius:8,color:'#000',fontSize:12,fontWeight:700,textDecoration:'none'}}>Back to game →</Link>
        </div>
      </main>
    </div>
  );
}
