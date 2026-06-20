import { useState, useRef } from "react";

// ─── Milestone detection ──────────────────────────────────────────────────
// Given when a profile was created, figures out which milestones (if any)
// have actually occurred, and how many days old the most recent one is —
// used to decide whether to show a "you just hit a milestone!" prompt
// without making the person hunt for it on the exact calendar day.
export function getProfileMilestones(createdAtDate) {
  if (!createdAtDate) return [];
  const now = new Date();
  const created = new Date(createdAtDate);
  const msPerDay = 86400000;
  const daysSince = Math.floor((now - created) / msPerDay);

  const milestones = [];
  // Monthly: every 30-ish days, using actual month math so "1 month" lands
  // on the same day-of-month rather than a flat 30 days every time.
  let monthsElapsed = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  if (now.getDate() < created.getDate()) monthsElapsed--;
  if (monthsElapsed >= 1) {
    milestones.push({ type: "month", count: monthsElapsed, label: `${monthsElapsed} Month${monthsElapsed > 1 ? "s" : ""}` });
  }
  const yearsElapsed = Math.floor(monthsElapsed / 12);
  if (yearsElapsed >= 1) {
    milestones.push({ type: "year", count: yearsElapsed, label: `${yearsElapsed} Year${yearsElapsed > 1 ? "s" : ""}` });
  }
  if (yearsElapsed >= 10) {
    const decades = Math.floor(yearsElapsed / 10);
    milestones.push({ type: "decade", count: decades, label: `${decades * 10} Years` });
  }
  return { milestones, daysSince };
}

// Returns the single most significant currently-available milestone (decade
// > year > month), since showing all three at once for a 2-year-old profile
// would be redundant - the certificate for "2 Years" already implies the
// month milestones happened along the way.
export function getTopMilestone(createdAtDate) {
  const { milestones } = getProfileMilestones(createdAtDate);
  if (!milestones.length) return null;
  return milestones.find(m => m.type === "decade")
    || milestones.find(m => m.type === "year")
    || milestones.find(m => m.type === "month");
}

// ─── Certificate rendering ─────────────────────────────────────────────────
// Renders entirely client-side to a canvas, then exports as a PNG - no
// server round-trip, no extra dependency, works offline once the page is
// loaded. 1600x1000 at devicePixelRatio scaling for a genuinely sharp
// download rather than a blurry low-res canvas upscaled by CSS.
async function renderCertificateCanvas({ profile, milestoneLabel, kind, accuratKeyColor = "#7c6af7" }) {
  const W = 1600, H = 1000;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0a0a0f");
  bgGrad.addColorStop(1, "#13101f");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative border
  ctx.strokeStyle = accuratKeyColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = accuratKeyColor + "55";
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 56, W - 112, H - 112);

  // Corner flourishes
  const cornerSize = 36;
  ctx.strokeStyle = accuratKeyColor;
  ctx.lineWidth = 3;
  [[40, 40, 1, 1], [W - 40, 40, -1, 1], [40, H - 40, 1, -1], [W - 40, H - 40, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + cornerSize * dy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerSize * dx, y);
    ctx.stroke();
  });

  // Brand
  ctx.textAlign = "center";
  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#e0e0ff";
  ctx.fillText("Accurat", W / 2 - 60, 130);
  ctx.fillStyle = accuratKeyColor;
  ctx.fillText("Key", W / 2 + 70, 130);

  // Title
  ctx.font = "900 56px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#fff";
  ctx.fillText(kind === "birthday" ? "Birthday Certificate" : "Certificate of Achievement", W / 2, 220);

  // Milestone label (big)
  ctx.font = "900 90px 'JetBrains Mono', monospace";
  const grad = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
  grad.addColorStop(0, accuratKeyColor);
  grad.addColorStop(1, "#a78bfa");
  ctx.fillStyle = grad;
  ctx.fillText(milestoneLabel, W / 2, 350);

  // Subtitle
  ctx.font = "500 26px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(
    kind === "birthday" ? `Happy Birthday, ${profile.name}!` : `${profile.name} has been training for ${milestoneLabel}`,
    W / 2, 410
  );

  // Stats grid
  const stats = [
    { label: "Current Level", value: String(profile.highestUnlocked || profile.currentLevel || 1) },
    { label: "Levels Completed", value: String(Math.max(0, (profile.highestUnlocked || 1) - 1)) },
    { label: "Best WPM", value: String(profile.bestWpm || 0) },
    { label: "Avg Accuracy", value: `${profile.avgAccuracy || 0}%` },
    { label: "Total Sessions", value: String(profile.totalSessions || 0) },
    { label: "Current Streak", value: `${profile.streak || 0} days` },
  ];
  const colW = (W - 240) / 3;
  const rowH = 140;
  const startY = 500;
  stats.forEach((s, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 120 + col * colW + colW / 2;
    const y = startY + row * rowH;
    ctx.font = "900 48px 'JetBrains Mono', monospace";
    ctx.fillStyle = accuratKeyColor;
    ctx.fillText(s.value, x, y);
    ctx.font = "500 18px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(s.label.toUpperCase(), x, y + 36);
  });

  // Footer date
  ctx.font = "400 18px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#4b5563";
  ctx.fillText(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), W / 2, H - 80);

  return canvas;
}

