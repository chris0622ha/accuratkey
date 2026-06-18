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

// 5. Speed Seeker — a rocket launching with layered exhaust flame and stars
export const IconRocket = ({ size = 28, color = "#ef4444" }) => (
  <Base size={size}>
    <circle cx="24" cy="10" r="1" fill="#fff" opacity="0.6" />
    <circle cx="38" cy="16" r="0.8" fill="#fff" opacity="0.5" />
    <circle cx="10" cy="14" r="0.8" fill="#fff" opacity="0.5" />
    <path d="M24 4 C29 9 31 18 29.5 28 L18.5 28 C17 18 19 9 24 4 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.4" />
    <path d="M21 14 Q24 11 27 14 Q24 17 21 14 Z" fill="#bae6fd" opacity="0.6" />
    <path d="M17.5 26 L9 37 L17.5 33.5 Z" fill={color} opacity="0.6" />
    <path d="M30.5 26 L39 37 L30.5 33.5 Z" fill={color} opacity="0.6" />
    <path d="M19.5 28 L24 44 L28.5 28 Z" fill="#fbbf24" opacity="0.55" />
    <path d="M21.3 28 L24 39 L26.7 28 Z" fill="#fde047" opacity="0.9" />
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

// 9. The Zone — a focused lightning bolt inside concentric energy rings with corner sparks
export const IconZone = ({ size = 28, color = "#a855f7" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="21" stroke={color} strokeWidth="1" opacity="0.2" fill="none" />
    <circle cx="24" cy="24" r="15" stroke={color} strokeWidth="1.2" opacity="0.35" fill="none" strokeDasharray="3 3" />
    <polygon points="27,6 13,26 22,26 18,42 35,20 24,20" fill={color} opacity="0.9" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    <circle cx="8" cy="10" r="1.3" fill="#fff" opacity="0.6" />
    <circle cx="40" cy="36" r="1.3" fill="#fff" opacity="0.6" />
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

// 13. Lightning Fingers — a double lightning bolt with motion trail and bright core
export const IconLightning = ({ size = 28, color = "#facc15" }) => (
  <Base size={size}>
    <polygon points="29,2 14,24 22,24 19,46" fill={color} opacity="0.3" />
    <polygon points="27,4 13,25 21,25 18,44 35,21 25,21" fill={color} />
    <polygon points="27,4 19,17 25,17 22,28" fill="#fff" opacity="0.55" />
    <path d="M4 14 L10 16 M4 20 L9 20" stroke={color} strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
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
    <circle cx="27" cy="9" r="4" fill={color} opacity="0.9" />
    <path d="M27 13 L23 24 L29 22 L33 32" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M23 24 L13 28" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M29 22 L37 18" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M33 32 L29 44" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M23 24 L18 40" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M5 16 H14 M3 22 H12 M5 28 H14" stroke={color} strokeWidth="1.6" opacity="0.4" strokeLinecap="round" />
  </Base>
);

// 17. Tech Talk — an open laptop with code brackets glowing on screen
export const IconLaptop = ({ size = 28, color = "#34d399" }) => (
  <Base size={size}>
    <rect x="8" y="9" width="32" height="21" rx="2" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
    <path d="M14 38 L17 30 H31 L34 38 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="10" y1="38" x2="38" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <text x="24" y="23" textAnchor="middle" fill={color} fontSize="11" fontWeight="bold" fontFamily="monospace">{"</>"}</text>
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

// 21. Wild Words — a stylized fox face with alert ears and a pointed snout
export const IconFox = ({ size = 28, color = "#fbbf24" }) => (
  <Base size={size}>
    <path d="M10 8 L19 19 L8 22 Z" fill={color} opacity="0.85" />
    <path d="M38 8 L29 19 L40 22 Z" fill={color} opacity="0.85" />
    <path d="M10 22 C10 14 16 10 24 10 C32 10 38 14 38 22 C38 32 32 38 24 40 C16 38 10 32 10 22 Z" fill={color} opacity="0.9" />
    <path d="M19 28 L24 36 L29 28 Z" fill="#fff" opacity="0.8" />
    <circle cx="18" cy="22" r="1.6" fill="#1e1e30" />
    <circle cx="30" cy="22" r="1.6" fill="#1e1e30" />
    <path d="M24 28 L24 31" stroke="#1e1e30" strokeWidth="1.4" opacity="0.6" />
  </Base>
);

// 22. Around the World — a globe with longitude/latitude lines and a landmass
export const IconGlobe = ({ size = 28, color = "#2dd4bf" }) => (
  <Base size={size}>
    <circle cx="24" cy="24" r="18" fill={color} opacity="0.1" stroke={color} strokeWidth="2" />
    <ellipse cx="24" cy="24" rx="8" ry="18" stroke={color} strokeWidth="1.2" opacity="0.5" fill="none" />
    <line x1="6" y1="24" x2="42" y2="24" stroke={color} strokeWidth="1.2" opacity="0.5" />
    <path d="M6 17 Q24 12 42 17" stroke={color} strokeWidth="1" opacity="0.35" fill="none" />
    <path d="M6 31 Q24 36 42 31" stroke={color} strokeWidth="1" opacity="0.35" fill="none" />
    <path d="M16 14 C20 16 18 20 14 20 C12 24 18 26 16 30 C22 32 26 26 28 30" fill={color} opacity="0.55" stroke="none" />
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

// 29. Code Words — a terminal window with a prompt and a cursor block
export const IconTerminal = ({ size = 28, color = "#06b6d4" }) => (
  <Base size={size}>
    <rect x="6" y="10" width="36" height="28" rx="3" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
    <line x1="6" y1="17" x2="42" y2="17" stroke={color} strokeWidth="1.6" opacity="0.6" />
    <circle cx="11" cy="13.5" r="1.2" fill={color} opacity="0.7" />
    <circle cx="15" cy="13.5" r="1.2" fill={color} opacity="0.5" />
    <text x="11" y="29" fill={color} fontSize="13" fontFamily="monospace" opacity="0.9">{">"}</text>
    <rect x="20" y="24" width="8" height="3" fill={color} opacity="0.8" />
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
