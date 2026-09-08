/**
 * Offline smoke test: renders every card against fixture data and asserts the
 * output is well-formed SVG. Runs without network access or API keys, so the
 * layout can be checked before spending a real API round trip.
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { THEMES } = require('../src/theme');
const { heroCard } = require('../src/cards/hero.card');
const { wakatimeCard } = require('../src/cards/wakatime.card');
const { statsCard } = require('../src/cards/stats.card');
const { heatmapCard } = require('../src/cards/heatmap.card');

const waka = {
  allTimeText: '1,695 hrs 25 mins',
  allTimeHours: 1695,
  rangeText: 'Sun Jan 11th 2026',
  dailyAverage: '8 hrs 52 mins',
  weeklyTotal: '62 hrs 4 mins',
  languages: [
    { name: 'TypeScript', percent: 24.11, text: '17 hrs 58 mins' },
    { name: 'JSON', percent: 14.97, text: '11 hrs 9 mins' },
    { name: 'Markdown', percent: 13.66, text: '10 hrs 10 mins' },
    { name: 'Bash', percent: 6.52, text: '4 hrs 51 mins' },
    { name: 'HTML', percent: 6.41, text: '4 hrs 46 mins' },
  ],
  editors: [
    { name: 'VS Code', percent: 55.25 },
    { name: 'Claude Code', percent: 44.32 },
    { name: 'Chrome', percent: 0.43 },
  ],
  categories: [
    { name: 'AI Coding', percent: 74.33 },
    { name: 'Coding', percent: 22.05 },
  ],
};

const weeks = Array.from({ length: 53 }, (_, w) => ({
  contributionDays: Array.from({ length: 7 }, (_, d) => ({
    date: new Date(Date.UTC(2025, 8, 8 + w * 7 + d)).toISOString().slice(0, 10),
    weekday: d,
    contributionCount: (w * 7 + d) % 17,
  })),
}));

const gh = {
  login: 'J-Pster',
  followers: 97,
  totalContributions: 4387,
  commits: 81,
  pullRequests: 7,
  issues: 7,
  reviews: 3,
  repositoriesContributedTo: 12,
  publicRepos: 36,
  stars: 317,
  pinned: [],
  weeks,
  streak: { current: 4, longest: 61, activeDays: 288 },
};

const cards = [
  ['hero', heroCard, { totalContributions: gh.totalContributions, stars: gh.stars, wakaHours: waka.allTimeHours }],
  ['wakatime', wakatimeCard, waka],
  ['stats', statsCard, gh],
  ['heatmap', heatmapCard, gh],
];

const outDir = process.env.VALIDATE_OUT_DIR;
if (outDir) fs.mkdirSync(outDir, { recursive: true });

let rendered = 0;

for (const [name, render, payload] of cards) {
  for (const theme of Object.values(THEMES)) {
    const svg = render(theme, payload);

    assert.ok(svg.startsWith('<svg '), `${name}/${theme.id}: missing <svg> root`);
    assert.ok(svg.trimEnd().endsWith('</svg>'), `${name}/${theme.id}: unterminated <svg>`);
    assert.ok(!svg.includes('undefined'), `${name}/${theme.id}: rendered "undefined"`);
    assert.ok(!svg.includes('NaN'), `${name}/${theme.id}: rendered "NaN"`);
    assert.ok(!/<script/i.test(svg), `${name}/${theme.id}: script tags are stripped by GitHub`);

    const open = (svg.match(/<(?!\/|\?|!)[a-zA-Z]/g) || []).length;
    const close = (svg.match(/<\/[a-zA-Z]/g) || []).length;
    const selfClosing = (svg.match(/\/>/g) || []).length;
    assert.strictEqual(open, close + selfClosing, `${name}/${theme.id}: unbalanced tags`);

    if (outDir) fs.writeFileSync(path.join(outDir, `${name}-${theme.id}.svg`), svg, 'utf8');
    rendered += 1;
  }
}

console.log(`ok · ${rendered} SVG cards rendered and validated`);
