const { FONT_MONO, FONT_SANS, esc } = require('../theme');

const W = 880;
const H = 212;
const CELL = 11;
const GAP = 3;
const PITCH = CELL + GAP;
const GRID_X = 58;
const GRID_Y = 84;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Contribution heatmap rendered from the real GraphQL calendar instead of
 * proxying a third-party image.
 */
function heatmapCard(theme, gh) {
  const weeks = gh.weeks.slice(-53);
  const counts = weeks.flatMap(w => w.contributionDays.map(d => d.contributionCount));
  const peak = Math.max(...counts, 1);

  const level = count => {
    if (count === 0) return 0;
    const ratio = count / peak;
    if (ratio <= 0.15) return 1;
    if (ratio <= 0.35) return 2;
    if (ratio <= 0.65) return 3;
    return 4;
  };

  const cells = weeks
    .map((week, wi) =>
      week.contributionDays
        .map(day => {
          const x = GRID_X + wi * PITCH;
          const y = GRID_Y + day.weekday * PITCH;
          const lvl = level(day.contributionCount);
          return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${theme.heat[lvl]}"><title>${esc(day.date)}: ${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'}</title></rect>`;
        })
        .join('')
    )
    .join('');

  // One label per month, placed on the first week that opens that month.
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.contributionDays[0];
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month !== lastMonth && wi < weeks.length - 2) {
      lastMonth = month;
      monthLabels.push(
        `<text class="axis" x="${GRID_X + wi * PITCH}" y="${GRID_Y - 10}">${MONTHS[month]}</text>`
      );
    }
  });

  const weekdayLabels = [
    [1, 'Mon'],
    [3, 'Wed'],
    [5, 'Fri'],
  ]
    .map(
      ([row, label]) =>
        `<text class="axis" x="${GRID_X - 10}" y="${GRID_Y + row * PITCH + 9}" text-anchor="end">${label}</text>`
    )
    .join('');

  const legend = theme.heat
    .map(
      (color, i) =>
        `<rect x="${W - 132 + i * (CELL + 3)}" y="${H - 32}" width="${CELL}" height="${CELL}" rx="2.5" fill="${color}"/>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${gh.totalContributions} contributions in the last year">
  <title>${gh.totalContributions} contributions in the last 12 months</title>
  <style>
    .card-title { font-family: ${FONT_MONO}; font-size: 13px; font-weight: 700; fill: ${theme.textStrong}; letter-spacing: 1.6px; }
    .card-sub   { font-family: ${FONT_SANS}; font-size: 10.5px; fill: ${theme.faint}; letter-spacing: 0.5px; }
    .count      { font-family: ${FONT_MONO}; font-size: 22px; font-weight: 700; fill: ${theme.accent3}; }
    .axis       { font-family: ${FONT_SANS}; font-size: 9.5px; fill: ${theme.faint}; }
    .foot       { font-family: ${FONT_SANS}; font-size: 10px; fill: ${theme.faint}; }
  </style>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${theme.surface}" stroke="${theme.border}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="3" rx="1.5" fill="${theme.accent3}" opacity="0.85"/>

  <text class="card-title" x="24" y="36">CONTRIBUTION HEATMAP</text>
  <text class="card-sub" x="24" y="52">drawn from the GraphQL contribution calendar</text>
  <text class="count" x="${W - 24}" y="42" text-anchor="end">${gh.totalContributions.toLocaleString('en-US')}</text>

  ${monthLabels.join('')}
  ${weekdayLabels}
  ${cells}

  <text class="foot" x="24" y="${H - 22}">peak day: ${peak} contributions · ${gh.streak.activeDays} active days · ${gh.repositoriesContributedTo} repositories touched</text>
  <text class="foot" x="${W - 148}" y="${H - 22}" text-anchor="end">less</text>
  ${legend}
  <text class="foot" x="${W - 24}" y="${H - 22}" text-anchor="end">more</text>
</svg>`;
}

module.exports = { heatmapCard, HEATMAP_SIZE: { width: W, height: H } };
