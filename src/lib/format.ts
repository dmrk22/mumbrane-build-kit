// Typographic formats (DESIGN §3.4). Dates are ISO `YYYY-MM-DD` strings and are formatted as
// calendar dates, never through a clock or time zone.

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function parts(iso: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) throw new Error(`not an ISO date: ${iso}`)
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (mo < 1 || mo > 12 || d < 1 || d > 31) throw new Error(`not a calendar date: ${iso}`)
  return [y, mo, d]
}

/** Mono meta: `2026·09·22`. */
export function monoDate(iso: string): string {
  parts(iso)
  return iso.replaceAll('-', '·')
}

/** Prose: `September 22, 2026`. */
export function proseDate(iso: string): string {
  const [y, m, d] = parts(iso)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

/** Compact UI: `Sep 22, 2026`. */
export function shortDate(iso: string): string {
  const [y, m, d] = parts(iso)
  return `${MONTHS[m - 1]?.slice(0, 3)} ${d}, ${y}`
}

/** Plate numbers in publication order: 1 → I, 4 → IV, 14 → XIV. */
export function roman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error(`no Roman numeral for ${n}`)
  const table: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let out = ''
  let rest = n
  for (const [v, s] of table) {
    while (rest >= v) {
      out += s
      rest -= v
    }
  }
  return out
}

/**
 * Non-breaking space between a number and the word or unit after it ("0.781 seconds",
 * "2,115 tests"), so the pair never splits across lines (DESIGN §3.4).
 */
export function keepNumberUnits(text: string): string {
  return text.replace(/(\d) (?=[A-Za-z])/g, '$1 ')
}
