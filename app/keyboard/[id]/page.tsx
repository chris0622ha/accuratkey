'use client';
import Link from 'next/link';
import { useState } from 'react';
import { notFound } from 'next/navigation';

const METHODS: Record<string, {
  emoji: string; title: string; tag: string;
  steps: string[]; detail: string[]; keyboards: string[];
  tips?: string[]; troubleshoot?: string[];
}> = {
  bluetooth: {
    emoji: '🔵', title: 'Bluetooth Keyboard', tag: 'Most common for phones & tablets',
    steps: [
      'Make sure your keyboard has Bluetooth (check the manual or look for a Bluetooth symbol).',
      'Turn on the keyboard and put it in pairing mode. On most keyboards: hold the Bluetooth/Connect button for 3–5 seconds until an LED flashes rapidly.',
      'On your phone/tablet: open Settings → Bluetooth → toggle on.',
      'Wait for the keyboard to appear in the list (may take 10–20 seconds).',
      'Tap the keyboard name. On Android you may need to confirm a PIN — type it on the physical keyboard and press Enter. On iPhone just tap Pair.',
      'The keyboard is now paired. Open AccuratKey and press any key.',
    ],
    detail: [
      'Bluetooth HID (Human Interface Device) is the standard protocol all Bluetooth keyboards use. Every modern smartphone and tablet supports it.',
      'Pairing is a one-time process. After the first pair, the keyboard reconnects automatically when you turn it on.',
      'Multi-device keyboards (like Logitech K380) let you pair to 3 devices and switch between them with a button press.',
      'Bluetooth 5.0 keyboards have longer range and better battery life than older Bluetooth 4.0 models.',
      'If your keyboard has a USB dongle (2.4GHz receiver), that\'s not Bluetooth — see the USB method instead. Dongles don\'t work with phones.',
      'Keyboard latency over Bluetooth is typically 10–30ms — imperceptible for normal typing.',
    ],
    tips: [
      'Keep your keyboard within 5 meters for best reliability.',
      'If typing feels laggy, check that no other apps are using heavy Bluetooth (like audio streaming).',
      'On iPhone, go to Settings → Accessibility → Keyboards to customize keyboard shortcuts.',
      'Enable "Auto Caps" and "Auto-Correction" off in phone settings for typing test accuracy.',
      'Most keyboards have a sleep mode after 10–30 min of inactivity. Press any key to wake.',
    ],
    troubleshoot: [
      'Keyboard not appearing in Bluetooth list: make sure it\'s in pairing mode (not just on). Try holding the Bluetooth button longer.',
      'Paired but not typing: forget the device in Bluetooth settings and re-pair from scratch.',
      'Keeps disconnecting: disable battery optimization for Bluetooth on Android (Settings → Battery → Optimize).',
      'Wrong characters typed: your phone\'s language/keyboard layout might differ from your physical keyboard. Set phone to English (US).',
      'Can\'t type PIN: type the numbers shown on screen using the physical keyboard, then press Enter.',
    ],
    keyboards: [
      'Logitech K380 Multi-Device Bluetooth Keyboard — best budget pick, connects to 3 devices',
      'Logitech MX Keys Mini — premium, backlit, great for productivity',
      'Logitech K480 — includes a slot to prop up your phone/tablet',
      'Apple Magic Keyboard — excellent on iPhone/iPad, pairs instantly',
      'Apple Magic Keyboard with Touch ID — Mac-focused but works on iPad too',
      'Keychron K3 (Bluetooth mode) — compact mechanical, popular among enthusiasts',
      'Keychron K7 — ultra-thin mechanical with Bluetooth',
      'Keychron K2 — TKL mechanical, great build quality',
      'Microsoft Sculpt Ergonomic Keyboard — ergonomic split design (uses USB dongle, not BT)',
      'Microsoft Surface Keyboard — slim, minimalist',
      'Microsoft Bluetooth Keyboard — budget-friendly, works everywhere',
      'Samsung Smart Keyboard Trio 500 — designed for Samsung but works with any Android',
      'Anker Ultra Compact Slim Bluetooth Keyboard — great budget option',
      'iClever BK10 — foldable, great for travel',
      'Jelly Comb Bluetooth Keyboard — compact, affordable',
      'OMOTON Ultra-Slim Bluetooth Keyboard — ultra-thin profile',
      'Arteck HB030B — backlit, good value',
      'Royal Kludge RK61 — 60% mechanical with Bluetooth',
      'Royal Kludge RK84 — TKL with Bluetooth and RGB',
      'Nuphy Air60 — ultra-slim mechanical',
      'Nuphy Air75 — compact 75% mechanical',
      'HHKB Professional Hybrid — premium Topre mechanical',
      'Topre Realforce R3 Bluetooth — high-end Topre switches',
      'Filco Majestouch Convertible 3 — solid mechanical with Bluetooth',
      'Ducky One 3 Mini (Bluetooth) — colorful, great switches',
      'Razer BlackWidow V3 Mini HyperSpeed — wireless mechanical',
      'Corsair K63 Wireless — compact wireless mechanical',
      'SteelSeries Apex Pro Mini Wireless — adjustable switches',
      'Any generic Bluetooth keyboard — if it says Bluetooth HID, it works',
    ],
  },
  usb: {
    emoji: '🔌', title: 'Wired USB Keyboard', tag: 'Works on most Android & iPad',
    steps: [
      'Check your phone/tablet\'s port: USB-C (most Android phones 2019+, iPad Pro, iPad Air 4+, iPad mini 6+) or Lightning (older iPhones/iPads).',
      'Get the right adapter: USB-C to USB-A adapter for USB-C phones, or Lightning to USB Camera Adapter for Lightning iPads.',
      'Plug the adapter into your device\'s port.',
      'Plug the keyboard\'s USB cable into the adapter.',
      'The keyboard should be recognized instantly — no drivers or setup needed.',
      'Open AccuratKey and press any key.',
    ],
    detail: [
      'USB OTG (On-The-Go) is the technology that lets phones/tablets act as USB hosts. Most Android phones with USB-C support it.',
      'iPhones do NOT support USB keyboards — only iPads with Lightning or USB-C do.',
      'USB-C keyboards (with a USB-C cable) plug directly into modern phones with no adapter.',
      'Power: USB keyboards draw very little power (under 100mA) and work fine with basic OTG adapters.',
      'A powered USB hub lets you connect a keyboard AND charge your phone simultaneously.',
      'Wired USB keyboards have essentially zero latency — the gold standard for typing accuracy.',
      'Check your Android settings: Settings → About Phone → USB OTG, or download "USB OTG Checker" to verify support.',
    ],
    tips: [
      'Wired is the most reliable — no pairing, no disconnects, no battery worries.',
      'A short, high-quality USB-C cable reduces potential signal issues.',
      'If your keyboard has USB hubs built in, they work too.',
      'For iPad: the USB-C to USB adapter from Apple is $9 and works perfectly.',
    ],
    troubleshoot: [
      'Keyboard not detected: your phone may not support USB OTG. Check your model specs online.',
      'Works on some apps but not AccuratKey: unlikely — if it types anywhere, it works in AccuratKey.',
      'Random disconnects: try a different USB cable or adapter. Cheap adapters can be unreliable.',
      'Phone charges slowly while keyboard is plugged in: normal, as power is shared.',
    ],
    keyboards: [
      'Any USB-A keyboard + USB-C to USB-A adapter',
      'Any USB-C keyboard (no adapter needed)',
      'Keychron Q series (USB-C cable included)',
      'Keychron C series (budget wired mechanical)',
      'Leopold FC750R — premium build, classic design',
      'Leopold FC980M — with numpad, excellent quality',
      'Varmilo VA87M — aluminum build, custom switches',
      'Varmilo VA108M — full size with numpad',
      'GMMK 2 — hot-swap wired mechanical',
      'Ducky One 3 (wired) — excellent stock switches',
      'Ducky Mecha Mini — 60% wired mechanical',
      'Logitech G413 — backlit, aluminum top plate',
      'Logitech G513 — GX switches, premium feel',
      'Corsair K70 RGB MK.2 — classic gaming keyboard',
      'Corsair K95 RGB Platinum — macro keys included',
      'Razer BlackWidow V3 — green or yellow switches',
      'SteelSeries Apex Pro — adjustable actuation',
      'HyperX Alloy Origins — solid budget mechanical',
      'Akko 3068B — great value hot-swap',
      'Epomaker TH80 — compact 75%',
      'Any cheap membrane keyboard — completely fine for typing practice',
    ],
  },
  'ipad-smart': {
    emoji: '🍎', title: 'iPad Smart Connector', tag: 'iPads only',
    steps: [
      'Check that your iPad has a Smart Connector — it\'s a small 3-pin magnetic port on the side (iPad Pro) or bottom edge.',
      'Align the keyboard\'s connector with the Smart Connector. It snaps on magnetically.',
      'The keyboard powers on and connects automatically — no Bluetooth pairing, no charging needed.',
      'Open AccuratKey and press any key.',
    ],
    detail: [
      'The Smart Connector is a proprietary Apple connector that carries power and data over 3 magnetic pins.',
      'Compatible iPads: iPad Pro (all generations), iPad Air 4th gen and later, iPad mini 6th gen and later.',
      'The keyboard draws power directly from the iPad — no battery needed in the keyboard.',
      'Connection is always-on with essentially zero latency.',
      'Smart Connector keyboards don\'t need to be "connected" or "paired" — they just work when attached.',
      'You can have a Smart Connector keyboard AND a Bluetooth keyboard paired simultaneously.',
      'The Magic Keyboard adds a USB-C hub for charging and a trackpad for pointer input.',
    ],
    tips: [
      'Keep the Smart Connector pins clean — use a dry cloth if they feel sticky.',
      'The keyboard and iPad don\'t need to be exact model matches — any Smart Connector keyboard works on any compatible iPad.',
      'Third-party Smart Connector keyboards are significantly cheaper than Apple\'s and work just as well for typing.',
    ],
    troubleshoot: [
      'Not connecting: remove and reattach. Make sure pins are clean.',
      'Keys not working in AccuratKey: navigate to the app and press any key.',
      'Not compatible: check your iPad model. Older iPads (non-Pro, or Air 3 and earlier) don\'t have Smart Connector.',
    ],
    keyboards: [
      'Apple Magic Keyboard for iPad Pro 11-inch (1st, 2nd, 3rd, 4th gen)',
      'Apple Magic Keyboard for iPad Pro 12.9-inch (3rd, 4th, 5th, 6th gen)',
      'Apple Magic Keyboard for iPad Air (4th, 5th gen)',
      'Apple Magic Keyboard for iPad mini (6th gen) — N/A, mini 6 uses Bluetooth',
      'Apple Smart Keyboard Folio (iPad Pro 11-inch)',
      'Apple Smart Keyboard Folio (iPad Pro 12.9-inch)',
      'Apple Smart Keyboard (older iPad Pro 10.5-inch and 12.9-inch)',
      'Logitech Combo Touch for iPad Pro 11-inch',
      'Logitech Combo Touch for iPad Pro 12.9-inch',
      'Logitech Combo Touch for iPad Air',
      'Logitech Slim Folio Pro for iPad Pro',
      'Logitech Folio Touch for iPad Air',
      'Brydge Pro+ Keyboard with Trackpad for iPad Pro',
      'Zagg Pro Keys with Trackpad for iPad Pro',
    ],
  },
  'samsung-dex': {
    emoji: '🖥️', title: 'Samsung DeX Mode', tag: 'Samsung Galaxy only',
    steps: [
      'Make sure your Samsung device supports DeX (Galaxy S21 and later, Galaxy Tab S6 and later).',
      'Connect to a monitor via USB-C to HDMI cable, or wirelessly via Samsung Wireless DeX (Smart TVs).',
      'DeX mode launches automatically or swipe down and tap "DeX" in the notification shade.',
      'Connect a Bluetooth or USB keyboard.',
      'Open Chrome in DeX mode and go to accuratkey.vercel.app.',
      'Press any key to begin.',
    ],
    detail: [
      'Samsung DeX is available on Galaxy S21, S22, S23, S24 series, Note 20, Note 20 Ultra, Galaxy Tab S6, S7, S8, S9 series.',
      'In DeX mode, Chrome runs as a full desktop browser — AccuratKey works exactly like it does on a computer.',
      'You can use DeX wirelessly on Samsung Smart TVs without any cable.',
      'Mouse and keyboard support in DeX is full — all keyboard shortcuts work.',
      'DeX sessions can run alongside your phone — you can still use your phone while it\'s connected to the monitor.',
    ],
    tips: [
      'Use a wireless keyboard and mouse for the cleanest DeX setup.',
      'DeX works best with a monitor that has speakers — sound from AccuratKey\'s typing sounds will play through.',
    ],
    troubleshoot: [
      'DeX not starting: check your Samsung model — not all Galaxy devices support DeX.',
      'Screen resolution issues: some monitors need a specific resolution set in DeX settings.',
    ],
    keyboards: [
      'Any Bluetooth keyboard',
      'Any USB keyboard via USB-C hub',
      'Samsung Smart Keyboard Trio 500',
      'Logitech K380',
      'Logitech MX Keys Mini',
      'Microsoft Bluetooth Keyboard',
      'Apple Magic Keyboard (works on Android via Bluetooth)',
    ],
  },
  chromebook: {
    emoji: '🐧', title: 'Chromebook / Chrome OS', tag: 'Built-in keyboard works instantly',
    steps: [
      'Open Chrome browser on your Chromebook.',
      'Navigate to accuratkey.vercel.app.',
      'Press any key on your Chromebook\'s built-in keyboard.',
      'Done — no setup needed.',
    ],
    detail: [
      'All Chromebooks have a physical keyboard built in — they work with AccuratKey out of the box.',
      'Chromebook keyboards have a slightly different layout — the Caps Lock key is replaced by a Search/Launcher key, and there\'s no F-key row by default (press Search + number for F1–F10).',
      'External USB and Bluetooth keyboards also work on Chromebooks.',
      'Chrome OS supports Android apps — you can add AccuratKey to your shelf as a Progressive Web App (PWA).',
      'Chromebook\'s built-in keyboard has very low latency since it\'s internal.',
    ],
    tips: [
      'Press Ctrl+Alt+? on your Chromebook to see a keyboard shortcut overlay.',
      'You can enable F-keys permanently in Chromebook keyboard settings.',
    ],
    troubleshoot: [
      'Keys not registering: click on the AccuratKey browser tab to make sure it has focus.',
    ],
    keyboards: [
      'Any Chromebook built-in keyboard',
      'Any Bluetooth keyboard paired to the Chromebook',
      'Any USB keyboard plugged into the Chromebook',
    ],
  },
  desktop: {
    emoji: '💻', title: 'Laptop or Desktop Computer', tag: 'Best experience — recommended',
    steps: [
      'Open Chrome, Firefox, Safari, or Edge on your computer.',
      'Navigate to accuratkey.vercel.app.',
      'Press any key — your keyboard works immediately.',
    ],
    detail: [
      'This is the primary intended experience for AccuratKey.',
      'All keyboard layouts are supported: QWERTY, AZERTY, QWERTZ, Dvorak, Colemak, and more.',
      'AccuratKey detects your layout automatically based on what keys you press.',
      'Mechanical keyboards, membrane keyboards, laptop keyboards — all work equally well.',
      'For competitive typing (typing races, etc.) a wired keyboard gives slightly lower latency than wireless.',
      'AccuratKey uses the browser\'s KeyboardEvent API which works the same across all major browsers and operating systems.',
    ],
    tips: [
      'For best accuracy, disable autocorrect and predictive text in your OS keyboard settings.',
      'Turn off sticky keys and filter keys (accessibility features that can interfere with fast typing).',
      'Use Chrome or Firefox for best performance.',
      'Full-screen mode (F11) removes distractions while typing.',
    ],
    troubleshoot: [
      'Keys not registering: click on the AccuratKey page to give it keyboard focus.',
      'Wrong characters: your OS keyboard layout might not match your physical keyboard. Check Settings → Language & Input.',
      'Backspace not working as expected: AccuratKey uses Backspace to delete one character at a time.',
    ],
    keyboards: [
      'Any laptop built-in keyboard',
      'Any desktop USB keyboard',
      'Any Bluetooth keyboard paired to your computer',
      'Mechanical keyboards (Cherry MX, Gateron, Kailh, Topre, Alps, etc.)',
      'Membrane keyboards',
      'Scissor-switch laptop-style keyboards',
      'Ergonomic keyboards (split, curved, vertical)',
      'Compact keyboards (60%, 65%, 75%, TKL)',
      'Full-size keyboards with numpad',
    ],
  },
};

