import { processFlashLobbyLiveReminders } from '~/server/utils/flashLobby'

export default defineEventHandler(async () => {
  const processed = await processFlashLobbyLiveReminders()
  return {
    ok: true,
    processed
  }
})
