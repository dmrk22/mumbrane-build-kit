// Every release fact the site renders (CONTENT §4 traceability): the value as shown, and the exact
// text of src/content/source/releases.md that contains it. claims.test.ts checks both.
export type Claim = { id: string; value: string; line: string }

const LIMITS =
  'Current limits include 256 entities, 2,048 facts, up to 32 documents and 128 sentences in composition, and six clauses per composed sentence.'

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
  {
    id: 'smoke',
    value: '10 answers and replays after fresh installation',
    line: '| Final sealed-artifact smoke | 10 answers and replays after fresh installation |',
  },
  { id: 'limit-entities', value: '256 entities', line: LIMITS },
  { id: 'limit-facts', value: '2,048 facts', line: LIMITS },
  { id: 'limit-composition', value: 'up to 32 documents and 128 sentences in composition', line: LIMITS },
  { id: 'limit-clauses', value: 'six clauses per composed sentence', line: LIMITS },
  {
    id: 'limit-question',
    value: 'Questions have a 2,048-character limit',
    line: 'Questions have a 2,048-character limit and separate bounded parsing/execution work.',
  },
  {
    id: 'first-query',
    value: '0.781 seconds',
    line: '| First core CLI query after install/load | 0.781 seconds |',
  },
  {
    id: 'repeated',
    value: 'Median 0.559 seconds across seven observations',
    line: '| Repeated fresh CLI processes | Median 0.559 seconds across seven observations |',
  },
  { id: 'installed', value: '728,184,684 bytes', line: '| Installed environment | 728,184,684 bytes |' },
  { id: 'payloads', value: '2,545,963 bytes', line: '| Compiled model payloads | 2,545,963 bytes |' },
  { id: 'archive', value: '180,884,002 bytes', line: '| Sealed delivery archive | 180,884,002 bytes |' },
  {
    id: 'instrumented',
    value: '51 instrumented processes',
    line: 'Guarded inference and replay recorded zero unexpected blocks across 51 instrumented processes after guard probes.',
  },
] as const satisfies readonly Claim[]

export type ClaimId = (typeof CLAIMS)[number]['id']

export function claim(id: ClaimId): string {
  return CLAIMS.find((c) => c.id === id)?.value ?? ''
}
