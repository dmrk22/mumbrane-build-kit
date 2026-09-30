import { z } from 'zod'

const first = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const INTERESTS = [
  'general',
  'research',
  'sales',
  'business',
  'customer-support',
  'legal',
  'security',
  'pricing',
  'careers',
  'press',
] as const
export type Interest = (typeof INTERESTS)[number]
const InterestParam = z.enum(INTERESTS)

/** `/contact?interest=…` → a known interest, or undefined (never reflected). */
export function parseInterest(raw: unknown): Interest | undefined {
  const result = InterestParam.safeParse(first(raw))
  return result.success ? result.data : undefined
}

export const USE_CASE_FILTERS = ['all', 'business', 'customer-support', 'legal', 'security'] as const
export type UseCaseFilter = (typeof USE_CASE_FILTERS)[number]
const UseCaseParam = z.enum(USE_CASE_FILTERS)

/** `/solutions/use-cases?domain=…` → a known filter, defaulting to 'all'. */
export function parseUseCaseFilter(raw: unknown): UseCaseFilter {
  const result = UseCaseParam.safeParse(first(raw))
  return result.success ? result.data : 'all'
}

export const WORLD_IDS = ['purchasing', 'libraries', 'trails', 'venues'] as const
export type WorldId = (typeof WORLD_IDS)[number]
const WorldParam = z.enum(WORLD_IDS)

/** `/console/playground?world=…` → a known world, or undefined (entry screen chooses). */
export function parseWorld(raw: unknown): WorldId | undefined {
  const result = WorldParam.safeParse(first(raw))
  return result.success ? result.data : undefined
}
