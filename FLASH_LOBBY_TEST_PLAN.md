# Flash Lobby Test Plan

This covers the four core Flash Lobby flows after the spark-based rewrite.

## Setup

1. Apply the latest migration, especially `054_flash_lobby_intents.sql`.
2. Run the app locally.
3. Use two real accounts:
   - User A
   - User B
4. Make sure both profiles:
   - are active
   - can see each other based on `gender` and `interested_in`
   - have completed vibe answers so compatibility scoring is meaningful
5. Create or start a live Flash Lobby.

## Scenario 1: One-Sided Spark

1. Log in as User A and open `/lobby`.
2. Open User B’s profile card.
3. Send a spark with a message longer than 12 characters.
4. Confirm:
   - the spark succeeds
   - User B disappears from User A’s live feed
   - User A sees the spark in the sidebar/live state
   - User B receives a notification about the spark
5. End the lobby.
6. Log in as User B and open `/lobby`.
7. Confirm:
   - the spark appears in `Received Sparks`
   - the message is visible
   - the match is not yet fully unlocked

## Scenario 2: Mutual Spark Instant Unlock

1. Start a live Flash Lobby with User A and User B eligible.
2. As User A, send a spark to User B.
3. Before the lobby ends, as User B, send a spark back to User A.
4. Confirm:
   - both intents become mutual
   - a `matches` row is created with `created_by_label = 'flash_lobby'`
   - the match is fully unlocked immediately
   - both users receive mutual-unlock notifications
   - both users can open `/me/connection/:id`

## Scenario 3: Receiver Unlock After Lobby

1. Create a one-sided spark from User A to User B.
2. End the lobby.
3. As User B, open `/lobby` and click `Unlock This Match`.
4. Confirm:
   - checkout starts via `/payment/match/:id?unlock_both=1`
   - after successful payment, both users are fully unlocked
   - both users receive in-app notifications
   - the match opens from notifications or `/me/connection/:id`

## Scenario 4: Super Connect

1. Create a one-sided spark from User A to User B.
2. End the lobby.
3. As User A, click `Super Connect for GHS 30`.
4. Confirm:
   - checkout starts via `/payment/match/:id?super_connect=1`
   - after successful payment, both users are fully unlocked
   - the sender covers the double unlock path
   - both users receive notifications explaining Super Connect

## Scenario 5: Decline

1. Create a one-sided spark from User A to User B.
2. End the lobby.
3. As User B, click `Pass`.
4. Confirm:
   - the spark disappears from `Received Sparks`
   - sender sees the spark as closed via notification
   - the intent status becomes `declined`

## Scenario 6: Expiry

1. Create a one-sided spark and do not resolve it.
2. Wait until the response window passes, or temporarily backdate the lobby.
3. Open `/lobby` or hit `/api/lobby/state`.
4. Confirm:
   - unresolved `pending` intents become `expired`
   - expired sparks are not actionable
   - the recent-lobby view shows the expired count

## Quick DB Checks

- `flash_lobby_intents.status` should move through:
  - `pending`
  - `mutual` or `converted_to_match` or `declined` or `expired`
- `matches.created_by_label` should be `flash_lobby`
- mutual or paid outcomes should end in a fully unlocked match
- notifications should exist in `m2m.notifications` for:
  - spark received
  - mutual unlock
  - paid resolution
