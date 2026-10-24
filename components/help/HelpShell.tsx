'use client';
import LogoMark from "@/components/LogoMark";
import Link from 'next/link';
import { ReactNode } from 'react';
import { latestVersion, BUILD } from '@/lib/version';
import { WHATS_NEW } from '@/lib/whatsNew';

export const H = { bg: '#0a0a0f', card: '#12121d', card2: '#171727', line: '#22223a', text: '#e6e6ff', mute: '#9a9ab8', dim: '#6b6b88', accent: '#7c6af7', font: "'JetBrains Mono',monospace" };

export function HelpShell({ children, back }: { children: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div style={{ minHeight: '100vh', background: H.bg, color: H.text, fontFamily: H.font }}>
      <style>{`
        .hl a{transition:border-color .15s,background .15s,transform .15s}
        .hcard:hover{border-color:var(--c,#7c6af7)!important;transform:translateY(-2px)}
        .hchip:hover{border-color:#7c6af7!important;color:#e6e6ff!important}
        .hbtn:focus-visible,.hcard:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #7c6af7;outline-offset:2px}
        .htoc a:hover{color:#e6e6ff!important}
        @media (max-width:860px){.hlayout{display:block!important}.htoc{position:static!important;margin-bottom:20px}}
        @media (prefers-reduced-motion:reduce){.hcard{transition:none!important}}
      `}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: H.bg + 'ee', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${H.line}` }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link href="/help" style={{ textDecoration: 'none', fontWeight: 800, fontSize: 17, display: 'inline-flex', alignItems: 'center' }}>
            <LogoMark size={26} />
            <span style={{ color: H.accent }}>Accurat</span><span style={{ color: H.text }}>Key</span>
            <span style={{ color: H.dim, fontWeight: 600, fontSize: 13, marginLeft: 10 }}>Help</span>
          </Link>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, alignItems: 'center' }}>
            {back && <Link href={back.href} style={{ color: H.mute, textDecoration: 'none' }}>{back.label}</Link>}
            <Link href="/game" style={{ background: H.accent, color: '#fff', textDecoration: 'none', fontWeight: 700, padding: '7px 14px', borderRadius: 8 }}>Open game</Link>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 20px 80px' }}>{children}</div>
      <footer style={{ borderTop: `1px solid ${H.line}`, padding: '20px', textAlign: 'center', fontSize: 11, color: H.dim, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/privacy" style={{ color: H.dim }}>Privacy</Link>
        <Link href="/childrens-privacy" style={{ color: H.dim }}>Children&apos;s privacy</Link>
        <Link href="/tos" style={{ color: H.dim }}>Terms</Link>
        <span>AccuratKey v{latestVersion(WHATS_NEW)}{BUILD ? ` · ${BUILD}` : ''}</span>
      </footer>
    </div>
  );
}
