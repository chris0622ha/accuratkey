import React from "react";

// Custom illustrative icons replacing emojis for level nodes. Each icon is
// built from multiple layered shapes (base + shading + highlight + detail)
// rather than a single flat glyph, so they read as small illustrations
// rather than colored silhouettes. Sized via `size`, tinted via `color`.

const Base = ({ size, viewBox = "0 0 48 48", children }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" style={{ display: "block" }}>
    {children}
  </svg>
);

// 1. Home Row Hero — a little house with a glowing doorway and roof shingle lines
export const IconHomeRow = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    <path d="M24 5 L43 20 V41 H5 V20 Z" fill={color} opacity="0.16" />
    <path d="M24 5 L43 20 V41 H5 V20 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M24 9 L38 20.5 M24 9 L10 20.5" stroke={color} strokeWidth="1" opacity="0.5" />
    <path d="M9 24 H39 M9 30 H39" stroke={color} strokeWidth="0.8" opacity="0.3" />
    <rect x="9" y="20" width="9" height="8" rx="1" fill={color} opacity="0.35" stroke={color} strokeWidth="1" />
    <rect x="30" y="20" width="9" height="8" rx="1" fill={color} opacity="0.35" stroke={color} strokeWidth="1" />
    <rect x="19" y="29" width="10" height="12" rx="1.5" fill="#15151f" stroke={color} strokeWidth="1.8" />
    <circle cx="27" cy="35" r="1.1" fill={color} />
    <circle cx="24" cy="3.5" r="1.6" fill="#fbbf24" opacity="0.9" />
  </Base>
);

// 2. Top Row Climber — a mountain with a climbing dotted path, flag at the summit
export const IconClimber = ({ size = 28, color = "#3b82f6" }) => (
  <Base size={size}>
    <path d="M4 40 L17 16 L24 26 L31 12 L44 40 Z" fill={color} opacity="0.18" />
    <path d="M4 40 L17 16 L24 26 L31 12 L44 40 Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M17 16 L21 22 L24 26" stroke={color} strokeWidth="1.2" opacity="0.5" fill="none" />
    <path d="M9 40 L17 27 L24 33 L31 18 L38 40" stroke={color} strokeWidth="1.6" strokeDasharray="2.4 3" opacity="0.7" fill="none" strokeLinecap="round" />
    <line x1="31" y1="12" x2="31" y2="4" stroke={color} strokeWidth="1.6" />
    <path d="M31 4 L39 7 L31 10 Z" fill={color} opacity="0.9" />
    <circle cx="14" cy="10" r="2.6" fill="#fbbf24" opacity="0.5" />
  </Base>
);

// 3. Full Board Basics — a full mechanical keyboard, angled, with key highlight + cable
export const IconKeyboard = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <path d="M4 32 L8 16 H40 L44 32 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <rect x="9" y="19" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.75"/>
    <rect x="13.7" y="19" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.75"/>
    <rect x="18.4" y="19" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.75"/>
    <rect x="23.1" y="19" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.75"/>
    <rect x="27.8" y="19" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.75"/>
    <rect x="32.5" y="19" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.75"/>
    <rect x="37.2" y="19" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.75"/>
    <rect x="11" y="24.5" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.55"/>
    <rect x="15.7" y="24.5" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.55"/>
    <rect x="20.4" y="24.5" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.55"/>
    <rect x="25.1" y="24.5" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.55"/>
    <rect x="29.8" y="24.5" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.55"/>
    <rect x="34.5" y="24.5" width="3.6" height="3.6" rx="0.8" fill={color} opacity="0.55"/>
    <rect x="14" y="29.5" width="20" height="3" rx="1.4" fill={color} opacity="0.85" />
    <circle cx="13.3" cy="20.8" r="1.2" fill="#fff" opacity="0.7" />
    <path d="M24 32 V38 Q24 40 26 40 H34" stroke={color} strokeWidth="1.6" fill="none" opacity="0.6" strokeLinecap="round" />
  </Base>
);

// 4. Word Builder — a hammer striking a building block, with motion lines and a spark
export const IconHammer = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    <rect x="12" y="30" width="24" height="9" rx="1.5" fill={color} opacity="0.2" stroke={color} strokeWidth="1.6" />
    <rect x="16" y="30" width="6" height="9" fill={color} opacity="0.35" />
    <rect x="26" y="30" width="6" height="9" fill={color} opacity="0.35" />
    <g transform="rotate(-28 26 18)">
      <rect x="24" y="16" width="4" height="20" rx="2" fill={color} opacity="0.55" />
      <path d="M14 8 L36 8 L40 16 L30 20 L26 16 L18 16 Z" fill={color} opacity="0.9" stroke={color} strokeWidth="1" />
    </g>
    <path d="M30 26 L34 22 M32 28 L37 26" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
  </Base>
);

// 5. Speed Seeker — a radar lock-on reticle sweeping with speed streaks
export const IconRocket = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <circle cx="22" cy="22" r="15" stroke={color} strokeWidth="1.6" opacity="0.4" fill="none" />
    <circle cx="22" cy="22" r="9" stroke={color} strokeWidth="1.6" opacity="0.6" fill="none" />
    <path d="M22 7 A15 15 0 0 1 37 22 L22 22 Z" fill={color} opacity="0.25" />
    <circle cx="22" cy="22" r="3" fill={color} />
    <path d="M22 22 L31 13" stroke={color} strokeWidth="1.6" opacity="0.7" strokeLinecap="round" />
    <path d="M35 9 L42 6 M38 13 L45 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
    <path d="M2 36 L14 36 M5 41 L20 41" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </Base>
);

// 6. Rhythm Rider — equalizer bars pulsing with a sound wave arc behind them
export const IconRhythm = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <path d="M6 30 Q24 4 42 30" stroke={color} strokeWidth="1.2" opacity="0.3" fill="none" />
    <rect x="9" y="24" width="5" height="14" rx="2" fill={color} opacity="0.55" />
    <rect x="17" y="14" width="5" height="24" rx="2" fill={color} opacity="0.75" />
    <rect x="25" y="20" width="5" height="18" rx="2" fill={color} opacity="0.9" />
    <rect x="33" y="9" width="5" height="29" rx="2" fill={color} />
    <circle cx="35.5" cy="6" r="1.4" fill="#fff" opacity="0.7" />
  </Base>
);

// 7. Flow State — layered ribbon waves with a glowing core dot riding the crest
export const IconFlow = ({ size = 28, color = "#ec4899" }) => (
  <Base size={size}>
    <path d="M3 32 C11 20 15 44 24 32 C33 20 37 44 45 32" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
    <path d="M3 24 C11 12 15 36 24 24 C33 12 37 36 45 24" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.45" />
    <path d="M3 40 C11 28 15 52 24 40 C33 28 37 52 45 40" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.25" />
    <circle cx="24" cy="24" r="2.4" fill="#fff" opacity="0.8" />
  </Base>
);

// 8. Steady Hands — an archery target with an arrow mid-flight
export const IconTarget = ({ size = 28, color = "#f97316" }) => (
  <Base size={size}>
    <circle cx="26" cy="24" r="17" fill={color} opacity="0.08" />
    <circle cx="26" cy="24" r="17" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="26" cy="24" r="11" stroke={color} strokeWidth="2" fill="none" opacity="0.75" />
    <circle cx="26" cy="24" r="5.5" stroke={color} strokeWidth="2" fill="none" opacity="0.55" />
    <circle cx="26" cy="24" r="2" fill={color} />
    <path d="M2 24 H17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M2 24 L8 21 M2 24 L8 27" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M14 20 L18 24 L14 28" stroke={color} strokeWidth="1.4" fill="none" opacity="0.6" />
  </Base>
);

// 9. The Zone — a camera-aperture/iris motif suggesting tunnel-vision focus
export const IconZone = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="19" stroke={color} strokeWidth="1" opacity="0.2" fill="none" />
    <path d="M24 7 L34 13 V25 L24 31 L14 25 V13 Z" stroke={color} strokeWidth="1.6" opacity="0.5" fill="none" strokeLinejoin="round" />
    <path d="M24 13 L30 16.5 V23.5 L24 27 L18 23.5 V16.5 Z" fill={color} opacity="0.35" />
    <path d="M24 17 L27 18.7 V22.3 L24 24 L21 22.3 V18.7 Z" fill={color} opacity="0.95" />
    <circle cx="9" cy="9" r="1.2" fill="#fff" opacity="0.5" />
    <circle cx="39" cy="39" r="1.2" fill="#fff" opacity="0.5" />
  </Base>
);

// 10. Turbo Typist — a layered flame with inner core glow and embers
export const IconFire = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M24 4 C31 13 35 18 31 27 C36 25 38 32 31 39 C33 32 26 30 26 36 C26 30 17 32 17 41 C8 34 10 22 17 18 C15 25 19 23 19 16 C19 10 21 7 24 4 Z" fill={color} opacity="0.85" />
    <path d="M24 14 C27 19 28 23 25 28 C27 27 28 31 25 34 C25 30 21 31 21 35 C16 31 17 25 21 22 C20 26 22 25 22 21 C22 18 23 16 24 14 Z" fill="#fde047" opacity="0.75" />
    <circle cx="33" cy="10" r="0.9" fill={color} opacity="0.5" />
    <circle cx="14" cy="8" r="0.7" fill={color} opacity="0.4" />
  </Base>
);

// 11. Precision Pro — a faceted gem with multiple cut planes and a sparkle
export const IconGem = ({ size = 28, color = "#6366f1" }) => (
  <Base size={size}>
    <polygon points="24,4 36,16 24,44 12,16" fill={color} opacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <polygon points="24,4 30,16 24,28 18,16" fill={color} opacity="0.55" />
    <polygon points="18,16 24,28 24,44 12,16" fill={color} opacity="0.35" />
    <polygon points="30,16 24,28 24,44 36,16" fill={color} opacity="0.45" />
    <line x1="12" y1="16" x2="36" y2="16" stroke={color} strokeWidth="1.4" opacity="0.8" />
    <line x1="24" y1="4" x2="24" y2="28" stroke={color} strokeWidth="1" opacity="0.5" />
    <circle cx="30" cy="10" r="1.3" fill="#fff" opacity="0.85" />
  </Base>
);

// 12. Key Wizard — a wizard hat with a star tip, brim band, and a tiny sparkle
export const IconWizard = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <path d="M24 4 L35 35 L24 29 L13 35 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M19 22 L29 22 L31 27 L17 27 Z" fill="#1e1e30" opacity="0.4" />
    <polygon points="24,2 25.4,5 28.4,5 26,7 27,10 24,8.2 21,10 22,7 19.6,5 22.6,5" fill="#fbbf24" opacity="0.95" />
    <path d="M11 35 Q24 42 37 35 L35 42 Q24 47 13 42 Z" fill={color} opacity="0.6" stroke={color} strokeWidth="1" />
    <circle cx="33" cy="14" r="1.1" fill="#fff" opacity="0.6" />
  </Base>
);

// 13. Lightning Fingers — a hand silhouette with energy crackling off the fingertips
export const IconLightning = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    <path d="M16 44 V26 C16 23 18 21 21 21 C22 21 23 21.5 23.5 22 V13 C23.5 11 25 10 26.5 10 C28 10 29.5 11 29.5 13 V22 C30 21.5 31 21 32 21 C34.5 21 36.5 23 36.5 26 V44 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    <path d="M21 21 V16 C21 14 22.3 13 23.5 13" stroke={color} opacity="0.6" strokeWidth="1.2" fill="none" />
    <path d="M32 21 V17 C32 15 30.8 14 29.5 14" stroke={color} opacity="0.6" strokeWidth="1.2" fill="none" />
    <polygon points="26,2 22,11 25.5,11 23,18 31,8 27,8" fill="#fff" opacity="0.95" />
    <path d="M9 14 L14 16 M40 12 L36 16" stroke={color} strokeWidth="1.4" opacity="0.45" strokeLinecap="round" />
  </Base>
);

// 14. Speed Demon — a small horned demon face with glowing eyes and curled smirk + wisp trail
export const IconDemon = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <path d="M11 18 L5 9 L16 13 C19 9 29 9 32 13 L43 9 L37 18 C39 22 39 31 35 37 C30 41 18 41 13 37 C9 31 9 22 11 18 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1" />
    <path d="M16 13 L12 6 M32 13 L36 6" stroke={color} strokeWidth="1.6" opacity="0.7" fill="none" strokeLinecap="round" />
    <circle cx="19" cy="25" r="3" fill="#1e1e30" />
    <circle cx="29" cy="25" r="3" fill="#1e1e30" />
    <circle cx="19" cy="24.3" r="1" fill="#fde047" opacity="0.9" />
    <circle cx="29" cy="24.3" r="1" fill="#fde047" opacity="0.9" />
    <path d="M16 33 Q24 38 32 33" stroke="#1e1e30" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M14 36 Q10 40 13 44" stroke={color} strokeWidth="1.2" opacity="0.5" fill="none" />
  </Base>
);

// 15. Legend — a trophy cup with engraved band, handle highlights, base plate, and a shine streak
export const IconTrophy = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M15 7 H33 V21 C33 28 29 33 24 33 C19 33 15 28 15 21 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.2" />
    <path d="M15 12 H6 C6 21 11 24 16 23" stroke={color} strokeWidth="2" fill="none" />
    <path d="M33 12 H42 C42 21 37 24 32 23" stroke={color} strokeWidth="2" fill="none" />
    <line x1="16" y1="16" x2="32" y2="16" stroke="#1e1e30" strokeWidth="1.2" opacity="0.4" />
    <path d="M19 11 L21 19" stroke="#fff" strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
    <rect x="20" y="33" width="8" height="7" fill={color} opacity="0.6" />
    <rect x="13" y="40" width="22" height="4.5" rx="1.5" fill={color} opacity="0.9" stroke={color} strokeWidth="1" />
    <circle cx="24" cy="3" r="1.6" fill="#fff" opacity="0.7" />
  </Base>
);

// Maps level id -> icon component, for the Foundations section (1-15).
export const FOUNDATIONS_ICONS = {
  1: IconHomeRow, 2: IconClimber, 3: IconKeyboard, 4: IconHammer, 5: IconRocket,
  6: IconRhythm, 7: IconFlow, 8: IconTarget, 9: IconZone, 10: IconFire,
  11: IconGem, 12: IconWizard, 13: IconLightning, 14: IconDemon, 15: IconTrophy,
};

// ─── Precision & Flow section (levels 16-30) ────────────────────────────────

// 16. Word Sprint — a running figure mid-stride with motion trail lines
export const IconSprint = ({ size = 28, color = "#22c55e" }) => (
  <Base size={size}>
    <rect x="20" y="3" width="8" height="4" rx="1.5" fill={color} opacity="0.8" />
    <line x1="24" y1="9" x2="24" y2="6" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="26" r="16" fill={color} opacity="0.12" stroke={color} strokeWidth="2.2" />
    <line x1="24" y1="26" x2="24" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="26" x2="32" y2="26" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <circle cx="24" cy="26" r="2" fill={color} />
    <path d="M3 18 H12 M2 24 H10 M3 30 H12" stroke={color} strokeWidth="1.8" opacity="0.45" strokeLinecap="round" />
  </Base>
);

