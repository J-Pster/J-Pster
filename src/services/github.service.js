/**
 * GitHub data source (GraphQL v4).
 *
 * One round trip gives the contribution calendar, aggregate counters,
 * the pinned repositories and the total star count across owned repos.
 */

const ENDPOINT = 'https://api.github.com/graphql';

const QUERY = `
query ($login: String!) {
  viewer { login }
  user(login: $login) {
    name
    login
    bio
    followers { totalCount }
    following { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      totalRepositoriesWithContributedCommits
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date weekday contributionCount }
        }
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage { name color }
        }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes { stargazerCount }
    }
  }
}`;

async function fetchGitHub(login, token) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'j-pster-readme-builder',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL -> ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(`GitHub GraphQL -> ${body.errors.map(e => e.message).join('; ')}`);
  }

  const user = body.data.user;
  // A token belonging to the profile owner sees private contributions in the
  // counters; the Action's default GITHUB_TOKEN authenticates as a bot and
  // silently reports public-only numbers. The card labels itself accordingly.
  const seesPrivate =
    body.data.viewer?.login?.toLowerCase() === login.toLowerCase();
  const contrib = user.contributionsCollection;
  const days = contrib.contributionCalendar.weeks.flatMap(w => w.contributionDays);

  return {
    name: user.name,
    login: user.login,
    seesPrivate,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    totalContributions: contrib.contributionCalendar.totalContributions,
    commits: contrib.totalCommitContributions,
    pullRequests: contrib.totalPullRequestContributions,
    issues: contrib.totalIssueContributions,
    reviews: contrib.totalPullRequestReviewContributions,
    repositoriesContributedTo: contrib.totalRepositoriesWithContributedCommits,
    publicRepos: user.repositories.totalCount,
    stars: user.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0),
    pinned: user.pinnedItems.nodes.filter(Boolean),
    weeks: contrib.contributionCalendar.weeks,
    streak: computeStreak(days),
  };
}

/**
 * Current streak = consecutive days with >0 contributions ending today
 * (or ending yesterday, so the badge does not flip to 0 every midnight).
 * Longest streak = best run anywhere in the 12 month window.
 */
function computeStreak(days) {
  let longest = 0;
  let run = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  let current = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].contributionCount > 0) {
      current += 1;
    } else if (i === days.length - 1) {
      // Today may simply not have started yet; skip it without breaking.
      continue;
    } else {
      break;
    }
  }

  return { current, longest, activeDays: days.filter(d => d.contributionCount > 0).length };
}

module.exports = { fetchGitHub };
