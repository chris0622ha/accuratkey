import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default function ChildrensPrivacyPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:740,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}><span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span></Link>
        <Link href="/game" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← Back</Link>
      </nav>
      <main style={{maxWidth:740,margin:'120px auto',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:20}}>🧒</div>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:12}}>Children's Privacy</h1>
        <p style={{color:'#555',fontSize:14,lineHeight:1.7}}>Coming soon. Check back later.</p>
        <Link href="/game" style={{display:'inline-block',marginTop:32,padding:'10px 24px',background:'#7c6af7',borderRadius:8,color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>Back to game</Link>
      </main>
    </div>
  );
}
