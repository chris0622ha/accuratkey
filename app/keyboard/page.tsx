import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default function KeyboardHelpPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:700,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}><span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span></Link>
        <Link href="/help" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← Help</Link>
      </nav>
      <main style={{maxWidth:700,margin:'40px auto 60px'}}>
        <h1 style={{fontSize:30,fontWeight:800,marginBottom:6}}>⌨️ How to connect a keyboard</h1>
        <p style={{color:'#555',fontSize:13,marginBottom:36}}>AccuratKey requires a physical keyboard. Here are all the ways to connect one.</p>

        {[
          {
            emoji: '🔵',
            title: 'Bluetooth keyboard',
            tag: 'Most common for phones & tablets',
            steps: [
              'Make sure your keyboard has Bluetooth (most wireless keyboards do)',
              'Put the keyboard in pairing mode — usually hold a Bluetooth button until a light flashes',
              'On your phone/tablet: Settings → Bluetooth → turn on → tap the keyboard when it appears',
              'Once paired, open AccuratKey and press any key',
            ],
            examples: 'Works with: Logitech K380, Apple Magic Keyboard, Keychron K3, any Bluetooth keyboard',
          },
          {
            emoji: '🔌',
            title: 'Wired USB keyboard',
            tag: 'Works on most Android devices & iPads',
            steps: [
              'You\'ll need a USB-C to USB-A adapter (or USB-C keyboard)',
              'Plug the adapter into your phone/tablet',
              'Plug the keyboard into the adapter',
              'It should work instantly — no setup needed',
              'Open AccuratKey and press any key',
            ],
            examples: 'Works with: Any USB keyboard + USB-C adapter. Most Android phones support this.',
          },
          {
            emoji: '🍎',
            title: 'iPad with Magic Keyboard / Smart Keyboard',
            tag: 'iPads only',
            steps: [
              'Attach the Magic Keyboard or Smart Keyboard Folio to your iPad via the Smart Connector (magnetic port on the side)',
              'No pairing needed — it connects automatically',
              'Open AccuratKey and press any key',
            ],
            examples: 'Works with: Apple Magic Keyboard for iPad, Smart Keyboard Folio',
          },
          {
            emoji: '💻',
            title: 'Laptop / Desktop (best experience)',
            tag: 'Recommended',
            steps: [
              'Just open accuratkey.vercel.app on any laptop or desktop computer',
              'No setup needed — your built-in keyboard works immediately',
            ],
            examples: 'Windows, Mac, Linux, Chromebook all work great',
          },
        ].map(({emoji, title, tag, steps, examples}) => (
          <div key={title} style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'20px 24px',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
              <span style={{fontSize:24}}>{emoji}</span>
              <div>
                <div style={{fontWeight:700,fontSize:16,color:'#e0e0ff'}}>{title}</div>
                <div style={{fontSize:11,color:'#7c6af7',marginTop:1}}>{tag}</div>
              </div>
            </div>
            <ol style={{margin:'12px 0 10px',paddingLeft:20,display:'flex',flexDirection:'column',gap:6}}>
              {steps.map((s,i) => <li key={i} style={{color:'#888',fontSize:13,lineHeight:1.6}}>{s}</li>)}
            </ol>
            <div style={{fontSize:11,color:'#444',borderTop:'1px solid #1e1e30',paddingTop:8,marginTop:4}}>{examples}</div>
          </div>
        ))}

        <div style={{textAlign:'center',marginTop:36,padding:'24px',background:'#13131f',border:'1px solid #1e1e30',borderRadius:12}}>
          <p style={{color:'#555',fontSize:13,marginBottom:12}}>Once your keyboard is connected, press any key on the AccuratKey block screen.</p>
          <Link href="/signin" style={{display:'inline-block',padding:'12px 28px',background:'#7c6af7',borderRadius:8,color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>Back to AccuratKey</Link>
        </div>
      </main>
    </div>
  );
}
