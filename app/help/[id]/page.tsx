'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { KKey } from '@/components/icons/KKey';
import { HelpShell, H } from '@/components/help/HelpShell';
import { TOPICS, HELP_GROUPS, TOPIC_DESC } from '@/lib/helpContent';

// Body text is plain strings; "{KKEY}" is swapped for the real key icon.
function withKKeyIcon(text: string) {
  const parts = text.split('{KKEY}');
  if (parts.length === 1) return text;
  const out: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    out.push(part);
    if (i < parts.length - 1) out.push(<KKey key={i} size={12} />);
  });
  return out;
}

const ORDER = HELP_GROUPS.flatMap(g => g.ids);

export default function HelpTopicPage({ params }: { params: { id: string } }) {
  const topic = TOPICS[params.id];
  if (!topic) notFound();
  const { title, emoji, color, intro, sections, faqs } = topic;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [active, setActive] = useState('');

  // Open the FAQ / scroll to the section named in the URL hash (used by search results).
  useEffect(() => {
    const go = () => {
      const h = window.location.hash.slice(1);
      if (!h) return;
      if (h.startsWith('f')) setOpenFaq(Number(h.slice(1)));
      setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  // Highlight the TOC entry for the section currently in view.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-sec]'));
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) setActive((e.target as HTMLElement).id); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, [params.id]);

  const idx = ORDER.indexOf(params.id);
  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  const group = HELP_GROUPS.find(g => g.ids.includes(params.id));
  const related = (group?.ids || []).filter(i => i !== params.id && TOPICS[i]).slice(0, 3);

  const navLink = (id: string | null, dir: 'prev' | 'next') => id && TOPICS[id] ? (
    <Link href={`/help/${id}`} className="hcard" style={{ ['--c' as any]: TOPICS[id].color, flex: 1, minWidth: 180, textDecoration: 'none', background: H.card, border: `1px solid ${H.line}`, borderRadius: 12, padding: '14px 18px', textAlign: dir === 'next' ? 'right' : 'left' }}>
      <div style={{ color: H.dim, fontSize: 11, marginBottom: 4 }}>{dir === 'prev' ? '← Previous' : 'Next →'}</div>
      <div style={{ color: H.text, fontWeight: 700, fontSize: 13 }}>{TOPICS[id].emoji} {TOPICS[id].title}</div>
    </Link>
  ) : <div style={{ flex: 1, minWidth: 180 }} />;

  return (
    <HelpShell back={{ href: '/help', label: '← All topics' }}>
      <div style={{ padding: '36px 0 28px', borderBottom: `1px solid ${H.line}`, marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: H.dim, marginBottom: 14 }}>
          <Link href="/help" style={{ color: H.dim, textDecoration: 'none' }}>Help Center</Link>
          {group && <> <span style={{ margin: '0 6px' }}>/</span> {group.title}</>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: color + '22', border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{emoji}</div>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,4.5vw,30px)', fontWeight: 800, margin: 0 }}>{title}</h1>
            <p style={{ color: H.mute, fontSize: 14, lineHeight: 1.7, margin: '6px 0 0', maxWidth: 640 }}>{withKKeyIcon(intro)}</p>
          </div>
        </div>
      </div>

      <div className="hlayout" style={{ display: 'grid', gridTemplateColumns: '210px minmax(0,1fr)', gap: 36, alignItems: 'start' }}>
        <nav className="htoc" aria-label="On this page" style={{ position: 'sticky', top: 84, fontSize: 12 }}>
          <div style={{ color: H.dim, letterSpacing: 2, fontSize: 10, marginBottom: 10 }}>ON THIS PAGE</div>
          {sections.map((s, i) => (
            <a key={i} href={`#s${i}`} style={{ display: 'block', textDecoration: 'none', color: active === `s${i}` ? color : H.mute, borderLeft: `2px solid ${active === `s${i}` ? color : H.line}`, padding: '5px 0 5px 12px', lineHeight: 1.4 }}>{s.heading}</a>
          ))}
          {faqs && faqs.length > 0 && (
            <a href="#faq" style={{ display: 'block', textDecoration: 'none', color: active === 'faq' ? color : H.mute, borderLeft: `2px solid ${active === 'faq' ? color : H.line}`, padding: '5px 0 5px 12px' }}>Common questions</a>
          )}
        </nav>

        <main style={{ minWidth: 0 }}>
          {sections.map(({ heading, body }, i) => (
            <section key={i} id={`s${i}`} data-sec style={{ background: H.card, border: `1px solid ${H.line}`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: '18px 22px', marginBottom: 12, scrollMarginTop: 90 }}>
              <h2 style={{ fontWeight: 700, fontSize: 14, color: H.text, margin: '0 0 8px' }}>{withKKeyIcon(heading)}</h2>
              <p style={{ color: H.mute, fontSize: 13, lineHeight: 1.85, margin: 0 }}>{withKKeyIcon(body)}</p>
            </section>
          ))}

          {faqs && faqs.length > 0 && (
            <section id="faq" data-sec style={{ marginTop: 28, scrollMarginTop: 90 }}>
              <h2 style={{ fontSize: 11, color: H.dim, letterSpacing: 2, fontWeight: 600, margin: '0 0 12px' }}>COMMON QUESTIONS</h2>
              {faqs.map(([q, a], i) => (
                <div key={i} id={`f${i}`} style={{ background: H.card, border: `1px solid ${openFaq === i ? color + '88' : H.line}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden', scrollMarginTop: 90 }}>
                  <button className="hbtn" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '14px 18px', background: 'none', border: 'none', color: H.text, fontFamily: H.font, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span>{withKKeyIcon(q)}</span>
                    <span style={{ color, fontSize: 18, flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 18px 16px', color: H.mute, fontSize: 13, lineHeight: 1.85 }}>{withKKeyIcon(a)}</div>}
                </div>
              ))}
            </section>
          )}

          {related.length > 0 && (
            <section style={{ marginTop: 34 }}>
              <h2 style={{ fontSize: 11, color: H.dim, letterSpacing: 2, fontWeight: 600, margin: '0 0 12px' }}>RELATED</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {related.map(id => (
                  <Link key={id} href={`/help/${id}`} className="hchip" style={{ textDecoration: 'none', background: H.card, border: `1px solid ${H.line}`, borderRadius: 999, padding: '8px 14px', color: H.mute, fontSize: 12 }} title={TOPIC_DESC[id]}>{TOPICS[id].emoji} {TOPICS[id].title}</Link>
                ))}
              </div>
            </section>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 34 }}>
            {navLink(prev, 'prev')}
            {navLink(next, 'next')}
          </div>
        </main>
      </div>
    </HelpShell>
  );
}
