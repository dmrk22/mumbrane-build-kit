// Console preview copy (CONSOLE §2–§12). Every output is labelled a simulation (CONTENT §4).
import type { Limit, Outcome, Refusal } from '../../lib/console/types.ts'
import type { Outcome as ChipOutcome } from '../outcomes.ts'

export const CONSOLE_UI = {
  simulation: 'Simulation',
  nav: {
    label: 'Console',
    playground: 'Playground',
    keys: 'Keys',
    usage: 'Usage',
    docs: 'Docs',
    settings: 'Settings',
    home: 'Mumbrane home',
  },
  theme: { label: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
  titles: {
    entry: 'Console preview',
    playground: 'Playground',
    keys: 'API keys',
    usage: 'Usage',
    settings: 'Settings',
  },
  entry: {
    title: 'Console preview',
    text: 'Ask questions about an example world and inspect the evidence. Everything runs in your browser as a simulation — nothing is sent anywhere.',
    steps: ['Open a world', 'Click a question', 'Read the evidence'],
    worlds: 'Example worlds',
    counts: (entities: number, definitions: number, facts: number) =>
      `${entities} entities · ${definitions} definitions · ${facts} facts`,
    examples: (n: number) => `${n} example questions, simulated:`,
    open: 'Open',
    footnote:
      'Simulation — not Moth. The worlds are named after the four synthetic example worlds in Moth Preview 004; their contents here are our own illustrative examples.',
    moth: { label: 'Moth itself runs locally', href: '/moth' },
  },
  world: {
    label: 'World',
    show: 'Show world',
    hide: 'Hide world',
    close: 'Close',
    switcher: 'Choose a world',
    requires: 'Requires',
    build: (id: string, active: boolean) => `build ${id}${active ? ' · active' : ''}`,
    buildHelp: 'A build is a compiled version of this world. Answers remember the build they came from.',
    definitions: 'Definitions',
    definitionsHelp: 'What each term requires. Questions are checked against these.',
    facts: 'Facts',
    factsHelp: 'What the world says about each entity — nothing from outside it.',
    change: 'Try a change',
    changeHelp: 'Pick a different definition, then rebuild. Facts never change between builds.',
    base: 'As written',
    baseEffect: 'The definitions shown above.',
    rebuild: 'Rebuild',
    rebuilt: (id: string) => `Rebuilt. Build ${id} is now active.`,
    empty: 'This world has no questions yet.',
  },
  ask: {
    label: 'Question',
    placeholder: (world: string, example: string) => `Ask about ${world}… e.g. ${example}`,
    submit: 'Ask',
    examples: 'Example questions',
    long: 'A question longer than 2,048 characters',
    counter: (n: number, max: number) => `${n.toLocaleString('en-US')} / ${max.toLocaleString('en-US')}`,
    skip: 'Skip to evidence',
  },
  results: {
    label: 'Results',
    empty: 'Ask a question, or click an example above.',
    capped: 'Showing the latest 200 results; older ones were dropped.',
    announce: (entity: string, outcome: string) => `${entity}: ${outcome}`,
    replay: 'Replay',
    replayed: (id: string, same: boolean) =>
      same
        ? `Replayed against build ${id} — same result.`
        : `Replayed against build ${id} — the result differs.`,
    evidence: 'Evidence',
    json: 'View JSON',
    simulated: (ms: number) => `Simulated in ${ms < 0.1 ? '<0.1' : ms.toFixed(1)} ms in your browser`,
    error: 'Something went wrong in the simulator. Try again.',
    retry: 'Try again',
  },
  evidence: {
    title: 'Evidence',
    empty: 'Ask a question to see its evidence here.',
    trace: 'Trace',
    build: 'Build',
    variant: (label: string | null) => label ?? 'As written',
    status: { supported: 'established', missing: 'not established', conflict: 'conflict' },
    jsonTag: 'Illustrative — not the Preview 004 schema',
    download: 'Download JSON',
    jsonLabel: 'JSON · simulation',
    showJson: 'Show JSON',
    hideJson: 'Hide JSON',
    question: 'Question',
    notEvaluated: 'Not evaluated. The question stopped before any fact was checked.',
    cite: 'Show in the world panel',
    filename: (id: string) => `mumbrane-simulation-${id}.json`,
    jsonNote: 'Simulation — not Moth. Illustrative — not the Preview 004 schema.',
  },
  answer: {
    supported: (entity: string, term: string, article: string) => `\`${entity}\` is ${article} ${term}.`,
    because: (clauses: string) => `Because ${clauses}.`,
    unproven: (entity: string, term: string, article: string) =>
      `The field does not establish that \`${entity}\` is ${article} ${term}.`,
    missing: (items: string) => `Missing: ${items}.`,
    recorded: (facts: string) => `The field records: ${facts}`,
    notFails: 'This does not mean it fails — the field has not been given that support.',
    conflict: (facts: string) => `The field contains conflicting facts: ${facts}`,
    resolve: 'Resolve the conflict and rebuild.',
    shorten: 'Shorten the question and ask again.',
    tryInstead: 'Try instead',
  } as const,
  refusal: (r: Refusal): string => {
    switch (r.code) {
      case 'negated':
        return 'Negated questions are not supported in this language contract. Ask the positive question instead.'
      case 'form':
        return 'This question form is outside the supported language. Try: Is <entity> a <term>?'
      case 'control':
        return 'The question contains control or invisible characters, which the language does not accept.'
      case 'undeclared':
        return `${r.subject} is not declared in this world.`
      case 'undefined':
        return `${r.subject} is not defined in this world.`
    }
  },
  limit: (l: Limit): string => {
    switch (l.code) {
      case 'length':
        return 'The question is longer than 2,048 characters.'
      case 'depth':
        return 'The definitions nest deeper than the bounded evaluation allows.'
      case 'steps':
        return 'The evaluation reached its bounded number of steps.'
    }
  },
  outcome: {
    SUPPORTED: 'supported',
    NO_SUPPORTED_PROOF: 'no supported proof',
    CONFLICT: 'conflict',
    REFUSED: 'refused',
    RESOURCE_LIMIT: 'resource limit',
  } satisfies Record<Outcome, string>,
  /** The site's outcome chip for each simulated outcome (same colours and labels as /moth). */
  chip: {
    SUPPORTED: 'supported',
    NO_SUPPORTED_PROOF: 'unproven',
    CONFLICT: 'conflict',
    REFUSED: 'refused',
    RESOURCE_LIMIT: 'limit',
  } satisfies Record<Outcome, ChipOutcome>,
  keys: {
    title: 'API keys',
    note: 'Keys arrive with the hosted console. This page shows how managing them will work.',
    columns: ['Name', 'Created', 'Last used', 'Scope'],
    empty: 'No keys yet',
    create: 'Create key',
    dialog: {
      title: 'Create a key',
      name: 'Name',
      scope: 'Scope',
      scopes: [
        { value: 'read', label: 'Read results' },
        { value: 'ask', label: 'Ask and build' },
      ],
      submit: 'Create',
      cancel: 'Cancel',
      done: 'No key was created — keys arrive with the hosted console.',
      close: 'Close',
    },
  },
  usage: {
    title: 'This session',
    asked: 'Questions asked',
    outcomes: 'Outcomes',
    worlds: 'By world',
    median: 'Median simulation time',
    empty: 'No questions yet in this session.',
    open: 'Open the playground',
    note: 'Counted in this browser tab only. Nothing is sent or stored.',
  },
  settings: {
    theme: 'Theme',
    motion: 'Motion',
    motionText: 'Follows your system setting.',
    session: 'Session',
    sessionText: 'Clears this tab’s questions and results.',
    reset: 'Reset session',
    confirm: 'Clear all questions and results?',
    confirmYes: 'Yes, reset',
    confirmNo: 'Keep them',
    cleared: 'Session cleared.',
    account: 'Account',
    accountText: 'Accounts arrive with the hosted console.',
    shortcuts: 'Keyboard shortcuts',
    links: 'Links',
    linkItems: [
      { label: 'Documentation', href: '/developers/docs' },
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Responsible disclosure', href: '/legal/responsible-disclosure' },
    ],
  },
  shortcuts: {
    title: 'Keyboard shortcuts',
    open: 'Shortcuts',
    close: 'Close',
    items: [
      ['/', 'Focus the question'],
      ['Enter', 'Ask'],
      ['↑', 'Previous question (in an empty question box)'],
      ['J / K', 'Next / previous result'],
      ['E', 'Show the selected result’s evidence'],
      ['R', 'Replay the selected result'],
      ['Esc', 'Close a drawer or dialog, or leave the question box'],
      ['?', 'Show these shortcuts'],
    ],
  },
} as const