// 17. Tech Talk — a speech bubble with a circuit-chip pattern inside
export const IconLaptop = ({ size = 28, color = "#34d399" }) => (
  <Base size={size}>
    <path d="M8 10 H40 C42 10 43 11 43 13 V28 C43 30 42 31 40 31 H22 L14 39 V31 H8 C6 31 5 30 5 28 V13 C5 11 6 10 8 10 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <rect x="18" y="16" width="12" height="9" rx="1.5" fill={color} opacity="0.5" />
    <line x1="14" y1="18" x2="18" y2="18" stroke={color} strokeWidth="1.4" opacity="0.7" />
    <line x1="14" y1="23" x2="18" y2="23" stroke={color} strokeWidth="1.4" opacity="0.7" />
    <line x1="30" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.4" opacity="0.7" />
    <line x1="30" y1="23" x2="34" y2="23" stroke={color} strokeWidth="1.4" opacity="0.7" />
    <line x1="22" y1="12" x2="22" y2="16" stroke={color} strokeWidth="1.4" opacity="0.7" />
    <line x1="26" y1="25" x2="26" y2="29" stroke={color} strokeWidth="1.4" opacity="0.7" />
    <circle cx="24" cy="20.5" r="1.6" fill="#fff" opacity="0.85" />
  </Base>
);

// 18. Twist It — a tangled swirl/knot of ribbon representing a tongue twister
export const IconTwist = ({ size = 28, color = "#f472b6" }) => (
  <Base size={size}>
    <path d="M10 16 C10 8 38 8 38 18 C38 28 14 26 14 34 C14 40 30 42 34 36" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M10 16 C10 8 38 8 38 18 C38 28 14 26 14 34 C14 40 30 42 34 36" stroke="#fff" strokeWidth="0.8" opacity="0.4" fill="none" strokeLinecap="round" />
    <circle cx="10" cy="16" r="2" fill={color} />
    <circle cx="34" cy="36" r="2" fill={color} />
  </Base>
);

// 19. Quote Runner — an open book with visible quote marks and a bookmark ribbon
export const IconQuoteBook = ({ size = 28, color = "#818cf8" }) => (
  <Base size={size}>
    <path d="M24 12 C20 9 12 8 7 9 V36 C12 35 20 36 24 39 C28 36 36 35 41 36 V9 C36 8 28 9 24 12 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <line x1="24" y1="12" x2="24" y2="39" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <text x="14" y="24" fontSize="13" fill={color} opacity="0.85" fontFamily="Georgia,serif">&#8220;</text>
    <text x="29" y="29" fontSize="13" fill={color} opacity="0.85" fontFamily="Georgia,serif">&#8221;</text>
    <rect x="32" y="6" width="5" height="14" fill={color} opacity="0.7" />
  </Base>
);

// 20. Number Words — three stacked numeral blocks
export const IconNumbers = ({ size = 28, color = "#fb923c" }) => (
  <Base size={size}>
    <rect x="6" y="9" width="13" height="13" rx="2" fill={color} opacity="0.85" />
    <rect x="29" y="9" width="13" height="13" rx="2" fill={color} opacity="0.6" />
    <rect x="17.5" y="26" width="13" height="13" rx="2" fill={color} opacity="0.45" />
    <text x="12.5" y="19" textAnchor="middle" fill="#15151f" fontSize="10" fontWeight="bold">1</text>
    <text x="35.5" y="19" textAnchor="middle" fill="#15151f" fontSize="10" fontWeight="bold">2</text>
    <text x="24" y="36" textAnchor="middle" fill="#15151f" fontSize="10" fontWeight="bold">3</text>
  </Base>
);

// 21. Wild Words — an animal paw print with claw marks
export const IconFox = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <ellipse cx="24" cy="30" rx="13" ry="11" fill={color} opacity="0.85" />
    <ellipse cx="24" cy="30" rx="13" ry="11" stroke={color} strokeWidth="1" opacity="0.4" fill="none" />
    <ellipse cx="11" cy="16" rx="5" ry="6.5" fill={color} opacity="0.85" transform="rotate(-18 11 16)" />
    <ellipse cx="22" cy="9" rx="5" ry="6.5" fill={color} opacity="0.9" transform="rotate(-6 22 9)" />
    <ellipse cx="34" cy="10" rx="5" ry="6.5" fill={color} opacity="0.9" transform="rotate(8 34 10)" />
    <ellipse cx="42" cy="18" rx="4.6" ry="6" fill={color} opacity="0.85" transform="rotate(20 42 18)" />
    <circle cx="19" cy="27" r="1.4" fill="#1e1e30" opacity="0.4" />
    <circle cx="29" cy="27" r="1.4" fill="#1e1e30" opacity="0.4" />
  </Base>
);

// 22. Around the World — a compass rose inside a passport-stamp style ring
export const IconGlobe = ({ size = 28, color = "#2dd4bf" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="19" stroke={color} strokeWidth="1.2" opacity="0.3" fill="none" strokeDasharray="1 3" />
    <circle cx="24" cy="24" r="14" fill={color} opacity="0.1" stroke={color} strokeWidth="1.8" />
    <polygon points="24,8 27,21 24,24 21,21" fill={color} opacity="0.95" />
    <polygon points="24,40 27,27 24,24 21,27" fill={color} opacity="0.5" />
    <polygon points="8,24 21,21 24,24 21,27" fill={color} opacity="0.7" />
    <polygon points="40,24 27,21 24,24 27,27" fill={color} opacity="0.7" />
    <circle cx="24" cy="24" r="2" fill="#fff" opacity="0.85" />
    <text x="24" y="6" textAnchor="middle" fill={color} fontSize="6" opacity="0.7">N</text>
  </Base>
);

// 23. Science Lab — a flask with bubbling liquid and a rising vapor trail
export const IconFlask = ({ size = 28, color = "#38bdf8" }) => (
  <Base size={size}>
    <path d="M19 6 H29 V18 L36 36 C37 39 35 41 32 41 H16 C13 41 11 39 12 36 L19 18 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <line x1="17" y1="6" x2="31" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M15 30 H33 L32 36 C31.5 38 30 39 28 39 H20 C18 39 16.5 38 16 36 Z" fill={color} opacity="0.7" />
    <circle cx="22" cy="34" r="1.4" fill="#fff" opacity="0.7" />
    <circle cx="27" cy="32" r="1" fill="#fff" opacity="0.6" />
    <path d="M24 14 Q26 10 24 4" stroke={color} strokeWidth="1.2" opacity="0.4" fill="none" strokeLinecap="round" />
  </Base>
);

// 24. Music Words — a stylized musical note pair with staff lines behind
export const IconMusicNote = ({ size = 28, color = "#e879f9" }) => (
  <Base size={size}>
    <line x1="4" y1="14" x2="44" y2="14" stroke={color} strokeWidth="0.8" opacity="0.25" />
    <line x1="4" y1="20" x2="44" y2="20" stroke={color} strokeWidth="0.8" opacity="0.25" />
    <line x1="4" y1="26" x2="44" y2="26" stroke={color} strokeWidth="0.8" opacity="0.25" />
    <ellipse cx="15" cy="34" rx="5" ry="3.6" fill={color} opacity="0.9" transform="rotate(-15 15 34)" />
    <line x1="19.5" y1="32" x2="19.5" y2="9" stroke={color} strokeWidth="2" />
    <ellipse cx="31" cy="30" rx="5" ry="3.6" fill={color} opacity="0.9" transform="rotate(-15 31 30)" />
    <line x1="35.5" y1="28" x2="35.5" y2="6" stroke={color} strokeWidth="2" />
    <path d="M19.5 9 Q27 6 35.5 6" stroke={color} strokeWidth="2.4" fill="none" />
  </Base>
);

// 25. Food Run — a plate with fork and knife, and steam wisps
export const IconPlate = ({ size = 28, color = "#f97316" }) => (
  <Base size={size}>
    <circle cx="24" cy="26" r="15" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="26" r="8" stroke={color} strokeWidth="1.4" opacity="0.5" fill="none" />
    <path d="M20 10 Q22 6 20 2 M24 10 Q24 5 24 2 M28 10 Q26 6 28 2" stroke={color} strokeWidth="1.2" opacity="0.4" fill="none" strokeLinecap="round" />
    <path d="M11 30 V40 M11 30 C9 30 9 26 9 24 M11 30 C13 30 13 26 13 24" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M38 24 V40 M35 24 C35 27 38 27 38 30" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.8" />
  </Base>
);

// 26. Both Hands — two hands meeting/clasping above a horizontal divider
export const IconHands = ({ size = 28, color = "#84cc16" }) => (
  <Base size={size}>
    <path d="M8 26 L18 20 C20 19 22 20 22 22 C22 24 20 25 18 26 L24 24" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 26 L30 20 C28 19 26 20 26 22 C26 24 28 25 30 26 L24 24" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 30 L18 26 L24 28 L30 26 L42 30" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
    <circle cx="24" cy="24" r="2" fill={color} opacity="0.8" />
  </Base>
);

// 27. Long Words — a ruler/measuring tape stretched diagonally with tick marks
export const IconRuler = ({ size = 28, color = "#a78bfa" }) => (
  <Base size={size}>
    <rect x="4" y="20" width="40" height="8" rx="1.5" fill={color} opacity="0.18" stroke={color} strokeWidth="1.8" transform="rotate(-12 24 24)" />
    <g transform="rotate(-12 24 24)">
      <line x1="9" y1="20" x2="9" y2="25" stroke={color} strokeWidth="1.2" />
      <line x1="15" y1="20" x2="15" y2="23" stroke={color} strokeWidth="1" opacity="0.7" />
      <line x1="21" y1="20" x2="21" y2="25" stroke={color} strokeWidth="1.2" />
      <line x1="27" y1="20" x2="27" y2="23" stroke={color} strokeWidth="1" opacity="0.7" />
      <line x1="33" y1="20" x2="33" y2="25" stroke={color} strokeWidth="1.2" />
      <line x1="39" y1="20" x2="39" y2="23" stroke={color} strokeWidth="1" opacity="0.7" />
    </g>
  </Base>
);

// 28. Short Burst — a sharp speed dash/chevron trio with a spark at the tip
export const IconBurst = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <path d="M6 30 L20 30" stroke={color} strokeWidth="2.4" opacity="0.3" strokeLinecap="round" />
    <path d="M6 24 L24 24" stroke={color} strokeWidth="2.4" opacity="0.55" strokeLinecap="round" />
    <path d="M6 18 L28 18" stroke={color} strokeWidth="2.4" opacity="0.8" strokeLinecap="round" />
    <polygon points="28,8 44,18 28,28 33,18" fill={color} />
    <circle cx="39" cy="14" r="1.2" fill="#fff" opacity="0.7" />
  </Base>
);

// 29. Code Words — interlocking curly braces with a binary digit accent
export const IconTerminal = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <path d="M18 6 C13 6 12 9 12 13 V18 C12 21 11 22 7 22 C11 22 12 23 12 26 V31 C12 35 13 38 18 38" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M30 6 C35 6 36 9 36 13 V18 C36 21 37 22 41 22 C37 22 36 23 36 26 V31 C36 35 35 38 30 38" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
    <text x="24" y="26" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold" fontFamily="monospace" opacity="0.85">01</text>
  </Base>
);

// 30. Classic Lines — a quill pen resting on an open page with ink lines
export const IconQuill = ({ size = 28, color = "#c084fc" }) => (
  <Base size={size}>
    <path d="M8 32 H38" stroke={color} strokeWidth="1.4" opacity="0.4" />
    <path d="M12 36 H30 M12 39 H26" stroke={color} strokeWidth="1.2" opacity="0.3" />
    <path d="M14 32 C18 22 28 10 40 5 C36 16 26 28 18 33 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    <path d="M40 5 C37 9 33 13 29 16" stroke="#fff" strokeWidth="0.8" opacity="0.35" fill="none" />
    <path d="M14 32 L9 38" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Base>
);

// Maps level id -> icon component, for the Precision & Flow section (16-30).
export const PRECISION_FLOW_ICONS = {
  16: IconSprint, 17: IconLaptop, 18: IconTwist, 19: IconQuoteBook, 20: IconNumbers,
  21: IconFox, 22: IconGlobe, 23: IconFlask, 24: IconMusicNote, 25: IconPlate,
  26: IconHands, 27: IconRuler, 28: IconBurst, 29: IconTerminal, 30: IconQuill,
};

// ─── Word Power section (levels 31-45) ──────────────────────────────────────

// 31. Medical Terms — a stethoscope with chest piece and a small heartbeat line
export const IconStethoscope = ({ size = 28, color = "#34d399" }) => (
  <Base size={size}>
    <path d="M14 6 V18 C14 24 18 27 24 27 C30 27 34 24 34 18 V6" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="14" cy="5" r="2.4" fill={color} opacity="0.85" />
    <circle cx="34" cy="5" r="2.4" fill={color} opacity="0.85" />
    <path d="M24 27 V33" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="24" cy="39" r="6" fill={color} opacity="0.2" stroke={color} strokeWidth="2" />
    <path d="M19 39 L21 39 L23 35 L25 43 L27 39 L29 39" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.85" />
  </Base>
);

// 32. Sports Words — a trophy cup with a ball motif engraved on the front
export const IconSportsTrophy = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    <path d="M14 8 H34 V20 C34 27 30 32 24 32 C18 32 14 27 14 20 Z" fill={color} opacity="0.7" stroke={color} strokeWidth="1.4" />
    <circle cx="24" cy="18" r="6" fill="none" stroke="#1e1e30" strokeWidth="1.2" opacity="0.5" />
    <path d="M19 15 L29 15 M21 23 L27 23 M19 19 L29 19" stroke="#1e1e30" strokeWidth="0.8" opacity="0.4" />
    <path d="M14 13 H7 C7 21 11 23 15 22" stroke={color} strokeWidth="1.8" fill="none" />
    <path d="M34 13 H41 C41 21 37 23 33 22" stroke={color} strokeWidth="1.8" fill="none" />
    <rect x="20" y="32" width="8" height="6" fill={color} opacity="0.5" />
    <rect x="14" y="38" width="20" height="4" rx="1.5" fill={color} opacity="0.85" />
  </Base>
);

// 33. Nature Words — a leaf with a detailed central vein and side ribs
export const IconLeaf = ({ size = 28, color = "#86efac" }) => (
  <Base size={size}>
    <path d="M24 6 C36 10 40 24 32 36 C26 44 16 42 12 34 C6 22 12 10 24 6 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.2" />
    <path d="M24 9 V38" stroke="#1e1e30" strokeWidth="1.2" opacity="0.35" />
    <path d="M24 16 L16 20 M24 22 L15 27 M24 28 L18 34" stroke="#1e1e30" strokeWidth="1" opacity="0.3" fill="none" />
    <path d="M24 16 L31 19 M24 22 L32 26" stroke="#1e1e30" strokeWidth="1" opacity="0.3" fill="none" />
    <circle cx="11" cy="33" r="1.4" fill="#fff" opacity="0.5" />
  </Base>
);

// 34. Business Words — a briefcase with a handle, latch, and a subtle chart line on the side panel
export const IconBriefcase = ({ size = 28, color = "#94a3b8" }) => (
  <Base size={size}>
    <path d="M19 12 V8 C19 6 20 5 22 5 H26 C28 5 29 6 29 8 V12" stroke={color} strokeWidth="2" fill="none" />
    <rect x="6" y="12" width="36" height="26" rx="3" fill={color} opacity="0.16" stroke={color} strokeWidth="2" />
    <rect x="20" y="20" width="8" height="6" rx="1.2" fill={color} opacity="0.7" />
    <path d="M10 24 L16 19 L22 23 L30 16" stroke={color} strokeWidth="1.4" opacity="0.5" fill="none" strokeLinecap="round" />
    <line x1="6" y1="24" x2="42" y2="24" stroke={color} strokeWidth="1.2" opacity="0.3" />
  </Base>
);

