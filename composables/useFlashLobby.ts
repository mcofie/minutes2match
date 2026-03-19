import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

export const useFlashLobby = () => {
  const supabase = useSupabaseClient()
  const activeLobby = ref<any>(null)
  const nextLobby = ref<any>(null)
  const lobbyUsers = ref<any[]>([])
  const currentTime = ref(new Date())
  const loading = ref(true)
  const loadingMore = ref(false)
  const currentPage = ref(1)
  const hasMore = ref(true)
  
  // Filtering state
  const activeFilters = ref({
    minAge: 18,
    maxAge: 50,
    persona: 'All',
    gender: '',
    location: ''
  })

  let timer: any = null

  const fetchLobbies = async () => {
    const now = new Date().toISOString()
    
    // 1. Check for current active lobby
    const { data: active } = await supabase
      .schema('m2m')
      .from('flash_lobbies')
      .select('*')
      .lte('start_at', now)
      .gte('end_at', now)
      .maybeSingle()

    activeLobby.value = active

    // 2. Check for next upcoming lobby
    const { data: upcoming } = await supabase
      .schema('m2m')
      .from('flash_lobbies')
      .select('*')
      .gt('start_at', now)
      .order('start_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    
    nextLobby.value = upcoming
    loading.value = false
  }

  const fetchParticipants = async (loadMore = false) => {
    if (loadMore) {
      if (!hasMore.value || loadingMore.value) return
      loadingMore.value = true
    } else {
      loading.value = true
      currentPage.value = 1
    }

    try {
      // 1. Fetch from our server-side API (bypasses RLS)
      const pageToFetch = loadMore ? currentPage.value + 1 : 1
      const response = await $fetch<any>('/api/lobby/participants', {
        params: { 
          page: pageToFetch, 
          limit: 12,
          ...activeFilters.value
        }
      })
      
      if (response && response.participants) {
        if (loadMore) {
          lobbyUsers.value = [...lobbyUsers.value, ...response.participants]
          currentPage.value = pageToFetch
        } else {
          lobbyUsers.value = response.participants
          currentPage.value = 1
        }
        hasMore.value = response.hasMore
      }
    } catch (err) {
      console.error('[useFlashLobby] Fetch participants failed:', err)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  // Auto-refresh when filters change
  watch(activeFilters, () => {
    fetchParticipants(false)
  }, { deep: true })

  const isLive = computed(() => !!activeLobby.value)
  
  const remainingSeconds = computed(() => {
    if (!activeLobby.value) return 0
    
    // If paused, we show the time that was remaining at the moment of pause
    if (activeLobby.value.is_paused && activeLobby.value.paused_at) {
       const end = new Date(activeLobby.value.end_at).getTime()
       const paused = new Date(activeLobby.value.paused_at).getTime()
       return Math.max(0, Math.floor((end - paused) / 1000))
    }

    const end = new Date(activeLobby.value.end_at).getTime()
    const diff = Math.floor((end - currentTime.value.getTime()) / 1000)
    return Math.max(0, diff)
  })

  const timeUntilNext = computed(() => {
    if (!nextLobby.value) return 0
    const start = new Date(nextLobby.value.start_at).getTime()
    return Math.max(0, start - currentTime.value.getTime())
  })

  let channel: any = null

  onMounted(() => {
    fetchLobbies()
    fetchParticipants()
    
    timer = setInterval(() => {
      currentTime.value = new Date()
    }, 1000)

    // Realtime subscription for instant Pause/Resume/AddTime feedback
    channel = supabase
      .channel('public:flash_lobbies')
      .on(
        'postgres_changes',
        { event: '*', schema: 'm2m', table: 'flash_lobbies' },
        () => {
           console.log('[Lobby] Realtime update detected')
           fetchLobbies() 
        }
      )
      .subscribe()
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
    if (channel) supabase.removeChannel(channel)
  })

  return { 
    activeLobby, 
    nextLobby, 
    lobbyUsers, 
    isLive, 
    remainingSeconds,
    timeUntilNext,
    loading, 
    loadingMore, 
    hasMore, 
    activeFilters,
    fetchLobbies, 
    fetchParticipants 
  }
}
