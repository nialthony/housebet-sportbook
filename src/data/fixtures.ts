/* ============================================================================
   SAMPLE DATA
   Competitions and clubs are real (the brief names them: Arsenal v Brighton,
   Premier League, Champions League, LaLiga, Serie A, Bundesliga).

   EVERY PLAYER NAME IN THIS FILE IS FICTIONAL.
   The rules say "no real players". The brief also requires a Goalscorers market
   on the match page — so the only compliant way to ship it is invented players.
   The goalscorer group is tagged SAMPLE DATA in the UI.
   ========================================================================== */

export type MarketGroup =
  | 'Popular'
  | 'Goals'
  | 'Halves'
  | 'Handicaps'
  | 'Goalscorers'
  | 'Corners & cards'

export type Selection = {
  id: string
  label: string
  odds: number
  suspended?: boolean
  suspendReason?: string
  /** shown under the label in wide layouts */
  meta?: string
}

export type Market = {
  id: string
  group: MarketGroup
  name: string
  /** compact column headers, e.g. ["1","X","2"] */
  cols?: string[]
  selections: Selection[]
  /** on-chain house bankroll backing this market, USDT */
  exposure: number
}

export type Status = 'live' | 'upcoming' | 'ended'

export type Match = {
  id: string
  sport: SportId
  comp: string
  compShort: string
  home: string
  away: string
  status: Status
  /** minutes from "now". negative = in the future */
  kickoffOffsetMin: number
  minute?: number
  addedTime?: number
  scoreHome: number
  scoreAway: number
  period?: string
  /** live-only detail line */
  note?: string
  markets?: Market[]
  /** 3-way result odds, used on list rows */
  odds?: number[]
}

export type SportId =
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'baseball'
  | 'hockey'
  | 'esports'
  | 'american-football'

export type Sport = {
  id: SportId
  name: string
  short: string
  live: number
}

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football', short: 'FTB', live: 14 },
  { id: 'basketball', name: 'Basketball', short: 'BSK', live: 6 },
  { id: 'tennis', name: 'Tennis', short: 'TEN', live: 4 },
  { id: 'baseball', name: 'Baseball', short: 'BSB', live: 3 },
  { id: 'hockey', name: 'Ice Hockey', short: 'ICH', live: 2 },
  { id: 'esports', name: 'eSports', short: 'ESP', live: 5 },
  { id: 'american-football', name: 'American Football', short: 'NFL', live: 2 },
]

/* ---------------------------------------------------------------- helpers */
let _uid = 0
const uid = (p: string) => `${p}${++_uid}`

function sel(label: string, odds: number, extra: Partial<Selection> = {}): Selection {
  return { id: uid('s'), label, odds, ...extra }
}

/* ------------------------------------------------------- fictional players */
export const ARSENAL_SQUAD = [
  'K. Vardal',
  'M. Okonjo',
  'T. Bergström',
  'R. Salgado',
  'A. Whitfield',
  'D. Nkemelu',
]
export const BRIGHTON_SQUAD = [
  'J. Ferreira',
  'L. Dunmore',
  'S. Achterberg',
  'N. Kovačev',
  'O. Adeyemi',
  'C. Brightly',
]