// 35. Mythology — a Greek temple facade with fluted columns and a triangular pediment
export const IconTemple = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <polygon points="24,5 41,18 7,18" fill={color} opacity="0.85" />
    <rect x="6" y="18" width="36" height="3" fill={color} opacity="0.6" />
    <rect x="9" y="22" width="3.5" height="14" fill={color} opacity="0.75" />
    <rect x="16" y="22" width="3.5" height="14" fill={color} opacity="0.75" />
    <rect x="22.3" y="22" width="3.5" height="14" fill={color} opacity="0.75" />
    <rect x="28.5" y="22" width="3.5" height="14" fill={color} opacity="0.75" />
    <rect x="35" y="22" width="3.5" height="14" fill={color} opacity="0.75" />
    <rect x="6" y="36" width="36" height="3.5" rx="1" fill={color} opacity="0.9" />
  </Base>
);

// 36. Alliterations — three letter blocks sharing the same initial letter, slightly fanned
export const IconAlliteration = ({ size = 28, color = "#f472b6" }) => (
  <Base size={size}>
    <rect x="6" y="16" width="14" height="16" rx="2.5" fill={color} opacity="0.5" transform="rotate(-8 13 24)" />
    <rect x="17" y="14" width="14" height="16" rx="2.5" fill={color} opacity="0.75" />
    <rect x="28" y="16" width="14" height="16" rx="2.5" fill={color} opacity="0.5" transform="rotate(8 35 24)" />
    <text x="24" y="26" textAnchor="middle" fill="#15151f" fontSize="13" fontWeight="bold" fontFamily="Georgia,serif">P</text>
  </Base>
);

// 37. Rhyming Words — a microphone with rising sound-rhyme rings
export const IconMic = ({ size = 28, color = "#fb923c" }) => (
  <Base size={size}>
    <rect x="18" y="6" width="12" height="20" rx="6" fill={color} opacity="0.85" stroke={color} strokeWidth="1.2" />
    <line x1="20" y1="12" x2="26" y2="12" stroke="#1e1e30" strokeWidth="1" opacity="0.3" />
    <line x1="20" y1="17" x2="26" y2="17" stroke="#1e1e30" strokeWidth="1" opacity="0.3" />
    <path d="M11 22 C11 30 16 35 24 35 C32 35 37 30 37 22" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="24" y1="35" x2="24" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="17" y1="42" x2="31" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M32 10 Q38 14 32 18" stroke={color} strokeWidth="1.2" opacity="0.4" fill="none" />
  </Base>
);

// 38. Power Phrases — a flexed bicep/arm silhouette with a small strength burst
export const IconFlex = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M10 30 C8 22 12 14 19 12 C24 11 28 13 29 17 C32 16 36 18 36 23 C36 28 33 30 30 30 L30 38 C30 40 28 42 25 42 H17 C13 42 10 39 10 35 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1" />
    <path d="M19 12 C23 18 22 26 17 30" stroke="#1e1e30" strokeWidth="1.2" opacity="0.3" fill="none" />
    <circle cx="29" cy="19" r="1.2" fill="#fff" opacity="0.6" />
  </Base>
);

// 39. World Capitals — a map pin dropped onto a folded paper map
export const IconMapPin = ({ size = 28, color = "#38bdf8" }) => (
  <Base size={size}>
    <path d="M6 14 L18 9 L30 14 L42 9 V34 L30 39 L18 34 L6 39 Z" fill={color} opacity="0.12" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="18" y1="9" x2="18" y2="34" stroke={color} strokeWidth="1" opacity="0.3" />
    <line x1="30" y1="14" x2="30" y2="39" stroke={color} strokeWidth="1" opacity="0.3" />
    <path d="M24 12 C18 12 14 16 14 21 C14 28 24 38 24 38 C24 38 34 28 34 21 C34 16 30 12 24 12 Z" fill={color} stroke="#15151f" strokeWidth="1" />
    <circle cx="24" cy="21" r="3.2" fill="#15151f" opacity="0.7" />
  </Base>
);

// 40. Tech Terms — a gear cog with circuit traces radiating from the center
export const IconGear = ({ size = 28, color = "#818cf8" }) => (
  <Base size={size}>
    <path d="M24 6 L27 6 L28 11 L32 13 L37 10 L40 13 L37 18 L39 22 L44 23 L44 27 L39 28 L37 32 L40 37 L37 40 L32 37 L28 39 L27 44 L24 44 L23 39 L19 37 L14 40 L11 37 L14 32 L12 28 L7 27 L7 23 L12 22 L14 18 L11 13 L14 10 L19 13 L23 11 Z" fill={color} opacity="0.75" />
    <circle cx="24" cy="25" r="8" fill="#15151f" opacity="0.6" />
    <circle cx="24" cy="25" r="3" fill={color} />
    <line x1="24" y1="17" x2="24" y2="21" stroke={color} strokeWidth="1.2" opacity="0.7" />
    <line x1="24" y1="29" x2="24" y2="33" stroke={color} strokeWidth="1.2" opacity="0.7" />
  </Base>
);

// 41. Homophones — an ear with sound ripple waves, suggesting words that sound alike
export const IconEar = ({ size = 28, color = "#a3e635" }) => (
  <Base size={size}>
    <path d="M20 8 C12 8 8 16 9 24 C10 30 14 32 16 38 C17 41 20 42 22 40 C24 38 22 36 20 34 C17 31 16 27 18 23 C19 21 22 21 23 23 C24 25 23 27 21 27" fill={color} opacity="0.85" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M27 14 Q33 19 27 26" stroke={color} strokeWidth="1.4" opacity="0.5" fill="none" strokeLinecap="round" />
    <path d="M32 10 Q41 19 32 30" stroke={color} strokeWidth="1.4" opacity="0.3" fill="none" strokeLinecap="round" />
  </Base>
);

// 42. Compound Words — two interlocking puzzle pieces joining together
export const IconPuzzle = ({ size = 28, color = "#e2e8f0" }) => (
  <Base size={size}>
    <path d="M6 12 H20 V18 C22 16 26 16 26 19 C26 22 22 22 20 20 V30 H6 V20 C4 22 0 22 0 19 C0 16 4 16 6 18 Z" fill={color} opacity="0.4" stroke={color} strokeWidth="1.4" transform="translate(2,2)" />
    <path d="M22 12 H36 V18 C38 16 42 16 42 19 C42 22 38 22 36 20 V30 H22 V20 C20 22 16 22 16 19 C16 16 20 16 22 18 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.4" transform="translate(2,8)" />
  </Base>
);

// 43. Adverbs — a magic wand with a sparkle trail, suggesting a word that modifies/enhances
export const IconWand = ({ size = 28, color = "#67e8f9" }) => (
  <Base size={size}>
    <line x1="14" y1="38" x2="34" y2="10" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    <line x1="14" y1="38" x2="34" y2="10" stroke="#fff" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
    <polygon points="36,4 38,9 43,11 38,13 36,18 34,13 29,11 34,9" fill={color} opacity="0.95" />
    <circle cx="22" cy="26" r="1.4" fill={color} opacity="0.7" />
    <circle cx="17" cy="33" r="1" fill={color} opacity="0.5" />
  </Base>
);

// 44. Prefixes — a stack of blocks with a small "+" tile attached to the front, suggesting an added prefix
export const IconPrefixBlocks = ({ size = 28, color = "#c4b5fd" }) => (
  <Base size={size}>
    <rect x="14" y="26" width="28" height="11" rx="2" fill={color} opacity="0.4" />
    <rect x="14" y="13" width="28" height="11" rx="2" fill={color} opacity="0.85" />
    <rect x="4" y="13" width="9" height="11" rx="2" fill={color} stroke="#15151f" strokeWidth="1" />
    <line x1="6.5" y1="18.5" x2="10.5" y2="18.5" stroke="#15151f" strokeWidth="1.4" />
    <line x1="8.5" y1="16.5" x2="8.5" y2="20.5" stroke="#15151f" strokeWidth="1.4" />
  </Base>
);

// 45. Descriptive Words — a paintbrush dragging a stroke of color with paint droplets
export const IconPaintbrush = ({ size = 28, color = "#fde68a" }) => (
  <Base size={size}>
    <path d="M8 36 C14 30 20 24 26 18" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.4" />
    <path d="M26 18 L33 9 C35 7 38 7 39 9 C40 11 39 13 37 15 L29 23 Z" fill={color} opacity="0.9" stroke={color} strokeWidth="1" />
    <circle cx="10" cy="34" r="2" fill={color} opacity="0.6" />
    <circle cx="14" cy="39" r="1.3" fill={color} opacity="0.45" />
  </Base>
);

// Maps level id -> icon component, for the Word Power section (31-45).
export const WORD_POWER_ICONS = {
  31: IconStethoscope, 32: IconSportsTrophy, 33: IconLeaf, 34: IconBriefcase, 35: IconTemple,
  36: IconAlliteration, 37: IconMic, 38: IconFlex, 39: IconMapPin, 40: IconGear,
  41: IconEar, 42: IconPuzzle, 43: IconWand, 44: IconPrefixBlocks, 45: IconPaintbrush,
};

// ─── Keyboard Mastery section (levels 46-60) ────────────────────────────────

// 46. Hard Spellings — a bee with striped body and folded wings, spelling-bee themed
export const IconBee = ({ size = 28, color = "#fcd34d" }) => (
  <Base size={size}>
    <ellipse cx="24" cy="26" rx="9" ry="11" fill={color} opacity="0.9" />
    <path d="M17 19 H31 M16 25 H32 M17 31 H31" stroke="#1e1e30" strokeWidth="2.4" opacity="0.6" />
    <ellipse cx="16" cy="18" rx="6" ry="8" fill="#fff" opacity="0.3" transform="rotate(-25 16 18)" />
    <ellipse cx="32" cy="18" rx="6" ry="8" fill="#fff" opacity="0.3" transform="rotate(25 32 18)" />
    <circle cx="24" cy="13" r="4" fill={color} />
    <path d="M21 10 L19 5 M27 10 L29 5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </Base>
);

// 47. Famous Names — a laurel wreath encircling a small carved bust silhouette
export const IconLaurel = ({ size = 28, color = "#d97706" }) => (
  <Base size={size}>
    <path d="M10 36 C6 28 6 16 14 8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M10 32 L5 30 M9 26 L4 25 M10 20 L6 18 M12 14 L8 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    <path d="M38 36 C42 28 42 16 34 8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M38 32 L43 30 M39 26 L44 25 M38 20 L42 18 M36 14 L40 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    <path d="M19 18 C19 14 28 14 28 18 C28 22 26 24 24 26 C22 24 19 22 19 18 Z" fill={color} opacity="0.85" />
    <rect x="20" y="26" width="8" height="12" rx="2" fill={color} opacity="0.6" />
  </Base>
);

// 48. Tricky Words — a tangled thread knot, with one strand pulled taut
export const IconKnot = ({ size = 28, color = "#4ade80" }) => (
  <Base size={size}>
    <path d="M8 18 C8 12 16 12 18 18 C20 24 28 24 30 18 C32 12 40 12 40 18 C40 26 30 26 26 30 C22 34 12 32 14 26 C15 22 19 22 18 26" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="8" cy="18" r="2" fill={color} />
    <circle cx="18" cy="26" r="2" fill={color} opacity="0.7" />
  </Base>
);

// 49. Keyboard Rows — a single highlighted keyboard row strip with raised keys
export const IconKeyRow = ({ size = 28, color = "#818cf8" }) => (
  <Base size={size}>
    <rect x="4" y="20" width="40" height="10" rx="2.5" fill={color} opacity="0.14" stroke={color} strokeWidth="1.8" />
    <rect x="7" y="22" width="5" height="6" rx="1.2" fill={color} opacity="0.85" />
    <rect x="14" y="22" width="5" height="6" rx="1.2" fill={color} opacity="0.7" />
    <rect x="21" y="22" width="5" height="6" rx="1.2" fill={color} opacity="0.85" />
    <rect x="28" y="22" width="5" height="6" rx="1.2" fill={color} opacity="0.7" />
    <rect x="35" y="22" width="5" height="6" rx="1.2" fill={color} opacity="0.85" />
    <path d="M10 12 H38" stroke={color} strokeWidth="1.2" opacity="0.25" strokeDasharray="2 3" />
    <path d="M10 38 H38" stroke={color} strokeWidth="1.2" opacity="0.25" strokeDasharray="2 3" />
  </Base>
);

// 50. Left Side — a half-keyboard panel with three key columns, anchored left, with a leftward arrow
export const IconLeftHand = ({ size = 28, color = "#f87171" }) => (
  <Base size={size}>
    <rect x="6" y="14" width="24" height="22" rx="3" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <rect x="9" y="18" width="5" height="5" rx="1" fill={color} opacity="0.85" />
    <rect x="16" y="18" width="5" height="5" rx="1" fill={color} opacity="0.65" />
    <rect x="23" y="18" width="5" height="5" rx="1" fill={color} opacity="0.85" />
    <rect x="9" y="25" width="5" height="5" rx="1" fill={color} opacity="0.65" />
    <rect x="16" y="25" width="5" height="5" rx="1" fill={color} opacity="0.85" />
    <rect x="23" y="25" width="5" height="5" rx="1" fill={color} opacity="0.65" />
    <path d="M40 25 H32 M36 21 L32 25 L36 29" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Base>
);

// 51. Right Side — a half-keyboard panel anchored right, with a rightward arrow, distinct dot-grid fill
export const IconRightHand = ({ size = 28, color = "#fb923c" }) => (
  <Base size={size}>
    <rect x="18" y="14" width="24" height="22" rx="3" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="23" cy="20.5" r="2.2" fill={color} opacity="0.85" />
    <circle cx="30" cy="20.5" r="2.2" fill={color} opacity="0.65" />
    <circle cx="37" cy="20.5" r="2.2" fill={color} opacity="0.85" />
    <circle cx="23" cy="27.5" r="2.2" fill={color} opacity="0.65" />
    <circle cx="30" cy="27.5" r="2.2" fill={color} opacity="0.85" />
    <circle cx="37" cy="27.5" r="2.2" fill={color} opacity="0.65" />
    <path d="M8 25 H16 M12 21 L16 25 L12 29" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Base>
);

// 52. Full Sentences — a checkered finish-line flag on a pole
export const IconFinishFlag = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <line x1="10" y1="6" x2="10" y2="42" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M10 8 H34 V24 H10 Z" fill="#fff" opacity="0.9" />
    <rect x="10" y="8" width="6" height="4" fill={color} /><rect x="22" y="8" width="6" height="4" fill={color} />
    <rect x="16" y="12" width="6" height="4" fill={color} /><rect x="28" y="12" width="6" height="4" fill={color} />
    <rect x="10" y="16" width="6" height="4" fill={color} /><rect x="22" y="16" width="6" height="4" fill={color} />
    <rect x="16" y="20" width="6" height="4" fill={color} /><rect x="28" y="20" width="6" height="4" fill={color} />
  </Base>
);

// 53. Philosophy — a head profile in thought, with a lightbulb-idea above
export const IconThinker = ({ size = 28, color = "#a78bfa" }) => (
  <Base size={size}>
    <path d="M16 26 C13 22 13 14 19 10 C25 6 33 9 34 16 C35 20 33 22 33 26 V32 C33 35 31 37 28 37 H20 C18 37 17 35 17 33 V28 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    <path d="M19 10 C16 12 14 16 16 20" stroke="#1e1e30" strokeWidth="1.2" opacity="0.3" fill="none" />
    <circle cx="29" cy="6" r="4" fill="#fde047" opacity="0.85" />
    <line x1="29" y1="1" x2="29" y2="-1" stroke="#fde047" strokeWidth="1.2" opacity="0.6" />
    <line x1="34" y1="6" x2="36" y2="6" stroke="#fde047" strokeWidth="1.2" opacity="0.6" />
  </Base>
);

