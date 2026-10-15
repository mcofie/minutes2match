import test from 'node:test'
import assert from 'node:assert/strict'

import { buildQueueRows } from '../server/utils/smsBroadcast.ts'

test('one queued message per phone number, however it is written', () => {
  const { rows, duplicates, noPhone } = buildQueueRows('b1', 'Hi {name}!', [
    { id: 'u1', phone: '0244123456', name: 'Ama Mensah' },
    { id: 'u2', phone: '+233 24 412 3456', name: 'Ama again' },
    { id: 'u3', phone: '233244123456', name: 'Ama thrice' },
    { id: 'u4', phone: '+254712345678', name: 'Wanjiku' },
    { id: 'u5', phone: '', name: 'No phone' },
    { id: 'u6', phone: null, name: 'Also none' }
  ], 'admin-1')
  assert.equal(rows.length, 2)
  assert.equal(duplicates, 2)
  assert.equal(noPhone, 2)
  assert.deepEqual(rows.map(r => r.recipient_phone), ['+233244123456', '+254712345678'])
})

test('{name} becomes the first name, or "there" when there is none', () => {
  const { rows } = buildQueueRows('b1', 'Hi {name}, {name}!', [
    { id: 'u1', phone: '+233200000001', name: 'Kofi Boateng' },
    { id: 'u2', phone: '+233200000002', name: '' }
  ], null)
  assert.equal(rows[0].message, 'Hi Kofi, Kofi!')
  assert.equal(rows[1].message, 'Hi there, there!')
})

test('rows start queued and belong to the blast', () => {
  const { rows } = buildQueueRows('blast-9', 'Hello', [{ id: 'u1', phone: '+233200000001', name: 'A' }], 'admin-1')
  assert.equal(rows[0].status, 'pending')
  assert.equal(rows[0].broadcast_id, 'blast-9')
  assert.equal(rows[0].sent_by, 'admin-1')
})