export default function KeyboardDetailPage({ params }: { params: { id: string } }) {
  const paramId = params.id;
  const method = METHODS[paramId];
  if (!method) notFound();

  const { emoji, title, tag, steps, detail, tips, troubleshoot, keyboards } = method;
  const [showKbs, setShowKbs] = useState(false);

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:700,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}><span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span></Link>
        <Link href="/keyboard" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← All methods</Link>
      </nav>
      <main style={{maxWidth:700,margin:'40px auto 80px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <span style={{fontSize:40}}>{emoji}</span>
          <div>
            <h1 style={{fontSize:26,fontWeight:800,marginBottom:2}}>{title}</h1>
            <div style={{fontSize:12,color:'#7c6af7'}}>{tag}</div>
          </div>
        </div>

        <section style={{marginTop:32}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'#7c6af7',letterSpacing:2,marginBottom:16}}>STEPS</h2>
          <ol style={{paddingLeft:20,display:'flex',flexDirection:'column',gap:10}}>
            {steps.map((s,i) => (
              <li key={i} style={{color:'#ccc',fontSize:14,lineHeight:1.7}}>{s}</li>
            ))}
          </ol>
        </section>

        <section style={{marginTop:32,background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'20px 24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'#7c6af7',letterSpacing:2,marginBottom:16}}>HOW IT WORKS</h2>
          {detail.map((d,i) => (
            <p key={i} style={{color:'#777',fontSize:13,lineHeight:1.8,marginBottom:8}}>• {d}</p>
          ))}
        </section>

        {tips && tips.length > 0 && (
          <section style={{marginTop:20,background:'#0d1a0d',border:'1px solid #34d39922',borderRadius:12,padding:'20px 24px'}}>
            <h2 style={{fontSize:14,fontWeight:700,color:'#34d399',letterSpacing:2,marginBottom:16}}>💡 TIPS</h2>
            {tips.map((t,i) => (
              <p key={i} style={{color:'#666',fontSize:13,lineHeight:1.8,marginBottom:6}}>• {t}</p>
            ))}
          </section>
        )}

        {troubleshoot && troubleshoot.length > 0 && (
          <section style={{marginTop:20,background:'#1a0d0d',border:'1px solid #ef444422',borderRadius:12,padding:'20px 24px'}}>
            <h2 style={{fontSize:14,fontWeight:700,color:'#ef4444',letterSpacing:2,marginBottom:16}}>🔧 TROUBLESHOOTING</h2>
            {troubleshoot.map((t,i) => (
              <p key={i} style={{color:'#666',fontSize:13,lineHeight:1.8,marginBottom:8}}>• {t}</p>
            ))}
          </section>
        )}

        <section style={{marginTop:20,background:'#13131f',border:'1px solid #1e1e30',borderRadius:12,padding:'20px 24px'}}>
          <button onClick={()=>setShowKbs(p=>!p)} style={{width:'100%',background:'none',border:'none',color:'#555',fontSize:13,cursor:'pointer',fontFamily:"'JetBrains Mono',monospace",textAlign:'left',display:'flex',justifyContent:'space-between'}}>
            <span>✓ Works with {keyboards.length} keyboards & devices</span>
            <span>{showKbs ? '▲' : '▼'}</span>
          </button>
          {showKbs && (
            <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:5}}>
              {keyboards.map((k,i) => (
                <div key={i} style={{color:'#555',fontSize:12,lineHeight:1.6}}>• {k}</div>
              ))}
            </div>
          )}
        </section>

        <div style={{textAlign:'center',marginTop:36,padding:'24px',background:'#13131f',border:'1px solid #1e1e30',borderRadius:12}}>
          <p style={{color:'#555',fontSize:13,marginBottom:12}}>Ready? Connect your keyboard and press any key.</p>
          <Link href="/signin" style={{display:'inline-block',padding:'12px 28px',background:'#7c6af7',borderRadius:8,color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none',marginRight:10}}>Go to AccuratKey</Link>
          <Link href="/keyboard" style={{display:'inline-block',padding:'12px 28px',background:'transparent',border:'1px solid #1e1e30',borderRadius:8,color:'#555',fontSize:13,textDecoration:'none'}}>All methods</Link>
        </div>
      </main>
    </div>
  );
}