// 54. Shortcut Words — two overlapping keys suggesting a key combination shortcut
export const IconCmdKey = ({ size = 28, color = "#38bdf8" }) => (
  <Base size={size}>
    <rect x="6" y="14" width="20" height="20" rx="4" fill={color} opacity="0.45" stroke={color} strokeWidth="1.6" />
    <rect x="22" y="10" width="20" height="20" rx="4" fill={color} opacity="0.9" stroke={color} strokeWidth="1.6" />
    <line x1="27" y1="16" x2="33" y2="16" stroke="#15151f" strokeWidth="1.4" opacity="0.35" />
    <text x="32" y="25" textAnchor="middle" fill="#15151f" fontSize="10" fontWeight="bold" opacity="0.6">+</text>
  </Base>
);

// 55. World Languages — three speech bubbles of varying shapes overlapping, suggesting many tongues
export const IconLangBubbles = ({ size = 28, color = "#e879f9" }) => (
  <Base size={size}>
    <ellipse cx="16" cy="18" rx="11" ry="8" fill={color} opacity="0.4" />
    <path d="M11 24 L9 30 L16 25" fill={color} opacity="0.4" />
    <rect x="22" y="14" width="20" height="14" rx="3" fill={color} opacity="0.85" />
    <path d="M28 28 L26 34 L34 28" fill={color} opacity="0.85" />
    <circle cx="28" cy="21" r="1.4" fill="#15151f" opacity="0.5" />
    <circle cx="33" cy="21" r="1.4" fill="#15151f" opacity="0.5" />
    <circle cx="38" cy="21" r="1.4" fill="#15151f" opacity="0.5" />
  </Base>
);

// 56. Long Phrases — a horizontally stretched arrow with extension tick marks
export const IconStretchArrow = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <line x1="4" y1="24" x2="38" y2="24" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M32 17 L40 24 L32 31" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="18" x2="8" y2="30" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <line x1="16" y1="20" x2="16" y2="28" stroke={color} strokeWidth="1.2" opacity="0.4" />
    <line x1="24" y1="20" x2="24" y2="28" stroke={color} strokeWidth="1.2" opacity="0.4" />
  </Base>
);

// 57. Hard Clusters — three interlocked rings, suggesting tangled consonant clusters
export const IconLinkedRings = ({ size = 28, color = "#94a3b8" }) => (
  <Base size={size}>
    <circle cx="17" cy="20" r="8" stroke={color} strokeWidth="2.6" fill="none" opacity="0.85" />
    <circle cx="31" cy="20" r="8" stroke={color} strokeWidth="2.6" fill="none" opacity="0.65" />
    <circle cx="24" cy="31" r="8" stroke={color} strokeWidth="2.6" fill="none" opacity="0.45" />
  </Base>
);

// 58. Common Words — a small stack of everyday index/flash cards, slightly fanned
export const IconCards = ({ size = 28, color = "#22c55e" }) => (
  <Base size={size}>
    <rect x="9" y="14" width="26" height="18" rx="2.5" fill={color} opacity="0.3" transform="rotate(-6 22 23)" />
    <rect x="11" y="12" width="26" height="18" rx="2.5" fill={color} opacity="0.55" transform="rotate(3 24 21)" />
    <rect x="10" y="13" width="28" height="20" rx="2.5" fill={color} opacity="0.9" stroke={color} strokeWidth="1" />
    <line x1="15" y1="20" x2="33" y2="20" stroke="#15151f" strokeWidth="1.4" opacity="0.4" />
    <line x1="15" y1="25" x2="27" y2="25" stroke="#15151f" strokeWidth="1.4" opacity="0.3" />
  </Base>
);

// 59. Emotion Words — a heart with a heartbeat/pulse line crossing through it
export const IconHeartPulse = ({ size = 28, color = "#fb7185" }) => (
  <Base size={size}>
    <path d="M24 38 C12 30 6 22 6 15 C6 9 11 5 16 5 C20 5 23 8 24 11 C25 8 28 5 32 5 C37 5 42 9 42 15 C42 22 36 30 24 38 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1" />
    <path d="M9 19 H17 L20 13 L25 25 L28 19 H39" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  </Base>
);

// 60. Very Long Words — an expanding accordion bracket with stretch arrows on both ends
export const IconExpand = ({ size = 28, color = "#c084fc" }) => (
  <Base size={size}>
    <path d="M10 14 V34" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M38 14 V34" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M14 24 H34" stroke={color} strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
    <path d="M16 18 L10 24 L16 30" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 18 L38 24 L32 30" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Base>
);

// Maps level id -> icon component, for the Keyboard Mastery section (46-60).
export const KEYBOARD_MASTERY_ICONS = {
  46: IconBee, 47: IconLaurel, 48: IconKnot, 49: IconKeyRow, 50: IconLeftHand,
  51: IconRightHand, 52: IconFinishFlag, 53: IconThinker, 54: IconCmdKey, 55: IconLangBubbles,
  56: IconStretchArrow, 57: IconLinkedRings, 58: IconCards, 59: IconHeartPulse, 60: IconExpand,
};

// A custom-drawn 5-point star used for level star ratings, replacing the emoji star.
// `filled` controls solid vs. hollow outline rendering.
export const IconStar = ({ size = 14, color = "#facc15", filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path
      d="M12 2.5 L14.9 9.1 L22.1 9.8 L16.7 14.6 L18.3 21.7 L12 17.9 L5.7 21.7 L7.3 14.6 L1.9 9.8 L9.1 9.1 Z"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={filled ? 0 : 1.6}
      strokeLinejoin="round"
      opacity={filled ? 0.95 : 0.5}
    />
  </svg>
);

// ─── Speed Surge section (levels 61-75) ─────────────────────────────────────

// 61. Short Word Rush — a runner mid-stride with motion lines streaking behind,
//     feet leaving speed-blur dashes, arms pumping, conveying explosive short bursts
export const IconBoltCluster = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    {/* motion streak lines */}
    <path d="M4 20 H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.3" />
    <path d="M4 24 H11" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.22" />
    <path d="M4 28 H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.3" />
    {/* body */}
    <circle cx="28" cy="11" r="4" fill={color} opacity="0.9" />
    <path d="M28 15 L26 24 L21 32" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <path d="M26 24 L32 30" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.9" />
    {/* arms */}
    <path d="M27 18 L20 22" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75" />
    <path d="M27 18 L34 15" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75" />
    {/* speed dashes under feet */}
    <path d="M18 34 L23 34" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    <path d="M29 32 L34 32" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    {/* forward bolt */}
    <polygon points="38,19 34,27 37,26 34,35 42,25 39,26" fill={color} opacity="0.85" />
  </Base>
);

// 62. Fast Patterns — a DNA-like double helix of repeating letter shapes,
//     suggesting rhythmic pattern memory burned into muscle
export const IconSinePattern = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    {/* back strand */}
    <path d="M8 38 C12 32 20 28 24 24 C28 20 36 16 40 10"
      stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
    {/* front strand */}
    <path d="M8 10 C12 16 20 20 24 24 C28 28 36 32 40 38"
      stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9" />
    {/* rungs connecting the strands */}
    <line x1="11" y1="13" x2="11" y2="35" stroke={color} strokeWidth="1.4" opacity="0.35" />
    <line x1="17" y1="18" x2="17" y2="30" stroke={color} strokeWidth="1.4" opacity="0.35" />
    <line x1="24" y1="20" x2="24" y2="28" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <line x1="31" y1="18" x2="31" y2="30" stroke={color} strokeWidth="1.4" opacity="0.35" />
    <line x1="37" y1="13" x2="37" y2="35" stroke={color} strokeWidth="1.4" opacity="0.35" />
    {/* node dots on front strand */}
    <circle cx="11" cy="13" r="2.2" fill={color} opacity="0.85" />
    <circle cx="17" cy="18" r="2.2" fill={color} opacity="0.85" />
    <circle cx="24" cy="24" r="2.8" fill={color} opacity="1" />
    <circle cx="31" cy="30" r="2.2" fill={color} opacity="0.85" />
    <circle cx="37" cy="35" r="2.2" fill={color} opacity="0.85" />
  </Base>
);

// 63. Dev Commands — a terminal window with scan-line texture, a blinking
//     block cursor, and three lines of code at different widths
export const IconTerminalPrompt = ({ size = 28, color = "#4ade80" }) => (
  <Base size={size}>
    {/* window body */}
    <rect x="5" y="8" width="38" height="32" rx="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.8" opacity="0.75" />
    {/* title bar */}
    <rect x="5" y="8" width="38" height="7" rx="4" fill={color} opacity="0.2" />
    <circle cx="11" cy="11.5" r="1.5" fill={color} opacity="0.5" />
    <circle cx="16" cy="11.5" r="1.5" fill={color} opacity="0.35" />
    <circle cx="21" cy="11.5" r="1.5" fill={color} opacity="0.2" />
    {/* prompt arrow */}
    <path d="M10 21 L14 24 L10 27" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    {/* code lines */}
    <rect x="17" y="22" width="14" height="2.2" rx="1" fill={color} opacity="0.75" />
    <rect x="10" y="29" width="20" height="2.2" rx="1" fill={color} opacity="0.45" />
    <rect x="10" y="34" width="11" height="2.2" rx="1" fill={color} opacity="0.3" />
    {/* blinking cursor block */}
    <rect x="32" y="29" width="4" height="2.2" rx="0.5" fill={color} opacity="0.9" />
  </Base>
);

// 64. Long Quotes — an open book with a large speech bubble rising from it,
//     containing an ellipsis — quotes coming alive off the page
export const IconQuoteMarks = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    {/* book base */}
    <path d="M6 34 L6 16 Q6 14 8 14 L22 14 L22 36 L8 36 Q6 36 6 34 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="1.6" />
    <path d="M22 14 L38 14 Q40 14 40 16 L40 34 Q40 36 38 36 L22 36 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.6" />
    {/* spine line */}
    <line x1="22" y1="14" x2="22" y2="36" stroke={color} strokeWidth="2" opacity="0.6" />
    {/* page lines */}
    <line x1="10" y1="20" x2="19" y2="20" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <line x1="10" y1="24" x2="19" y2="24" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <line x1="10" y1="28" x2="15" y2="28" stroke={color} strokeWidth="1.4" opacity="0.35" />
    {/* speech bubble */}
    <path d="M26 6 Q26 3 29 3 L38 3 Q41 3 41 6 L41 12 Q41 15 38 15 L32 15 L30 18 L29 15 L29 15 Q26 15 26 12 Z"
      fill={color} opacity="0.9" />
    {/* ellipsis in bubble */}
    <circle cx="30" cy="9" r="1.5" fill="#15151f" opacity="0.85" />
    <circle cx="33.5" cy="9" r="1.5" fill="#15151f" opacity="0.85" />
    <circle cx="37" cy="9" r="1.5" fill="#15151f" opacity="0.85" />
  </Base>
);

// 65. Grand Master — a tiered crown with five pointed peaks, gem inlays on each
//     peak, a jeweled band, and a subtle glow ring beneath — regal and earned
export const IconCrown = ({ size = 28, color = "#dc2626" }) => (
  <Base size={size}>
    {/* glow base ring */}
    <ellipse cx="24" cy="36" rx="14" ry="3" fill={color} opacity="0.18" />
    {/* crown body */}
    <path d="M9 35 L9 22 L15 30 L24 10 L33 30 L39 22 L39 35 Z"
      fill={color} opacity="0.85" strokeLinejoin="round" />
    {/* inner shadow on crown body */}
    <path d="M12 35 L12 26 L17 31 L24 16 L31 31 L36 26 L36 35 Z"
      fill={color} opacity="0.25" />
    {/* band across bottom */}
    <rect x="9" y="32" width="30" height="5" rx="2" fill={color} opacity="0.7" />
    {/* band highlight line */}
    <rect x="9" y="32" width="30" height="1.5" rx="1" fill="#fff" opacity="0.15" />
    {/* peak gems */}
    <circle cx="24" cy="13" r="3" fill="#fff" opacity="0.8" />
    <circle cx="24" cy="13" r="1.5" fill={color} opacity="0.6" />
    <circle cx="12" cy="24" r="2.2" fill="#fff" opacity="0.65" />
    <circle cx="36" cy="24" r="2.2" fill="#fff" opacity="0.65" />
    {/* band studs */}
    <circle cx="16" cy="34.5" r="1.2" fill="#fff" opacity="0.5" />
    <circle cx="24" cy="34.5" r="1.2" fill="#fff" opacity="0.5" />
    <circle cx="32" cy="34.5" r="1.2" fill="#fff" opacity="0.5" />
  </Base>
);

// 66. Word Flow — water flowing through a channel with ripple rings expanding
//     outward, suggesting words moving effortlessly in a current
export const IconFlowRibbon = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    {/* channel walls */}
    <path d="M5 16 Q12 10 24 14 Q36 18 43 14" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
    <path d="M5 32 Q12 38 24 34 Q36 30 43 34" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
    {/* main flow stream */}
    <path d="M5 24 Q12 18 24 22 Q36 26 43 20"
      stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.9" />
    {/* ripple rings at center */}
    <ellipse cx="24" cy="22" rx="5" ry="2.5" fill="none" stroke={color} strokeWidth="1.4" opacity="0.55" />
    <ellipse cx="24" cy="22" rx="9" ry="4" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
    <ellipse cx="24" cy="22" rx="13" ry="5.5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.15" />
    {/* flow arrows */}
    <path d="M30 20 L35 22 L30 24" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    <path d="M14 22 L19 24 L14 26" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
  </Base>
);

// 67. Smooth Operator — a vinyl record with a stylus arm resting on it and
//     concentric groove rings, music notes floating off — smooth and cool
export const IconSax = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    {/* record body */}
    <circle cx="22" cy="26" r="16" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.8" opacity="0.7" />
    {/* groove rings */}
    <circle cx="22" cy="26" r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
    <circle cx="22" cy="26" r="8" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
    {/* label in center */}
    <circle cx="22" cy="26" r="4.5" fill={color} opacity="0.7" />
    <circle cx="22" cy="26" r="1.5" fill="#15151f" opacity="0.8" />
    {/* tonearm */}
    <path d="M36 8 L30 16 L26 22" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
    <circle cx="36" cy="8" r="3" fill="none" stroke={color} strokeWidth="1.8" opacity="0.7" />
    {/* stylus tip */}
    <circle cx="26" cy="22" r="1.8" fill={color} opacity="0.9" />
    {/* music notes */}
    <path d="M37 18 L40 15 L40 20" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
    <circle cx="37" cy="20" r="1.5" fill={color} opacity="0.6" />
    <path d="M40 13 L43 10 L43 15" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.4" />
    <circle cx="40" cy="15" r="1.2" fill={color} opacity="0.4" />
  </Base>
);

// 68. Key Climber — a mountaineer's pick axe driven into a cliff face with
//     height markers on the rock wall and a flag planted at the summit
export const IconStaircase = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    {/* cliff face */}
    <path d="M12 40 L12 10 Q12 8 14 8 L30 8" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    {/* height tick marks on cliff */}
    <line x1="12" y1="15" x2="16" y2="15" stroke={color} strokeWidth="1.4" opacity="0.4" />
    <line x1="12" y1="22" x2="16" y2="22" stroke={color} strokeWidth="1.4" opacity="0.4" />
    <line x1="12" y1="29" x2="16" y2="29" stroke={color} strokeWidth="1.4" opacity="0.4" />
    <line x1="12" y1="36" x2="16" y2="36" stroke={color} strokeWidth="1.4" opacity="0.4" />
    {/* pick axe handle */}
    <path d="M30 32 L18 16" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
    {/* pick axe head */}
    <path d="M14 12 L22 18 L18 22 Z" fill={color} opacity="0.9" />
    <path d="M14 12 L10 16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    {/* summit flag */}
    <line x1="30" y1="8" x2="30" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    <path d="M30 8 L39 11 L30 14 Z" fill={color} opacity="0.85" />
    {/* climber figure at pick end */}
    <circle cx="32" cy="30" r="3" fill={color} opacity="0.7" />
    <path d="M32 33 L32 40" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 69. Word Weaver — a loom with warp threads running vertically and two weft
