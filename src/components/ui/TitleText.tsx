/**
 * Keeps hyphenated compounds ("field-based") on one line in display titles: each compound becomes
 * a no-wrap span (a non-breaking hyphen would fall back to another font's glyph).
 */
export function TitleText({ text }: { text: string }) {
  const parts = text.split(/(\S+-\S+)/).map((part, i) => ({ part, id: `${i}:${part}` }))
  return parts.map(({ part, id }) =>
    /\S-\S/.test(part) ? (
      <span key={id} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  )
}
