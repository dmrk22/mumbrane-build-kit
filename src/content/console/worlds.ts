// The console's four worlds (CONSOLE §5.2). Named after Moth Preview 004's synthetic example worlds;
// their contents here are our own illustrative examples. Entity ids are single lowercase words;
// definitions are positive; explicit negative facts are allowed.
import type { Fact, World, WorldId } from '../../lib/console/types.ts'

const prop = (entity: string, property: string, text: string): Fact => ({
  type: 'property',
  entity,
  property,
  text,
})
const not = (entity: string, property: string, text: string): Fact => ({
  type: 'property',
  entity,
  property,
  negated: true,
  text,
})
const rel = (entity: string, relation: string, object: string, text: string): Fact => ({
  type: 'relation',
  entity,
  relation,
  object,
  text,
})

// The Trails limit example: a well-formed question padded past 2,048 characters.
const LONG_QUESTION = `Is trailone an accessible trail${' and'.repeat(517)}?`

export const WORLDS: readonly World[] = [
  {
    id: 'purchasing',
    name: 'Purchasing',
    blurb: 'Is an order ready to purchase? Funds and supplier approval.',
    entities: [
      { id: 'atlas', kind: 'supplier' },
      { id: 'birch', kind: 'supplier' },
      { id: 'cedar', kind: 'supplier' },
      { id: 'orderone', kind: 'item' },
      { id: 'ordertwo', kind: 'item' },
      { id: 'orderthree', kind: 'item' },
      { id: 'orderfour', kind: 'item' },
    ],
    definitions: [
      {
        id: 'approved-supplier',
        term: 'approved supplier',
        kind: 'supplier',
        requires: [{ type: 'property', property: 'passed inspection', text: 'passed inspection' }],
        text: 'An approved supplier is a supplier that passed inspection.',
      },
      {
        id: 'purchase-ready-item',
        term: 'purchase-ready item',
        kind: 'item',
        requires: [
          { type: 'property', property: 'funds available', text: 'has funds available' },
          {
            type: 'relation',
            relation: 'supplier',
            target: 'approved-supplier',
            text: 'has an approved supplier',
          },
        ],
        text: 'A purchase-ready item is an item that has funds available and has an approved supplier.',
      },
    ],
    facts: [
      prop('atlas', 'passed inspection', 'atlas passed inspection.'),
      prop('birch', 'passed audit', 'birch passed audit.'),
      prop('cedar', 'passed inspection', 'cedar passed inspection.'),
      not('cedar', 'passed inspection', 'cedar did not pass inspection.'),
      prop('orderone', 'funds available', 'orderone has funds available.'),
      rel('orderone', 'supplier', 'atlas', 'orderone appoints atlas as its supplier.'),
      prop('ordertwo', 'funds available', 'ordertwo has funds available.'),
      rel('ordertwo', 'supplier', 'birch', 'ordertwo appoints birch as its supplier.'),
      prop('orderthree', 'funds available', 'orderthree has funds available.'),
      rel('orderthree', 'supplier', 'cedar', 'orderthree appoints cedar as its supplier.'),
      rel('orderfour', 'supplier', 'atlas', 'orderfour appoints atlas as its supplier.'),
    ],
    examples: [
      'Is orderone a purchase-ready item?',
      'Does ordertwo meet the requirements for a purchase-ready item?',
      'Is orderthree a purchase-ready item?',
      'Is orderfour a purchase-ready item?',
      'Is ordertwo not a purchase-ready item?',
      'Is atlas an approved supplier?',
    ],
    variants: [
      {
        id: 'audit',
        label: 'Require audit instead of inspection',
        effect: 'An approved supplier must have passed audit.',
        replace: {
          definitionId: 'approved-supplier',
          requires: [{ type: 'property', property: 'passed audit', text: 'passed audit' }],
          text: 'An approved supplier is a supplier that passed audit.',
        },
      },
    ],
  },
  {
    id: 'libraries',
    name: 'Libraries',
    blurb: 'Can a book be lent or recommended? Catalogue and collection rules.',
    entities: [
      { id: 'bookone', kind: 'book' },
      { id: 'booktwo', kind: 'book' },
      { id: 'bookthree', kind: 'book' },
    ],
    definitions: [
      {
        id: 'lendable-book',
        term: 'lendable book',
        kind: 'book',
        requires: [
          { type: 'property', property: 'catalogued', text: 'is catalogued' },
          { type: 'property', property: 'lending collection', text: 'is in the lending collection' },
        ],
        text: 'A lendable book is a book that is catalogued and is in the lending collection.',
      },
      {
        id: 'recommended-book',
        term: 'recommended book',
        kind: 'book',
        requires: [
          { type: 'is', target: 'lendable-book', text: 'is a lendable book' },
          { type: 'property', property: 'reviewed summary', text: 'has a reviewed summary' },
        ],
        text: 'A recommended book is a lendable book that has a reviewed summary.',
      },
    ],
    facts: [
      prop('bookone', 'catalogued', 'bookone is catalogued.'),
      prop('bookone', 'lending collection', 'bookone is in the lending collection.'),
      prop('bookone', 'reviewed summary', 'bookone has a reviewed summary.'),
      prop('booktwo', 'catalogued', 'booktwo is catalogued.'),
      prop('bookthree', 'catalogued', 'bookthree is catalogued.'),
      prop('bookthree', 'lending collection', 'bookthree is in the lending collection.'),
    ],
    examples: [
      'Is bookone a recommended book?',
      'Is booktwo a lendable book?',
      'Is bookthree a recommended book?',
      'Is bookfour a lendable book?',
      'Is bookone a rare book?',
    ],
    variants: [
      {
        id: 'no-summary',
        label: 'Drop the summary requirement',
        effect: 'A recommended book only has to be lendable.',
        replace: {
          definitionId: 'recommended-book',
          requires: [{ type: 'is', target: 'lendable-book', text: 'is a lendable book' }],
          text: 'A recommended book is a lendable book.',
        },
      },
    ],
  },
  {
    id: 'trails',
    name: 'Trails',
    blurb: 'Is a trail accessible? Surface and status rules.',
    entities: [
      { id: 'trailone', kind: 'trail' },
      { id: 'trailtwo', kind: 'trail' },
      { id: 'trailthree', kind: 'trail' },
    ],
    definitions: [
      {
        id: 'accessible-trail',
        term: 'accessible trail',
        kind: 'trail',
        requires: [
          { type: 'property', property: 'open', text: 'is open' },
          { type: 'property', property: 'paved surface', text: 'has a paved surface' },
        ],
        text: 'An accessible trail is a trail that is open and has a paved surface.',
      },
      {
        id: 'family-trail',
        term: 'family trail',
        kind: 'trail',
        requires: [
          { type: 'is', target: 'accessible-trail', text: 'is an accessible trail' },
          { type: 'property', property: 'shaded section', text: 'has a shaded section' },
        ],
        text: 'A family trail is an accessible trail that has a shaded section.',
      },
    ],
    facts: [
      prop('trailone', 'open', 'trailone is open.'),
      prop('trailone', 'paved surface', 'trailone has a paved surface.'),
      prop('trailone', 'shaded section', 'trailone has a shaded section.'),
      prop('trailtwo', 'open', 'trailtwo is open.'),
      prop('trailthree', 'open', 'trailthree is open.'),
      not('trailthree', 'open', 'trailthree is not open.'),
      prop('trailthree', 'paved surface', 'trailthree has a paved surface.'),
    ],
    examples: [
      'Is trailone a family trail?',
      'Is trailtwo an accessible trail?',
      'Is trailthree an accessible trail?',
      LONG_QUESTION,
    ],
    variants: [
      {
        id: 'unpaved',
        label: 'Paved surface not required',
        effect: 'An accessible trail only has to be open.',
        replace: {
          definitionId: 'accessible-trail',
          requires: [{ type: 'property', property: 'open', text: 'is open' }],
          text: 'An accessible trail is a trail that is open.',
        },
      },
    ],
  },
  {
    id: 'venues',
    name: 'Venues',
    blurb: 'Is a venue ready for an event? Access, licence, and booking.',
    entities: [
      { id: 'hallone', kind: 'venue' },
      { id: 'halltwo', kind: 'venue' },
      { id: 'hallthree', kind: 'venue' },
    ],
    definitions: [
      {
        id: 'suitable-venue',
        term: 'suitable venue',
        kind: 'venue',
        requires: [
          { type: 'property', property: 'step-free access', text: 'has step-free access' },
          { type: 'property', property: 'licence for events', text: 'has a licence for events' },
        ],
        text: 'A suitable venue is a venue that has step-free access and has a licence for events.',
      },
      {
        id: 'ready-venue',
        term: 'ready venue',
        kind: 'venue',
        requires: [
          { type: 'is', target: 'suitable-venue', text: 'is a suitable venue' },
          { type: 'property', property: 'confirmed booking', text: 'has a confirmed booking' },
        ],
        text: 'A ready venue is a suitable venue that has a confirmed booking.',
      },
    ],
    facts: [
      prop('hallone', 'step-free access', 'hallone has step-free access.'),
      prop('hallone', 'licence for events', 'hallone has a licence for events.'),
      prop('hallone', 'confirmed booking', 'hallone has a confirmed booking.'),
      prop('halltwo', 'step-free access', 'halltwo has step-free access.'),
      not('halltwo', 'licence for events', 'halltwo has no licence for events.'),
      prop('hallthree', 'step-free access', 'hallthree has step-free access.'),
      prop('hallthree', 'licence for events', 'hallthree has a licence for events.'),
    ],
    examples: [
      'Is hallone a ready venue?',
      'Is halltwo a suitable venue?',
      'Is hallthree a ready venue?',
      'Does hallone meet the requirements for a ready venue?',
    ],
    variants: [
      {
        id: 'no-booking',
        label: 'Booking not required',
        effect: 'A ready venue only has to be suitable.',
        replace: {
          definitionId: 'ready-venue',
          requires: [{ type: 'is', target: 'suitable-venue', text: 'is a suitable venue' }],
          text: 'A ready venue is a suitable venue.',
        },
      },
    ],
  },
]

export function worldById(id: WorldId): World {
  const w = WORLDS.find((x) => x.id === id)
  if (!w) throw new Error(`unknown world ${id}`)
  return w
}
