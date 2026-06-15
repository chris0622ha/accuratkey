import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default function AboutPage() {
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
        <h1 style={{fontSize:42,fontWeight:800,marginBottom:8}}><span style={{color:'#7c6af7'}}>Accurat</span>Key</h1>
        <p style={{color:'#7c6af7',fontSize:16,marginBottom:40}}>Train smarter. Type faster.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:60}}>
          {[
            ['⌨️','Built for accuracy','Most typing apps reward raw speed. AccuratKey locks in your keystrokes — no corrections, no backspace. You learn to type it right the first time.'],
            ['🧠','Adaptive difficulty','15 progressive levels from home row basics to 90 WPM targets. Age-adaptive themes make it work for everyone from kids to adults.'],
            ['🔥','Streak system','Daily challenges keep you coming back. Build streaks, earn keys, unlock themes and sound packs in the shop.'],
            ['👥','Social','Challenge friends to beat your score on any level. Public profiles, leaderboards, and friend system built in.'],
          ].map(([emoji,title,desc])=>(
            <div key={title} style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:24}}>
              <div style={{fontSize:28,marginBottom:10}}>{emoji}</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:'#e0e0ff'}}>{title}</div>
              <div style={{color:'#666',fontSize:13,lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',padding:'40px 0',borderTop:'1px solid #1e1e30'}}>
          <Link href="/game" style={{display:'inline-block',padding:'14px 36px',background:'#7c6af7',borderRadius:10,color:'#fff',fontWeight:700,fontSize:15,textDecoration:'none'}}>Start Typing →</Link>
          <p style={{color:'#444',fontSize:12,marginTop:20}}>Free to play · No ads · Open to all ages</p>
        </div>
      </main>
    </div>
  );
}
