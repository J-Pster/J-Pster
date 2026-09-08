const { FONT_MONO, FONT_SANS, esc } = require('../theme');

const W = 434;
const H = 300;

/**
 * GitHub card. Same footprint as the WakaTime card so the two sit
 * side by side without the README needing a table hack.
 */
function statsCard(theme, gh) {
  const cells = [
    { value: gh.commits.toLocaleString('en-US'), label: 'commits', accent: theme.accent },
    { value: gh.pullRequests.toLocaleString('en-US'), label: 'pull requests', accent: theme.accent2 },
    { value: gh.repositoriesContributedTo.toLocaleString('en-US'), label: 'repos touched', accent: theme.accent3 },
    { value: gh.issues.toLocaleString('en-US'), label: 'issues', accent: theme.warn },
  ];

  const colW = (W - 48) / 2;
  const grid = cells
    .map((cell, i) => {
      const x = 24 + (i % 2) * colW;
      const y = 110 + Math.floor(i / 2) * 70;
      // Outer group carries the layout transform, inner group carries the CSS
      // animation: a CSS transform would otherwise override the attribute.
      return `
    <g transform="translate(${x}, ${y})">
      <g>
        <rect x="0" y="-2" width="2" height="34" rx="1" fill="${cell.accent}" opacity="0.8"/>
        <text class="cell-value" x="14" y="18">${esc(cell.value)}</text>
        <text class="cell-label" x="14" y="33">${esc(cell.label)}</text>
      </g>
    </g>`;
    })
    .join('');


  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub activity over the last 12 months">
  <title>GitHub · last 12 months</title>
  <style>
    .card-title { font-family: ${FONT_MONO}; font-size: 13px; font-weight: 700; fill: ${theme.textStrong}; letter-spacing: 1.6px; }
    .card-sub   { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.faint}; letter-spacing: 0.5px; }
    .big        { font-family: ${FONT_MONO}; font-size: 26px; font-weight: 700; fill: ${theme.accent2}; }
    .big-label  { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.muted}; }
    .cell-value { font-family: ${FONT_MONO}; font-size: 19px; font-weight: 700; fill: ${theme.text}; }
    .cell-label { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.faint}; }
    .foot       { font-family: ${FONT_SANS}; font-size: 10px; fill: ${theme.faint}; }
    .foot-b     { font-family: ${FONT_MONO}; font-size: 10px; font-weight: 700; fill: ${theme.text}; }
  </style>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${theme.surface}" stroke="${theme.border}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="3" rx="1.5" fill="${theme.accent2}" opacity="0.85"/>

  <text class="card-title" x="24" y="34">GITHUB</text>
  <text class="card-sub" x="24" y="50">rolling 12 months of activity</text>

  <text class="big" x="24" y="82">${gh.totalContributions.toLocaleString('en-US')}</text>
  <text class="big-label" x="${W - 24}" y="82" text-anchor="end">contributions</text>

  ${grid}

  <line x1="24" y1="${H - 52}" x2="${W - 24}" y2="${H - 52}" stroke="${theme.border}"/>
  <text class="foot" x="24" y="${H - 32}">longest streak</text>
  <text class="foot-b" x="24" y="${H - 16}">${gh.streak.longest} days</text>
  <text class="foot" x="${W / 2}" y="${H - 32}" text-anchor="middle">active days</text>
  <text class="foot-b" x="${W / 2}" y="${H - 16}" text-anchor="middle">${gh.streak.activeDays}</text>
  <text class="foot" x="${W - 24}" y="${H - 32}" text-anchor="end">stars</text>
  <text class="foot-b" x="${W - 24}" y="${H - 16}" text-anchor="end">${gh.stars}</text>
</svg>`;
}

module.exports = { statsCard, STATS_SIZE: { width: W, height: H } };
