<template>
  <div class="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="p-6 md:p-8 flex items-start gap-4 border-b border-stone-100">
      <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-gift"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
      </div>
      <div>
        <h3 class="font-serif font-bold text-xl text-stone-900 leading-tight mb-1">Invite Friends</h3>
        <p class="text-sm text-stone-500 leading-relaxed">Refer friends to Minutes2Match and earn rewards when they join.</p>
      </div>
    </div>

    <div class="p-6 md:p-8 space-y-6">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4 animate-pulse">
        <div class="h-24 bg-stone-100 rounded-xl"></div>
        <div class="h-10 bg-stone-100 rounded-lg"></div>
        <div class="grid grid-cols-3 gap-4 pt-4">
           <div class="h-12 bg-stone-100 rounded-lg"></div>
           <div class="h-12 bg-stone-100 rounded-lg"></div>
           <div class="h-12 bg-stone-100 rounded-lg"></div>
        </div>
      </div>

      <!-- Content State -->
      <div v-else class="space-y-6">
        <!-- Code Box -->
        <div class="bg-stone-50 rounded-xl p-5 border border-stone-200 border-dashed relative group text-center">
          <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Your Referral Code</p>
          <div class="flex items-center justify-center gap-3">
            <span class="font-mono text-3xl font-bold text-stone-900 tracking-wider select-all">{{ referralCode }}</span>
            <button 
              @click="copyCode" 
              class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-200 transition-all text-stone-500 hover:text-stone-900 active:scale-95"
              title="Copy code"
            >
              <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 animate-in zoom-in spin-in-90"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>
        </div>

        <!-- Share Link -->
        <div class="flex gap-2">
          <div class="relative flex-1">
             <input 
              readonly
              :value="referralLink"
              class="w-full bg-white border border-stone-200 text-stone-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-medium"
              @click="($event.target as HTMLInputElement).select()"
            />
          </div>
          <button 
            @click="shareLink"
            class="bg-black hover:bg-stone-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-colors shrink-0 shadow-sm active:translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            <span>Share</span>
          </button>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span class="block text-2xl font-black text-stone-900 font-serif mb-1">{{ stats.signedUp }}</span>
            <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Signups</span>
          </div>
          <div class="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
             <span class="block text-2xl font-black text-stone-900 font-serif mb-1">{{ stats.paid }}</span>
            <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Paid</span>
          </div>
          <div class="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
            <span class="block text-2xl font-black text-amber-600 font-serif mb-1">{{ formatReward(stats.totalRewards) }}</span>
             <span class="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Earned</span>
          </div>
        </div>

        <!-- Note -->
        <div class="bg-blue-50 border border-blue-100 text-blue-800 text-xs px-4 py-3 rounded-lg flex gap-3 items-start leading-relaxed">
           <span class="text-base shrink-0 mt-0.5">💡</span>
           <p class="font-medium">Earn a <span class="font-bold underline">free match unlock</span> when your friend makes their first payment!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true)
const referralCode = ref<string | null>(null)
const referralLink = ref('')
const copied = ref(false)
const stats = ref({
  signedUp: 0,
  paid: 0,
  totalRewards: 0
})

onMounted(async () => {
  try {
    const { data } = await useFetch('/api/referrals')
    const result = data.value as any
    if (result) {
      referralCode.value = result.referralCode
      referralLink.value = result.referralLink
      stats.value = {
        signedUp: result.stats.signedUp || 0,
        paid: result.stats.paid || 0,
        totalRewards: result.stats.totalRewards || 0
      }
    }
  } catch (error) {
    console.error('Failed to fetch referral info:', error)
  } finally {
    loading.value = false
  }
})

const copyCode = async () => {
  if (!referralCode.value) return
  
  try {
    await navigator.clipboard.writeText(referralCode.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const shareLink = async () => {
  if (!referralLink.value) return
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join Minutes 2 Match',
        text: 'Find your perfect match with curated speed dating events!',
        url: referralLink.value
      })
    } catch (error) {
      console.error('Share failed:', error)
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(referralLink.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

const formatReward = (amount: number) => {
  if (amount === 0) return '₵0'
  return `₵${amount}`
}
</script>