export async function downloadCertificate({ profile, milestoneLabel, kind = "achievement" }) {
  const canvas = await renderCertificateCanvas({ profile, milestoneLabel, kind });
  const dataUrl = canvas.toDataURL("image/png", 1.0);
  const link = document.createElement("a");
  const safeName = (profile.name || "player").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const safeMilestone = milestoneLabel.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  link.download = `accuratkey_${kind}_${safeName}_${safeMilestone}.png`;
  link.href = dataUrl;
  link.click();
}

// ─── UI: certificate prompt + picker ───────────────────────────────────────
// Shown when a real milestone is detected, or available on-demand from a
// profile's settings so someone can grab a certificate for any milestone
// they've already passed, not just the literal day it happened.
export function CertificateModal({ profile, onClose, T }) {
  const [generating, setGenerating] = useState(false);
  const { milestones } = getProfileMilestones(profile?.createdAt?.toDate ? profile.createdAt.toDate() : profile?.createdAt);
  const isBirthdayToday = (() => {
    if (!profile?.birthday) return false;
    const today = new Date();
    const bday = new Date(profile.birthday);
    return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
  })();

  const allOptions = [
    ...(isBirthdayToday ? [{ key: "birthday", label: "Birthday", kind: "birthday" }] : []),
    ...milestones.map(m => ({ key: m.type + m.count, label: m.label, kind: "achievement" })),
  ];

  const handleDownload = async (opt) => {
    setGenerating(true);
    try {
      await downloadCertificate({ profile, milestoneLabel: opt.label, kind: opt.kind });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T?.card || "#13131f", border: `1px solid ${T?.border || "#1e1e30"}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: T?.text || "#e0e0ff", fontWeight: 800, fontSize: 16 }}>🏆 Certificates</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T?.faint || "#555", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {allOptions.length === 0 ? (
          <div style={{ color: T?.muted || "#888", fontSize: 13, textAlign: "center", padding: "20px 10px" }}>
            No milestones yet — keep playing! Your first certificate unlocks after one month on this profile.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {allOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => handleDownload(opt)}
                disabled={generating}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: 10, border: `1px solid ${T?.border || "#2a2a3e"}`,
                  background: "transparent", color: T?.text || "#e0e0ff", fontSize: 14, fontWeight: 700,
                  cursor: generating ? "default" : "pointer", fontFamily: "inherit", opacity: generating ? 0.6 : 1,
                }}
              >
                <span>{opt.kind === "birthday" ? "🎂" : "🏆"} {opt.label}</span>
                <span style={{ fontSize: 12, color: T?.purple || "#7c6af7" }}>Download</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