/* ------------------------------------------------------ the marquee match */
function arsenalBrightonMarkets(): Market[] {
  return [
    {
      id: uid('m'),
      group: 'Popular',
      name: 'Match result',
      selections: [
        sel('Arsenal', 1.42),
        sel('Draw', 4.6),
        sel('Brighton', 7.4, { suspended: true, suspendReason: 'Line review' }),
      ],
      exposure: 184_320,
    },
    {
      id: uid('m'),
      group: 'Popular',
      name: 'Double chance',
      selections: [sel('Arsenal or draw', 1.1), sel('Draw or Brighton', 2.75)],
      exposure: 61_400,
    },
    {
      id: uid('m'),
      group: 'Popular',
      name: 'Both teams to score',
      selections: [sel('Yes', 1.8), sel('No', 2.0)],
      exposure: 98_750,
    },
    {
      id: uid('m'),
      group: 'Goals',
      name: 'Total goals',
      cols: ['Over', 'Under'],
      selections: [
        sel('Over 0.5', 1.06),
        sel('Under 0.5', 9.4),
        sel('Over 1.5', 1.28),
        sel('Under 1.5', 3.6),
        sel('Over 2.5', 1.85),
        sel('Under 2.5', 1.95),
        sel('Over 3.5', 3.1),
        sel('Under 3.5', 1.36),
        sel('Over 4.5', 5.8),
        sel('Under 4.5', 1.14),
      ],
      exposure: 241_900,
    },
    {
      id: uid('m'),
      group: 'Goals',
      name: 'Next goal',
      selections: [sel('Arsenal', 1.62), sel('No goal', 13.0), sel('Brighton', 3.4)],
      exposure: 44_180,
    },
    {
      id: uid('m'),
      group: 'Goals',
      name: 'Correct score',
      selections: [
        sel('1–0', 7.0),
        sel('2–0', 7.5),
        sel('2–1', 8.5),
        sel('3–0', 13.0),
        sel('1–1', 9.5),
        sel('0–0', 21.0),
        sel('Any other', 3.4),
      ],
      exposure: 27_640,
    },
    {
      id: uid('m'),
      group: 'Halves',
      name: 'Half-time result',
      selections: [sel('Arsenal', 1.95), sel('Draw', 2.4), sel('Brighton', 6.5)],
      exposure: 38_920,
    },
    {
      id: uid('m'),
      group: 'Halves',
      name: 'Second half total goals',
      cols: ['Over', 'Under'],
      selections: [
        sel('Over 0.5', 1.22),
        sel('Under 0.5', 4.2),
        sel('Over 1.5', 2.1),
        sel('Under 1.5', 1.72),
      ],
      exposure: 52_310,
    },
    {
      id: uid('m'),
      group: 'Halves',
      name: 'Half-time / Full-time',
      selections: [sel('Arsenal / Arsenal', 2.05), sel('Draw / Arsenal', 4.5), sel('Any other', 3.2)],
      exposure: 19_470,
    },
    {
      id: uid('m'),
      group: 'Handicaps',
      name: 'Handicap (3-way)',
      selections: [sel('Arsenal −1', 2.3), sel('Tie −1', 3.6), sel('Brighton +1', 2.9)],
      exposure: 71_050,
    },
    {
      id: uid('m'),
      group: 'Handicaps',
      name: 'Asian handicap',
      cols: ['Home', 'Away'],
      selections: [
        sel('Arsenal −0.5', 1.44),
        sel('Brighton +0.5', 2.75),
        sel('Arsenal −1.5', 2.1),
        sel('Brighton +1.5', 1.75),
      ],
      exposure: 88_260,
    },
    {
      id: uid('m'),
      group: 'Goalscorers',
      name: 'Anytime goalscorer',
      selections: [
        ...ARSENAL_SQUAD.map((p) => sel(p, 0)),
        ...BRIGHTON_SQUAD.map((p) => sel(p, 0)),
      ],
      exposure: 33_180,
    },
    {
      id: uid('m'),
      group: 'Goalscorers',
      name: 'First goalscorer',
      selections: [
        ...ARSENAL_SQUAD.slice(0, 3).map((p) => sel(p, 0)),
        ...BRIGHTON_SQUAD.slice(0, 3).map((p) => sel(p, 0)),
        sel('No goalscorer', 0),
      ],
      exposure: 21_540,
    },
    {
      id: uid('m'),
      group: 'Corners & cards',
      name: 'Total corners',
      cols: ['Over', 'Under'],
      selections: [
        sel('Over 8.5', 1.7),
        sel('Under 8.5', 2.1),
        sel('Over 10.5', 2.9),
        sel('Under 10.5', 1.4),
      ],
      exposure: 24_760,
    },
    {
      id: uid('m'),
      group: 'Corners & cards',
      name: 'Total cards',
      cols: ['Over', 'Under'],
      selections: [
        sel('Over 2.5', 1.62),
        sel('Under 2.5', 2.25),
        sel('Over 4.5', 3.4),
        sel('Under 4.5', 1.3),
      ],
      exposure: 17_890,
    },
  ]
}

