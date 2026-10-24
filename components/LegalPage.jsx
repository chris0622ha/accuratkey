import LogoMark from "@/components/LogoMark";
import Link from "next/link";
import CookieLink from "./CookieLink";
import { LEGAL } from "@/lib/legal";

export const ContactLine = () => LEGAL.contactEmail
  ? <>email <a href={`mailto:${LEGAL.contactEmail}`} style={{color:"#a78bfa"}}>{LEGAL.contactEmail}</a>, or use <b>Send feedback</b> in the app</>
  : <>use <b>Send feedback</b> in the app (avatar menu)</>;

export default function LegalPage({ title, intro, sections }) {
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",fontFamily:"system-ui,-apple-system,Segoe UI,sans-serif",color:"#d6d6ee",padding:"0 20px 80px"}}>
      <nav style={{maxWidth:760,margin:"0 auto",padding:"20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #1e1e30"}}>
        <Link href="/game" style={{fontWeight:800,fontSize:18,textDecoration:"none",fontFamily:"'JetBrains Mono',monospace",display:"inline-flex",alignItems:"center"}}><LogoMark size={24} /><span style={{color:"#7c6af7"}}>Accurat</span><span style={{color:"#e0e0ff"}}>Key</span></Link>
        <div style={{display:"flex",gap:16,fontSize:13}}>
          <Link href="/privacy" style={{color:"#8a8aa8",textDecoration:"none"}}>Privacy</Link>
          <CookieLink style={{color:"#8a8aa8",textDecoration:"none"}} />
          <Link href="/childrens-privacy" style={{color:"#8a8aa8",textDecoration:"none"}}>Children</Link>
          <Link href="/tos" style={{color:"#8a8aa8",textDecoration:"none"}}>Terms</Link>
        </div>
      </nav>
      <main style={{maxWidth:760,margin:"36px auto 0",lineHeight:1.75,fontSize:15}}>
        <h1 style={{fontSize:30,fontWeight:800,color:"#fff",margin:"0 0 6px"}}>{title}</h1>
        <div style={{color:"#7a7a98",fontSize:13,marginBottom:20}}>Last updated {LEGAL.updated}</div>
        {intro && <p style={{background:"#13131f",border:"1px solid #1e1e30",borderRadius:12,padding:"14px 18px",margin:"0 0 28px"}}>{intro}</p>}
        {sections.map((s, i) => (
          <section key={i} style={{marginBottom:26}}>
            <h2 style={{fontSize:18,fontWeight:700,color:"#fff",margin:"0 0 8px"}}>{s.h}</h2>
            {s.p && s.p.map((t, j) => <p key={j} style={{margin:"0 0 10px"}}>{t}</p>)}
            {s.ul && <ul style={{margin:"0 0 10px",paddingLeft:22}}>{s.ul.map((t, j) => <li key={j} style={{marginBottom:5}}>{t}</li>)}</ul>}
            {s.node}
          </section>
        ))}
      </main>
    </div>
  );
}
