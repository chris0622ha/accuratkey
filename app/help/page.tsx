import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default function HelpPage() {
  const faqs = [
    ['How do I start?','Pick a profile, choose a level from the Level Map, read the tips, and click Start Typing. No account needed to play.'],
    ['Why can\'t I correct mistakes?','AccuratKey locks in each keystroke — no backspace allowed. This forces you to slow down and type accurately rather than typing fast and fixing errors.'],
    ['What are Keys 🔑?','Keys are the in-game currency you earn by completing levels. Spend them in the Shop on themes, fonts, and sound packs.'],
    ['What is Profile Admin?','Profile Admin unlocks all features for a profile. Turn it on in Edit Profile → Profile Admin.'],
    ['How do I challenge a friend?','You and your friend both need accounts. Click ⚔️ in the nav bar, pick a friend and a level, and send the challenge.'],
    ['What is the Daily challenge?','A new set of words every day. Complete it to appear on the daily leaderboard. Only one attempt per day.'],
    ['How do streaks work?','Complete at least one level per day to maintain your streak. Streaks reset at midnight.'],
    ['Can I use a custom keyboard layout?','Yes — QWERTY, QWERTZ, AZERTY, Colemak, Dvorak and more. Change it in Edit Profile.'],
    ['Why is there no mobile support?','AccuratKey is built for physical keyboards. Mobile keyboards don\'t have the same layout so the game wouldn\'t make sense.'],
    ['How do I delete my account?','Go to Edit Profile → scroll to the bottom → Delete Account. This is permanent.'],
  ];
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:800,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}><span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span></Link>
        <div style={{display:'flex',gap:24}}>
          {[['Game','/game'],['About','/about'],['Help','/help']].map(([l,h])=>(
            <Link key={h} href={h} style={{color:'#666',fontSize:13,textDecoration:'none'}}>{l}</Link>
          ))}
        </div>
      </nav>
      <main style={{maxWidth:800,margin:'60px auto 0'}}>
        <h1 style={{fontSize:36,fontWeight:800,marginBottom:8}}>Help & FAQ</h1>
        <p style={{color:'#555',fontSize:14,marginBottom:40}}>Answers to common questions</p>
        <div style={{display:'flex',flexDirection:'column',gap:2,marginBottom:60}}>
          {faqs.map(([q,a])=>(
            <details key={q} style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:8,padding:'16px 20px',cursor:'pointer'}}>
              <summary style={{fontWeight:700,fontSize:14,color:'#e0e0ff',listStyle:'none',display:'flex',justifyContent:'space-between'}}>
                {q} <span style={{color:'#7c6af7'}}>+</span>
              </summary>
              <p style={{color:'#666',fontSize:13,lineHeight:1.7,marginTop:12,marginBottom:0}}>{a}</p>
            </details>
          ))}
        </div>
        <div style={{textAlign:'center',padding:'30px 0',borderTop:'1px solid #1e1e30'}}>
          <p style={{color:'#555',fontSize:13}}>Still need help? Send feedback in the app using the 💬 button.</p>
          <Link href="/game" style={{display:'inline-block',marginTop:16,padding:'12px 28px',background:'#7c6af7',borderRadius:8,color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>Back to Game</Link>
        </div>
      </main>
    </div>
  );
}
