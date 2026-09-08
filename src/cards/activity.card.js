const { FONT_MONO, FONT_SANS, esc, clamp, languageColor } = require('../theme');

const W = 880;
const H = 300;
const PANEL = 428;
const RIGHT = W - PANEL;

/**
 * WakaTime and GitHub side by side in a single SVG.
 *
 * They were two separate images at first, but the profile README column is
 * narrower than their combined width, so the browser wrapped them into a
 * stack. Rendering one image instead means the pair scales down together and
 * stays aligned at any column width.
 *
 * Nothing here is animated: browsers park SVG-in-<img> animations at frame 0
 * while the image is off-screen, and this card sits below the fold, so an
 * entrance animation would render as a blank panel.
 */
function activityCard(theme, { waka, gh }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="WakaTime activity for the last 7 days and GitHub activity for the last 12 months">
  <title>Coding activity · WakaTime last 7 days and GitHub last 12 months</title>
  <style>
    .card-title { font-family: ${FONT_MONO}; font-size: 13px; font-weight: 700; fill: ${theme.textStrong}; letter-spacing: 1.6px; }
    .card-sub   { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.faint}; letter-spacing: 0.5px; }
    .big-w      { font-family: ${FONT_MONO}; font-size: 26px; font-weight: 700; fill: ${theme.accent}; }
    .big-g      { font-family: ${FONT_MONO}; font-size: 26px; font-weight: 700; fill: ${theme.accent2}; }
    .big-label  { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.muted}; }
    .row-label  { font-family: ${FONT_SANS}; font-size: 11.5px; font-weight: 500; fill: ${theme.text}; }
    .row-value  { font-family: ${FONT_MONO}; font-size: 11px; fill: ${theme.muted}; }
    .cell-value { font-family: ${FONT_MONO}; font-size: 19px; font-weight: 700; fill: ${theme.text}; }
    .cell-label { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.faint}; }
    .foot       { font-family: ${FONT_SANS}; font-size: 10px; fill: ${theme.faint}; }
    .foot-b     { font-family: ${FONT_MONO}; font-size: 10px; font-weight: 700; fill: ${theme.text}; }
  </style>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${theme.surface}" stroke="${theme.border}"/>
  <rect x="0.5" y="0.5" width="${PANEL}" height="3" rx="1.5" fill="${theme.accent}" opacity="0.85"/>
  <rect x="${RIGHT}" y="0.5" width="${PANEL - 1}" height="3" rx="1.5" fill="${theme.accent2}" opacity="0.85"/>
  <line x1="${W / 2}" y1="28" x2="${W / 2}" y2="${H - 28}" stroke="${theme.border}"/>

  ${wakaPanel(theme, waka, 0)}
  ${githubPanel(theme, gh, RIGHT)}