//     threads crossing through them in alternating over-under weave rows
export const IconWeave = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    {/* loom frame top and bottom bars */}
    <rect x="7" y="8" width="34" height="4" rx="2" fill={color} opacity="0.6" />
    <rect x="7" y="36" width="34" height="4" rx="2" fill={color} opacity="0.6" />
    {/* vertical warp threads */}
    <line x1="13" y1="12" x2="13" y2="36" stroke={color} strokeWidth="1.4" opacity="0.3" />
    <line x1="19" y1="12" x2="19" y2="36" stroke={color} strokeWidth="1.4" opacity="0.3" />
    <line x1="25" y1="12" x2="25" y2="36" stroke={color} strokeWidth="1.4" opacity="0.3" />
    <line x1="31" y1="12" x2="31" y2="36" stroke={color} strokeWidth="1.4" opacity="0.3" />
    <line x1="37" y1="12" x2="37" y2="36" stroke={color} strokeWidth="1.4" opacity="0.3" />
    {/* weft thread row 1 — weaves over/under alternate warps */}
    <path d="M7 19 Q10 16 13 19 Q16 22 19 19 Q22 16 25 19 Q28 22 31 19 Q34 16 37 19 Q40 22 43 19"
      stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.9" />
    {/* weft thread row 2 — opposite phase */}
    <path d="M7 27 Q10 30 13 27 Q16 24 19 27 Q22 30 25 27 Q28 24 31 27 Q34 30 37 27 Q40 24 43 27"
      stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.65" />
  </Base>
);

// 70. Steady Stream — a faucet tap viewed from the side with a thick consistent
//     water stream falling from it and small splash rings at the bottom
export const IconDrops = ({ size = 28, color = "#3b82f6" }) => (
  <Base size={size}>
    {/* pipe body */}
    <rect x="8" y="10" width="18" height="7" rx="3.5" fill={color} opacity="0.7" />
    {/* pipe vertical drop neck */}
    <rect x="22" y="10" width="5" height="12" rx="2" fill={color} opacity="0.5" />
    {/* faucet spout tip */}
    <path d="M20 17 L28 17 L28 22 Q28 25 24 25 Q20 25 20 22 Z" fill={color} opacity="0.8" />
    {/* water stream */}
    <path d="M24 25 Q23 31 23 36" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85" />
    <path d="M24 25 Q25 31 25 36" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    {/* splash rings at bottom */}
    <ellipse cx="24" cy="38" rx="5" ry="2" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <ellipse cx="24" cy="38" rx="9" ry="3" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
    {/* handle on top of pipe */}
    <rect x="18" y="7" width="5" height="5" rx="1" fill={color} opacity="0.5" />
    <rect x="20" y="4" width="2" height="5" rx="1" fill={color} opacity="0.7" />
  </Base>
);

// 71. Rapid Rush — a racing car viewed from above at speed, with aerodynamic
//     body lines, spinning wheel blurs, and long speed-trail streaks behind it
export const IconBigBolt = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    {/* speed trail lines */}
    <path d="M3 18 H14" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
    <path d="M3 24 H12" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
    <path d="M3 30 H14" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
    {/* car body */}
    <path d="M14 18 Q16 14 24 13 Q36 13 40 18 L40 30 Q36 35 24 35 Q16 34 14 30 Z"
      fill={color} opacity="0.85" />
    {/* cockpit canopy */}
    <path d="M20 18 Q24 15 30 18 L30 24 Q24 26 20 24 Z" fill={color} opacity="0.35" />
    {/* front wing */}
    <path d="M38 17 L44 15 L44 20 L38 20 Z" fill={color} opacity="0.7" />
    <path d="M38 28 L44 28 L44 33 L38 31 Z" fill={color} opacity="0.7" />
    {/* wheels (blurred circles) */}
    <ellipse cx="18" cy="14" rx="3.5" ry="2" fill={color} opacity="0.5" />
    <ellipse cx="18" cy="34" rx="3.5" ry="2" fill={color} opacity="0.5" />
    <ellipse cx="35" cy="14" rx="3.5" ry="2" fill={color} opacity="0.5" />
    <ellipse cx="35" cy="34" rx="3.5" ry="2" fill={color} opacity="0.5" />
  </Base>
);

// 72. Precision Peak — a sniper scope reticle: crosshairs spanning the full
//     icon, mil-dot marks on each arm, concentric ring sight, center dot
export const IconBullseye = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    {/* scope outer ring */}
    <circle cx="24" cy="24" r="17" fill="none" stroke={color} strokeWidth="1.8" opacity="0.5" />
    {/* inner sight ring */}
    <circle cx="24" cy="24" r="10" fill="none" stroke={color} strokeWidth="1.6" opacity="0.75" />
    {/* crosshair lines — gap in center */}
    <line x1="7" y1="24" x2="14" y2="24" stroke={color} strokeWidth="2" opacity="0.9" />
    <line x1="34" y1="24" x2="41" y2="24" stroke={color} strokeWidth="2" opacity="0.9" />
    <line x1="24" y1="7" x2="24" y2="14" stroke={color} strokeWidth="2" opacity="0.9" />
    <line x1="24" y1="34" x2="24" y2="41" stroke={color} strokeWidth="2" opacity="0.9" />
    {/* mil-dot marks on crosshairs */}
    <circle cx="10" cy="24" r="1.2" fill={color} opacity="0.7" />
    <circle cx="38" cy="24" r="1.2" fill={color} opacity="0.7" />
    <circle cx="24" cy="10" r="1.2" fill={color} opacity="0.7" />
    <circle cx="24" cy="38" r="1.2" fill={color} opacity="0.7" />
    {/* center dot */}
    <circle cx="24" cy="24" r="3" fill={color} opacity="0.95" />
    <circle cx="24" cy="24" r="1.2" fill="#fff" opacity="0.6" />
  </Base>
);

// 73. Focus Fire — a campfire with three logs arranged in a tripod base,
//     rising flame layers in yellow-orange, and rising ember sparks
export const IconFlame = ({ size = 28, color = "#f97316" }) => (
  <Base size={size}>
    {/* log base left */}
    <path d="M10 38 L20 30" stroke={color} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
    {/* log base right */}
    <path d="M38 38 L28 30" stroke={color} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
    {/* log base center */}
    <path d="M16 38 L32 38" stroke={color} strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />
    {/* outer flame */}
    <path d="M24 10 C18 14 12 20 14 28 C16 34 20 36 24 36 C28 36 32 34 34 28 C36 20 30 14 24 10 Z"
      fill={color} opacity="0.8" />
    {/* mid flame */}
    <path d="M24 16 C20 20 18 24 20 29 C21 32 22 33 24 33 C26 33 27 32 28 29 C30 24 28 20 24 16 Z"
      fill="#fde68a" opacity="0.75" />
    {/* inner core */}
    <path d="M24 22 C22 25 22 27 24 30 C26 27 26 25 24 22 Z"
      fill="#fff" opacity="0.55" />
    {/* ember sparks */}
    <circle cx="18" cy="14" r="1.2" fill={color} opacity="0.6" />
    <circle cx="30" cy="11" r="1" fill={color} opacity="0.5" />
    <circle cx="33" cy="17" r="0.9" fill="#fde68a" opacity="0.5" />
    <circle cx="15" cy="20" r="0.9" fill="#fde68a" opacity="0.4" />
  </Base>
);

// 74. Type Storm — a hurricane viewed from above: a tight eye at center,
//     spiral cloud bands curling outward, and rain-streak lines radiating out
export const IconTornado = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    {/* outer band */}
    <path d="M24 6 C34 6 42 14 42 24 C42 34 34 42 24 42 C14 42 6 34 6 24 C6 14 14 6 24 6 Z"
      fill="none" stroke={color} strokeWidth="1.4" opacity="0.2" />
    {/* spiral band 1 */}
    <path d="M24 9 C38 10 41 22 34 32 C28 40 14 40 9 30"
      fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    {/* spiral band 2 */}
    <path d="M24 13 C34 14 37 24 30 31 C24 37 14 35 11 27"
      fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
    {/* spiral band 3 — innermost */}
    <path d="M24 17 C30 17 33 22 30 27 C27 32 20 31 18 26"
      fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    {/* eye ring */}
    <circle cx="24" cy="24" r="5" fill="none" stroke={color} strokeWidth="2" opacity="0.85" />
    {/* eye center calm dot */}
    <circle cx="24" cy="24" r="2" fill={color} opacity="0.6" />
    {/* rain streaks */}
    <line x1="10" y1="12" x2="8" y2="17" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    <line x1="38" y1="10" x2="40" y2="15" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    <line x1="6" y1="28" x2="4" y2="33" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    <line x1="42" y1="30" x2="44" y2="35" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
  </Base>
);

// 75. Word Blitz — a bomb with a lit fuse and a stylized explosion ring around
//     it: the fuse sparks upward, the blast ring has radiating spike shards
export const IconStarburst = ({ size = 28, color = "#ec4899" }) => (
  <Base size={size}>
    {/* explosion ring shards */}
    <polygon points="24,4 25.5,10 30,6 27,12 34,10 28,15 36,16 28,18 35,22 27,21 32,28 24,23 24,31 20,23 16,28 21,21 13,22 20,18 12,16 20,15 14,10 21,12 18,6 23,10" fill={color} opacity="0.3" />
    {/* bomb body */}
    <circle cx="24" cy="26" r="11" fill={color} opacity="0.85" />
    {/* bomb shine */}
    <circle cx="20" cy="21" r="3.5" fill="#fff" opacity="0.15" />
    {/* bomb top nub */}
    <rect x="21.5" y="14" width="5" height="4" rx="2" fill={color} opacity="0.8" />
    {/* fuse cord */}
    <path d="M24 14 Q28 10 26 6 Q30 3 34 5"
      stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
    {/* fuse spark */}
    <circle cx="34" cy="5" r="2.5" fill="#fde68a" opacity="0.95" />
    <circle cx="34" cy="5" r="1.2" fill="#fff" opacity="0.8" />
    <path d="M35 3 L37 1" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <path d="M36 5 L39 4" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <path d="M35 7 L38 8" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
  </Base>
);

export const SPEED_SURGE_ICONS = {
  61: IconBoltCluster, 62: IconSinePattern, 63: IconTerminalPrompt, 64: IconQuoteMarks, 65: IconCrown,
  66: IconFlowRibbon, 67: IconSax, 68: IconStaircase, 69: IconWeave, 70: IconDrops,
  71: IconBigBolt, 72: IconBullseye, 73: IconFlame, 74: IconTornado, 75: IconStarburst,
};

// ─── Free Run section (levels 76-99) ────────────────────────────────────────

// 76. Long Haul — a semi-truck side view with motion streaks
export const IconTruck = ({ size = 28, color = "#34d399" }) => (
  <Base size={size}>
    <rect x="4" y="20" width="30" height="14" rx="2" fill={color} opacity="0.18" stroke={color} strokeWidth="2" />
    <rect x="32" y="24" width="12" height="10" rx="2" fill={color} opacity="0.3" stroke={color} strokeWidth="1.6" />
    <circle cx="11" cy="36" r="4" fill={color} opacity="0.85" stroke="#15151f" strokeWidth="1.2" />
    <circle cx="35" cy="36" r="4" fill={color} opacity="0.85" stroke="#15151f" strokeWidth="1.2" />
    <path d="M2 26 L0 26 M2 22 L0 22" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    <rect x="33" y="25" width="10" height="6" rx="1" fill={color} opacity="0.2" />
  </Base>
);

// 77. Big Words — a large capital letter A with size indicators
export const IconBigA = ({ size = 28, color = "#60a5fa" }) => (
  <Base size={size}>
    <path d="M24 6 L38 42 M24 6 L10 42" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
    <path d="M16 28 H32" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M4 10 L8 6 M44 10 L40 6" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    <path d="M4 38 L8 42 M44 38 L40 42" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
  </Base>
);

// 78. Mega Vocab — a bulging dictionary with words exploding out
export const IconMegaBook = ({ size = 28, color = "#f472b6" }) => (
  <Base size={size}>
    <path d="M10 8 Q8 24 10 40 H38 Q40 24 38 8 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="2" />
    <path d="M10 8 H38" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <path d="M14 16 H34 M14 22 H34 M14 28 H28" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <path d="M30 24 L36 18 M33 20 L39 14" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    <circle cx="40" cy="12" r="3" fill={color} opacity="0.7" />
  </Base>
);

// 79. Word Mountain — a steep mountain peak with word-trail switchbacks
export const IconWordMtn = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M4 42 L24 8 L44 42 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M10 42 L16 30 L22 36 L24 28" stroke={color} strokeWidth="1.4" strokeDasharray="2 2.5" fill="none" strokeLinecap="round" opacity="0.7" />
    <circle cx="24" cy="8" r="3" fill={color} opacity="0.9" />
    <path d="M20 16 H28 M18 22 H30" stroke={color} strokeWidth="1" opacity="0.4" />
  </Base>
);

