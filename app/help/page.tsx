'use client';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

const TOPICS = [
  {
    id: 'getting-started',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    title: 'Getting Started',
    desc: 'Accounts, profiles, first level',
    color: '#7c6af7',
  },
  {
    id: 'keyboard-setup',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></svg>,
    title: 'Keyboard Setup',
    desc: 'Bluetooth, USB, iPad, desktop',
    color: '#06b6d4',
    href: '/keyboard',
  },
  {
    id: 'levels',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    title: 'Levels & Progress',
    desc: 'Level map, WPM, accuracy, passing',
    color: '#34d399',
  },
  {
    id: 'games',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="1" fill="#f59e0b"/><circle cx="17" cy="13" r="1" fill="#f59e0b"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg>,
    title: 'Games',
    desc: 'All 38 game modes explained',
    color: '#f59e0b',
  },
  {
    id: 'keys-shop',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="3"/></svg>,
    title: 'Keys & Shop',
    desc: 'Earning keys, themes, fonts, purchases',
    color: '#fb923c',
  },
  {
    id: 'social',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Friends & Challenges',
    desc: 'Adding friends, duels, leaderboards',
    color: '#a78bfa',
  },
  {
    id: 'daily',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    title: 'Daily Challenge',
    desc: 'Daily words, streaks, leaderboard',
    color: '#f472b6',
  },
  {
    id: 'typing-tips',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    title: 'Typing Tips',
    desc: 'How to improve WPM and accuracy fast',
    color: '#4ade80',
  },
  {
    id: 'profiles',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    title: 'Profiles & Account',
    desc: 'Multiple profiles, settings, deleting',
    color: '#64748b',
  },
  {
    id: 'features',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Features & Settings',
    desc: 'Feature access, sounds, themes, pomodoro',
    color: '#e879f9',
  },
  {
    id: 'streaks',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z"/><path d="M12 12c0 3-2 4-2 7a2 2 0 0 0 4 0c0-3-2-4-2-7z"/></svg>,
    title: 'Streaks & Stats',
    desc: 'Streaks, weekly summary, session history',
    color: '#f97316',
  },
  {
    id: 'layouts',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 14h4M14 14h4M12 14h.01"/></svg>,
    title: 'Keyboard Layouts',
    desc: 'QWERTY, Dvorak, Colemak, AZERTY and more',
    color: '#38bdf8',
  },
  {
    id: 'accessibility',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,
    title: 'Accessibility & Age',
    desc: 'Age-adaptive themes, font sizes, simpler words',
    color: '#a3e635',
  },
  {
    id: 'security',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Privacy & Security',
    desc: 'Data storage, PINs, account safety',
    color: '#94a3b8',
  },
  {
    id: 'troubleshooting',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    title: 'Troubleshooting',
    desc: 'Common problems and how to fix them',
    color: '#ef4444',
  },
  {
    id: 'faq',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    title: 'FAQ',
    desc: 'Quick answers to everything',
    color: '#22d3ee',
  },
];

export default function HelpPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:860,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}>
          <span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span>
        </Link>
        <Link href="/game" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← Back to game</Link>
      </nav>
      <main style={{maxWidth:860,margin:'48px auto 80px'}}>
        <h1 style={{fontSize:32,fontWeight:800,marginBottom:6}}>Help Center</h1>
        <p style={{color:'#555',fontSize:14,marginBottom:40}}>Everything you need to know about AccuratKey.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10,marginBottom:48}}>
          {TOPICS.map(({id,icon,title,desc,color,href}: any) => (
            <Link key={id} href={href||`/help/${id}`} style={{textDecoration:'none'}}>
              <div style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'18px',height:'100%',boxSizing:'border-box'}}>
                <div style={{marginBottom:10}}>{icon}</div>
                <div style={{fontWeight:700,fontSize:13,color:'#e0e0ff',marginBottom:4}}>{title}</div>
                <div style={{fontSize:11,color:'#555',lineHeight:1.5}}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'22px',marginBottom:16}}>
          <div style={{fontSize:11,color:'#7c6af7',letterSpacing:2,marginBottom:14}}>QUICK LINKS</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {[
              ['⌨️ Keyboard setup','/keyboard'],['🔵 Bluetooth','/keyboard/bluetooth'],
              ['🔌 USB keyboard','/keyboard/usb'],['🍎 iPad Smart Connector','/keyboard/ipad-smart'],
              ['💻 Desktop','/keyboard/desktop'],['🚀 Getting started','/help/getting-started'],
              ['📈 Levels','/help/levels'],['🎮 Games','/help/games'],
              ['🔑 Keys & Shop','/help/keys-shop'],['👥 Friends','/help/social'],
              ['📅 Daily','/help/daily'],['✍️ Typing tips','/help/typing-tips'],
              ['🎹 Layouts','/help/layouts'],['♿ Accessibility','/help/accessibility'],
              ['🔒 Privacy','/help/security'],['🔧 Troubleshooting','/help/troubleshooting'],
              ['❓ FAQ','/help/faq'],
            ].map(([l,h]: any)=>(
              <Link key={h} href={h} style={{display:'inline-block',padding:'5px 11px',background:'#0a0a0f',border:'1px solid #1e1e30',borderRadius:6,color:'#777',fontSize:11,textDecoration:'none'}}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{textAlign:'center',padding:'26px',background:'#13131f',border:'1px solid #1e1e30',borderRadius:12}}>
          <p style={{color:'#555',fontSize:13,marginBottom:14}}>Can't find what you're looking for?</p>
          <Link href="/game" style={{display:'inline-block',padding:'10px 24px',background:'#7c6af7',borderRadius:8,color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>Send feedback in-app 💬</Link>
        </div>
      </main>
    </div>
  );
}
