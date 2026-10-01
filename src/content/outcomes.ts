// Moth's outcomes (CONTENT §3.1 section 4). Labels are sentence case. Each carries its judgement in
// logic notation: Γ is the field, φ the question, ⊥ a contradiction, ℒ the supported language, B the
// resource bound. `meaning` and `next` feed the outcome ledgers on /, /moth and /developers.
export const OUTCOMES = {
  supported: {
    label: 'Supported',
    symbol: 'Γ ⊢ φ',
    meaning: 'The field’s facts and definitions establish membership.',
    next: 'Inspect the evidence; replay it later against the same build.',
  },
  unproven: {
    label: 'No supported proof',
    symbol: 'Γ ⊬ φ',
    meaning: 'The field does not establish membership. It does not prove the opposite.',
    next: 'Add the missing fact or revisit the definition.',
  },
  conflict: {
    label: 'Conflict',
    symbol: 'Γ ⊢ ⊥',
    meaning: 'The supplied information contradicts itself.',
    next: 'Resolve the conflicting facts.',
  },
  refused: {
    label: 'Refused',
    symbol: 'φ ∉ ℒ',
    meaning: 'The question or source is outside the supported language.',
    next: 'Rephrase within the language contract.',
  },
  limit: {
    label: 'Resource limit',
    symbol: 'cost > B',
    meaning: 'A bounded safeguard stopped the work before it finished.',
    next: 'Narrow the question or the field.',
  },
  // The source (releases.md) names these two outcomes without defining them further; the text
  // below restates only what the names say.
  incomplete: {
    label: 'Incomplete',
    symbol: 'Γ ⊢ ?',
    meaning: 'Execution did not finish. No classification was established.',
    next: 'Treat it as no answer, not as a no.',
  },
  incompatible: {
    label: 'Incompatible',
    symbol: 'b ≠ b′',
    meaning: 'A retained artifact does not match the runtime it was used with.',
    next: 'Use it with the build and runtime it came from.',
  },
} as const satisfies Record<string, { label: string; symbol: string; meaning: string; next: string }>

export type Outcome = keyof typeof OUTCOMES

/** The five outcomes shown on the home page and in compact ledgers. */
export const CORE_OUTCOMES = [
  'supported',
  'unproven',
  'conflict',
  'refused',
  'limit',
] as const satisfies readonly Outcome[]
