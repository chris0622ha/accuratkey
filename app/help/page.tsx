'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HelpShell, H } from '@/components/help/HelpShell';
import { TOPICS, HELP_GROUPS, TOPIC_DESC, POPULAR } from '@/lib/helpContent';
import { KKey } from '@/components/icons/KKey';

const plain = (t: string) => t.replace(/\{KKEY\}/g, 'Keys');
const kk = (t: string) => {
  const p = t.split('{KKEY}');
  return p.length === 1 ? t : p.flatMap((x, i) => (i < p.length - 1 ? [x, <KKey key={i} size={12} />] : [x]));
};

type Hit = { topic: string; label: string; heading: string; text: string; anchor: string; score: number };

export default function HelpPage() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const hits = useMemo<Hit[]>(() => {
    if (query.length < 2) return [];
    const words = query.split(/\s+/);
    const out: Hit[] = [];
    Object.entries(TOPICS).forEach(([id, t]) => {
      const push = (heading: string, text: string, anchor: string) => {
        const h = plain(heading).toLowerCase(), b = plain(text).toLowerCase();
        let score = 0;
        for (const w of words) {
          if (h.includes(w)) score += 3;
          if (b.includes(w)) score += 1;
          if (!h.includes(w) && !b.includes(w)) return;
        }
        out.push({ topic: id, label: t.title, heading, text, anchor, score });
      };
      t.sections.forEach((s, i) => push(s.heading, s.body, `s${i}`));
      (t.faqs || []).forEach(([a, b], i) => push(a, b, `f${i}`));
    });
    return out.sort((a, b) => b.score - a.score).slice(0, 12);
  }, [query]);

  return (
    <HelpShell>
      <section style={{ margin: '28px 0 30px', padding: 'clamp(30px,6vw,56px) clamp(18px,4vw,48px)', borderRadius: 24, textAlign: 'center', background: 'radial-gradient(120% 140% at 10% 0%, #3b2d8f 0%, #1b1640 45%, #0e0e1c 100%)', border: `1px solid ${H.line}`, position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,#7c6af755,transparent 70%)' }} />
        <div style={{ fontSize: 12, letterSpacing: 4, color: '#b9afff', marginBottom: 12 }}>HELP CENTER</div>
        <h1 style={{ fontSize: 'clamp(28px,6vw,46px)', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.1 }}>How can we help?</h1>
        <p style={{ color: '#c9c9e8', fontSize: 14, margin: '0 0 26px' }}>Guides, answers and fixes for every part of AccuratKey.</p>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="🔎  Search, e.g. streak, Bluetooth, delete account"
            aria-label="Search help"
            style={{ width: '100%', boxSizing: 'border-box', background: '#0a0a12', border: '1px solid #4b4390', borderRadius: 14, padding: '16px 20px', color: H.text, fontFamily: H.font, fontSize: 15, outline: 'none', boxShadow: '0 8px 30px #0008' }}
          />
        </div>
        {query.length < 2 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 18 }}>
            {POPULAR.map(([label, id], i) => (
              <Link key={i} href={`/help/${id}`} className="hchip" style={{ textDecoration: 'none', background: '#ffffff12', border: '1px solid #ffffff22', borderRadius: 999, padding: '7px 13px', color: '#d6d6f2', fontSize: 12 }}>{label}</Link>
            ))}
          </div>
        )}
      </section>

      {query.length >= 2 ? (
        <section aria-live="polite" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ color: H.dim, fontSize: 12, marginBottom: 12 }}>{hits.length ? `${hits.length} result${hits.length > 1 ? 's' : ''}` : 'No results'}</div>
          {hits.map((h, i) => (
            <Link key={i} href={`/help/${h.topic}#${h.anchor}`} style={{ display: 'block', textDecoration: 'none', background: H.card, border: `1px solid ${H.line}`, borderRadius: 12, padding: '14px 18px', marginBottom: 8 }}>
              <div style={{ color: TOPICS[h.topic].color, fontSize: 11, marginBottom: 4 }}>{TOPICS[h.topic].emoji} {h.label}</div>
              <div style={{ color: H.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{kk(h.heading)}</div>
              <div style={{ color: H.mute, fontSize: 12, lineHeight: 1.6 }}>{kk(h.text.length > 150 ? h.text.slice(0, 150) + '…' : h.text)}</div>
            </Link>
          ))}
          {!hits.length && (
            <div style={{ background: H.card, border: `1px solid ${H.line}`, borderRadius: 12, padding: 22, color: H.mute, fontSize: 13, lineHeight: 1.7 }}>
              Nothing matched. Try a shorter word, or send us a note with Send feedback in the profile menu.
            </div>
          )}
        </section>
      ) : (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12, marginBottom: 44 }}>
            {[['1', 'Connect a keyboard', 'AccuratKey needs a physical one.', '/help/keyboard'], ['2', 'Make a profile', 'Free, with or without an account.', '/help/getting-started'], ['3', 'Pass your first level', 'No Backspace: accuracy comes first.', '/help/levels']].map(([n, t, d, h]) => (
              <Link key={n} href={h} className="hcard" style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center', background: H.card2, border: `1px solid ${H.line}`, borderRadius: 14, padding: '16px 18px' }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: H.accent, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
                <span><div style={{ color: H.text, fontWeight: 700, fontSize: 13 }}>{t}</div><div style={{ color: H.mute, fontSize: 11, marginTop: 2 }}>{d}</div></span>
              </Link>
            ))}
          </section>

          {HELP_GROUPS.map(g => (
            <section key={g.title} style={{ marginBottom: 38 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 2px' }}>{g.title}</h2>
              <p style={{ color: H.dim, fontSize: 12, margin: '0 0 14px' }}>{g.blurb}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
                {g.ids.map(id => {
                  const t = TOPICS[id];
                  if (!t) return null;
                  const href = id === 'keyboard' ? '/help/keyboard' : `/help/${id}`;
                  return (
                    <Link key={id} href={href} className="hcard" style={{ ['--c' as any]: t.color, textDecoration: 'none', border: `1px solid ${H.line}`, borderRadius: 16, padding: '18px 20px', display: 'block', background: `linear-gradient(160deg, ${t.color}1f, ${H.card} 55%)` }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: t.color + '2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 }}>{t.emoji}</div>
                      <div style={{ color: H.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                      <div style={{ color: H.mute, fontSize: 12, lineHeight: 1.55 }}>{TOPIC_DESC[id]}</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          <section style={{ background: H.card, border: `1px solid ${H.line}`, borderRadius: 14, padding: '22px 24px', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Keyboard setup guides</div>
            <p style={{ color: H.dim, fontSize: 12, margin: '0 0 12px' }}>AccuratKey needs a physical keyboard. Step-by-step guides:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[['Overview', '/keyboard'], ['Bluetooth', '/keyboard/bluetooth'], ['USB', '/keyboard/usb'], ['iPad Smart Connector', '/keyboard/ipad-smart'], ['Samsung DeX', '/keyboard/samsung-dex'], ['Desktop', '/keyboard/desktop']].map(([l, h]) => (
                <Link key={h} href={h} className="hchip" style={{ textDecoration: 'none', background: H.bg, border: `1px solid ${H.line}`, borderRadius: 8, padding: '7px 12px', color: H.mute, fontSize: 12 }}>{l}</Link>
              ))}
            </div>
          </section>

          <section style={{ textAlign: 'center', padding: '28px 20px', border: `1px dashed ${H.line}`, borderRadius: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Still stuck?</div>
            <p style={{ color: H.mute, fontSize: 12, margin: '0 0 16px' }}>Open the game, tap your avatar, then Send feedback. The developer reads every message.</p>
            <Link href="/game" style={{ display: 'inline-block', background: H.accent, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13, padding: '10px 22px', borderRadius: 8 }}>Open the game</Link>
          </section>
        </>
      )}
    </HelpShell>
  );
}
