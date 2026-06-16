import Link from 'next/link';
export const dynamic = 'force-dynamic';

const TOPICS = [
  {
    id: 'getting-started',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
    title: 'Getting Started',
    desc: 'Accounts, profiles, first level, keyboard setup',
    color: '#7c6af7',
  },
  {
    id: 'keyboard-setup',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/>
      </svg>
    ),
    title: 'Keyboard Setup',
    desc: 'Bluetooth, USB, iPad, and more',
    color: '#06b6d4',
    href: '/keyboard',
  },
  {
    id: 'levels',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: 'Levels & Progress',
    desc: 'Level map, unlocking levels, WPM, accuracy',
    color: '#34d399',
  },
  {
    id: 'games',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
        <circle cx="15" cy="11" r="1" fill="#f59e0b"/><circle cx="17" cy="13" r="1" fill="#f59e0b"/>
        <rect x="2" y="6" width="20" height="12" rx="4"/>
      </svg>
    ),
    title: 'Games',
    desc: 'All 38 game modes explained',
    color: '#f59e0b',
  },
  {
    id: 'keys-shop',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: 'Keys & Shop',
    desc: 'Earning keys, themes, fonts, purchases',
    color: '#fb923c',
  },
  {
    id: 'social',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Friends & Challenges',
    desc: 'Adding friends, duels, leaderboards',
    color: '#a78bfa',
  },
  {
    id: 'daily',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
      </svg>
    ),
    title: 'Daily Challenge',
    desc: 'Daily words, streaks, daily leaderboard',
    color: '#f472b6',
  },
  {
    id: 'account',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Account & Profiles',
    desc: 'Creating accounts, multiple profiles, deleting',
    color: '#64748b',
  },
  {
    id: 'faq',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: 'FAQ',
    desc: 'Quick answers to common questions',
    color: '#22d3ee',
  },
];

export default function HelpPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:800,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}>
          <span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span>
        </Link>
        <Link href="/game" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← Back to game</Link>
      </nav>

      <main style={{maxWidth:800,margin:'48px auto 80px'}}>
        <h1 style={{fontSize:32,fontWeight:800,marginBottom:6}}>Help Center</h1>
        <p style={{color:'#555',fontSize:14,marginBottom:40}}>Everything you need to know about AccuratKey.</p>

        {/* Topic grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,marginBottom:48}}>
          {TOPICS.map(({id, icon, title, desc, color, href}) => (
            <Link key={id} href={href || `/help/${id}`} style={{textDecoration:'none'}}>
              <div style={{background:'#13131f',border:`1px solid #1e1e30`,borderRadius:12,padding:'20px',cursor:'pointer',transition:'border-color 0.2s'}}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=color+'88')}
                onMouseLeave={e=>(e.currentTarget.style.borderColor='#1e1e30')}>
                <div style={{marginBottom:12}}>{icon}</div>
                <div style={{fontWeight:700,fontSize:14,color:'#e0e0ff',marginBottom:4}}>{title}</div>
                <div style={{fontSize:11,color:'#555',lineHeight:1.5}}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'24px',marginBottom:20}}>
          <div style={{fontSize:11,color:'#7c6af7',letterSpacing:2,marginBottom:16}}>QUICK LINKS</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
            {[
              ['⌨️ Connect a keyboard','/keyboard'],
              ['🔵 Bluetooth setup','/keyboard/bluetooth'],
              ['🔌 USB keyboard','/keyboard/usb'],
              ['🍎 iPad Smart Connector','/keyboard/ipad-smart'],
              ['💻 Desktop (recommended)','/keyboard/desktop'],
              ['🎮 Getting started','/help/getting-started'],
              ['🔑 Keys & Shop','/help/keys-shop'],
              ['📅 Daily challenge','/help/daily'],
              ['👥 Friends','/help/social'],
              ['❓ FAQ','/help/faq'],
            ].map(([label, href]) => (
              <Link key={href} href={href} style={{display:'inline-block',padding:'6px 12px',background:'#0a0a0f',border:'1px solid #1e1e30',borderRadius:6,color:'#888',fontSize:12,textDecoration:'none'}}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center',padding:'28px',background:'#13131f',border:'1px solid #1e1e30',borderRadius:12}}>
          <p style={{color:'#555',fontSize:13,marginBottom:14}}>Can't find what you're looking for?</p>
          <Link href="/game" style={{display:'inline-block',padding:'10px 24px',background:'#7c6af7',borderRadius:8,color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>
            Send feedback in-app 💬
          </Link>
        </div>
      </main>
    </div>
  );
}
