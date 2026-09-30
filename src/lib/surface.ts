/** The five grounds a section can sit on (DESIGN §5). Each is themed by `[data-surface]` in CSS. */
export const SURFACES = ['paper', 'paper-2', 'ink', 'ultramarine', 'cadmium'] as const
export type Surface = (typeof SURFACES)[number]
