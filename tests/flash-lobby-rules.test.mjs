import test from 'node:test'
import assert from 'node:assert/strict'

import {
  sanitizeSparkMessage,
  validateSparkMessage,
  resolveSparkOutcome,
  canPerformPostLobbyAction
} from '../server/utils/flashLobbyRules.ts'

test('sanitizeSparkMessage trims and collapses whitespace', () => {
  assert.equal(
    sanitizeSparkMessage('   Hey   there\n\nI think we would click   '),
    'Hey there I think we would click'
  )
})

test('validateSparkMessage enforces lobby message constraints', () => {
  assert.equal(validateSparkMessage('short'), 'Say a little more. Spark messages should be at least 12 characters.')
  assert.equal(validateSparkMessage('x'.repeat(181)), 'Spark messages must be 180 characters or less.')
  assert.equal(validateSparkMessage('I think we would genuinely connect.'), null)
})

test('resolveSparkOutcome keeps one-sided sparks pending', () => {
  assert.equal(resolveSparkOutcome({ existingIntentStatus: 'pending', reverseIntentExists: false }), 'pending')
})

test('resolveSparkOutcome promotes reverse sparks to mutual', () => {
  assert.equal(resolveSparkOutcome({ existingIntentStatus: 'pending', reverseIntentExists: true }), 'mutual')
})

test('resolveSparkOutcome blocks resolved spark states from being reused', () => {
  assert.equal(resolveSparkOutcome({ existingIntentStatus: 'converted_to_match', reverseIntentExists: false }), 'resolved')
  assert.equal(resolveSparkOutcome({ existingIntentStatus: 'declined', reverseIntentExists: false }), 'resolved')
  assert.equal(resolveSparkOutcome({ existingIntentStatus: 'expired', reverseIntentExists: false }), 'resolved')
})

test('recipient can unlock a pending one-sided spark after the lobby ends', () => {
  assert.deepEqual(
    canPerformPostLobbyAction({
      action: 'unlock',
      status: 'pending',
      isSender: false,
      isReceiver: true,
      lobbyEnded: true
    }),
    { ok: true }
  )
})

test('sender can super connect after the lobby ends', () => {
  assert.deepEqual(
    canPerformPostLobbyAction({
      action: 'super_connect',
      status: 'pending',
      isSender: true,
      isReceiver: false,
      lobbyEnded: true
    }),
    { ok: true }
  )
})

test('recipient can decline after the lobby ends', () => {
  assert.deepEqual(
    canPerformPostLobbyAction({
      action: 'decline',
      status: 'pending',
      isSender: false,
      isReceiver: true,
      lobbyEnded: true
    }),
    { ok: true }
  )
})

test('mutual sparks cannot be post-lobby unlocked again', () => {
  assert.deepEqual(
    canPerformPostLobbyAction({
      action: 'unlock',
      status: 'mutual',
      isSender: false,
      isReceiver: true,
      lobbyEnded: true
    }),
    { ok: false, error: 'This spark is already mutual.' }
  )
})

test('expired sparks are blocked', () => {
  assert.deepEqual(
    canPerformPostLobbyAction({
      action: 'unlock',
      status: 'expired',
      isSender: false,
      isReceiver: true,
      lobbyEnded: true
    }),
    { ok: false, error: 'This spark has expired.' }
  )
})

test('wrong actor cannot perform another users action', () => {
  assert.deepEqual(
    canPerformPostLobbyAction({
      action: 'super_connect',
      status: 'pending',
      isSender: false,
      isReceiver: true,
      lobbyEnded: true
    }),
    { ok: false, error: 'Only the sender can super connect this spark' }
  )
})