</svg>`;
}

function wakaPanel(theme, waka, ox) {
  const barX = ox + 132;
  const barW = PANEL - 132 - 74;
  const rowY = 112;
  const rowGap = 26;

  const languages = waka.languages.slice(0, 5);
  const max = Math.max(...languages.map(l => l.percent), 1);

  const rows = languages
    .map((lang, i) => {
      const width = Math.max(4, (lang.percent / max) * barW);
      const y = rowY + i * rowGap;
      return `
    <g>
      <text class="row-label" x="${ox + 24}" y="${y + 4}">${esc(clamp(lang.name, 13))}</text>
      <rect x="${barX}" y="${y - 6}" width="${barW}" height="9" rx="4.5" fill="${theme.surfaceAlt}"/>
      <rect x="${barX}" y="${y - 6}" width="${width.toFixed(1)}" height="9" rx="4.5" fill="${languageColor(lang.name, i)}"/>
      <text class="row-value" x="${ox + PANEL - 24}" y="${y + 4}" text-anchor="end">${lang.percent.toFixed(1)}%</text>
    </g>`;
    })
    .join('');

  // The AI/human split is the most telling number on this card, so it gets its
  // own strip rather than being buried in a category list.
  const ai = waka.categories.find(c => /ai/i.test(c.name))?.percent ?? 0;
  const aiW = (Math.max(0, Math.min(100, ai)) / 100) * (PANEL - 48);

  const editors = waka.editors
    .slice(0, 3)
    .map(e => `${e.name} ${Math.round(e.percent)}%`)
    .join('  ·  ');

  return `
  <text class="card-title" x="${ox + 24}" y="38">WAKATIME</text>
  <text class="card-sub" x="${ox + 24}" y="54">measured, not estimated · last 7 days</text>
  <text class="big-w" x="${ox + 24}" y="86">${esc(waka.weeklyTotal)}</text>
  <text class="big-label" x="${ox + PANEL - 24}" y="86" text-anchor="end">${esc(waka.dailyAverage)} / day</text>
  ${rows}
  <text class="foot" x="${ox + 24}" y="${H - 62}">AI-assisted coding</text>
  <text class="foot" x="${ox + PANEL - 24}" y="${H - 62}" text-anchor="end">${ai.toFixed(0)}%</text>
  <rect x="${ox + 24}" y="${H - 54}" width="${PANEL - 48}" height="6" rx="3" fill="${theme.surfaceAlt}"/>
  <rect x="${ox + 24}" y="${H - 54}" width="${aiW.toFixed(1)}" height="6" rx="3" fill="${theme.accent2}"/>
  <line x1="${ox + 24}" y1="${H - 38}" x2="${ox + PANEL - 24}" y2="${H - 38}" stroke="${theme.border}"/>
  <text class="foot" x="${ox + 24}" y="${H - 18}">${esc(editors)}</text>
  <text class="foot" x="${ox + PANEL - 24}" y="${H - 18}" text-anchor="end">all time: ${esc(waka.allTimeText)}</text>`;
}

function githubPanel(theme, gh, ox) {
  const cells = [
    { value: gh.commits, label: 'commits', accent: theme.accent },
    { value: gh.pullRequests, label: 'pull requests', accent: theme.accent2 },
    { value: gh.repositoriesContributedTo, label: 'repos touched', accent: theme.accent3 },
    { value: gh.issues, label: 'issues', accent: theme.warn },
  ];

  const colW = (PANEL - 48) / 2;
  const grid = cells
    .map((cell, i) => {
      const x = ox + 24 + (i % 2) * colW;
      const y = 112 + Math.floor(i / 2) * 66;
      return `
    <g transform="translate(${x}, ${y})">
      <rect x="0" y="-2" width="2" height="34" rx="1" fill="${cell.accent}" opacity="0.8"/>
      <text class="cell-value" x="14" y="18">${cell.value.toLocaleString('en-US')}</text>
      <text class="cell-label" x="14" y="33">${esc(cell.label)}</text>
    </g>`;
    })
    .join('');

  const footers = [
    { label: 'longest streak', value: `${gh.streak.longest} days`, anchor: 'start', x: ox + 24 },
    { label: 'active days', value: `${gh.streak.activeDays}`, anchor: 'middle', x: ox + PANEL / 2 },
    { label: 'stars', value: `${gh.stars}`, anchor: 'end', x: ox + PANEL - 24 },
  ]
    .map(
      f => `
  <text class="foot" x="${f.x}" y="${H - 40}" text-anchor="${f.anchor}">${esc(f.label)}</text>
  <text class="foot-b" x="${f.x}" y="${H - 22}" text-anchor="${f.anchor}">${esc(f.value)}</text>`
    )
    .join('');

  return `
  <text class="card-title" x="${ox + 24}" y="38">GITHUB</text>
  <text class="card-sub" x="${ox + 24}" y="54">rolling 12 months of activity</text>
  <text class="big-g" x="${ox + 24}" y="86">${gh.totalContributions.toLocaleString('en-US')}</text>
  <text class="big-label" x="${ox + PANEL - 24}" y="86" text-anchor="end">contributions</text>
  ${grid}
  <line x1="${ox + 24}" y1="${H - 58}" x2="${ox + PANEL - 24}" y2="${H - 58}" stroke="${theme.border}"/>
  ${footers}`;
}

module.exports = { activityCard, ACTIVITY_SIZE: { width: W, height: H } };
