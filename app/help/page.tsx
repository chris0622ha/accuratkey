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
      <section style={{ padding: '56px 0 28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: 800, margin: '0 0 10px' }}>How can we help?</h1>
        <p style={{ color: H.mute, fontSize: 14, margin: '0 0 24px' }}>Search the Help Center or pick a topic below.</p>
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search, e.g. streak, Bluetooth, delete account"
            aria-label="Search help"
            style={{ width: '100%', boxSizing: 'border-box', background: H.card, border: `1px solid ${H.line}`, borderRadius: 12, padding: '15px 18px', color: H.text, fontFamily: H.font, fontSize: 15, outline: 'none' }}
          />
        </div>
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
          <section style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 44 }}>
            {POPULAR.map(([label, id], i) => (
              <Link key={i} href={`/help/${id}`} className="hchip" style={{ textDecoration: 'none', background: H.card, border: `1px solid ${H.line}`, borderRadius: 999, padding: '8px 14px', color: H.mute, fontSize: 12 }}>{label}</Link>
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
                    <Link key={id} href={href} className="hcard" style={{ ['--c' as any]: t.color, textDecoration: 'none', background: H.card, border: `1px solid ${H.line}`, borderTop: `3px solid ${t.color}`, borderRadius: 12, padding: '16px 18px', display: 'block' }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{t.emoji}</div>
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
