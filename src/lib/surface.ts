/** The five grounds a section can sit on. Each is themed by `[data-surface]` in CSS. */
export const SURFACES = ['paper', 'paper-2', 'ink', 'deep', 'ice'] as const
export type Surface = (typeof SURFACES)[number]