/* ------------------------------------------------------------ fixture list */
type RawMatch = Omit<Match, 'id'> & { id?: string }

const RAW: RawMatch[] = [
  /* ---- LIVE ---- */
  {
    sport: 'football',
    comp: 'Premier League',
    compShort: 'PL',
    home: 'Arsenal',
    away: 'Brighton',
    status: 'live',
    kickoffOffsetMin: -67,
    minute: 67,
    addedTime: 0,
    scoreHome: 2,
    scoreAway: 1,
    note: 'Arsenal pressure. 4 shots in the last 6 minutes.',
    odds: [1.42, 4.6, 7.4],
    markets: arsenalBrightonMarkets(),
  },
  {
    sport: 'football',
    comp: 'Premier League',
    compShort: 'PL',
    home: 'Aston Villa',
    away: 'Newcastle',
    status: 'live',
    kickoffOffsetMin: -23,
    minute: 23,
    scoreHome: 0,
    scoreAway: 0,
    note: 'Scrappy opening. No shots on target.',
    odds: [2.5, 3.3, 2.9],
    markets: [],
  },
  {
    sport: 'football',
    comp: 'Champions League',
    compShort: 'UCL',
    home: 'Inter',
    away: 'Benfica',
    status: 'live',
    kickoffOffsetMin: -81,
    minute: 81,
    scoreHome: 1,
    scoreAway: 1,
    note: 'Benfica down to 10. Red card, 74 minutes.',
    odds: [1.85, 3.6, 4.4],
    markets: [],
  },
  {
    sport: 'football',
    comp: 'LaLiga',
    compShort: 'LL',
    home: 'Real Sociedad',
    away: 'Villarreal',
    status: 'live',
    kickoffOffsetMin: -54,
    minute: 54,
    scoreHome: 3,
    scoreAway: 0,
    note: 'Rout. Three goals in 14 minutes.',
    odds: [1.06, 13.0, 34.0],
    markets: [],
  },
  {
    sport: 'basketball',
    comp: 'NBA',
    compShort: 'NBA',
    home: 'Cleveland Cavaliers',
    away: 'Boston Celtics',
    status: 'live',
    kickoffOffsetMin: -28,
    minute: 28,
    scoreHome: 74,
    scoreAway: 69,
    period: 'Q3 04:12',
    note: 'Cleveland on a 9–0 run.',
    odds: [1.72, 2.15],
  },
  {
    sport: 'basketball',
    comp: 'EuroLeague',
    compShort: 'EL',
    home: 'Olympiacos',
    away: 'Fenerbahçe',
    status: 'live',
    kickoffOffsetMin: -16,
    minute: 16,
    scoreHome: 38,
    scoreAway: 41,
    period: 'Q2 03:48',
    odds: [2.05, 1.8],
  },
  {
    sport: 'tennis',
    comp: 'ATP Masters',
    compShort: 'ATP',
    home: 'L. Marchetti',
    away: 'D. Okabe',
    status: 'live',
    kickoffOffsetMin: -95,
    minute: 95,
    scoreHome: 1,
    scoreAway: 2,
    period: 'Set 4 · 3–2',
    note: 'Marchetti break point.',
    odds: [2.4, 1.57],
  },
  {
    sport: 'tennis',
    comp: 'WTA 500',
    compShort: 'WTA',
    home: 'P. Sandoval',
    away: 'H. Lindqvist',
    status: 'live',
    kickoffOffsetMin: -42,
    minute: 42,
    scoreHome: 0,
    scoreAway: 1,
    period: 'Set 2 · 5–4',
    odds: [3.1, 1.36],
  },
  {
    sport: 'esports',
    comp: 'CS2 Major',
    compShort: 'CS2',
    home: 'Aurora Vanguard',
    away: 'Nordic Nine',
    status: 'live',
    kickoffOffsetMin: -37,
    minute: 37,
    scoreHome: 9,
    scoreAway: 7,
    period: 'Map 2 · Nuke',
    odds: [1.66, 2.2],
  },
  {
    sport: 'hockey',
    comp: 'NHL',
    compShort: 'NHL',
    home: 'Toronto Maple Leafs',
    away: 'Vegas Golden Knights',
    status: 'live',
    kickoffOffsetMin: -46,
    minute: 46,
    scoreHome: 2,
    scoreAway: 2,
    period: 'P2 08:33',
    odds: [2.15, 1.75],
  },
  {
    sport: 'baseball',
    comp: 'MLB',
    compShort: 'MLB',
    home: 'Chicago Cubs',
    away: 'San Diego Padres',
    status: 'live',
    kickoffOffsetMin: -61,
    minute: 61,
    scoreHome: 4,
    scoreAway: 1,
    period: 'Bot 6th',
    odds: [1.48, 2.7],
  },

  /* ---- UPCOMING ---- */
  {
    sport: 'football',
    comp: 'Premier League',
    compShort: 'PL',
    home: 'Manchester City',
    away: 'Tottenham',
    status: 'upcoming',
    kickoffOffsetMin: 14,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.55, 4.2, 5.8],
  },
  {
    sport: 'football',
    comp: 'Premier League',
    compShort: 'PL',
    home: 'Chelsea',
    away: 'West Ham',
    status: 'upcoming',
    kickoffOffsetMin: 41,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.9, 3.6, 4.1],
  },
  {
    sport: 'football',
    comp: 'Premier League',
    compShort: 'PL',
    home: 'Liverpool',
    away: 'Everton',
    status: 'upcoming',
    kickoffOffsetMin: 92,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.45, 4.6, 6.8],
  },
  {
    sport: 'football',
    comp: 'Champions League',
    compShort: 'UCL',
    home: 'Real Madrid',
    away: 'Bayern Munich',
    status: 'upcoming',
    kickoffOffsetMin: 26,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.15, 3.5, 3.3],
  },
  {
    sport: 'football',
    comp: 'Champions League',
    compShort: 'UCL',
    home: 'Barcelona',
    away: 'Atletico Madrid',
    status: 'upcoming',
    kickoffOffsetMin: 26,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.3, 3.3, 3.1],
  },
  {
    sport: 'football',
    comp: 'Champions League',
    compShort: 'UCL',
    home: 'PSG',
    away: 'Borussia Dortmund',
    status: 'upcoming',
    kickoffOffsetMin: 118,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.75, 4.0, 4.4],
  },
  {
    sport: 'football',
    comp: 'LaLiga',
    compShort: 'LL',
    home: 'Real Betis',
    away: 'Athletic Club',
    status: 'upcoming',
    kickoffOffsetMin: 63,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.6, 3.2, 2.8],
  },
  {
    sport: 'football',
    comp: 'LaLiga',
    compShort: 'LL',
    home: 'Sevilla',
    away: 'Celta Vigo',
    status: 'upcoming',
    kickoffOffsetMin: 205,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.1, 3.4, 3.5],
  },
  {
    sport: 'football',
    comp: 'Serie A',
    compShort: 'SA',
    home: 'Juventus',
    away: 'Napoli',
    status: 'upcoming',
    kickoffOffsetMin: 33,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.45, 3.2, 3.0],
  },
  {
    sport: 'football',
    comp: 'Serie A',
    compShort: 'SA',
    home: 'AC Milan',
    away: 'Roma',
    status: 'upcoming',
    kickoffOffsetMin: 87,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.95, 3.5, 4.0],
  },
  {
    sport: 'football',
    comp: 'Serie A',
    compShort: 'SA',
    home: 'Lazio',
    away: 'Fiorentina',
    status: 'upcoming',
    kickoffOffsetMin: 240,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.2, 3.3, 3.4],
  },
  {
    sport: 'football',
    comp: 'Bundesliga',
    compShort: 'BL',
    home: 'Bayer Leverkusen',
    away: 'RB Leipzig',
    status: 'upcoming',
    kickoffOffsetMin: 19,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.05, 3.6, 3.5],
  },
  {
    sport: 'football',
    comp: 'Bundesliga',
    compShort: 'BL',
    home: 'Eintracht Frankfurt',
    away: 'VfB Stuttgart',
    status: 'upcoming',
    kickoffOffsetMin: 156,
    scoreHome: 0,
    scoreAway: 0,
    odds: [2.35, 3.5, 2.95],
  },
  {
    sport: 'basketball',
    comp: 'NBA',
    compShort: 'NBA',
    home: 'Denver Nuggets',
    away: 'Phoenix Suns',
    status: 'upcoming',
    kickoffOffsetMin: 52,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.62, 2.3],
  },
  {
    sport: 'basketball',
    comp: 'NBA',
    compShort: 'NBA',
    home: 'Milwaukee Bucks',
    away: 'Miami Heat',
    status: 'upcoming',
    kickoffOffsetMin: 73,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.8, 2.0],
  },
  {
    sport: 'tennis',
    comp: 'ATP Masters',
    compShort: 'ATP',
    home: 'R. Bianchi',
    away: 'Y. Tanaka',
    status: 'upcoming',
    kickoffOffsetMin: 8,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.44, 2.8],
  },
  {
    sport: 'esports',
    comp: 'LoL Worlds',
    compShort: 'LOL',
    home: 'Seoul Ascend',
    away: 'Berlin Praxis',
    status: 'upcoming',
    kickoffOffsetMin: 47,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.9, 1.9],
  },
  {
    sport: 'hockey',
    comp: 'NHL',
    compShort: 'NHL',
    home: 'Edmonton Oilers',
    away: 'Florida Panthers',
    status: 'upcoming',
    kickoffOffsetMin: 104,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.95, 1.9],
  },
  {
    sport: 'american-football',
    comp: 'NFL',
    compShort: 'NFL',
    home: 'Kansas City Chiefs',
    away: 'Buffalo Bills',
    status: 'live',
    kickoffOffsetMin: -41,
    minute: 41,
    scoreHome: 17,
    scoreAway: 14,
    period: 'Q3 09:12',
    odds: [1.9, 1.95],
  },
  {
    sport: 'american-football',
    comp: 'NFL',
    compShort: 'NFL',
    home: 'San Francisco 49ers',
    away: 'Dallas Cowboys',
    status: 'upcoming',
    kickoffOffsetMin: 288,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.7, 2.2],
  },
  {
    sport: 'baseball',
    comp: 'MLB',
    compShort: 'MLB',
    home: 'New York Yankees',
    away: 'Houston Astros',
    status: 'upcoming',
    kickoffOffsetMin: 131,
    scoreHome: 0,
    scoreAway: 0,
    odds: [1.72, 2.15],
  },
]

