import { cx } from '@/lib/cx'

// One set, drawn on a 20 px grid with a 1.5 px round stroke (DESIGN §9.9). Each entry is path data.
const PATHS = {
  'arrow-right': 'M4 10h12M11 5l5 5-5 5',
  'arrow-up-right': 'M6 14l8-8M7.5 6H14v6.5',
  'chevron-down': 'M5.5 8l4.5 4.5L14.5 8',
  'chevron-right': 'M8 5.5l4.5 4.5L8 14.5',
  menu: 'M3 7.5h14M3 12.5h14',
  close: 'M5 5l10 10M15 5L5 15',
  plus: 'M10 4v12M4 10h12',
  minus: 'M4 10h12',
  check: 'M4 10.5l4 4 8-9',
  copy: 'M7 7h10v10H7zM13 7V3H3v10h4',
  download: 'M10 3v10M5.5 8.5L10 13l4.5-4.5M4 17h12',
  sun: 'M10 6.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4',
  moon: 'M16.5 12.5A7 7 0 0 1 7.5 3.5a7 7 0 1 0 9 9z',
  monitor: 'M3 4h14v10H3zM7 17h6M10 14v3',
  key: 'M7 9.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM9.5 10.5L16 4M13.5 6.5l2 2M11.5 8.5l1.5 1.5',
  chart: 'M3 17h14M6 14V9M10 14V5M14 14v-3',
  flask: 'M7.5 3h5M8.5 3v5.2l-4.2 7.2A1 1 0 0 0 5.2 17h9.6a1 1 0 0 0 .9-1.6l-4.2-7.2V3M6.3 12.5h7.4',
  book: 'M10 5.5C8.5 4.3 6 4 3 4v11c3 0 5.5.3 7 1.5 1.5-1.2 4-1.5 7-1.5V4c-3 0-5.5.3-7 1.5zM10 5.5v11',
  gear: 'M10 7.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5zM10 4.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.3 4.3l1.8 1.8M13.9 13.9l1.8 1.8M4.3 15.7l1.8-1.8M13.9 6.1l1.8-1.8',
  replay: 'M4 10a6 6 0 1 0 1.8-4.3M4 3.5V7h3.5',
  layers: 'M10 3l7 3.5-7 3.5-7-3.5zM3 10l7 3.5 7-3.5M3 13.5L10 17l7-3.5',
  lock: 'M5 9h10v8H5zM7 9V6.5a3 3 0 0 1 6 0V9',
  info: 'M10 2.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM10 9v5M10 6.25v.5',
  warning: 'M10 3L2.5 16.5h15zM10 8.5v3.5M10 14.25v.5',
} as const

export type IconName = keyof typeof PATHS
export const ICON_NAMES = Object.keys(PATHS) as IconName[]

/** Decorative by default (`aria-hidden`); pass `label` when the icon alone carries meaning. */
const STROKE = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function Icon({ name, label, className }: { name: IconName; label?: string; className?: string }) {
  const classes = cx('size-5 shrink-0', className)
  if (label) {
    // aria-label, not <title>: WebKit does not name an icon-only button from an SVG title
    // (axe button-name in WebKit; VoiceOver is unreliable with it too).
    return (
      <svg role="img" aria-label={label} className={classes} {...STROKE}>
        <path d={PATHS[name]} />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" focusable="false" className={classes} {...STROKE}>
      <path d={PATHS[name]} />
    </svg>
  )
}
