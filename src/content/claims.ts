// Every release fact the site renders (CONTENT §4 traceability): the value as shown, and the exact
// text of src/content/source/releases.md that contains it. claims.test.ts checks both.
export type Claim = { id: string; value: string; line: string }

export const CLAIMS = [
  { id: 'release', value: 'Moth Inference Preview 004', line: '## Moth Inference Preview 004' },
  { id: 'profile', value: 'integrated-field/1', line: 'Current profile: integrated-field/1' },
  {
    id: 'models',
    value: 'five delivered models',
    line: 'The five delivered models span two profile families.',
  },
  {
    id: 'worlds',
    value: 'four synthetic example worlds',
    line: 'with four synthetic example worlds—purchasing, libraries, trails, and venues',
  },
  {
    id: 'platform',
    value: 'macOS ARM64',
    line: 'The package targets macOS ARM64 with Python 3.11 and locally available uv.',
  },
  {
    id: 'python',
    value: 'Python 3.11',
    line: 'The package targets macOS ARM64 with Python 3.11 and locally available uv.',
  },
  { id: 'core-answers', value: '64', line: '| Core installed answers | 64 |' },
  { id: 'replays', value: '64', line: '| Historical replays of those answers | 64 |' },
  { id: 'refusals', value: '32', line: '| Expected language/resource refusals | 32 |' },
  { id: 'regression', value: '2,115 tests passed', line: '| Repository regression | 2,115 tests passed |' },
] as const satisfies readonly Claim[]

export type ClaimId = (typeof CLAIMS)[number]['id']

export function claim(id: ClaimId): string {
  return CLAIMS.find((c) => c.id === id)?.value ?? ''
}
