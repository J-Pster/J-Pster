const { FONT_MONO, FONT_SANS, esc } = require('../theme');

const W = 880;
const H = 260;
const LINE_H = 26;
const ROLE_BASELINE = 150;

/**
 * Header banner: identity, rotating role line and live counters.
 *
 * The role line is a clipped roller rather than three cross-faded labels.
 * Browsers park SVG-in-<img> animations at frame 0 while the image sits
 * outside the viewport, so every animation here is authored such that frame 0
 * is already a correct, readable state. Nothing that carries information is
 * allowed to start hidden.
 */
function heroCard(theme, data) {
  const roles = [
    'Senior Web Software Architect',
    'AI Engineer  ·  document intelligence',
    'AWS  ·  CDK, ECS Fargate, TypeScript',
  ];

  const roleNodes = roles
    .map(
      (role, i) => `
      <text class="role" x="46" y="${ROLE_BASELINE + i * LINE_H}">${esc(role)}</text>`
    )
    .join('');

  const hold = 100 / roles.length;
  const roleFrames = roles
    .map((_, i) => {
      const from = (i * hold).toFixed(1);
      const to = (i * hold + hold - 6).toFixed(1);
      return `      ${from}%, ${to}% { transform: translateY(-${i * LINE_H}px); }`;
    })
    .join('\n');

  const chips = [
    { label: 'BidChex', accent: theme.accent },
    { label: 'Goiânia · BR', accent: theme.muted },
    { label: 'Open to collaborations', accent: theme.accent3 },
  ];

  let chipX = 46;
  const chipNodes = chips
    .map(chip => {
      const width = chip.label.length * 7.4 + 30;
      const node = `
    <g transform="translate(${chipX}, 186)">
      <rect width="${width.toFixed(0)}" height="26" rx="13" fill="${theme.surfaceAlt}" stroke="${theme.border}"/>
      <circle cx="14" cy="13" r="3.5" fill="${chip.accent}"/>
      <text class="chip" x="25" y="17">${esc(chip.label)}</text>
    </g>`;
      chipX += width + 10;
      return node;
    })
    .join('');

  const metrics = [
    { value: data.totalContributions.toLocaleString('en-US'), label: 'contributions / yr' },
    { value: `${data.stars}`, label: 'stars earned' },
    { value: `${data.wakaHours.toLocaleString('en-US')}h`, label: 'tracked coding' },
  ];

  const metricNodes = metrics
    .map(
      (m, i) => `
    <g transform="translate(${W - 300}, ${64 + i * 52})">
      <text class="metric-value" x="220" y="0" text-anchor="end">${esc(m.value)}</text>
      <text class="metric-label" x="220" y="18" text-anchor="end">${esc(m.label)}</text>
      <rect x="232" y="-14" width="2" height="20" rx="1" fill="${theme.accent}" opacity="0.55"/>
    </g>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="João Pster · Senior Web Software Architect and AI Engineer at BidChex">
  <title>João Pster · Senior Web Software Architect &amp; AI Engineer at BidChex</title>
  <defs>
    <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.surface}"/>
      <stop offset="100%" stop-color="${theme.bg}"/>
    </linearGradient>
    <radialGradient id="hero-glow" cx="0.82" cy="0.1" r="0.7">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="${theme.accent2}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${theme.accent2}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hero-rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="50%" stop-color="${theme.accent2}"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="hero-grid" width="26" height="26" patternUnits="userSpaceOnUse">
      <path d="M26 0 L0 0 0 26" fill="none" stroke="${theme.grid}" stroke-width="1"/>
    </pattern>
    <clipPath id="hero-clip">
      <rect width="${W}" height="${H}" rx="18"/>
    </clipPath>
    <clipPath id="role-clip">
      <rect x="40" y="${ROLE_BASELINE - 19}" width="${W - 340}" height="${LINE_H}"/>
    </clipPath>
  </defs>

  <style>
    .name   { font-family: ${FONT_MONO}; font-size: 40px; font-weight: 700; fill: ${theme.textStrong}; letter-spacing: 1.5px; }
    .kicker { font-family: ${FONT_MONO}; font-size: 12px; font-weight: 600; fill: ${theme.accent}; letter-spacing: 3.2px; }
    .role   { font-family: ${FONT_SANS}; font-size: 17px; font-weight: 500; fill: ${theme.muted}; }
    .chip   { font-family: ${FONT_SANS}; font-size: 12px; font-weight: 600; fill: ${theme.text}; }
    .metric-value { font-family: ${FONT_MONO}; font-size: 22px; font-weight: 700; fill: ${theme.textStrong}; }
    .metric-label { font-family: ${FONT_SANS}; font-size: 11px; fill: ${theme.faint}; letter-spacing: 0.4px; }
    .cursor { animation: blink 1.05s steps(1) infinite; }
    @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .sweep { animation: sweep 7s ease-in-out infinite; }
    @keyframes sweep { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.9; } }
    .roller { animation: roll ${roles.length * 4}s cubic-bezier(.65, 0, .2, 1) infinite; }
    @keyframes roll {
${roleFrames}
      100% { transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .roller, .cursor, .sweep { animation: none !important; }
    }
  </style>

  <g clip-path="url(#hero-clip)">
    <rect width="${W}" height="${H}" fill="url(#hero-bg)"/>
    <rect width="${W}" height="${H}" fill="url(#hero-grid)" opacity="0.55"/>
    <rect width="${W}" height="${H}" fill="url(#hero-glow)"/>
    <rect class="sweep" x="0" y="0" width="${W}" height="2" fill="url(#hero-rule)"/>
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${theme.border}"/>

  <text class="kicker" x="46" y="62">BIDCHEX · CO-FOUNDER &amp; HEAD OF ENGINEERING</text>
  <text class="name" x="46" y="110">João Pster<tspan class="cursor" fill="${theme.accent}">_</tspan></text>
  <g clip-path="url(#role-clip)"><g class="roller">${roleNodes}
  </g></g>
  ${chipNodes}
  ${metricNodes}
</svg>`;
}

module.exports = { heroCard, HERO_SIZE: { width: W, height: H } };
