'use client';
import Link from 'next/link';
import { useState } from 'react';
import { notFound } from 'next/navigation';

type Section = { heading: string; body: string; };
type Topic = { title: string; emoji: string; color: string; intro: string; sections: Section[]; faqs?: [string,string][]; };

const TOPICS: Record<string, Topic> = {
  'getting-started': {
    title: 'Getting Started',
    emoji: '🚀',
    color: '#7c6af7',
    intro: 'New to AccuratKey? Here\'s everything you need to get up and running in under 5 minutes.',
    sections: [
      { heading: '1. Create an account', body: 'Go to accuratkey.vercel.app and click Sign Up. You can sign in with Google (easiest), GitHub, or an email and password. You can also Continue as Guest to try it without an account — progress is saved locally.' },
      { heading: '2. Create a profile', body: 'After signing in you\'ll create your first profile. Choose a name, pick an avatar, and enter your birthday (used to adjust font sizes for younger users). You can have multiple profiles on one account — great for families.' },
      { heading: '3. Connect a keyboard', body: 'AccuratKey requires a physical keyboard. On desktop you\'re already good to go. On a phone or tablet, connect a Bluetooth or USB keyboard first. See the Keyboard Setup section for detailed instructions.' },
      { heading: '4. Start your first level', body: 'From the Level Map tab, tap Level 1. Read the typing tip, then click Start Typing. Type the words shown on screen. You can\'t use Backspace — every keystroke counts.' },
      { heading: '5. Pass and unlock', body: 'Each level has a WPM (words per minute) target and accuracy requirement. Pass to unlock the next level. You earn 🔑 Keys for every level you complete.' },
    ],
    faqs: [
      ['Do I need an account?', 'No — you can use Guest mode to play all levels and games. Progress is saved in your browser. Create an account to sync across devices, use friends features, and access the daily challenge.'],
      ['Is it free?', 'Yes. AccuratKey is completely free. The Shop sells cosmetic items (themes, fonts) for Keys earned in-game — no real money involved.'],
      ['What browsers work?', 'Chrome, Firefox, Safari, and Edge all work. Chrome is recommended for best performance.'],
    ],
  },
  'levels': {
    title: 'Levels & Progress',
    emoji: '📈',
    color: '#34d399',
    intro: 'AccuratKey has 15 levels of increasing difficulty. Each one targets specific typing skills.',
    sections: [
      { heading: 'Level Map', body: 'The Level Map shows all 15 levels as nodes on a path. Completed levels show a ✓. Your current level glows. Locked levels show 🔒. Use Show More to reveal upcoming levels.' },
      { heading: 'WPM & Accuracy', body: 'Each level has a minimum WPM (words per minute) and accuracy % to pass. WPM is calculated from characters typed divided by 5 (standard word length), per minute. Accuracy is the percentage of correct characters on first press — no Backspace means every typo counts.' },
      { heading: 'No Backspace', body: 'AccuratKey intentionally disables Backspace. The goal is to train your fingers to press the right key the first time, not to type fast and fix errors. This builds genuine muscle memory.' },
      { heading: 'Level Bests', body: 'Your best WPM and accuracy for each level are saved in your profile. You can replay any unlocked level to improve your personal best. Replays don\'t affect your unlock progress.' },
      { heading: 'Keys Earned', body: 'Completing a level earns 🔑 Keys. Higher levels earn more keys. A combo multiplier applies if you type 10+ or 20+ words in a row correctly.' },
    ],
    faqs: [
      ['Can I skip levels?', 'You can attempt the next locked level without completing the current one — but you must pass it to unlock further levels.'],
      ['What if I fail?', 'Nothing bad happens — just try again. There\'s no limit on attempts.'],
      ['Does guest mode save level progress?', 'Yes — guest progress is saved in your browser\'s localStorage. Clearing browser data will erase it.'],
    ],
  },
  'games': {
    title: 'Games',
    emoji: '🎮',
    color: '#f59e0b',
    intro: 'AccuratKey has 38 game modes across 10 categories. Each one trains a different aspect of typing.',
    sections: [
      { heading: '⚡ Speed Games', body: 'Word Rain, Speed Burst, Speed Ladder, Speed Test — focused on raw typing speed. Words come faster and faster. Good for building WPM.' },
      { heading: '🎯 Accuracy Games', body: 'Survival, Sudden Death, Sniper Mode — one mistake and it\'s over (or you lose a life). Forces precise keystrokes over speed.' },
      { heading: '🧠 Memory Games', body: 'Ghost Words, Echo Mode, Mirror Mode — words flash briefly then disappear. You type from memory. Builds visual memory and touch typing.' },
      { heading: '🕹️ Arcade Games', body: 'Typing Invaders, Asteroid Belt, Brick Breaker, Boss Battle, Code Rain — words control a game element. Type correctly to shoot, destroy, or survive.' },
      { heading: '🧘 Chill Games', body: 'Zen Mode, Typewriter Story, Typing Journal, Poetry Mode — no timer, no pressure. Just type at your own pace. Great for warmups.' },
      { heading: '🔀 Puzzle Games', body: 'Word Scramble, Anagram, Missing Letters — rearranged or partially hidden words. Tests your word recognition speed.' },
      { heading: '📚 Educational Games', body: 'Spelling Bee (with text-to-speech), Vocab Builder, Synonyms, Antonyms — learn while you type. Spelling Bee reads the word aloud.' },
      { heading: '🎨 Creative Games', body: 'Mad Libs, Haiku Mode, Quotes — type creatively structured content. Fun and different.' },
      { heading: '🏆 Challenge Games', body: '100 Words, Endurance, Word Chain — complete specific goals. 100 Words makes you type exactly 100 words. Endurance goes until you drop.' },
      { heading: '🎲 Random', body: 'Roulette — randomly picks a game mode each round. Good for variety.' },
    ],
    faqs: [
      ['Do games save progress?', 'Each game saves your last session score locally. Personal bests are tracked per game.'],
      ['Are games available in guest mode?', 'Yes — all 38 games are fully playable in guest mode.'],
      ['How does Spelling Bee TTS work?', 'The word is read aloud using your device\'s built-in text-to-speech. Tap the 🔊 button to hear it again. Type the word without seeing it to test spelling.'],
    ],
  },
  'keys-shop': {
    title: 'Keys & Shop',
    emoji: '🔑',
    color: '#fb923c',
    intro: '🔑 Keys are AccuratKey\'s in-game currency. Earn them by playing — spend them on cosmetics.',
    sections: [
      { heading: 'Earning Keys', body: 'You earn Keys every time you complete a typing level. Higher levels give more Keys. A combo multiplier (1.5× for 10+ combo, 2× for 20+ combo) can boost your earnings. Replaying levels also earns Keys.' },
      { heading: 'The Shop', body: 'Spend Keys on Themes (color schemes), Fonts, and Sound Packs. Everything in the shop is purely cosmetic — it doesn\'t affect gameplay. Once purchased, an item is yours forever on that profile.' },
      { heading: 'Themes', body: 'Themes change the entire color scheme of the app. Dark, light, neon, retro, pastel — many options. Equip a theme from the Shop or from Edit Profile.' },
      { heading: 'Fonts', body: 'Change the typeface used throughout the app and during typing tests. Monospace, sans-serif, display fonts and more.' },
      { heading: 'Sending Keys', body: 'You can gift Keys to friends if the Send Keys feature is enabled on your profile. Go to a friend\'s profile and tap Gift 🔑.' },
    ],
    faqs: [
      ['Can I buy Keys with real money?', 'No. Keys are only earned by playing. There are no microtransactions.'],
      ['Do Keys carry over to a new profile?', 'No — Keys are per profile, not per account.'],
      ['What if I don\'t have enough Keys?', 'Just keep playing levels and games. Keys accumulate quickly.'],
    ],
  },
  'social': {
    title: 'Friends & Challenges',
    emoji: '👥',
    color: '#a78bfa',
    intro: 'Add friends, challenge them to typing duels, and see how you rank.',
    sections: [
      { heading: 'Adding Friends', body: 'You need a username first (set in Edit Profile). Then click 👥 in the nav bar, search for a friend\'s username, and send a request. They\'ll see it next time they open the app.' },
      { heading: 'Challenges', body: 'Click ⚔️ in the nav bar, pick a friend and a level, and send a challenge. They\'ll be notified. Both players type the same level — the one with the higher WPM wins.' },
      { heading: 'Spectating', body: 'You can watch friends type in real time. Open a challenge and tap Spectate. You\'ll see their progress live.' },
      { heading: 'Friend Leaderboard', body: 'See how your WPM ranks against your friends on a per-level basis. Tap a level from the Level Map and choose Friend Leaderboard.' },
      { heading: 'Public Profile', body: 'Enable Public Profile in Feature Access to let other users view your stats, levels, and badges. Your profile URL is accuratkey.vercel.app/user/[username].' },
    ],
    faqs: [
      ['Do I need a username?', 'Yes, to use friend features. Set one in Edit Profile.'],
      ['Can I remove a friend?', 'Yes — open the Friends panel, tap the friend, and choose Remove.'],
      ['Are challenges real-time?', 'Both players type independently — not simultaneously in real time. Results are compared after both finish.'],
    ],
  },
  'daily': {
    title: 'Daily Challenge',
    emoji: '📅',
    color: '#f472b6',
    intro: 'A new typing challenge every day. Complete it to appear on the daily leaderboard.',
    sections: [
      { heading: 'How it works', body: 'Every day at midnight a new set of words is generated. All players type the same words. Your score (WPM × accuracy) determines your leaderboard rank. Only your first attempt counts.' },
      { heading: 'Streaks', body: 'Complete at least one level or the daily challenge each day to maintain your streak 🔥. Streaks reset at midnight if you miss a day. Longer streaks are shown on your profile.' },
      { heading: 'Daily Leaderboard', body: 'After completing the daily challenge, tap Daily tab → Leaderboard to see today\'s top scores. Rankings update in real time.' },
      { heading: 'Accessibility', body: 'The daily challenge is available to all logged-in users. Guest mode does not have access to the daily challenge or leaderboard.' },
    ],
    faqs: [
      ['Can I retry the daily challenge?', 'No — only your first attempt is recorded.'],
      ['What time does it reset?', 'Midnight in your local timezone.'],
      ['Do I need to complete it every day?', 'No — it\'s optional. But streaks require daily activity.'],
    ],
  },
  'account': {
    title: 'Account & Profiles',
    emoji: '👤',
    color: '#64748b',
    intro: 'Manage your account, create multiple profiles, and customize your experience.',
    sections: [
      { heading: 'Sign-in methods', body: 'You can sign in with Google, GitHub, or email/password. All methods link to the same account if you use the same email. You can add more sign-in methods in account settings.' },
      { heading: 'Multiple profiles', body: 'One account can have multiple profiles — useful for families sharing a device or for separating work and practice sessions. Each profile has its own level progress, Keys, themes, and settings.' },
      { heading: 'Age & themes', body: 'Enter your birthday when creating a profile. AccuratKey uses your age to adjust fonts, word complexity, and maximum level. Profiles under 10 use larger fonts and simpler words.' },
      { heading: 'Editing a profile', body: 'Tap your avatar in the nav bar to open Edit Profile. Change your name, avatar, birthday, layout, and toggle features on or off.' },
      { heading: 'Deleting a profile', body: 'Edit Profile → scroll to the bottom → Delete Profile. This permanently deletes the profile and all its data including Keys, progress, and purchases.' },
      { heading: 'Deleting your account', body: 'Edit Profile → Delete Account. This deletes ALL profiles on the account and the account itself. Permanent and irreversible.' },
    ],
    faqs: [
      ['Can I change my email?', 'Not currently. Contact support via the 💬 feedback button.'],
      ['I forgot my password', 'On the sign-in screen, tap Forgot Password. A reset link will be emailed to you.'],
      ['Can I transfer progress between profiles?', 'Not currently — each profile\'s data is separate.'],
    ],
  },
  'faq': {
    title: 'Frequently Asked Questions',
    emoji: '❓',
    color: '#22d3ee',
    intro: 'Quick answers to the most common questions.',
    sections: [],
    faqs: [
      ['Why can\'t I use Backspace?', 'AccuratKey intentionally disables Backspace to train accurate typing from the start. The goal is to press the right key the first time, not to type fast and fix errors. This builds genuine muscle memory faster.'],
      ['Why does it need a physical keyboard?', 'Typing on a glass touchscreen doesn\'t have the tactile feedback or key travel of a physical keyboard. AccuratKey is designed to improve physical keyboard typing — touchscreen would undermine the whole point.'],
      ['Is AccuratKey free?', 'Yes, completely. No subscriptions, no paywalls, no real-money purchases. Keys are earned only by playing.'],
      ['What is WPM?', 'Words Per Minute. Calculated as (characters typed ÷ 5) ÷ minutes elapsed. Dividing by 5 is the standard way to normalize "word" length across different texts.'],
      ['What accuracy does AccuratKey measure?', 'The percentage of characters you typed correctly on the first press. Every typo reduces your accuracy — there\'s no way to "hide" mistakes.'],
      ['Does AccuratKey work offline?', 'Partially. The page loads from the server, so you need internet to open it. Once loaded, most features work offline. Progress syncs when you reconnect.'],
      ['How do I improve my WPM?', 'Focus on accuracy first — speed comes naturally. Practice the home row position (ASDF JKL;). Use the Zen Mode game for relaxed practice. Type every day — even 10 minutes is enough.'],
      ['What keyboard layout should I use?', 'QWERTY if you\'re just starting. Colemak or Dvorak are more efficient but require relearning from scratch. AccuratKey supports all major layouts — change it in Edit Profile.'],
      ['Why is my accuracy lower on AccuratKey than other sites?', 'Most typing sites let you fix mistakes with Backspace. AccuratKey doesn\'t, so your true accuracy is measured. It\'ll feel lower at first but improves fast.'],
      ['How do I report a bug?', 'Use the 💬 feedback button in the app. Describe what happened and what you expected. The dev reads every message.'],
      ['Can I use AccuratKey in a classroom?', 'Yes — create a profile for each student. Guest mode works without accounts. The age-adaptive system adjusts difficulty for younger users automatically.'],
      ['Why is mobile not supported for everyone?', 'Touchscreen typing on a phone doesn\'t transfer to physical keyboard skills. AccuratKey is specifically for physical keyboard training. Mobile users with a Bluetooth keyboard connected can access the full app.'],
      ['How do streaks work?', 'Complete at least one typing level or the daily challenge each calendar day to maintain your streak. Streaks reset at midnight. They\'re shown on your profile and in the nav bar.'],
      ['What is the Daily Challenge?', 'A fresh set of words generated every day. All players type the same words. One attempt per day. Scores go on the daily leaderboard.'],
      ['Can I delete my account?', 'Yes. Edit Profile → Delete Account. This permanently deletes all profiles, Keys, progress, and your login — it cannot be undone.'],
    ],
  },
};

