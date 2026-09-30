const ESCAPES: Readonly<Record<string, string>> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

/** JSON that cannot break out of a <script type="application/ld+json"> element. */
export function toScriptSafeJson(value: unknown): string {
  const json = JSON.stringify(value)
  if (typeof json !== 'string') throw new TypeError('Value is not JSON-serialisable')
  return json.replace(/[<>&\u2028\u2029]/g, (ch) => ESCAPES[ch] ?? '')
}