let mid = 0
export const MATCHES: Match[] = RAW.map((m) => ({
  ...m,
  id: m.id ?? `m${++mid}`,
  markets: m.markets ?? [],
  minute: m.minute ?? 0,
}))

export const FOOTBALL_COMPS = [
  'Premier League',
  'Champions League',
  'LaLiga',
  'Serie A',
  'Bundesliga',
]

export const TOP_COMPS = [
  { name: 'Premier League', short: 'PL', events: 38, sport: 'football' as SportId },
  { name: 'Champions League', short: 'UCL', events: 24, sport: 'football' as SportId },
  { name: 'NBA', short: 'NBA', events: 19, sport: 'basketball' as SportId },
  { name: 'LaLiga', short: 'LL', events: 31, sport: 'football' as SportId },
  { name: 'Serie A', short: 'SA', events: 27, sport: 'football' as SportId },
  { name: 'CS2 Major', short: 'CS2', events: 12, sport: 'esports' as SportId },
  { name: 'Bundesliga', short: 'BL', events: 22, sport: 'football' as SportId },
  { name: 'NHL', short: 'NHL', events: 16, sport: 'hockey' as SportId },
]

/* goalscorer prices are generated from squad position, not hand-typed */
export function priceGoalscorers(markets: Market[]) {
  for (const m of markets) {
    if (m.group !== 'Goalscorers') continue
    const n = m.selections.length
    m.selections.forEach((s, i) => {
      if (s.label === 'No goalscorer') {
        s.odds = m.name.startsWith('First') ? 21.0 : 0
        if (m.name.startsWith('Anytime')) s.odds = 0
        return
      }
      const base = m.name.startsWith('First') ? 6.5 : 2.4
      s.odds = Math.round((base + i * (m.name.startsWith('First') ? 1.9 : 0.62)) * 10) / 10
      if (n === 0) s.odds = 2.4
    })
  }
}
priceGoalscorers(MATCHES[0].markets!)

