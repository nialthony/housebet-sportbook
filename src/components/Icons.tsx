/* All icons drawn for this project. 1.5px stroke, 16px grid, no emoji.
   currentColor only — never a hardcoded fill. */

type P = { size?: number; className?: string; strokeWidth?: number }
const base = (size = 16, strokeWidth = 1.5) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IconFootball = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="6.1" />
    <path d="M8 4.6 10.1 3l.8 2.9L13.7 7l-2.2 2 .4 3-3.9-1.5L4.1 12l.4-3L2.3 7l2.8-1.1L5.9 3 8 4.6Z" />
  </svg>
)

export const IconBasketball = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="6.1" />
    <path d="M1.9 8h12.2M8 1.9c1.9 2 1.9 10.2 0 12.2M8 1.9c-1.9 2-1.9 10.2 0 12.2" />
  </svg>
)

export const IconTennis = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="6.1" />
    <path d="M3.6 4.2c3.1 1.4 5.7 1.4 8.8 0M3.6 11.8c3.1-1.4 5.7-1.4 8.8 0" />
  </svg>
)

export const IconBaseball = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="6.1" />
    <path d="M4.3 2.4c1.5 2.1 1.5 9.1 0 11.2M11.7 2.4c-1.5 2.1-1.5 9.1 0 11.2" />
  </svg>
)

export const IconHockey = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M2.1 6.6h11.8v3.2H2.1z" />
    <path d="M13.9 6.6 15.3 4M2.1 9.8H.7" />
    <path d="M5.4 6.6v3.2M10.6 6.6v3.2" />
  </svg>
)

export const IconEsports = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M5 4.4h6a3.4 3.4 0 0 1 3.3 2.6l.5 2c.2.9-.4 1.7-1.3 1.7-.6 0-1-.4-1.1-.9l-.3-1.1H3.9l-.3 1.1c-.1.5-.5.9-1.1.9-.9 0-1.5-.8-1.3-1.7l.5-2A3.4 3.4 0 0 1 5 4.4Z" />
    <path d="M4.7 7.1v1.8M3.8 8h1.8M10.6 7.6h.01M11.9 8.6h.01" />
  </svg>
)

export const IconAmericanFootball = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M3.4 5.2c3.1 2.1 6.1 2.1 9.2 0 3.1-2.1 6.1-2.1 9.2 0" transform="translate(-3.4 0)" />
    <path d="M4.6 8.2h6.8M4.6 10.8h6.8" />
    <path d="M2.2 6.4c0 1.6 2.6 2.9 5.8 2.9s5.8-1.3 5.8-2.9" />
  </svg>
)

export const IconSearch = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="7.1" cy="7.1" r="4.6" />
    <path d="m10.6 10.6 3 3" />
  </svg>
)

export const IconClose = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
)

export const IconChevron = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="m6 3.5 5 4.5-5 4.5" />
  </svg>
)

export const IconStar = ({ size = 16, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? 'currentColor' : 'none'}>
    <path d="m8 2 1.76 3.65 4.02.56-2.93 2.8.71 3.99L8 10.79 4.44 13l.71-3.99L2.22 6.2l4.02-.56L8 2Z" />
  </svg>
)

export const IconSlip = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M3.2 2.4h9.6v11.2H3.2z" />
    <path d="M5.6 5.6h4.8M5.6 8h4.8M5.6 10.4h2.6" />
  </svg>
)

export const IconBets = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M2.4 4.2h11.2v8.4H2.4z" />
    <path d="M2.4 6.6h11.2M6.2 6.6v5.9" />
  </svg>
)

export const IconWallet = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M2.6 4.6h10.8v7.8H2.6z" />
    <path d="M2.6 4.6 4.2 2.4h6.2l.4 2.2M10.4 8.5h1.2" />
  </svg>
)

export const IconHome = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M2.4 7 8 2.4 13.6 7v6.2H2.4z" />
    <path d="M6.4 13.2V9.4h3.2v3.8" />
  </svg>
)

export const IconLive = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M2.4 8a5.6 5.6 0 0 1 5.6-5.6A5.6 5.6 0 0 1 13.6 8a5.6 5.6 0 0 1-5.6 5.6A5.6 5.6 0 0 1 2.4 8Z" />
    <path d="M6.1 8a1.9 1.9 0 0 1 1.9-1.9A1.9 1.9 0 0 1 9.9 8a1.9 1.9 0 0 1-1.9 1.9A1.9 1.9 0 0 1 6.1 8Z" />
  </svg>
)

export const IconAlert = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M8 2.6 14.2 13H1.8L8 2.6Z" />
    <path d="M8 6.4v3M8 11.3h.01" />
  </svg>
)

export const IconCheck = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="m3 8.4 3.2 3.2L13 4.8" />
  </svg>
)

export const IconClock = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="6.1" />
    <path d="M8 4.3V8l2.6 1.6" />
  </svg>
)

export const IconLink = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M6.6 9.4 9.4 6.6" />
    <path d="M9 4.2l1.2-1.2a2.9 2.9 0 0 1 4.1 4.1L13 8.3" />
    <path d="M7 11.8 5.8 13a2.9 2.9 0 0 1-4.1-4.1L3 7.7" />
  </svg>
)

export const IconCash = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="6.1" />
    <path d="M5.4 5.5 8 8.6l2.6-3.1M8 8.6v2.7M5.8 9.4h4.4" />
  </svg>
)

export const IconFilter = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M2.4 4h11.2M4.4 8h7.2M6.4 12h3.2" />
  </svg>
)

export const IconMenu = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M2.4 4.5h11.2M2.4 8h11.2M2.4 11.5h11.2" />
  </svg>
)

export const IconLock = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M3.6 7.2h8.8v6H3.6z" />
    <path d="M5.6 7.2V5.3a2.4 2.4 0 0 1 4.8 0v1.9" />
  </svg>
)

export const SPORT_ICON: Record<string, (p: P) => JSX.Element> = {
  football: IconFootball,
  basketball: IconBasketball,
  tennis: IconTennis,
  baseball: IconBaseball,
  hockey: IconHockey,
  esports: IconEsports,
  'american-football': IconAmericanFootball,
}