export default function HelpTopicPage({ params }: { params: { id: string } }) {
  const topic = TOPICS[params.id];
  if (!topic) notFound();

  const { title, emoji, color, intro, sections, faqs } = topic;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <h1 style={{fontSize:28,fontWeight:800,marginBottom:2}}>{title}</h1>
            <div style={{width:40,height:3,background:color,borderRadius:2}}/>
          </div>
        </div>
        <p style={{color:'#666',fontSize:14,lineHeight:1.7,marginTop:16,marginBottom:36}}>{intro}</p>

        {sections.map(({heading, body}) => (
          <div key={heading} style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'20px 24px',marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:14,color:color,marginBottom:10}}>{heading}</div>
            <p style={{color:'#888',fontSize:13,lineHeight:1.8,margin:0}}>{body}</p>
          </div>
        ))}

        {faqs && faqs.length > 0 && (
          <div style={{marginTop:32}}>
            <div style={{fontSize:11,color:'#555',letterSpacing:2,marginBottom:16}}>FREQUENTLY ASKED</div>
            {faqs.map(([q,a],i) => (
              <div key={i} style={{background:'#13131f',border:`1px solid ${openFaq===i?color+'66':'#1e1e30'}`,borderRadius:10,marginBottom:6,overflow:'hidden',transition:'border-color 0.2s'}}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',padding:'14px 20px',background:'none',border:'none',color:'#e0e0ff',fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,cursor:'pointer',textAlign:'left',display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                  <span>{q}</span>
                  <span style={{color:color,fontSize:16,flexShrink:0}}>{openFaq===i?'−':'+'}</span>
                </button>
                {openFaq===i && (
                  <div style={{padding:'0 20px 16px',color:'#777',fontSize:13,lineHeight:1.8}}>{a}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:36}}>
          <Link href="/help" style={{padding:'10px 18px',background:'transparent',border:'1px solid #1e1e30',borderRadius:8,color:'#555',fontSize:12,textDecoration:'none'}}>← All topics</Link>
          <Link href="/game" style={{padding:'10px 18px',background:color,border:'none',borderRadius:8,color:'#000',fontSize:12,fontWeight:700,textDecoration:'none'}}>Back to game →</Link>
        </div>
      </main>
    </div>
  );
}
