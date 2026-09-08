const { FONT_MONO, FONT_SANS, esc, clamp, languageColor } = require('../theme');

const W = 434;
const H = 300;

/**
 * WakaTime card: what the last 7 days of keystrokes actually looked like.
 * Rendered static on purpose: browsers park SVG-in-<img> animations at frame 0
 * while the image is off-screen, which would blank out the bars below the fold.
 */
function wakatimeCard(theme, waka) {
  const barX = 132;
  const barW = W - barX - 74;
  const rowY = 108;
  const rowGap = 26;

  const languages = waka.languages.slice(0, 5);
  const max = Math.max(...languages.map(l => l.percent), 1);

  const rows = languages
    .map((lang, i) => {
      const width = Math.max(4, (lang.percent / max) * barW);
      const color = languageColor(lang.name, i);
      const y = rowY + i * rowGap;
      return `
    <g>
      <text class="row-label" x="24" y="${y + 4}">${esc(clamp(lang.name, 13))}</text>
      <rect x="${barX}" y="${y - 6}" width="${barW}" height="9" rx="4.5" fill="${theme.surfaceAlt}"/>
      <rect x="${barX}" y="${y - 6}" width="${width.toFixed(1)}" height="9" rx="4.5" fill="${color}"/>
      <text class="row-value" x="${W - 24}" y="${y + 4}" text-anchor="end">${lang.percent.toFixed(1)}%</text>
    </g>`;
    })
    .join('');


  // The AI/human split is the single most 2026 stat on this profile, so it gets
  // its own strip instead of being buried in a list.
  const ai = waka.categories.find(c => /ai/i.test(c.name))?.percent ?? 0;
  const aiW = Math.max(0, Math.min(100, ai)) / 100 * (W - 48);

  const editors = waka.editors
    .slice(0, 3)
    .map(e => `${e.name} ${Math.round(e.percent)}%`)
    .join('  ·  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="WakaTime coding activity, last 7 days">
  <title>WakaTime · last 7 days</title>
  <style>
    .card-title { font-family: ${FONT_MONO}; font-size: 13px; font-weight: 700; fill: ${theme.textStrong}; letter-spacing: 1.6px; }
    .card-sub   { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.faint}; letter-spacing: 0.5px; }
    .big        { font-family: ${FONT_MONO}; font-size: 26px; font-weight: 700; fill: ${theme.accent}; }
    .big-label  { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.muted}; }
    .row-label  { font-family: ${FONT_SANS}; font-size: 11.5px; font-weight: 500; fill: ${theme.text}; }
    .row-value  { font-family: ${FONT_MONO}; font-size: 11px; fill: ${theme.muted}; }
    .foot       { font-family: ${FONT_SANS}; font-size: 10px; fill: ${theme.faint}; }
  </style>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${theme.surface}" stroke="${theme.border}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="3" rx="1.5" fill="${theme.accent}" opacity="0.85"/>

  <text class="card-title" x="24" y="34">WAKATIME</text>
  <text class="card-sub" x="24" y="50">measured, not estimated · last 7 days</text>

  <text class="big" x="24" y="82">${esc(waka.weeklyTotal)}</text>
  <text class="big-label" x="${W - 24}" y="82" text-anchor="end">${esc(waka.dailyAverage)} / day</text>

  ${rows}

  <g>
    <text class="foot" x="24" y="${H - 64}">AI-assisted coding</text>
    <text class="foot" x="${W - 24}" y="${H - 64}" text-anchor="end">${ai.toFixed(0)}%</text>
    <rect x="24" y="${H - 56}" width="${W - 48}" height="6" rx="3" fill="${theme.surfaceAlt}"/>
    <rect x="24" y="${H - 56}" width="${aiW.toFixed(1)}" height="6" rx="3" fill="${theme.accent2}"/>
  </g>

  <line x1="24" y1="${H - 40}" x2="${W - 24}" y2="${H - 40}" stroke="${theme.border}"/>
  <text class="foot" x="24" y="${H - 20}">${esc(editors)}</text>
  <text class="foot" x="${W - 24}" y="${H - 20}" text-anchor="end">all time: ${esc(waka.allTimeText)}</text>
</svg>`;
}

module.exports = { wakatimeCard, WAKATIME_SIZE: { width: W, height: H } };
