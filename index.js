require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const Mustache = require('mustache');

const { THEMES, esc, clamp } = require('./src/theme');
const { fetchWakaTime } = require('./src/services/wakatime.service');
const { fetchGitHub } = require('./src/services/github.service');
const { heroCard } = require('./src/cards/hero.card');
const { activityCard } = require('./src/cards/activity.card');
const { heatmapCard } = require('./src/cards/heatmap.card');

const TEMPLATE = path.join(__dirname, 'main.mustache');
const OUTPUT = path.join(__dirname, 'README.md');
const ASSETS = path.join(__dirname, 'assets');

const LOGIN = process.env.GITHUB_LOGIN || 'J-Pster';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/** Writes both theme variants of one card. */
async function writeCard(basename, render, payload) {
  await Promise.all(
    Object.values(THEMES).map(theme =>
      fs.writeFile(path.join(ASSETS, `${basename}-${theme.id}.svg`), render(theme, payload), 'utf8')
    )
  );
}

/** Pairs the pinned repos two per table row so the grid reads like GitHub's own. */
function renderPinnedGrid(pinned) {
  const cell = repo => {
    const language = repo.primaryLanguage?.name ?? 'Mixed';
    const color = (repo.primaryLanguage?.color ?? '#8B93A1').replace('#', '');
    const stars = repo.stargazerCount ? ` <code>★ ${repo.stargazerCount}</code>` : '';
    return [
      '<td valign="top" width="50%">',
      `<a href="${esc(repo.url)}"><b>${esc(repo.name)}</b></a>${stars}<br/>`,
      `<img src="https://img.shields.io/badge/${encodeURIComponent(language)}-${color}?style=flat-square&logoColor=white" height="18" alt="${esc(language)}"/><br/>`,
      `<sub>${esc(clamp(repo.description ?? 'No description yet.', 175))}</sub>`,
      '</td>',
    ].join('\n');
  };

  const rows = [];
  for (let i = 0; i < pinned.length; i += 2) {
    const pair = pinned.slice(i, i + 2);
    rows.push(['<tr>', ...pair.map(cell), pair.length === 1 ? '<td></td>' : '', '</tr>'].filter(Boolean).join('\n'));
  }
  return rows.join('\n');
}

async function main() {
  const wakaKey = requireEnv('WAKATIME_API_KEY');
  const ghToken = requireEnv('GH_TOKEN');

  const [waka, gh] = await Promise.all([
    fetchWakaTime(wakaKey),
    fetchGitHub(LOGIN, ghToken),
  ]);

  await fs.mkdir(ASSETS, { recursive: true });

  await Promise.all([
    writeCard('hero', heroCard, {
      totalContributions: gh.totalContributions,
      stars: gh.stars,
      wakaHours: waka.allTimeHours,
    }),
    writeCard('activity', activityCard, { waka, gh }),
    writeCard('heatmap', heatmapCard, gh),
  ]);

  const refreshedAt = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  });

  const view = {
    login: gh.login,
    refreshed_at: `${refreshedAt} (BRT)`,
    total_contributions: gh.totalContributions.toLocaleString('en-US'),
    stars: gh.stars,
    followers: gh.followers,
    public_repos: gh.publicRepos,
    waka_all_time: waka.allTimeText,
    waka_since: waka.rangeText,
    waka_daily_average: waka.dailyAverage,
    top_language: waka.languages[0]?.name ?? 'TypeScript',
    top_language_share: waka.languages[0]?.percent?.toFixed(0) ?? 'n/a',
    pinned_grid: renderPinnedGrid(gh.pinned),
  };

  const template = await fs.readFile(TEMPLATE, 'utf8');
  await fs.writeFile(OUTPUT, Mustache.render(template, view), 'utf8');

  console.log(
    `README rebuilt · ${gh.totalContributions} contributions · ${waka.allTimeText} tracked · ${gh.pinned.length} pinned repos`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
