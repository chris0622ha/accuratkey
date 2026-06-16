import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  const updated = 'June 16, 2025';
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:"'JetBrains Mono',monospace",color:'#e0e0ff',padding:'0 20px'}}>
      <nav style={{maxWidth:740,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e1e30'}}>
        <Link href="/game" style={{color:'#7c6af7',fontWeight:800,fontSize:18,textDecoration:'none'}}>
          <span style={{color:'#7c6af7'}}>Accurat</span><span style={{color:'#e0e0ff'}}>Key</span>
        </Link>
        <Link href="/game" style={{color:'#555',fontSize:13,textDecoration:'none'}}>← Back</Link>
      </nav>
      <main style={{maxWidth:740,margin:'48px auto 80px'}}>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>Privacy Policy</h1>
        <p style={{color:'#555',fontSize:12,marginBottom:40}}>Last updated: {updated}</p>

        {[
          {
            title: '1. Information We Collect',
            body: 'Account users: email address, display name, profile photo (optional), birthday (for age-adaptive features), keyboard layout preference, typing session data (WPM, accuracy, level, timestamp), Key balance, purchased items, friend list, and username. Guest users: typing progress stored locally in your browser only — nothing is sent to our servers.',
          },
          {
            title: '2. How We Use Your Information',
            body: 'We use your information to: provide and improve the Service; display your progress and stats; enable social features (friends, challenges, leaderboards); send notifications you have opted into within the app; process subscription payments (via third-party payment processor); adapt the experience to your age; and respond to your feedback.',
          },
          {
            title: '3. Data Storage',
            body: 'Your data is stored in Firebase (Google Cloud Firestore), hosted in the United States. Firebase uses industry-standard encryption at rest and in transit. Profile photos are stored as resized base64 strings in Firestore. Authentication tokens are managed by Firebase Authentication.',
          },
          {
            title: '4. Data We Do Not Collect',
            body: 'We do not collect: your actual keystrokes or typing content; device identifiers; location data; browsing history outside AccuratKey; contact lists. We do not serve ads and do not share data with advertisers.',
          },
          {
            title: '5. Third-Party Services',
            body: 'We use the following third-party services: Firebase (Google) for authentication, database, and storage; Vercel for web hosting; Stripe (or similar) for subscription payment processing. Each has its own privacy policy. We share only the minimum data required for these services to function.',
          },
          {
            title: '6. Cookies and Local Storage',
            body: 'AccuratKey uses browser localStorage to: save guest progress locally; remember your last signed-in profile; store mute preferences and other UI settings. We do not use third-party tracking cookies or advertising cookies. Firebase may set authentication-related cookies necessary for sign-in to function.',
          },
          {
            title: '7. Children\'s Privacy',
            body: 'AccuratKey is designed to be usable by children with parental supervision. We do not knowingly collect personal information from children under 13 without parental consent. The birthday field is used only for age-adaptive features — it is not used for profiling or targeting. Parents may contact us to review or delete a child\'s data.',
          },
          {
            title: '8. Public Profiles',
            body: 'If you enable "Public Profile" in your settings, your username, display name, avatar, level progress, and best WPM scores will be visible to other users at /user/[username]. This feature is opt-in and can be disabled at any time from Feature Access settings.',
          },
          {
            title: '9. Your Rights',
            body: 'You have the right to: access the data we hold about you; correct inaccurate data (via Edit Profile); delete your account and all associated data (via Edit Profile → Delete Account); opt out of non-essential data collection; request a copy of your data (contact us via the 💬 feedback button). EU/UK users have additional rights under GDPR/UK GDPR including the right to data portability.',
          },
          {
            title: '10. Data Retention',
            body: 'We retain your data for as long as your account is active. When you delete your account, all personal data is permanently deleted within 30 days. Session history and stats are deleted immediately upon account deletion. Backup copies may persist for up to 7 days in Firebase backups before being overwritten.',
          },
          {
            title: '11. Security',
            body: 'We implement industry-standard security measures: HTTPS everywhere; Firebase Authentication for secure login; bcrypt password hashing; Firestore security rules restricting data access by user ID; no plaintext passwords stored. Despite these measures, no internet transmission is 100% secure.',
          },
          {
            title: '12. Changes to This Policy',
            body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via the app. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the Service after changes constitutes acceptance.',
          },
          {
            title: '13. Contact',
            body: 'For privacy questions, data requests, or to report a concern, use the 💬 feedback button in the app. We aim to respond within 5 business days.',
          },
        ].map(({title, body}) => (
          <div key={title} style={{marginBottom:24}}>
            <h2 style={{fontSize:14,fontWeight:700,color:'#7c6af7',marginBottom:8}}>{title}</h2>
            <p style={{color:'#777',fontSize:13,lineHeight:1.8,margin:0}}>{body}</p>
          </div>
        ))}

        <div style={{borderTop:'1px solid #1e1e30',paddingTop:24,marginTop:24,display:'flex',gap:16,flexWrap:'wrap'}}>
          <Link href="/tos" style={{color:'#7c6af7',fontSize:13,textDecoration:'none'}}>Terms of Service →</Link>
          <Link href="/help" style={{color:'#555',fontSize:13,textDecoration:'none'}}>Help Center →</Link>
          <Link href="/game" style={{color:'#555',fontSize:13,textDecoration:'none'}}>Back to game →</Link>
        </div>
      </main>
    </div>
  );
}
