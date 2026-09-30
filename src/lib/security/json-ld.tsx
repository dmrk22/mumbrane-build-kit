// The only sanctioned dangerouslySetInnerHTML in the project (SECURITY §4.3).
import { toScriptSafeJson } from './serialize.ts'

type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue }

export function JsonLd({ data }: { data: { readonly [key: string]: JsonValue } }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toScriptSafeJson(data) }} />
}
