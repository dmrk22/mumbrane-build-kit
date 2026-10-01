// /contact and /contact/sales copy (CONTENT §3.7). Field names match src/lib/forms.ts schemas.
import type { Interest } from '../lib/security/params.ts'

export type FieldSpec = {
  name: string
  label: string
  kind: 'text' | 'email' | 'select' | 'textarea'
  autoComplete?: string
  hint?: string
  optional?: true
  /** Pairs with its neighbour from 768 px (DESIGN §9.5). */
  half?: true
  options?: readonly { value: string; label: string }[]
  /** Error copy per failure (src/lib/forms.ts `FieldError`). */
  errors: { missing?: string; invalid?: string; short?: string; long?: string }
}

const MESSAGE_HINT = "At least 20 characters. Please don't include sensitive personal data."
const NAME_ERRORS = { missing: 'Enter your name.', long: 'Keep it under 120 characters.' }
const EMAIL_ERRORS = {
  missing: 'Enter an email address like name@example.com.',
  invalid: 'Enter an email address like name@example.com.',
  long: 'Enter an email address like name@example.com.',
}
const MESSAGE_ERRORS = {
  missing: 'Tell us a little more — at least 20 characters.',
  short: 'Tell us a little more — at least 20 characters.',
  long: 'Keep it under 4,000 characters.',
}

export const TOPICS: Record<Interest, string> = {
  general: 'General',
  research: 'Research',
  sales: 'Sales',
  business: 'Business',
  'customer-support': 'Customer support',
  legal: 'Legal',
  security: 'Security',
  pricing: 'Pricing',
  careers: 'Careers',
  press: 'Press',
}

export const FORM_UI = {
  choose: 'Choose…',
  optional: '(optional)',
  summary: (n: number) => `Please fix ${n} ${n === 1 ? 'field' : 'fields'}.`,
  privacy: 'We use what you send only to reply. See the [privacy notice](/legal/privacy).',
  honeypot: 'Leave this field empty',
  sending: 'Checking',
  preview: {
    title: 'Thanks — nearly there.',
    text: 'Online submissions are not connected yet, so this message has not been sent. You can send it by email in one step.',
    email: 'Send it by email instead',
    edit: 'Edit message',
  },
  to: 'hello@mumbrane.com',
} as const

export const CONTACT = {
  eyebrow: 'Contact',
  title: 'Talk to Mumbrane.',
  lede: 'Tell us what you are trying to understand, and where the difficulty is.',
  emails: [
    { label: 'Research and technical', address: 'research@mumbrane.com' },
    { label: 'General and press', address: 'hello@mumbrane.com' },
  ],
  copy: 'Copy the address',
  note: 'A focused note is enough. Links to papers or prior work are welcome.',
  form: {
    title: 'Send a message',
    submit: 'Send message',
    subject: (topic: string) => `Contact — ${topic}`,
    fields: [
      { name: 'name', label: 'Name', kind: 'text', autoComplete: 'name', half: true, errors: NAME_ERRORS },
      {
        name: 'email',
        label: 'Email',
        kind: 'email',
        autoComplete: 'email',
        half: true,
        errors: EMAIL_ERRORS,
      },
      {
        name: 'organization',
        label: 'Organization',
        kind: 'text',
        autoComplete: 'organization',
        optional: true,
        errors: { long: 'Keep it under 160 characters.' },
      },
      {
        name: 'interest',
        label: 'Topic',
        kind: 'select',
        options: Object.entries(TOPICS).map(([value, label]) => ({ value, label })),
        errors: { missing: 'Choose a topic.', invalid: 'Choose a topic.' },
      },
      { name: 'message', label: 'Message', kind: 'textarea', hint: MESSAGE_HINT, errors: MESSAGE_ERRORS },
    ] satisfies FieldSpec[] as FieldSpec[],
  },
} as const

export const SALES = {
  eyebrow: 'Contact sales',
  title: 'Contact sales',
  lede: 'Tell us the decisions you want answered from your own rules. We’ll tell you honestly whether Moth fits today.',
  expect: {
    title: 'What to expect',
    items: [
      { icon: 'flask', text: 'Preview 004 is a local evaluation package.' },
      { icon: 'lock', text: 'No hosted service or public API yet.' },
      { icon: 'info', text: 'Pricing is by conversation.' },
    ],
  },
  form: {
    title: 'Tell us about the decision',
    submit: 'Contact sales',
    subject: (company: string) => `Sales — ${company}`,
    fields: [
      { name: 'name', label: 'Name', kind: 'text', autoComplete: 'name', half: true, errors: NAME_ERRORS },
      {
        name: 'email',
        label: 'Work email',
        kind: 'email',
        autoComplete: 'email',
        half: true,
        errors: EMAIL_ERRORS,
      },
      {
        name: 'company',
        label: 'Company',
        kind: 'text',
        autoComplete: 'organization',
        half: true,
        errors: { missing: 'Enter your company.', long: 'Keep it under 160 characters.' },
      },
      {
        name: 'role',
        label: 'Role',
        kind: 'text',
        autoComplete: 'organization-title',
        optional: true,
        half: true,
        errors: { long: 'Keep it under 120 characters.' },
      },
      {
        name: 'size',
        label: 'Company size',
        kind: 'select',
        half: true,
        options: [
          { value: '1-50', label: '1–50' },
          { value: '51-500', label: '51–500' },
          { value: '501-5000', label: '501–5,000' },
          { value: '5000+', label: '5,000+' },
        ],
        errors: { missing: 'Choose a company size.', invalid: 'Choose a company size.' },
      },
      {
        name: 'area',
        label: 'Area',
        kind: 'select',
        half: true,
        options: [
          { value: 'business', label: 'Business' },
          { value: 'customer-support', label: 'Customer support' },
          { value: 'legal', label: 'Legal' },
          { value: 'security', label: 'Security' },
          { value: 'other', label: 'Other' },
        ],
        errors: { missing: 'Choose an area.', invalid: 'Choose an area.' },
      },
      {
        name: 'timeframe',
        label: 'Timeframe',
        kind: 'select',
        options: [
          { value: 'exploring', label: 'Exploring' },
          { value: 'this-quarter', label: 'This quarter' },
          { value: 'this-year', label: 'This year' },
        ],
        errors: { missing: 'Choose a timeframe.', invalid: 'Choose a timeframe.' },
      },
      {
        name: 'message',
        label: 'What should the model decide?',
        kind: 'textarea',
        hint: MESSAGE_HINT,
        errors: MESSAGE_ERRORS,
      },
    ] satisfies FieldSpec[] as FieldSpec[],
  },
} as const
