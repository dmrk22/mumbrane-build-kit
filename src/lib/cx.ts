type Part = string | false | null | undefined

/** Joins class names, skipping falsy parts. */
export function cx(...parts: Part[]): string {
  return parts.filter(Boolean).join(' ')
}
