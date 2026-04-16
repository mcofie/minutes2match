import { processFlashLobbyLifecycle } from '~/server/utils/flashLobby'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const result = await processFlashLobbyLifecycle()
  return {
    success: true,
    ...result
  }
})
