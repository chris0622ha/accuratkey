// The AccuratKey app icon, shown beside the wordmark.
export default function LogoMark({ size = 22, style = {} }) {
  return <img src="/icons/icon-192.png" width={size} height={size} alt="" aria-hidden="true" style={{ borderRadius: Math.round(size * 0.24), verticalAlign: "middle", marginRight: Math.max(6, Math.round(size * 0.35)), flexShrink: 0, display: "inline-block", ...style }} />;
}
