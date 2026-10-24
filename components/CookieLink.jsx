"use client";
export default function CookieLink({ style, children = "Cookies" }) {
  return <a href="#cookies" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent("ak-open-cookie-settings")); }} style={style}>{children}</a>;
}
