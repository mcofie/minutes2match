<script setup lang="ts">
const route = useRoute()
const code = route.params.code as string

onMounted(async () => {
   try {
      const data = await $fetch<{ success: boolean; target: string }>(`/api/franchise/short-lookup`, {
         params: { code }
      })

      if (data.success && data.target) {
         return navigateTo(data.target)
      }

      // 3. Fallback
      return navigateTo('/')
   } catch (err) {
      console.error('[Short Redirection DEBUG] Lookup Error:', err)
      return navigateTo('/')
   }
})

</script>

<template>
   <div class="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4">
      <div class="w-8 h-8 border-4 border-rose-500 border-t-transparent animate-spin rounded-full"></div>
      <p class="text-[10px] text-white font-black uppercase tracking-[0.3em] opacity-40">Connecting you...</p>
   </div>
</template>