// 80. Vocab Vault — a bank vault door with a spinning dial
export const IconVault = ({ size = 28, color = "#818cf8" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="18" fill={color} opacity="0.14" stroke={color} strokeWidth="2.2" />
    <circle cx="24" cy="24" r="11" fill="none" stroke={color} strokeWidth="1.6" opacity="0.6" />
    <circle cx="24" cy="24" r="5" fill={color} opacity="0.4" />
    <path d="M24 13 V16 M24 32 V35 M13 24 H16 M32 24 H35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M24 24 L30 18" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
    <circle cx="24" cy="24" r="2" fill={color} />
  </Base>
);

// 81. Lab Notes — a clipboard with checkboxes and a pencil
export const IconClipboard = ({ size = 28, color = "#38bdf8" }) => (
  <Base size={size}>
    <rect x="10" y="10" width="28" height="34" rx="3" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <rect x="18" y="6" width="12" height="8" rx="2" fill={color} opacity="0.4" stroke={color} strokeWidth="1.4" />
    <rect x="14" y="20" width="4" height="4" rx="1" fill="none" stroke={color} strokeWidth="1.4" opacity="0.8" />
    <path d="M20 22 H32" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <rect x="14" y="28" width="4" height="4" rx="1" fill={color} opacity="0.7" stroke={color} strokeWidth="1.2" />
    <path d="M20 30 H32" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <path d="M20 38 H28" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
  </Base>
);

// 82. Tech Talk II — circuit board traces with a chip node
export const IconCircuit = ({ size = 28, color = "#4ade80" }) => (
  <Base size={size}>
    <rect x="16" y="16" width="16" height="16" rx="2" fill={color} opacity="0.2" stroke={color} strokeWidth="2" />
    <circle cx="20" cy="20" r="1.5" fill={color} opacity="0.9" />
    <circle cx="28" cy="20" r="1.5" fill={color} opacity="0.9" />
    <circle cx="20" cy="28" r="1.5" fill={color} opacity="0.9" />
    <circle cx="28" cy="28" r="1.5" fill={color} opacity="0.9" />
    <path d="M20 16 V10 M28 16 V10 M16 20 H8 M16 28 H8 M32 20 H40 M32 28 H40 M20 32 V40 M28 32 V40" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
  </Base>
);

// 83. Science Sprint — an atom with orbiting electrons
export const IconAtom = ({ size = 28, color = "#fb923c" }) => (
  <Base size={size}>
    <ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke={color} strokeWidth="1.8" opacity="0.85" />
    <ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke={color} strokeWidth="1.8" opacity="0.85" transform="rotate(60 24 24)" />
    <ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke={color} strokeWidth="1.8" opacity="0.85" transform="rotate(-60 24 24)" />
    <circle cx="24" cy="24" r="4" fill={color} opacity="0.85" />
    <circle cx="24" cy="17" r="2.5" fill={color} opacity="0.9" />
    <circle cx="36" cy="29" r="2" fill={color} opacity="0.7" />
    <circle cx="13" cy="29" r="2" fill={color} opacity="0.7" />
  </Base>
);

// 84. Data Drive — a hard drive disk with spinning platters visible
export const IconDrive = ({ size = 28, color = "#c084fc" }) => (
  <Base size={size}>
    <rect x="6" y="14" width="36" height="22" rx="4" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="25" r="8" fill="none" stroke={color} strokeWidth="1.6" opacity="0.7" />
    <circle cx="24" cy="25" r="3" fill={color} opacity="0.5" />
    <circle cx="36" cy="18" r="2.5" fill={color} opacity="0.8" />
    <path d="M36 18 L24 25" stroke={color} strokeWidth="1" opacity="0.5" />
  </Base>
);

// 85. Code Breaker — a padlock cracked open with binary sparks
export const IconCrackLock = ({ size = 28, color = "#2dd4bf" }) => (
  <Base size={size}>
    <rect x="10" y="22" width="22" height="18" rx="3" fill={color} opacity="0.18" stroke={color} strokeWidth="2" />
    <path d="M16 22 V15 C16 9 32 9 32 15 V22" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
    <path d="M32 15 L36 10" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <circle cx="24" cy="31" r="3" fill={color} opacity="0.8" />
    <path d="M38 8 L40 6 M40 10 L42 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    <path d="M22 28 L26 34" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
  </Base>
);

// 86. Phrase Runner — a speech bubble with legs running
export const IconPhraseBubble = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V24 Q40 30 34 30 H28 L22 38 L22 30 H14 Q8 30 8 24 V14 Q8 8 14 8 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M14 17 H34 M14 23 H28" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
  </Base>
);

// 87. Quote Dash — a racing checkered flag with quote marks
export const IconQuoteDash = ({ size = 28, color = "#a78bfa" }) => (
  <Base size={size}>
    <path d="M10 6 V38" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 6 H34 L28 16 H34 L10 26" fill={color} opacity="0.4" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M22 34 Q20 30 24 28 M30 34 Q28 30 32 28" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
  </Base>
);

// 88. Sentence Sprint — a long dash/em-dash with trailing words
export const IconSentenceRun = ({ size = 28, color = "#fb923c" }) => (
  <Base size={size}>
    <path d="M6 24 H42" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M6 18 H20 M6 30 H16" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    <path d="M36 18 L44 24 L36 30" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="6" cy="24" r="3" fill={color} opacity="0.8" />
  </Base>
);

// 89. Flow State II — a continuous sine wave with a glowing crest
export const IconSineWave = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <path d="M4 24 C8 12 16 12 20 24 C24 36 32 36 36 24 C40 12 44 12 44 24" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="20" cy="24" r="3" fill={color} opacity="0.9" />
    <path d="M4 24 C8 14 14 14 18 24" stroke={color} strokeWidth="1" opacity="0.35" fill="none" />
    <circle cx="36" cy="24" r="2" fill={color} opacity="0.5" />
  </Base>
);

// 90. Mind Meld — two overlapping brain hemispheres with a spark at the join
export const IconBrain = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <path d="M24 12 C14 10 8 16 8 24 C8 34 14 38 24 38" stroke={color} strokeWidth="2" fill="none" opacity="0.85" />
    <path d="M12 18 C10 22 10 28 14 32" stroke={color} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
    <path d="M24 12 C34 10 40 16 40 24 C40 34 34 38 24 38" stroke={color} strokeWidth="2" fill="none" opacity="0.85" />
    <path d="M36 18 C38 22 38 28 34 32" stroke={color} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
    <path d="M24 10 V38" stroke={color} strokeWidth="1.4" strokeDasharray="2 2" opacity="0.4" />
    <circle cx="24" cy="24" r="4" fill={color} opacity="0.3" />
    <path d="M21 22 L27 26 M27 22 L21 26" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
  </Base>
);

// 91-99. Greek letters — stylized Greek letter for each
export const IconAlpha = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    <path d="M6 36 C10 20 18 12 24 12 C30 12 34 18 34 26 C34 32 30 38 24 38" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <path d="M24 38 L42 38" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    <path d="M30 30 L42 20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </Base>
);

export const IconBeta = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M12 8 V40" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 8 H26 C34 8 34 18 24 20 C34 22 36 32 26 34 H12" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="36" cy="10" r="2.5" fill={color} opacity="0.5" />
  </Base>
);

export const IconGamma = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    <path d="M6 10 H24 L24 40" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M24 10 L42 10" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M18 10 L24 20" stroke={color} strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
  </Base>
);

export const IconDelta = ({ size = 28, color = "#3b82f6" }) => (
  <Base size={size}>
    <path d="M24 8 L42 40 H6 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M16 28 H32" stroke={color} strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
    <circle cx="24" cy="8" r="2.5" fill={color} opacity="0.85" />
  </Base>
);

export const IconEpsilon = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    <path d="M36 12 H14 Q8 12 8 20 Q8 24 16 24 M36 24 H16 Q8 24 8 32 Q8 40 14 40 H36" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 24 H30" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Base>
);

export const IconZeta = ({ size = 28, color = "#c084fc" }) => (
  <Base size={size}>
    <path d="M10 10 H38 L10 38 H38" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="10" cy="10" r="2.5" fill={color} opacity="0.7" />
    <circle cx="38" cy="38" r="2.5" fill={color} opacity="0.7" />
  </Base>
);

export const IconTheta = ({ size = 28, color = "#34d399" }) => (
  <Base size={size}>
    <ellipse cx="24" cy="24" rx="16" ry="18" fill={color} opacity="0.12" stroke={color} strokeWidth="2.2" />
    <path d="M8 24 H40" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
  </Base>
);

export const IconIota = ({ size = 28, color = "#f472b6" }) => (
  <Base size={size}>
    <path d="M24 8 V40" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    <path d="M14 8 H34 M14 40 H34" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    <circle cx="24" cy="24" r="3" fill={color} opacity="0.5" />
  </Base>
);

export const IconKappa = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M12 8 V40" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 24 L38 8 M12 24 L38 40" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="24" r="3" fill={color} opacity="0.6" />
  </Base>
);

export const FREE_RUN_ICONS = {
  76: IconTruck, 77: IconBigA, 78: IconMegaBook, 79: IconWordMtn, 80: IconVault,
  81: IconClipboard, 82: IconCircuit, 83: IconAtom, 84: IconDrive, 85: IconCrackLock,
  86: IconPhraseBubble, 87: IconQuoteDash, 88: IconSentenceRun, 89: IconSineWave, 90: IconBrain,
  91: IconAlpha, 92: IconBeta, 93: IconGamma, 94: IconDelta, 95: IconEpsilon,
  96: IconZeta, 97: IconTheta, 98: IconIota, 99: IconKappa,
};

// ─── Century Club section (levels 100-115) ──────────────────────────────────

// 100. Century Mark — a bold "100" with a medal ribbon
export const IconHundred = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M6 10 V34 M6 10 H12" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    <circle cx="22" cy="22" r="10" fill={color} opacity="0.14" stroke={color} strokeWidth="2.2" />
    <circle cx="36" cy="22" r="10" fill={color} opacity="0.14" stroke={color} strokeWidth="2.2" />
    <path d="M18 38 L22 44 L24 40 L26 44 L30 38" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
  </Base>
);

// 101-110. Language greetings — speech bubble with stylized script
export const IconFrench = ({ size = 28, color = "#3b82f6" }) => (
  <Base size={size}>
    <path d="M6 8 H38 Q42 8 42 14 V24 Q42 30 36 30 H22 L14 38 V30 H12 Q6 30 6 24 V14 Q6 8 12 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M14 18 H22 M14 24 H18" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <path d="M26 14 L30 22 M34 14 L30 22" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </Base>
);

export const IconSpanish = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 12 C22 14 22 18 24 20 C26 18 26 14 24 12 Z" fill={color} opacity="0.8" />
    <path d="M14 24 H34" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </Base>
);

export const IconItalian = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 12 V28" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
    <circle cx="24" cy="10" r="2.5" fill={color} opacity="0.8" />
  </Base>
);

export const IconGerman = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M14 12 H22 V22 H30 V12 H38" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  </Base>
);

export const IconJapanese = ({ size = 28, color = "#ec4899" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="24" cy="20" r="8" fill={color} opacity="0.6" />
  </Base>
);

export const IconKorean = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="24" cy="20" r="7" fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
    <path d="M18 17 H30 M18 23 H30" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    <path d="M21 17 V23 M27 17 V23" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
  </Base>
);

export const IconChinese = ({ size = 28, color = "#f97316" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 12 V28 M16 18 H32 M19 12 L14 28 M29 12 L34 28" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
  </Base>
);

export const IconArabic = ({ size = 28, color = "#2dd4bf" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M34 14 C28 14 20 18 16 22 C22 22 30 18 34 14 Z" fill={color} opacity="0.7" />
    <path d="M18 26 C22 22 30 22 34 26" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
    <circle cx="16" cy="22" r="1.8" fill={color} opacity="0.9" />
    <circle cx="18" cy="26" r="1.5" fill={color} opacity="0.7" />
  </Base>
);

export const IconHindi = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 12 H32 M24 12 V28" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
    <path d="M18 20 C18 26 30 26 30 20" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
  </Base>
);

export const IconAussie = ({ size = 28, color = "#84cc16" }) => (
  <Base size={size}>
    <path d="M8 8 H36 Q40 8 40 14 V26 Q40 32 34 32 H20 L12 40 V32 H10 Q8 32 8 26 V14 Q8 8 14 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 14 H32 M16 20 H26 M16 26 H22" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <path d="M30 20 L36 14 M30 20 L36 26" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 111. History Makers — a scroll with a quill and historical seal
export const IconScroll = ({ size = 28, color = "#94a3b8" }) => (
  <Base size={size}>
    <path d="M12 8 H36 V38 H12 C8 38 8 34 12 34 C8 34 8 30 12 30 C8 30 8 8 12 8 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <path d="M36 8 C40 8 40 12 36 12 C40 12 40 38 36 38" stroke={color} strokeWidth="1.4" opacity="0.6" />
    <path d="M16 16 H32 M16 22 H32 M16 28 H24" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <path d="M28 32 L34 26 L36 28 L30 34 Z" fill={color} opacity="0.6" />
  </Base>
);

// 112. Scientists — a microscope with lens detail
export const IconMicroscope = ({ size = 28, color = "#38bdf8" }) => (
  <Base size={size}>
    <rect x="16" y="28" width="16" height="4" rx="1.5" fill={color} opacity="0.7" />
    <rect x="20" y="32" width="8" height="8" rx="1" fill={color} opacity="0.5" />
    <path d="M24 8 V28" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M18 14 H30" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <ellipse cx="24" cy="10" rx="6" ry="4" fill={color} opacity="0.4" stroke={color} strokeWidth="1.4" />
    <path d="M10 40 H38" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <path d="M10 40 L20 32" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
  </Base>
);

// 113. Artists — a painter's palette with paint dabs and a brush
export const IconPalette = ({ size = 28, color = "#f472b6" }) => (
  <Base size={size}>
    <path d="M24 6 C14 6 6 14 6 22 C6 30 12 36 20 36 C22 36 24 34 24 32 C24 30 26 28 28 28 C34 28 42 24 42 18 C42 12 34 6 24 6 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="2" />
    <circle cx="16" cy="16" r="3" fill={color} opacity="0.85" />
    <circle cx="24" cy="12" r="3" fill="#f59e0b" opacity="0.85" />
    <circle cx="32" cy="16" r="3" fill="#ef4444" opacity="0.85" />
    <circle cx="34" cy="24" r="3" fill="#10b981" opacity="0.85" />
    <circle cx="22" cy="28" r="4" fill={color} opacity="0.3" />
    <path d="M36 8 L44 4" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 114. Writers — a quill pen writing on a page with ink splash
export const IconQuillPen = ({ size = 28, color = "#c084fc" }) => (
  <Base size={size}>
    <path d="M8 40 L20 28 L36 8 C40 4 44 6 42 12 L24 32 L14 44 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M20 28 L16 36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <path d="M36 8 L28 20" stroke={color} strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
    <ellipse cx="12" cy="40" rx="4" ry="2" fill={color} opacity="0.4" />
  </Base>
);

// 115. Musicians — a treble clef with musical notes
export const IconTreble = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M24 6 C28 10 32 16 28 22 C26 26 22 28 22 32 C22 38 28 42 28 42" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M18 34 H30" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="42" r="4" fill={color} opacity="0.4" stroke={color} strokeWidth="1.4" />
    <path d="M34 16 L40 14 M34 22 L40 20" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <circle cx="40" cy="14" r="2.5" fill={color} opacity="0.7" />
    <circle cx="40" cy="20" r="2.5" fill={color} opacity="0.7" />
  </Base>
);

export const CENTURY_CLUB_ICONS = {
  100: IconHundred,
  101: IconFrench, 102: IconSpanish, 103: IconItalian, 104: IconGerman, 105: IconJapanese,
  106: IconKorean, 107: IconChinese, 108: IconArabic, 109: IconHindi, 110: IconAussie,
  111: IconScroll, 112: IconMicroscope, 113: IconPalette, 114: IconQuillPen, 115: IconTreble,
};

// ─── Endurance section (levels 116-130) ─────────────────────────────────────

// 116. Home Row Hero II — home row keys highlighted on a keyboard
export const IconHomeRow2 = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    <rect x="4" y="28" width="40" height="14" rx="3" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <rect x="4" y="16" width="40" height="10" rx="2" fill="none" stroke={color} strokeWidth="1.4" opacity="0.4" />
    <rect x="4" y="8" width="40" height="6" rx="2" fill="none" stroke={color} strokeWidth="1" opacity="0.25" />
    {[8,15,22,29,36].map((x,i) => <rect key={i} x={x} y="31" width="5" height="5" rx="1.2" fill={color} opacity="0.8" />)}
    <path d="M8 36 H36" stroke={color} strokeWidth="1" opacity="0.3" strokeLinecap="round" />
  </Base>
);

// 117. Number Words II — numeral digits cascading
export const IconNums2 = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    <text x="6" y="22" fontSize="14" fontWeight="bold" fill={color} opacity="0.9" fontFamily="monospace">123</text>
    <text x="10" y="38" fontSize="14" fontWeight="bold" fill={color} opacity="0.6" fontFamily="monospace">456</text>
    <path d="M6 26 H42" stroke={color} strokeWidth="1" opacity="0.3" />
  </Base>
);

// 118. Keyboard Row Mix — three staggered rows of keys
export const IconRowMix = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <rect x="6" y="8" width="36" height="8" rx="2" fill={color} opacity="0.14" stroke={color} strokeWidth="1.6" />
    <rect x="10" y="20" width="36" height="8" rx="2" fill={color} opacity="0.14" stroke={color} strokeWidth="1.6" />
    <rect x="14" y="32" width="28" height="8" rx="2" fill={color} opacity="0.14" stroke={color} strokeWidth="1.6" />
    {[10,18,26,34].map((x,i)=><rect key={i} x={x} y="10" width="5" height="4" rx="1" fill={color} opacity="0.6"/>)}
    {[14,22,30,38].map((x,i)=><rect key={i} x={x} y="22" width="5" height="4" rx="1" fill={color} opacity="0.6"/>)}
  </Base>
);

