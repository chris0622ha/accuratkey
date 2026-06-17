import React from "react";

// Shared Keys (currency) icon — replaces the 🔑 emoji throughout the app.
export const KKey = ({ size = 16, style = {} }) => (
  <svg
    width={size}
    height={size * 1.1}
    viewBox="0 0 20 22"
    fill="none"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
  >
    <rect x="1" y="1" width="18" height="17" rx="3" fill="#2a2a3e" stroke="#5a5870" strokeWidth="1.2" />
    <rect x="1" y="15" width="18" height="5" rx="2" fill="#1a1a2e" stroke="#3a3850" strokeWidth="1" />
    <rect x="2.5" y="2" width="15" height="13" rx="2" fill="#1e1e30" />
    <text x="10" y="12" textAnchor="middle" fill="#c4baff" fontSize="9" fontWeight="bold" fontFamily="'JetBrains Mono',monospace">K</text>
  </svg>
);

export default KKey;
