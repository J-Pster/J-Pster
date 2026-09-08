/**
 * WakaTime data source.
 *
 * Only aggregate signals are exposed (languages, editors, categories, totals).
 * Project names are deliberately never surfaced: most of them are private
 * client work and would leak roadmap information into a public README.
 */

const API = 'https://api.wakatime.com/api/v1';

function authHeader(apiKey) {
  return `Basic ${Buffer.from(apiKey).toString('base64')}`;
}

async function get(path, apiKey) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: authHeader(apiKey) },
  });

  if (!res.ok) {
    throw new Error(`WakaTime ${path} -> ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  return body.data;
}

/**
 * @returns {Promise<{
 *   allTimeText: string,
 *   allTimeHours: number,
 *   rangeText: string,
 *   dailyAverage: string,
 *   weeklyTotal: string,
 *   languages: Array<{name: string, percent: number, text: string}>,
 *   editors: Array<{name: string, percent: number}>,
 *   categories: Array<{name: string, percent: number}>,
 *   bestDay: string | null,
 * }>}
 */
async function fetchWakaTime(apiKey) {
  const [allTime, weekly] = await Promise.all([
    get('/users/current/all_time_since_today', apiKey),
    get('/users/current/stats/last_7_days', apiKey),
  ]);

  return {
    allTimeText: allTime.text,
    allTimeHours: Math.round(allTime.total_seconds / 3600),
    rangeText: allTime.range?.start_text ?? '',
    dailyAverage: weekly.human_readable_daily_average ?? 'n/a',
    weeklyTotal: weekly.human_readable_total ?? 'n/a',
    languages: (weekly.languages ?? [])
      .filter(l => l.percent > 0)
      .slice(0, 6)
      .map(l => ({ name: l.name, percent: l.percent, text: l.text })),
    editors: (weekly.editors ?? [])
      .slice(0, 4)
      .map(e => ({ name: e.name, percent: e.percent })),
    categories: (weekly.categories ?? [])
      .slice(0, 4)
      .map(c => ({ name: c.name, percent: c.percent })),
    bestDay: weekly.best_day?.text ?? null,
  };
}

module.exports = { fetchWakaTime };