// 119. Alternating Hands — two hands alternating left-right pattern
export const IconAltHands = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <path d="M8 28 C8 22 12 18 16 18 L16 8 C16 6 18 6 18 8 V18 L20 18 V10 C20 8 22 8 22 10 V18 L24 18 V12 C24 10 26 10 26 12 V20 C26 20 28 14 30 16 C32 18 28 28 26 32 H10 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M40 28 C40 22 36 18 32 18 L32 10 C32 8 30 8 30 10 V18" stroke={color} strokeWidth="1.4" fill="none" opacity="0.5" strokeLinecap="round" />
    <path d="M6 36 H42" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
  </Base>
);

// 120. Pinky Power — a hand with pinky finger extended and glowing
export const IconPinky = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M14 36 C14 28 18 22 20 18 L20 10 C20 8 22 8 22 10 V18 L24 18 V12 C24 10 26 10 26 12 V20 L28 20 V14 C28 12 30 12 30 14 V22 L32 22 V18 C32 16 34 16 34 18 V30 C34 34 30 38 26 38 H18 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M14 26 C12 22 10 16 12 12 C14 10 16 12 16 16" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <circle cx="12" cy="10" r="3" fill={color} opacity="0.85" />
    <path d="M8 8 L6 4 M10 6 L10 2 M14 6 L14 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 121. Monster Words — a monster mouth open wide with teeth
export const IconMonster = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <path d="M4 24 C4 14 12 6 24 6 C36 6 44 14 44 24 C44 34 36 42 24 42 C12 42 4 34 4 24 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <path d="M10 28 H38" stroke={color} strokeWidth="1.4" opacity="0.4" />
    <path d="M10 28 C12 36 20 40 24 40 C28 40 36 36 38 28" fill={color} opacity="0.3" />
    {[14,19,24,29,34].map((x,i)=><path key={i} d={`M${x} 28 L${x+2} 34 L${x+4} 28`} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" opacity="0.7"/>)}
    <circle cx="17" cy="18" r="4" fill={color} opacity="0.4" />
    <circle cx="31" cy="18" r="4" fill={color} opacity="0.4" />
    <circle cx="17" cy="18" r="2" fill={color} opacity="0.9" />
    <circle cx="31" cy="18" r="2" fill={color} opacity="0.9" />
  </Base>
);

// 122. Mega Phrases — a giant speech bubble with ellipsis
export const IconMegaBubble = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <path d="M4 6 H40 Q44 6 44 12 V28 Q44 34 38 34 H28 L18 44 V34 H10 Q4 34 4 28 V12 Q4 6 10 6 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="16" cy="20" r="3.5" fill={color} opacity="0.75" />
    <circle cx="24" cy="20" r="3.5" fill={color} opacity="0.75" />
    <circle cx="32" cy="20" r="3.5" fill={color} opacity="0.75" />
  </Base>
);

// 123. Speed Sentence — a race car on a track with sentence lines
export const IconRaceLine = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    <rect x="4" y="16" width="40" height="18" rx="9" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
    <rect x="10" y="19" width="18" height="12" rx="3" fill={color} opacity="0.4" stroke={color} strokeWidth="1.4" />
    <circle cx="14" cy="33" r="4" fill={color} opacity="0.85" />
    <circle cx="24" cy="33" r="4" fill={color} opacity="0.85" />
    <path d="M32 22 H40 M32 28 H38" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 124. Long Quote — an extended scroll unrolling
export const IconLongScroll = ({ size = 28, color = "#818cf8" }) => (
  <Base size={size}>
    <path d="M10 10 H40 V38 H10 C6 38 6 34 10 34 C6 34 6 10 10 10 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <path d="M40 10 C44 10 44 38 40 38" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <path d="M16 18 H36 M16 24 H36 M16 30 H28" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <path d="M28 30 L36 22" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
  </Base>
);

// 125. Tongue Tornado — a swirling vortex
export const IconVortex = ({ size = 28, color = "#fb923c" }) => (
  <Base size={size}>
    <path d="M24 24 C24 24 34 20 36 14 C38 8 32 4 26 8 C20 12 14 20 18 28 C22 36 32 38 38 32 C44 26 40 16 32 16" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="24" r="4" fill={color} opacity="0.4" />
    <circle cx="24" cy="24" r="2" fill={color} opacity="0.9" />
  </Base>
);

// 126-130. Letter-count levels — die/block with pips showing count
export const IconDie2 = ({ size = 28, color = "#34d399" }) => (
  <Base size={size}>
    <rect x="8" y="8" width="32" height="32" rx="5" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="16" cy="16" r="3.5" fill={color} opacity="0.85" />
    <circle cx="32" cy="32" r="3.5" fill={color} opacity="0.85" />
  </Base>
);

export const IconDie4 = ({ size = 28, color = "#60a5fa" }) => (
  <Base size={size}>
    <rect x="8" y="8" width="32" height="32" rx="5" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="16" cy="16" r="3" fill={color} opacity="0.85" />
    <circle cx="32" cy="16" r="3" fill={color} opacity="0.85" />
    <circle cx="16" cy="32" r="3" fill={color} opacity="0.85" />
    <circle cx="32" cy="32" r="3" fill={color} opacity="0.85" />
  </Base>
);

export const IconDie5 = ({ size = 28, color = "#f97316" }) => (
  <Base size={size}>
    <rect x="8" y="8" width="32" height="32" rx="5" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="16" cy="16" r="3" fill={color} opacity="0.85" />
    <circle cx="32" cy="16" r="3" fill={color} opacity="0.85" />
    <circle cx="24" cy="24" r="3" fill={color} opacity="0.85" />
    <circle cx="16" cy="32" r="3" fill={color} opacity="0.85" />
    <circle cx="32" cy="32" r="3" fill={color} opacity="0.85" />
  </Base>
);

export const IconDie6 = ({ size = 28, color = "#818cf8" }) => (
  <Base size={size}>
    <rect x="8" y="8" width="32" height="32" rx="5" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="16" cy="14" r="3" fill={color} opacity="0.85" />
    <circle cx="32" cy="14" r="3" fill={color} opacity="0.85" />
    <circle cx="16" cy="24" r="3" fill={color} opacity="0.85" />
    <circle cx="32" cy="24" r="3" fill={color} opacity="0.85" />
    <circle cx="16" cy="34" r="3" fill={color} opacity="0.85" />
    <circle cx="32" cy="34" r="3" fill={color} opacity="0.85" />
  </Base>
);

export const IconDie7 = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <rect x="8" y="8" width="32" height="32" rx="5" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="15" cy="13" r="2.5" fill={color} opacity="0.85" />
    <circle cx="33" cy="13" r="2.5" fill={color} opacity="0.85" />
    <circle cx="15" cy="24" r="2.5" fill={color} opacity="0.85" />
    <circle cx="24" cy="24" r="2.5" fill={color} opacity="0.85" />
    <circle cx="33" cy="24" r="2.5" fill={color} opacity="0.85" />
    <circle cx="15" cy="35" r="2.5" fill={color} opacity="0.85" />
    <circle cx="33" cy="35" r="2.5" fill={color} opacity="0.85" />
  </Base>
);

export const ENDURANCE_ICONS = {
  116: IconHomeRow2, 117: IconNums2, 118: IconRowMix, 119: IconAltHands, 120: IconPinky,
  121: IconMonster, 122: IconMegaBubble, 123: IconRaceLine, 124: IconLongScroll, 125: IconVortex,
  126: IconDie2, 127: IconDie4, 128: IconDie5, 129: IconDie6, 130: IconDie7,
};

// ─── Literature section (levels 131-145) ────────────────────────────────────

// 131. Epic Sentences — an unrolling epic scroll
export const IconEpicScroll = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <path d="M8 6 H40 V40 H8 C4 40 4 36 8 36 C4 36 4 6 8 6 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <path d="M14 14 H36 M14 20 H36 M14 26 H36 M14 32 H28" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <path d="M40 6 C44 6 44 40 40 40" stroke={color} strokeWidth="1.4" opacity="0.5" />
    <circle cx="8" cy="6" r="3" fill={color} opacity="0.6" />
    <circle cx="8" cy="40" r="3" fill={color} opacity="0.6" />
  </Base>
);

// 132. Philosophy — a thinking head profile
export const IconPhiloHead = ({ size = 28, color = "#38bdf8" }) => (
  <Base size={size}>
    <path d="M16 10 C10 10 6 16 6 22 C6 30 12 36 20 38 V44 H30 V38 C38 36 42 30 42 22 C42 14 36 8 28 8 C24 8 20 10 18 12 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <path d="M22 20 C22 16 30 16 30 20 C30 24 26 24 26 28" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <circle cx="26" cy="32" r="2.5" fill={color} opacity="0.8" />
  </Base>
);

// 133. Scripture — an open bible/book with a cross bookmark
export const IconBible = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M4 8 H22 V40 H4 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.8" />
    <path d="M22 8 H44 V40 H22 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="1.8" />
    <path d="M22 8 V40" stroke={color} strokeWidth="2.4" />
    <path d="M8 16 H18 M8 22 H18 M8 28 H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <path d="M31 14 V32 M26 20 H36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
  </Base>
);

// 134. Shakespeare — a quill and a theatrical mask
export const IconShakeMask = ({ size = 28, color = "#ec4899" }) => (
  <Base size={size}>
    <path d="M6 16 C6 10 10 6 16 6 H32 C38 6 42 10 42 16 C42 24 36 30 24 32 C12 30 6 24 6 16 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <circle cx="16" cy="16" r="4" fill="none" stroke={color} strokeWidth="1.8" />
    <circle cx="32" cy="16" r="4" fill="none" stroke={color} strokeWidth="1.8" />
    <path d="M16 24 C18 28 22 30 24 30 C26 30 30 28 32 24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M36 4 L44 2 L42 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
  </Base>
);

// 135. US History — a liberty bell with a crack
export const IconBell = ({ size = 28, color = "#3b82f6" }) => (
  <Base size={size}>
    <path d="M12 14 C12 6 36 6 36 14 L40 34 H8 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M8 34 H40" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M20 34 V40 H28 V34" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    <circle cx="24" cy="40" r="3" fill={color} opacity="0.6" />
    <path d="M26 10 L28 20 L26 28" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    <path d="M22 6 V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
  </Base>
);

// 136. Finger Fury — a hand with speed lines radiating from all fingertips
export const IconFingerFury = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M14 36 C14 28 18 20 20 16 L20 8 C20 6 22 6 22 8 V16 L24 16 V10 C24 8 26 8 26 10 V18 L28 18 V12 C28 10 30 10 30 12 V20 L32 20 V16 C32 14 34 14 34 16 V30 C34 34 30 38 26 38 H18 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M20 8 L16 4 M22 8 L20 3 M26 10 L26 4 M30 12 L32 6 M34 16 L38 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
  </Base>
);

// 137. Code Marathon — a long code block with runner
export const IconCodeRun = ({ size = 28, color = "#4ade80" }) => (
  <Base size={size}>
    <rect x="4" y="8" width="36" height="28" rx="4" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
    <path d="M12 18 L18 24 L12 30" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 30 H36" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    <path d="M22 24 H32 M22 18 H36" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    <circle cx="40" cy="8" r="4" fill={color} opacity="0.7" />
    <path d="M38 10 L40 8 L42 10" stroke="#15151f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </Base>
);

// 138. Emoji Words — a face emoji with code brackets
export const IconEmojiCode = ({ size = 28, color = "#f472b6" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="16" fill={color} opacity="0.16" stroke={color} strokeWidth="2" />
    <circle cx="18" cy="20" r="2.5" fill={color} opacity="0.85" />
    <circle cx="30" cy="20" r="2.5" fill={color} opacity="0.85" />
    <path d="M16 28 C18 33 30 33 32 28" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M4 16 L8 24 L4 32 M44 16 L40 24 L44 32" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
  </Base>
);

// 139. Hard Clusters — interlocked sharp spiky shapes
export const IconSpikes = ({ size = 28, color = "#818cf8" }) => (
  <Base size={size}>
    <path d="M24 4 L28 16 L40 12 L32 22 L44 26 L32 30 L36 42 L24 34 L12 42 L16 30 L4 26 L16 22 L8 12 L20 16 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="24" cy="24" r="6" fill={color} opacity="0.25" />
    <circle cx="24" cy="24" r="2.5" fill={color} opacity="0.8" />
  </Base>
);

// 140. Suffix Surge — a word root with branches growing off the end
export const IconSuffix = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <path d="M4 24 H30" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="4" cy="24" r="3" fill={color} opacity="0.7" />
    <path d="M30 24 L38 16 M30 24 L38 24 M30 24 L38 32" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="39" cy="16" r="3" fill={color} opacity="0.7" />
    <circle cx="39" cy="24" r="3" fill={color} opacity="0.7" />
    <circle cx="39" cy="32" r="3" fill={color} opacity="0.7" />
  </Base>
);

// 141-145. Elite progression — rising tiers
export const IconElite = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <rect x="4" y="32" width="10" height="10" rx="2" fill={color} opacity="0.5" stroke={color} strokeWidth="1.6" />
    <rect x="16" y="24" width="10" height="18" rx="2" fill={color} opacity="0.65" stroke={color} strokeWidth="1.6" />
    <rect x="28" y="14" width="10" height="28" rx="2" fill={color} opacity="0.85" stroke={color} strokeWidth="1.8" />
    <path d="M38 10 L38 6 M36 8 H40" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </Base>
);

export const IconMaster = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <path d="M24 4 L30 16 L44 18 L34 28 L36 42 L24 36 L12 42 L14 28 L4 18 L18 16 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 4 L30 16 L44 18 L34 28 L36 42 L24 36 L12 42 L14 28 L4 18 L18 16 Z" fill={color} opacity="0.0" />
    <circle cx="24" cy="24" r="8" fill={color} opacity="0.3" />
    <circle cx="24" cy="24" r="4" fill={color} opacity="0.7" />
  </Base>
);

export const IconWordGod = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="18" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
    <path d="M24 6 V14 M24 34 V42 M6 24 H14 M34 24 H42" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    <path d="M11 11 L17 17 M31 31 L37 37 M37 11 L31 17 M17 31 L11 37" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
    <circle cx="24" cy="24" r="7" fill={color} opacity="0.25" stroke={color} strokeWidth="1.4" />
    <circle cx="24" cy="24" r="3" fill={color} opacity="0.9" />
  </Base>
);

export const IconTranscend = ({ size = 28, color = "#c084fc" }) => (
  <Base size={size}>
    <path d="M24 4 L24 44 M4 24 L44 24" stroke={color} strokeWidth="1.4" opacity="0.3" strokeLinecap="round" />
    <path d="M24 4 L20 10 H28 Z" fill={color} opacity="0.8" />
    <circle cx="24" cy="24" r="12" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="24" r="6" fill={color} opacity="0.2" stroke={color} strokeWidth="1.4" />
    <circle cx="24" cy="24" r="2.5" fill={color} opacity="0.9" />
  </Base>
);

export const IconSummit = ({ size = 28, color = "#38bdf8" }) => (
  <Base size={size}>
    <path d="M4 44 L24 6 L44 44 Z" fill={color} opacity="0.14" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M14 32 L22 18 L30 32" stroke={color} strokeWidth="1.4" fill="none" opacity="0.5" strokeLinejoin="round" />
    <circle cx="24" cy="6" r="4" fill={color} opacity="0.9" />
    <path d="M24 2 L22 6 M24 2 L26 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    <path d="M20 38 H28" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
  </Base>
);

