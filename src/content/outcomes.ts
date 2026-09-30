// Moth's outcomes (CONTENT §3.1). Labels are sentence case; chips render them as mono uppercase.
export const OUTCOMES = {
  supported: { label: 'Supported' },
  unproven: { label: 'No supported proof' },
  conflict: { label: 'Conflict' },
  refused: { label: 'Refused' },
  limit: { label: 'Resource limit' },
  incomplete: { label: 'Incomplete' },
  incompatible: { label: 'Incompatible' },
} as const satisfies Record<string, { label: string }>

export type Outcome = keyof typeof OUTCOMES
