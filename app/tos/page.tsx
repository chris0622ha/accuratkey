import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function TOSPage() {
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
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>Terms of Service</h1>
        <p style={{color:'#555',fontSize:12,marginBottom:40}}>Last updated: {updated}</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By accessing or using AccuratKey ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. These terms apply to all users, including guests, registered users, and subscribers.',
          },
          {
            title: '2. Description of Service',
            body: 'AccuratKey is a web-based typing training application. We offer a free tier with core features, and a Pro subscription with additional features. The Service is accessible at accuratkey.vercel.app and any associated domains.',
          },
          {
            title: '3. User Accounts',
            body: 'You may use AccuratKey as a guest without an account. To access cloud sync, friends, and daily challenge features, you must create an account. You are responsible for maintaining the security of your account credentials. You must be at least 13 years old to create an account. Parents or guardians are responsible for supervising account creation for minors.',
          },
          {
            title: '4. Acceptable Use',
            body: 'You agree not to: attempt to circumvent any security measures; use automated tools to interact with the Service; harass, abuse, or harm other users; use the Service for any unlawful purpose; attempt to access another user\'s account; reverse engineer or attempt to extract source code from the Service.',
          },
          {
            title: '5. Subscriptions and Payments',
            body: 'AccuratKey offers an optional Pro subscription. Subscriptions are billed on a recurring basis (monthly or annual) until cancelled. You may cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period. Refunds are issued at our discretion for unused portions of annual subscriptions. Free tier users are not required to subscribe and retain access to core features indefinitely.',
          },
          {
            title: '6. In-App Currency (Keys)',
            body: '🔑 Keys are an in-app virtual currency with no real-world monetary value. Keys earned through gameplay cannot be withdrawn, transferred to another service, or exchanged for real money. Keys purchased directly are subject to the same restrictions. All Key transactions are final.',
          },
          {
            title: '7. User Content',
            body: 'You may upload a profile photo and set a username and display name. You retain ownership of content you upload. By uploading content, you grant AccuratKey a limited license to store and display that content to you and (if you enable public profile) other users. You may not upload content that is illegal, offensive, or infringes on the rights of others.',
          },
          {
            title: '8. Intellectual Property',
            body: 'AccuratKey, its logo, design, and all original content are the property of the AccuratKey developer. You may not reproduce, distribute, or create derivative works without explicit written permission. The word lists, game modes, and scoring systems used in the Service are proprietary.',
          },
          {
            title: '9. Disclaimers',
            body: 'AccuratKey is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or available at all times. We are not responsible for any loss of data, progress, or virtual currency due to technical issues.',
          },
          {
            title: '10. Limitation of Liability',
            body: 'To the maximum extent permitted by law, AccuratKey and its developer shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability to you for any claims shall not exceed the amount you paid for the Service in the past 12 months.',
          },
          {
            title: '11. Termination',
            body: 'We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time from Edit Profile. Upon termination, your data will be permanently deleted.',
          },
          {
            title: '12. Changes to Terms',
            body: 'We may update these Terms at any time. We will notify users of material changes via the app or email. Continued use of the Service after changes constitutes acceptance of the new Terms.',
          },
          {
            title: '13. Governing Law',
            body: 'These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration rather than in court, except where prohibited by law.',
          },
          {
            title: '14. Contact',
            body: 'For questions about these Terms, use the feedback button (💬) in the app.',
          },
        ].map(({title, body}) => (
          <div key={title} style={{marginBottom:24}}>
            <h2 style={{fontSize:14,fontWeight:700,color:'#7c6af7',marginBottom:8}}>{title}</h2>
            <p style={{color:'#777',fontSize:13,lineHeight:1.8,margin:0}}>{body}</p>
          </div>
        ))}

        <div style={{borderTop:'1px solid #1e1e30',paddingTop:24,marginTop:24,display:'flex',gap:16,flexWrap:'wrap'}}>
          <Link href="/privacy" style={{color:'#7c6af7',fontSize:13,textDecoration:'none'}}>Privacy Policy →</Link>
          <Link href="/help" style={{color:'#555',fontSize:13,textDecoration:'none'}}>Help Center →</Link>
          <Link href="/game" style={{color:'#555',fontSize:13,textDecoration:'none'}}>Back to game →</Link>
        </div>
      </main>
    </div>
  );
}
