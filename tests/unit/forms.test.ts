import assert from 'node:assert/strict'
import test from 'node:test'
import { check, MAILTO_MAX, mailtoHref, readValues } from '../../src/lib/forms.ts'

const contact = {
  name: '  Ada  ',
  email: 'ada@example.com',
  organization: '',
  interest: 'research',
  message: 'A question about compiled definitions.',
}

test('a valid contact message passes, trimmed', () => {
  const r = check('contact', contact)
  assert.ok(r.ok)
  assert.equal(r.data.name, 'Ada')
})

test('each failure is named once, in field order', () => {
  const r = check('contact', { name: ' ', email: 'not-an-email', interest: '', message: 'too short' })
  assert.ok(!r.ok)
  assert.deepEqual(r.errors, { name: 'missing', email: 'invalid', interest: 'missing', message: 'short' })
  assert.deepEqual(Object.keys(r.errors), ['name', 'email', 'interest', 'message'])
})

test('blank email is missing; over-long fields are long; unknown topics are invalid', () => {
  const r = check('contact', { ...contact, email: '', message: 'x'.repeat(4001), interest: 'jobs' })
  assert.ok(!r.ok)
  assert.deepEqual(r.errors, { email: 'missing', interest: 'invalid', message: 'long' })
})

test('sales: enums and required company', () => {
  const ok = check('sales', {
    name: 'Ada',
    email: 'ada@example.com',
    company: 'Analytical Engines',
    role: '',
    size: '51-500',
    area: 'legal',
    timeframe: 'this-year',
    message: 'Which purchases may skip review?',
  })
  assert.ok(ok.ok)
  const bad = check('sales', { name: 'Ada', email: 'ada@example.com', company: '', size: '10', message: '' })
  assert.ok(!bad.ok)
  assert.deepEqual(Object.keys(bad.errors), ['company', 'size', 'area', 'timeframe', 'message'])
  assert.equal(bad.errors.size, 'invalid')
  assert.equal(bad.errors.area, 'missing')
})

test('readValues keeps only schema fields, as strings', () => {
  const fd = new FormData()
  fd.set('name', 'Ada')
  fd.set('website', 'spam')
  fd.set('$ACTION_ID_abc', '')
  fd.set('message', new Blob(['file']), 'x.txt')
  assert.deepEqual(readValues('contact', fd), { name: 'Ada' })
})

test('mailto stays within 1,800 characters and cuts on a code point with an ellipsis', () => {
  const body = `Message:\n${'naïve 🧪 '.repeat(600)}`
  const href = mailtoHref('hello@mumbrane.com', 'Contact — Research', body)
  assert.ok(href.length <= MAILTO_MAX, `${href.length}`)
  const decoded = decodeURIComponent(href.slice(href.indexOf('&body=') + 6))
  assert.ok(decoded.endsWith('…'))
  assert.ok(body.startsWith(decoded.slice(0, -1)))
})

test('a short mailto is exact and fully encoded', () => {
  const href = mailtoHref('hello@mumbrane.com', 'Hi & bye', 'a=b?c')
  assert.equal(href, 'mailto:hello@mumbrane.com?subject=Hi%20%26%20bye&body=a%3Db%3Fc')
})