export const LITERATURE_ICONS = {
  131: IconEpicScroll, 132: IconPhiloHead, 133: IconBible, 134: IconShakeMask, 135: IconBell,
  136: IconFingerFury, 137: IconCodeRun, 138: IconEmojiCode, 139: IconSpikes, 140: IconSuffix,
  141: IconElite, 142: IconMaster, 143: IconWordGod, 144: IconTranscend, 145: IconSummit,
};

// ─── Machine Mode section (levels 146-155) ──────────────────────────────────

// 146-150. Speed God tiers — lightning bolt variants
export const IconSpeedGod1 = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    <path d="M28 4 L14 26 H22 L16 44 L34 20 H26 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="28" cy="4" r="3" fill="#fff" opacity="0.6" />
  </Base>
);

export const IconSpeedGod2 = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M28 4 L14 26 H22 L16 44 L34 20 H26 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M34 6 L38 2" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="28" cy="4" r="2.5" fill="#fff" opacity="0.5" />
  </Base>
);

export const IconSpeedGod3 = ({ size = 28, color = "#f97316" }) => (
  <Base size={size}>
    <path d="M28 4 L14 26 H22 L16 44 L34 20 H26 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M34 6 L40 2 M36 10 L42 8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="28" cy="4" r="3" fill="#fff" opacity="0.6" />
  </Base>
);

export const IconSpeedGod4 = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <path d="M26 2 L10 24 H20 L14 46 L38 22 H28 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M38 4 L44 0 M40 8 L46 6" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    <circle cx="26" cy="2" r="3.5" fill="#fff" opacity="0.6" />
  </Base>
);

export const IconSpeedGod5 = ({ size = 28, color = "#ec4899" }) => (
  <Base size={size}>
    <path d="M26 2 L8 26 H20 L12 46 L40 22 H28 Z" fill={color} opacity="0.9" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M40 4 L46 0 M42 8 L48 5 M38 12 L44 10" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="26" cy="2" r="4" fill="#fff" opacity="0.7" />
  </Base>
);

// 151. The Grind — a gear grinding with sparks
export const IconGrind = ({ size = 28, color = "#94a3b8" }) => (
  <Base size={size}>
    <path d="M20 6 L22 4 H26 L28 6 L32 4 L34 8 L38 8 L38 12 L42 14 L40 18 L42 22 L38 24 L38 28 L34 28 L32 32 L28 30 L26 32 H22 L20 30 L16 32 L14 28 L10 28 L10 24 L6 22 L8 18 L6 14 L10 12 L10 8 L14 8 L16 4 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="1.8" />
    <circle cx="24" cy="18" r="8" fill="none" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="18" r="3" fill={color} opacity="0.6" />
    <path d="M36 8 L40 6 M38 10 L42 10" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
  </Base>
);

// 152. Iron Fingers — a metallic mechanical finger
export const IconIronFist = ({ size = 28, color = "#6366f1" }) => (
  <Base size={size}>
    <path d="M18 44 H30 L30 28 L34 28 L34 20 L30 20 L30 14 L26 14 L26 20 L22 20 L22 14 L18 14 L18 20 L14 20 L14 28 L18 28 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M18 28 H30 M18 20 H30" stroke={color} strokeWidth="1.2" opacity="0.5" />
    <rect x="22" y="8" width="4" height="8" rx="1" fill={color} opacity="0.6" />
    <path d="M18 8 L14 4 M30 8 L34 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    <path d="M20 44 H28" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 153. The Crucible — a molten metal crucible pouring
export const IconCrucible = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M10 12 H38 L34 36 H14 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M6 12 H42" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M34 28 L40 36 L44 32" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    <path d="M38 36 L42 40" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M40 40 L38 46 M44 40 L46 46" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 154. Apex Predator — a falcon diving with sharp wings
export const IconFalcon = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    <path d="M24 6 C24 6 40 14 42 22 L32 20 L26 44 L24 38 L22 44 L16 20 L6 22 C8 14 24 6 24 6 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="24" cy="10" r="4" fill={color} opacity="0.85" />
    <path d="M22 8 L20 4 M26 8 L28 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 155. Finger Lightning — fingers firing bolts
export const IconFingerBolts = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M14 36 C14 28 18 22 20 18 L20 12 C20 10 22 10 22 12 V18 L24 18 V12 C24 10 26 10 26 12 V20 L28 20 V14 C28 12 30 12 30 14 V22 L32 22 V18 C32 16 34 16 34 18 V30 C34 34 30 38 26 38 H18 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M20 12 L17 6 L20 8 L18 2 M24 12 L24 4 M28 14 L31 6 L28 9 L30 2 M32 18 L36 10 L34 14 L38 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
  </Base>
);

export const MACHINE_MODE_ICONS = {
  146: IconSpeedGod1, 147: IconSpeedGod2, 148: IconSpeedGod3, 149: IconSpeedGod4, 150: IconSpeedGod5,
  151: IconGrind, 152: IconIronFist, 153: IconCrucible, 154: IconFalcon, 155: IconFingerBolts,
};

// ─── Legend Tier section (levels 156-165) ───────────────────────────────────

// 156-164. Legend crowns — increasingly ornate crowns
// 156. Tongue Twisters — a speech bubble with looping tangled lines
export const IconTongueTwist = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M6 10 H38 a4 4 0 0 1 4 4 V26 a4 4 0 0 1 -4 4 H18 L10 38 V30 H6 a4 4 0 0 1 -4 -4 V14 a4 4 0 0 1 4 -4 Z" fill={color} opacity="0.16" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <path d="M10 19 C14 14, 18 24, 22 19 S30 14, 34 19" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
  </Base>
);

// 157. Word Pairs — two linked rounded rectangles
export const IconWordPairs = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <rect x="4" y="16" width="18" height="16" rx="5" fill={color} opacity="0.22" stroke={color} strokeWidth="2" />
    <rect x="26" y="16" width="18" height="16" rx="5" fill={color} opacity="0.4" stroke={color} strokeWidth="2" />
    <path d="M22 24 H26" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </Base>
);

// 158. Quote Practice — opening quotation marks
export const IconQuotePractice = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <path d="M10 14 C5 16, 4 22, 6 28 C8 26, 11 25, 11 21 C11 18, 9 16, 6 17" fill={color} opacity="0.7" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M28 14 C23 16, 22 22, 24 28 C26 26, 29 25, 29 21 C29 18, 27 16, 24 17" fill={color} opacity="0.45" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
  </Base>
);

// 159. Build Speed — upward step bars
export const IconBuildSpeed = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <rect x="6" y="30" width="8" height="10" rx="1.5" fill={color} opacity="0.35" stroke={color} strokeWidth="1.6" />
    <rect x="18" y="22" width="8" height="18" rx="1.5" fill={color} opacity="0.55" stroke={color} strokeWidth="1.6" />
    <rect x="30" y="12" width="8" height="28" rx="1.5" fill={color} opacity="0.8" stroke={color} strokeWidth="1.6" />
    <path d="M8 28 L18 18 L26 22 L36 8" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
  </Base>
);

// 160. Final Stretch — a finish-line flag, calm rather than dramatic
export const IconFinalStretch = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    <line x1="12" y1="6" x2="12" y2="42" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M12 8 L34 8 L28 14 L34 20 L12 20 Z" fill={color} opacity="0.7" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
  </Base>
);

export const IconLegend1 = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M6 34 L6 18 L14 26 L24 8 L34 26 L42 18 L42 34 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <rect x="6" y="34" width="36" height="6" rx="2" fill={color} opacity="0.6" stroke={color} strokeWidth="1.4" />
    <circle cx="24" cy="8" r="3.5" fill={color} opacity="0.9" />
  </Base>
);

export const IconLegend2 = ({ size = 28, color = "#f43f5e" }) => (
  <Base size={size}>
    <path d="M6 34 L6 18 L14 26 L24 8 L34 26 L42 18 L42 34 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <rect x="6" y="34" width="36" height="6" rx="2" fill={color} opacity="0.6" stroke={color} strokeWidth="1.4" />
    <circle cx="24" cy="8" r="3.5" fill={color} opacity="0.9" />
    <circle cx="6" cy="18" r="2.5" fill={color} opacity="0.7" />
    <circle cx="42" cy="18" r="2.5" fill={color} opacity="0.7" />
  </Base>
);

export const IconLegend3 = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <path d="M4 36 L4 16 L13 26 L24 6 L35 26 L44 16 L44 36 Z" fill={color} opacity="0.22" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <rect x="4" y="36" width="40" height="6" rx="2" fill={color} opacity="0.6" stroke={color} strokeWidth="1.4" />
    <circle cx="24" cy="6" r="4" fill={color} opacity="0.9" />
    <circle cx="4" cy="16" r="3" fill={color} opacity="0.8" />
    <circle cx="44" cy="16" r="3" fill={color} opacity="0.8" />
    <rect x="20" y="38" width="8" height="2" rx="1" fill="#fff" opacity="0.4" />
  </Base>
);

export const IconLegend4 = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <path d="M4 36 L4 14 L13 24 L24 4 L35 24 L44 14 L44 36 Z" fill={color} opacity="0.22" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
    <rect x="4" y="36" width="40" height="7" rx="2" fill={color} opacity="0.6" stroke={color} strokeWidth="1.6" />
    <circle cx="24" cy="4" r="4.5" fill={color} opacity="0.9" />
    <circle cx="4" cy="14" r="3" fill={color} opacity="0.8" />
    <circle cx="44" cy="14" r="3" fill={color} opacity="0.8" />
    <circle cx="14" cy="36" r="2" fill={color} opacity="0.7" />
    <circle cx="34" cy="36" r="2" fill={color} opacity="0.7" />
  </Base>
);

export const IconLegend5 = ({ size = 28, color = "#10b981" }) => (
  <Base size={size}>
    <path d="M4 36 L4 12 L13 22 L24 2 L35 22 L44 12 L44 36 Z" fill={color} opacity="0.22" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
    <rect x="4" y="36" width="40" height="7" rx="2" fill={color} opacity="0.65" stroke={color} strokeWidth="1.8" />
    <circle cx="24" cy="2" r="5" fill={color} opacity="0.95" />
    <circle cx="4" cy="12" r="3.5" fill={color} opacity="0.85" />
    <circle cx="44" cy="12" r="3.5" fill={color} opacity="0.85" />
    {[10,20,28,38].map((x,i)=><circle key={i} cx={x} cy="36" r="1.8" fill={color} opacity="0.6"/>)}
  </Base>
);

export const IconLegend6 = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <path d="M2 38 L2 12 L12 24 L24 2 L36 24 L46 12 L46 38 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
    <rect x="2" y="38" width="44" height="8" rx="3" fill={color} opacity="0.65" stroke={color} strokeWidth="1.8" />
    <circle cx="24" cy="2" r="5" fill={color} opacity="0.95" />
    <circle cx="2" cy="12" r="3.5" fill={color} opacity="0.85" />
    <circle cx="46" cy="12" r="3.5" fill={color} opacity="0.85" />
    <path d="M24 2 L24 0 M21 3 L19 1 M27 3 L29 1" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
  </Base>
);

export const IconLegend7 = ({ size = 28, color = "#8b5cf6" }) => (
  <Base size={size}>
    <path d="M2 38 L2 10 L12 22 L24 2 L36 22 L46 10 L46 38 Z" fill={color} opacity="0.22" stroke={color} strokeWidth="2.6" strokeLinejoin="round" />
    <rect x="2" y="38" width="44" height="8" rx="3" fill={color} opacity="0.7" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="2" r="5.5" fill={color} opacity="0.95" />
    <circle cx="2" cy="10" r="4" fill={color} opacity="0.9" />
    <circle cx="46" cy="10" r="4" fill={color} opacity="0.9" />
    <circle cx="12" cy="38" r="2.5" fill="#fff" opacity="0.4" />
    <circle cx="24" cy="38" r="2.5" fill="#fff" opacity="0.4" />
    <circle cx="36" cy="38" r="2.5" fill="#fff" opacity="0.4" />
    <circle cx="24" cy="2" r="2.5" fill="#fff" opacity="0.6" />
  </Base>
);

export const IconLegend8 = ({ size = 28, color = "#f59e0b" }) => (
  <Base size={size}>
    <path d="M2 38 L2 10 L12 22 L24 2 L36 22 L46 10 L46 38 Z" fill={color} opacity="0.22" stroke={color} strokeWidth="2.6" strokeLinejoin="round" />
    <rect x="2" y="38" width="44" height="8" rx="3" fill={color} opacity="0.7" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="2" r="5.5" fill={color} opacity="0.95" />
    <circle cx="2" cy="10" r="4" fill={color} opacity="0.9" />
    <circle cx="46" cy="10" r="4" fill={color} opacity="0.9" />
    <path d="M6 38 H42" stroke="#fff" strokeWidth="1.4" opacity="0.3" />
    <path d="M20 36 L24 40 L28 36" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    <circle cx="24" cy="2" r="2.5" fill="#fff" opacity="0.7" />
  </Base>
);

export const IconLegend9 = ({ size = 28, color = "#c084fc" }) => (
  <Base size={size}>
    <path d="M2 38 L2 8 L12 20 L24 0 L36 20 L46 8 L46 38 Z" fill={color} opacity="0.22" stroke={color} strokeWidth="2.8" strokeLinejoin="round" />
    <rect x="2" y="38" width="44" height="8" rx="3" fill={color} opacity="0.75" stroke={color} strokeWidth="2.2" />
    <circle cx="24" cy="0" r="6" fill={color} opacity="0.95" />
    <circle cx="2" cy="8" r="4.5" fill={color} opacity="0.9" />
    <circle cx="46" cy="8" r="4.5" fill={color} opacity="0.9" />
    <path d="M8 38 H40" stroke="#fff" strokeWidth="1.6" opacity="0.35" />
    <circle cx="14" cy="40" r="2" fill="#fff" opacity="0.5" />
    <circle cx="24" cy="40" r="2" fill="#fff" opacity="0.5" />
    <circle cx="34" cy="40" r="2" fill="#fff" opacity="0.5" />
  </Base>
);

// 165. True Final Boss — a dragon head breathing fire on a keyboard
export const IconFinalBoss = ({ size = 28, color = "#dc2626" }) => (
  <Base size={size}>
    <path d="M4 32 C4 20 10 10 20 8 C26 6 32 10 34 16 C36 10 42 8 44 14 C46 20 42 28 36 30 L30 32 L28 40 L24 34 L20 40 L18 32 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="14" cy="18" r="3" fill={color} opacity="0.4" />
    <circle cx="14" cy="18" r="1.5" fill={color} opacity="0.95" />
    <circle cx="30" cy="14" r="2.5" fill={color} opacity="0.4" />
    <circle cx="30" cy="14" r="1.2" fill={color} opacity="0.95" />
    <path d="M18 32 L10 38 L14 44 M24 34 L22 46 M28 32 L32 44" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <path d="M36 24 L44 20 L42 28 L46 24" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
    <path d="M20 22 L26 18 M22 26 L30 22" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
  </Base>
);

export const LEGEND_TIER_ICONS = {
  156: IconTongueTwist, 157: IconWordPairs, 158: IconQuotePractice, 159: IconBuildSpeed, 160: IconFinalStretch,
  161: IconLegend1, 162: IconLegend2, 163: IconLegend3, 164: IconLegend4, 165: IconLegend5,
  166: IconLegend6, 167: IconLegend7, 168: IconLegend8, 169: IconLegend9, 170: IconFinalBoss,
};
