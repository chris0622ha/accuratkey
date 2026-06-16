'use client';
import Link from 'next/link';
import { useState } from 'react';

const METHODS = [
  {
    id: 'bluetooth',
    emoji: '🔵',
    title: 'Bluetooth Keyboard',
    tag: 'Most common for phones & tablets',
    steps: [
      'Put your keyboard in pairing mode — usually hold the Bluetooth button until a light flashes blue.',
      'On your phone/tablet go to Settings → Bluetooth, turn it on, and tap the keyboard when it appears.',
      'Once paired it will reconnect automatically next time.',
      'Open AccuratKey and press any key to begin.',
    ],
    detail: [
      'Most Bluetooth keyboards use Bluetooth HID (Human Interface Device) profile, which all modern phones support.',
      'If the keyboard doesn\'t appear in your Bluetooth list, make sure it\'s in pairing mode (not just on). Many keyboards require holding the Bluetooth key for 3–5 seconds.',
      'Some keyboards have multiple device slots (e.g. buttons 1, 2, 3). Make sure you\'re pairing to an empty slot.',
      'On Android: the keyboard may ask you to confirm a PIN — type the PIN on the physical keyboard and press Enter.',
      'On iPhone/iPad: go to Settings → Bluetooth. The keyboard should appear under "Other Devices". Tap it.',
      'If it disconnects after a while, check your phone\'s battery optimization settings — some phones aggressively kill Bluetooth.',
      'Range is typically 10 meters (33 feet). Walls and interference can reduce this.',
    ],
    keyboards: [
      'Logitech K380 Multi-Device Bluetooth Keyboard',
      'Logitech MX Keys Mini',
      'Apple Magic Keyboard (all versions)',
      'Keychron K3 / K7 / K2',
      'Keychron Q and V series (with Bluetooth)',
      'Microsoft Sculpt Ergonomic Keyboard',
      'Microsoft Surface Keyboard',
      'Samsung Smart Keyboard Trio 500',
      'Anker Ultra Compact Slim Profile Wireless Bluetooth Keyboard',
      'iClever BK10 Bluetooth Keyboard',
      'OMOTON Ultra-Slim Bluetooth Keyboard',
      'Arteck HB030B Universal Slim Portable Wireless Bluetooth Keyboard',
      'Royal Kludge RK61 / RK71 / RK84',
      'Nuphy Air60 / Air75',
      'GMMK Pro (with Bluetooth dongle)',
      'Corsair K63 Wireless',
      'Razer BlackWidow V3 Mini HyperSpeed',
      'SteelSeries Apex Pro Mini Wireless',
      'Ducky One 3 Mini (Bluetooth version)',
      'Filco Majestouch Convertible 3',
      'HHKB Professional Hybrid',
      'Topre Realforce R3 Bluetooth',
      'Any generic Bluetooth keyboard from Amazon/AliExpress',
    ],
  },
  {
    id: 'usb',
    emoji: '🔌',
    title: 'Wired USB Keyboard',
    tag: 'Works on most Android & iPad',
    steps: [
      'Get a USB-C to USB-A adapter (or a USB-C keyboard — no adapter needed).',
      'Plug the adapter into your phone or tablet\'s charging port.',
      'Plug the keyboard USB cable into the adapter.',
      'It should work instantly with no setup or drivers.',
      'Open AccuratKey and press any key.',
    ],
    detail: [
      'Android phones with USB-C ports generally support USB OTG (On-The-Go), which lets you plug in keyboards, mice, and drives.',
      'iPads with USB-C (iPad Pro, iPad Air 4+, iPad mini 6+) also support wired USB keyboards via a USB-C hub or adapter.',
      'iPhones and older iPads with Lightning ports can use wired keyboards with a Lightning to USB Camera Adapter.',
      'If your keyboard isn\'t recognized, check if your phone supports USB OTG — you can test with a USB OTG checker app.',
      'Some cheaper USB hubs don\'t provide enough power. If the keyboard doesn\'t work, try a powered USB hub.',
      'USB keyboards draw very little power so they work fine with most OTG adapters.',
      'This method has zero latency — better than Bluetooth for typing accuracy.',
    ],
    keyboards: [
      'Any USB-A keyboard with a USB-C to USB-A adapter',
      'Keychron Q series (USB-C cable included)',
      'Leopold FC750R / FC980M',
      'Varmilo VA87M / VA108M',
      'GMMK 2',
      'Ducky One 3 (wired version)',
      'Logitech G413 / G513',
      'Corsair K70 RGB MK.2',
      'Razer BlackWidow V3',
      'SteelSeries Apex Pro',
      'HyperX Alloy Origins',
      'Any mechanical keyboard with USB-C detachable cable',
      'Any cheap membrane keyboard from a dollar store or electronics shop',
    ],
  },
  {
    id: 'ipad-smart',
    emoji: '🍎',
    title: 'iPad Smart Connector',
    tag: 'iPads only — no Bluetooth needed',
    steps: [
      'Align the keyboard with the Smart Connector port on the side or back of your iPad.',
      'It snaps on magnetically and connects automatically — no pairing, no Bluetooth, no charging.',
      'Open AccuratKey and press any key.',
    ],
    detail: [
      'The Smart Connector is a 3-pin magnetic connector found on iPad Pro (all sizes), iPad Air (4th gen+), and iPad mini (6th gen+).',
      'It carries both power and data, so the keyboard draws power from the iPad — no battery required.',
      'This is the lowest-latency keyboard connection on iPad — even lower than Bluetooth.',
      'Smart Connector keyboards don\'t need to be unpaired or re-paired when you switch between apps.',
      'The Magic Keyboard for iPad also adds a trackpad — the mouse cursor appears in Safari and most apps.',
      'Third-party keyboards also use the Smart Connector and are often cheaper than Apple\'s option.',
    ],
    keyboards: [
      'Apple Magic Keyboard for iPad Pro 11-inch (all generations)',
      'Apple Magic Keyboard for iPad Pro 12.9-inch (all generations)',
      'Apple Magic Keyboard for iPad Air',
      'Apple Smart Keyboard Folio',
      'Apple Smart Keyboard (older iPad Pro)',
      'Logitech Combo Touch for iPad Pro',
      'Logitech Slim Folio Pro',
      'Logitech Folio Touch',
      'Brydge Pro+ Wireless Keyboard with Trackpad',
    ],
  },
  {
    id: 'samsung-dex',
    emoji: '🖥️',
    title: 'Samsung DeX Mode',
    tag: 'Samsung Galaxy phones & tablets',
    steps: [
      'Connect your Samsung device to a monitor via HDMI or wirelessly.',
      'DeX mode launches automatically or from the notification shade.',
      'Connect any Bluetooth or USB keyboard.',
      'Open AccuratKey in the DeX browser — it works like a desktop.',
    ],
    detail: [
      'Samsung DeX turns your Galaxy device into a desktop-like experience.',
      'Supported on Galaxy S21+, S22+, S23+, S24+, Note series, and Galaxy Tab S series.',
      'In DeX mode, Chrome runs as a desktop browser, so AccuratKey works perfectly.',
      'You can also use DeX wirelessly on Samsung Smart TVs or supported monitors without a cable.',
      'Any keyboard that works with Android works in DeX mode.',
    ],
    keyboards: [
      'Any Bluetooth keyboard',
      'Any USB keyboard via USB-C adapter',
      'Samsung Smart Keyboard Trio 500',
      'Logitech K380',
      'Microsoft Bluetooth Keyboard',
    ],
  },
  {
    id: 'chromebook',
    emoji: '🐧',
    title: 'Chromebook / Chrome OS',
    tag: 'Built-in keyboard works instantly',
    steps: [
      'Open Chrome on your Chromebook.',
      'Go to accuratkey.vercel.app.',
      'Press any key — your built-in keyboard works immediately.',
    ],
    detail: [
      'Chromebooks run Chrome OS and have a full physical keyboard built in.',
      'AccuratKey works perfectly in Chrome on Chromebook.',
      'External keyboards (USB or Bluetooth) also work on Chromebook.',
      'Chrome OS supports Android apps — you can also sideload AccuratKey as a PWA.',
      'Some Chromebooks support Linux mode (Crostini) — AccuratKey runs in any Linux browser too.',
    ],
    keyboards: [
      'Any Chromebook built-in keyboard',
      'Any external USB or Bluetooth keyboard',
    ],
  },
  {
    id: 'desktop',
    emoji: '💻',
    title: 'Laptop or Desktop Computer',
    tag: 'Best experience — recommended',
    steps: [
      'Open any modern browser (Chrome, Firefox, Safari, Edge).',
      'Go to accuratkey.vercel.app.',
      'Press any key — your keyboard works immediately.',
    ],
    detail: [
      'This is the intended primary experience for AccuratKey.',
      'Works on Windows, macOS, Linux, and ChromeOS.',
      'All keyboard layouts are supported — QWERTY, AZERTY, QWERTZ, Dvorak, Colemak.',
      'External keyboards connected via USB or Bluetooth also work on any computer.',
      'For the best typing test accuracy, use a wired keyboard on a desktop.',
    ],
    keyboards: [
      'Any laptop built-in keyboard',
      'Any USB keyboard',
      'Any Bluetooth keyboard paired to a computer',
      'Mechanical keyboards, membrane keyboards, laptop keyboards — all work',
    ],
  },
];

