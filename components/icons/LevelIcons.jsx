import React from "react";

// Custom illustrative icons replacing emojis for level nodes. Each is a
// self-contained SVG with some shading/depth rather than a flat glyph, sized
// via the `size` prop and tinted via `color` to match each level's theme color.

const Base = ({ size, viewBox = "0 0 48 48", children }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" style={{ display: "block" }}>
    {children}
  </svg>
);

export const IconHomeRow = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    <path d="M24 6 L42 20 V41 H6 V20 Z" fill={color} opacity="0.18" />
    <path d="M24 6 L42 20 V41 H6 V20 Z" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
    <rect x="14" y="26" width="20" height="15" fill={color} opacity="0.3" />
    <rect x="20" y="30" width="8" height="11" rx="1" fill="#1e1e30" stroke={color} strokeWidth="1.6" />
  </Base>
);

export const IconClimber = ({ size = 28, color = "#3b82f6" }) => (
  <Base size={size}>
    <path d="M6 40 L18 24 L26 32 L42 8" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <circle cx="42" cy="8" r="4" fill={color} />
    <circle cx="26" cy="32" r="3" fill={color} opacity="0.7" />
    <circle cx="18" cy="24" r="3" fill={color} opacity="0.5" />
    <path d="M6 40 L18 24 L26 32 L42 8" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.4" strokeDasharray="0.1 6" />
  </Base>
);

export const IconKeyboard = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <rect x="5" y="16" width="38" height="22" rx="4" fill={color} opacity="0.16" stroke={color} strokeWidth="2.2" />
    {[0,1,2,3,4,5].map(i => <rect key={"a"+i} x={9+i*5.6} y={21} width="4" height="4" rx="1" fill={color} opacity="0.8"/>)}
    {[0,1,2,3,4,5].map(i => <rect key={"b"+i} x={9+i*5.6} y={27} width="4" height="4" rx="1" fill={color} opacity="0.6"/>)}
    <rect x="13" y="33" width="22" height="3.5" rx="1.5" fill={color} opacity="0.9" />
  </Base>
);

export const IconHammer = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    <rect x="20.5" y="18" width="4" height="24" rx="2" fill={color} opacity="0.5" transform="rotate(15 22.5 30)" />
    <rect x="20.5" y="18" width="4" height="24" rx="2" stroke={color} strokeWidth="1.6" transform="rotate(15 22.5 30)" fill="none"/>
    <path d="M10 10 L34 10 L38 18 L28 22 L24 18 L14 18 Z" fill={color} opacity="0.85" transform="rotate(15 24 16)" />
  </Base>
);

export const IconRocket = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M24 4 C30 10 32 20 30 30 L18 30 C16 20 18 10 24 4 Z" fill={color} opacity="0.85" />
    <circle cx="24" cy="16" r="3" fill="#1e1e30" opacity="0.6" />
    <path d="M18 28 L10 38 L18 35 Z" fill={color} opacity="0.5" />
    <path d="M30 28 L38 38 L30 35 Z" fill={color} opacity="0.5" />
    <path d="M20 30 L24 42 L28 30 Z" fill="#fbbf24" opacity="0.8" />
  </Base>
);

export const IconRhythm = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <circle cx="14" cy="34" r="6" fill={color} opacity="0.85" />
    <circle cx="32" cy="30" r="6" fill={color} opacity="0.6" />
    <path d="M20 34 V12 L38 8 V30" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </Base>
);

export const IconFlow = ({ size = 28, color = "#ec4899" }) => (
  <Base size={size}>
    <path d="M4 28 C12 18 16 38 24 28 C32 18 36 38 44 28" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M4 36 C12 26 16 46 24 36 C32 26 36 46 44 36" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.45" />
  </Base>
);

export const IconTarget = ({ size = 28, color = "#f97316" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="2.4" fill="none" opacity="0.9" />
    <circle cx="24" cy="24" r="11" stroke={color} strokeWidth="2.4" fill="none" opacity="0.7" />
    <circle cx="24" cy="24" r="4.5" fill={color} />
  </Base>
);

export const IconZone = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <polygon points="26,4 12,26 22,26 18,44 36,20 25,20" fill={color} opacity="0.85" />
    <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.4" opacity="0.25" fill="none" />
  </Base>
);

export const IconFire = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M24 4 C30 14 34 18 30 26 C34 24 36 30 30 36 C32 30 26 28 26 34 C26 28 18 30 18 38 C10 32 12 22 18 18 C16 24 20 22 20 16 C20 10 22 8 24 4 Z" fill={color} opacity="0.9" />
  </Base>
);

export const IconGem = ({ size = 28, color = "#6366f1" }) => (
  <Base size={size}>
    <polygon points="24,4 36,16 24,44 12,16" fill={color} opacity="0.25" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <polygon points="24,4 30,16 24,44 18,16" fill={color} opacity="0.5" />
    <line x1="12" y1="16" x2="36" y2="16" stroke={color} strokeWidth="1.6" opacity="0.7" />
  </Base>
);

export const IconWizard = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <path d="M24 4 L34 36 L24 30 L14 36 Z" fill={color} opacity="0.85" />
    <circle cx="24" cy="4" r="2.4" fill="#fbbf24" />
    <path d="M14 36 Q24 42 34 36 L32 42 Q24 46 16 42 Z" fill={color} opacity="0.6" />
  </Base>
);

export const IconLightning = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    <polygon points="27,2 12,26 21,26 18,46 36,20 26,20" fill={color} opacity="0.95" />
  </Base>
);

export const IconDemon = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <path d="M12 18 L6 10 L16 14 C19 10 29 10 32 14 L42 10 L36 18 C38 22 38 30 34 36 C30 40 18 40 14 36 C10 30 10 22 12 18 Z" fill={color} opacity="0.85" />
    <circle cx="19" cy="24" r="2.6" fill="#1e1e30" />
    <circle cx="29" cy="24" r="2.6" fill="#1e1e30" />
    <path d="M18 32 Q24 36 30 32" stroke="#1e1e30" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </Base>
);

export const IconTrophy = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M16 8 H32 V22 C32 28 28 32 24 32 C20 32 16 28 16 22 Z" fill={color} opacity="0.9" />
    <path d="M16 12 H8 C8 20 12 22 16 22" stroke={color} strokeWidth="2.2" fill="none" />
    <path d="M32 12 H40 C40 20 36 22 32 22" stroke={color} strokeWidth="2.2" fill="none" />
    <rect x="20" y="32" width="8" height="6" fill={color} opacity="0.6" />
    <rect x="14" y="38" width="20" height="4" rx="1.5" fill={color} opacity="0.85" />
  </Base>
);

// Maps level id -> icon component, for the Foundations section (1-15).
export const FOUNDATIONS_ICONS = {
  1: IconHomeRow, 2: IconClimber, 3: IconKeyboard, 4: IconHammer, 5: IconRocket,
  6: IconRhythm, 7: IconFlow, 8: IconTarget, 9: IconZone, 10: IconFire,
  11: IconGem, 12: IconWizard, 13: IconLightning, 14: IconDemon, 15: IconTrophy,
};