/* ------------------------------------------------- display helpers */
const TEAM_CODE: Record<string, string> = {
  Arsenal: 'ARS', Brighton: 'BHA', 'Aston Villa': 'AVL', Fulham: 'FUL',
  'Newcastle': 'NEW', Everton: 'EVE', Liverpool: 'LIV', 'Man Utd': 'MUN',
  'Manchester United': 'MUN', 'Manchester City': 'MCI', Tottenham: 'TOT',
  Chelsea: 'CHE', 'West Ham': 'WHU', Inter: 'INT', Benfica: 'BEN',
  'Real Madrid': 'RMA', 'Bayern Munich': 'BAY', Barcelona: 'BAR',
  'Atletico Madrid': 'ATM', PSG: 'PSG', 'Borussia Dortmund': 'BVB',
  'Real Sociedad': 'RSO', Villarreal: 'VIL', 'Real Betis': 'BET',
  'Athletic Club': 'ATH', Sevilla: 'SEV', 'Celta Vigo': 'CEL',
  Juventus: 'JUV', Napoli: 'NAP', 'AC Milan': 'MIL', Roma: 'ROM',
  Lazio: 'LAZ', Fiorentina: 'FIO', 'Bayer Leverkusen': 'B04',
  'RB Leipzig': 'RBL', 'Eintracht Frankfurt': 'SGE', 'VfB Stuttgart': 'VFB',
}
export const teamCode = (n: string) => TEAM_CODE[n] ?? n.slice(0, 3).toUpperCase()

