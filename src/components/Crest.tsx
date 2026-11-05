import { teamCode } from '../data/fixtures'

/* ------------------------------------------------------------------
   Club crests.

   Real clubs ship their real badge (bundled locally, never hotlinked,
   because a hotlinked crest is one CDN outage from a blank row). Clubs
   that only exist in this prototype get a generated crest instead, so
   every row has a mark and no row is ever empty.

   Real badges belong to their clubs and are used here as sample data in
   a design prototype. Generated crests are original.
   ------------------------------------------------------------------ */

// Vite fingerprints these at build time, so the URLs stay correct under
// a project sub-path like GitHub Pages /housebet-sportbook/
const files = import.meta.glob('../assets/crests/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const slug = (t: string) => t.toLowerCase().replace(/ /g, '-').replace(/\./g, '')

const REAL: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  REAL[path.replace('../assets/crests/', '').replace('.png', '')] = url
}

/** shape tells these apart at 20px when the monogram is unreadable */
type Gen = { shape: 'shield' | 'hex' | 'circle' | 'chevron' | 'tri'; bg: string; fg: string; edge: string }

const GENERATED: Record<string, Gen> = {
  // clubs that only exist here
  'Aurora Vanguard': { shape: 'chevron', bg: '#123A44', fg: '#D8FBFF', edge: '#4ABAC6' },
  'Berlin Praxis': { shape: 'hex', bg: '#2A2118', fg: '#FFE9BE', edge: '#D8A03A' },
  'Nordic Nine': { shape: 'hex', bg: '#16232E', fg: '#DCE9F2', edge: '#7FA8C4' },
  'Seoul Ascend': { shape: 'tri', bg: '#33122B', fg: '#FFD9EC', edge: '#F22050' },
  // real club absent from the 2026/27 dataset — generic mark, not their badge
  'West Ham': { shape: 'shield', bg: '#4A1224', fg: '#FFE3EC', edge: '#9BC3DE' },
  // individuals: the two sports where a "team" is one person
  'L. Marchetti': { shape: 'circle', bg: '#1B2A33', fg: '#E6F4FA', edge: '#4ABAC6' },
  'P. Sandoval': { shape: 'circle', bg: '#2E2013', fg: '#FBEBD6', edge: '#D8A03A' },
  'R. Bianchi': { shape: 'circle', bg: '#232A31', fg: '#EDF3F7', edge: '#8FA6B5' },
  'D. Okabe': { shape: 'circle', bg: '#2A1A22', fg: '#FBE0EA', edge: '#F22050' },
  'H. Lindqvist': { shape: 'circle', bg: '#182A24', fg: '#DCF3EA', edge: '#3FA07B' },
  'Y. Tanaka': { shape: 'circle', bg: '#241C33', fg: '#EADFFB', edge: '#8A6FD1' },
}

const SHAPES: Record<Gen['shape'], string> = {
  shield: 'M2.5 2.5h19v9.3c0 5-3.9 8.4-9.5 9.7C6.4 20.2 2.5 16.8 2.5 11.8V2.5z',
  hex: 'M12 1.8l8.7 4.6v9.2L12 20.2 3.3 15.6V6.4L12 1.8z',
  circle: '',
  chevron: 'M12 1.6l10.4 7.6-5 1.1V20h-2.2v-6.1L12 12.6l-3.2 1.3V20H6.6V10.3l-5-1.1L12 1.6z',
  tri: 'M12 1.8l10.4 17.4H1.6L12 1.8z',
}

/** initials for the generated marks — 2 chars stay legible at 18px */
function monogram(team: string) {
  const gen = GENERATED[team]
  if (gen.shape !== 'circle') return teamCode(team).slice(0, 3)
  const parts = team.replace(/\./g, '').split(' ').filter(Boolean)
  return (parts[0][0] + (parts[1]?.[0] ?? parts[0][1] ?? '')).toUpperCase()
}

const DARK_CREST_FILTER: Record<string, string> = {
  juventus: 'invert(0.92)',
  tottenham: 'invert(0.92) hue-rotate(180deg)',
  'san-diego-padres': 'brightness(2.8) saturate(1.2)',
}

export function Crest({ team, size }: { team: string; size?: number }) {
  // no explicit size -> CSS owns it, so breakpoints can scale the crest
  const dim: React.CSSProperties = size
    ? { width: size, height: size, flex: `0 0 ${size}px` }
    : { width: 'var(--crest-sz)', height: 'var(--crest-sz)', flex: '0 0 var(--crest-sz)' }
  const s = slug(team)
  const real = REAL[s]
  if (real) {
    return (
      <img
        className="crest"
        src={real}
        alt=""
        width={size}
        height={size}
        loading="eager"
        decoding="sync"
        style={{ ...dim, objectFit: 'contain', filter: DARK_CREST_FILTER[s] }}
      />
    )
  }

  const g = GENERATED[team]
  if (!g) {
    // no data for this team: a neutral disc, never a broken image
    // no data for this team: a neutral disc, never a broken image
    return (
      <svg className="crest" viewBox="0 0 24 24" aria-hidden style={dim}>
        <circle cx="12" cy="12" r="10" fill="#21313C" stroke="#3A4A55" strokeWidth="1" />
        <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7C8B96">
          {teamCode(team).slice(0, 2)}
        </text>
      </svg>
    )
  }

  return (
    <svg className="crest" viewBox="0 0 24 24" aria-hidden style={dim}>
      {g.shape === 'circle' ? (
        <>
          <circle cx="12" cy="12" r="10.2" fill={g.bg} />
          <circle cx="12" cy="12" r="10.2" fill="none" stroke={g.edge} strokeWidth="1.3" />
        </>
      ) : (
        <path d={SHAPES[g.shape]} fill={g.bg} stroke={g.edge} strokeWidth="1.3" strokeLinejoin="round" />
      )}
      <text
        x="12"
        y={g.shape === 'tri' ? 16.5 : 15.6}
        textAnchor="middle"
        fontSize={monogram(team).length > 2 ? 7.6 : 9.4}
        fontWeight="800"
        letterSpacing="0.2"
        fill={g.fg}
        fontFamily="var(--ui)"
      >
        {monogram(team)}
      </text>
    </svg>
  )
}

/** "Arsenal v Brighton" with both crests in front of it. Falls back to the
 *  plain string if the fixture is not in `home v away` shape, so a bad name
 *  degrades to text rather than to two blank boxes. */
export function FixtureLine({ fixture, size = 14 }: { fixture: string; size?: number }) {
  const parts = fixture.split(' v ')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return <>{fixture}</>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, verticalAlign: 'middle' }}>
      <Crest team={parts[0]} size={size} />
      <Crest team={parts[1]} size={size} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {fixture}
      </span>
    </span>
  )
}

export const hasRealCrest = (team: string) => Boolean(REAL[slug(team)])