export default function KeyboardHelpPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showDetail, setShowDetail] = useState<Record<string, boolean>>({});

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:700,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}><span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span></Link>
        <Link href="/help" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← Help</Link>
      </nav>
      <main style={{maxWidth:700,margin:'40px auto 60px'}}>
        <h1 style={{fontSize:30,fontWeight:800,marginBottom:6}}>⌨️ How to connect a keyboard</h1>
        <p style={{color:'#555',fontSize:13,marginBottom:36}}>AccuratKey requires a physical keyboard. Here are all the ways to connect one.</p>

        {METHODS.map(({id, emoji, title, tag, steps, detail, keyboards}) => (
          <div key={id} style={{background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'20px 24px',marginBottom:16,position:'relative'}}>
            {/* Detailed link in corner */}
            <Link href={`/keyboard/${id}`} style={{position:'absolute',top:14,right:16,fontSize:10,color:'#444',textDecoration:'none',border:'1px solid #1e1e3088',borderRadius:5,padding:'2px 7px',letterSpacing:1}}>DETAILED</Link>

            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,paddingRight:80}}>
              <span style={{fontSize:24}}>{emoji}</span>
              <div>
                <div style={{fontWeight:700,fontSize:16,color:'#e0e0ff'}}>{title}</div>
                <div style={{fontSize:11,color:'#7c6af7',marginTop:1}}>{tag}</div>
              </div>
            </div>

            <ol style={{margin:'12px 0 10px',paddingLeft:20,display:'flex',flexDirection:'column',gap:6}}>
              {steps.map((s,i) => <li key={i} style={{color:'#888',fontSize:13,lineHeight:1.6}}>{s}</li>)}
            </ol>

            {/* Show Detail toggle */}
            {showDetail[id] && (
              <div style={{background:'#0d0d1a',border:'1px solid #1e1e3088',borderRadius:8,padding:'12px 14px',marginBottom:10}}>
                <div style={{color:'#7c6af7',fontSize:10,letterSpacing:2,marginBottom:8}}>DETAILED NOTES</div>
                {detail.map((d,i) => (
                  <p key={i} style={{color:'#666',fontSize:12,lineHeight:1.7,marginBottom:6}}>• {d}</p>
                ))}
              </div>
            )}
            <button onClick={() => setShowDetail(p=>({...p,[id]:!p[id]}))} style={{background:'none',border:'none',color:'#444',fontSize:11,cursor:'pointer',fontFamily:"'JetBrains Mono',monospace",padding:0,marginBottom:10}}>
              {showDetail[id] ? '▲ Hide details' : '▼ More details'}
            </button>

            {/* Works with expandable list */}
            <div style={{borderTop:'1px solid #1e1e30',paddingTop:10,marginTop:4}}>
              <button onClick={() => setExpanded(p=>({...p,[id]:!p[id]}))} style={{background:'none',border:'none',color:'#444',fontSize:11,cursor:'pointer',fontFamily:"'JetBrains Mono',monospace",padding:0,display:'flex',alignItems:'center',gap:6}}>
                {expanded[id] ? '▲' : '▼'} Works with {keyboards.length} keyboards & devices
              </button>
              {expanded[id] && (
                <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:4}}>
                  {keyboards.map((k,i) => (
                    <div key={i} style={{color:'#555',fontSize:12,lineHeight:1.5,paddingLeft:4}}>• {k}</div>
                  ))}
                </div>
              )}
            </div>
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