/** the wireframe breadcrumb reads: Soccer › England › Premier League */
export const COMP_COUNTRY: Record<string, string> = {
  'Premier League': 'England',
  'Champions League': 'Europe',
  LaLiga: 'Spain',
  'Serie A': 'Italy',
  Bundesliga: 'Germany',
  NBA: 'USA',
  EuroLeague: 'Europe',
  MLB: 'USA',
  NHL: 'North America',
  'ATP Masters': 'Tour',
  'WTA 500': 'Tour',
  'CS2 Major': 'Europe',
  'LoL Worlds': 'Global',
}
export const compCountry = (c: string) => COMP_COUNTRY[c] ?? 'International'

export const MARQUEE_ID = MATCHES[0].id

/** everything the search box can return */
export const SEARCH_INDEX = (() => {
  const out: { kind: string; label: string; sub: string; to: string }[] = []
  for (const m of MATCHES) {
    out.push({
      kind: 'Event',
      label: `${m.home} v ${m.away}`,
      sub: m.comp,
      to: m.markets?.length ? `/match/${m.id}` : '/live',
    })
  }
  for (const c of TOP_COMPS) {
    out.push({ kind: 'Competition', label: c.name, sub: `${c.events} events`, to: '/football' })
  }
  for (const p of [...ARSENAL_SQUAD, ...BRIGHTON_SQUAD]) {
    out.push({ kind: 'Player', label: p, sub: 'Anytime goalscorer · Arsenal v Brighton', to: `/match/${MARQUEE_ID}` })
  }
  out.push({ kind: 'Market', label: 'Both teams to score', sub: 'Available on 41 events', to: `/match/${MARQUEE_ID}` })
  out.push({ kind: 'Market', label: 'Over 2.5 goals', sub: 'Available on 63 events', to: `/match/${MARQUEE_ID}` })
  out.push({ kind: 'Market', label: 'Asian handicap', sub: 'Available on 38 events', to: `/match/${MARQUEE_ID}` })
  return out
})()
