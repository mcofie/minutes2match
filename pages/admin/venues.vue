<template>
  <div class="admin-venues-page">
    <!-- Header -->
    <header class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mb-1">Partner Management</h1>
        <p class="text-stone-500">Manage curated date spots, discounts, and track user redemptions.</p>
      </div>
      <button 
        @click="openAddModal"
        class="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add New Partner
      </button>
    </header>

    <!-- Tabs -->
    <div class="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit mb-8">
      <button 
        @click="activeTab = 'venues'"
        :class="activeTab === 'venues' ? 'bg-white shadow-sm text-black' : 'text-stone-500 hover:text-stone-700'"
        class="px-6 py-2 rounded-lg font-bold text-sm transition-all"
      >
        Partners
      </button>
      <button 
        @click="activeTab = 'redemptions'"
        :class="activeTab === 'redemptions' ? 'bg-white shadow-sm text-black' : 'text-stone-500 hover:text-stone-700'"
        class="px-6 py-2 rounded-lg font-bold text-sm transition-all"
      >
        Redemptions
      </button>
    </div>


    <!-- Content: Partners -->
    <div v-if="activeTab === 'venues'">
      <div v-if="loading" class="py-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-stone-200 border-t-black rounded-full mx-auto mb-4"></div>
        <p class="text-stone-400 font-medium">Loading partners...</p>
      </div>

      <div v-else-if="venues.length === 0" class="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center">
        <div class="text-5xl mb-4 grayscale">🥂</div>
        <h3 class="text-xl font-bold text-stone-900 mb-1">No partners found</h3>
        <p class="text-stone-500 mb-6 max-w-xs mx-auto">Start by adding your first restaurant, bar, or activity partner.</p>
        <button @click="openAddModal" class="text-blue-600 font-bold hover:underline">Add your first partner →</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="venue in venues" :key="venue.id" class="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div class="h-40 relative overflow-hidden">
            <img :src="venue.image_url" :alt="venue.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div class="absolute top-3 right-3 flex gap-2">
              <button @click="openEditModal(venue)" class="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
              </button>
              <button @click="confirmDelete(venue)" class="p-2 bg-rose-50/90 backdrop-blur-sm text-rose-600 rounded-lg shadow-sm hover:bg-rose-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
            <div class="absolute bottom-3 left-3 bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg">
              {{ venue.discount_label }}
            </div>
          </div>
          <div class="p-5">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="text-xs">{{ getVenueIcon(venue.type) }}</span>
                <span class="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{{ venue.type }}</span>
              </div>
              <span v-if="venue.visibility_tier && venue.visibility_tier !== 'all'" :class="getTierClass(venue.visibility_tier)" class="text-[8px] font-black tracking-tighter uppercase px-2 py-0.5 rounded-full border">
                {{ venue.visibility_tier }}
              </span>
            </div>
            <h4 class="text-lg font-bold text-stone-900 mb-1 leading-tight">{{ venue.name }}</h4>
            <p class="text-xs text-stone-500 font-medium mb-3 flex items-center gap-1">
              <span class="text-rose-500">📍</span> {{ venue.location }}
            </p>
            
            <div v-if="venue.expires_at" class="mb-4 flex items-center gap-2 text-[10px] font-bold">
              <span class="text-stone-400">EXPIRES:</span>
              <span :class="isExpired(venue.expires_at) ? 'text-rose-500' : 'text-emerald-500'">
                {{ formatDate(venue.expires_at) }}
              </span>
            </div>

            <div class="flex items-center justify-between border-t border-stone-50 pt-4 mt-2">
              <div class="flex items-center gap-2">
                <div :class="venue.is_active && !isExpired(venue.expires_at) ? 'bg-green-500' : 'bg-stone-300'" class="w-2 h-2 rounded-full"></div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {{ venue.is_active && !isExpired(venue.expires_at) ? 'Live' : 'Hidden' }}
                </span>
              </div>
              <button @click="toggleVenueStatus(venue)" class="text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest">
                {{ venue.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content: Redemptions -->
    <div v-else-if="activeTab === 'redemptions'">
      <div v-if="loadingRedemptions" class="py-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-stone-200 border-t-black rounded-full mx-auto mb-4"></div>
        <p class="text-stone-400 font-medium">Loading redemptions...</p>
      </div>

      <div v-else-if="redemptions.length === 0" class="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center">
        <div class="text-5xl mb-4 grayscale">🎟️</div>
        <h3 class="text-xl font-bold text-stone-900 mb-1">No claims recorded yet</h3>
        <p class="text-stone-500 max-w-xs mx-auto">When users claim a date suggestion, they will appear here.</p>
      </div>

      <div v-else class="overflow-x-auto bg-white border border-stone-200 rounded-3xl shadow-sm">
        <table class="w-full text-left">
          <thead class="bg-stone-50 border-b border-stone-100">
            <tr>
              <th class="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">User</th>
              <th class="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Partner</th>
              <th class="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Claimed At</th>
              <th class="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
              <th class="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Match Ref</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-for="claim in redemptions" :key="claim.id" class="hover:bg-stone-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                    <img v-if="claim.profile?.photo_url" :src="claim.profile.photo_url" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-stone-300 text-xs font-bold uppercase">
                      {{ (claim.profile?.display_name || '?')[0] }}
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-stone-900">{{ claim.profile?.display_name || 'Anonymous' }}</span>
                      <span v-if="claim.profile?.gender" :class="claim.profile.gender === 'male' ? 'text-blue-500' : 'text-rose-400'" class="text-[10px]">
                        {{ claim.profile.gender === 'male' ? '♂' : '♀' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                       <span class="text-[10px] text-stone-400 font-mono">{{ claim.profile?.phone || 'No phone' }}</span>
                       <span v-if="claim.profile?.location" class="text-[9px] text-stone-300">| {{ claim.profile.location }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm">{{ getVenueIcon(claim.venue?.type || '') }}</span>
                  <div class="flex flex-col">
                    <span class="font-bold text-stone-700">{{ claim.venue?.name }}</span>
                    <span class="text-[10px] text-rose-500 font-black tracking-tight">{{ claim.venue?.discount_label }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs text-stone-500 font-medium">{{ formatDate(claim.redeemed_at, true) }}</span>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(claim.status)" class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border">
                  {{ claim.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <span v-if="claim.match_id" class="text-[10px] font-mono text-stone-400">{{ claim.match_id.slice(0,8) }}</span>
                <span v-else class="text-[10px] text-stone-300 italic">None</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="closeModal">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div class="p-6 border-b border-stone-100 flex justify-between items-center">
            <h3 class="text-xl font-bold text-stone-900">{{ isEditing ? 'Edit Partner' : 'Add New Partner' }}</h3>
            <button @click="closeModal" class="text-stone-400 hover:text-stone-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- Basic Info -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Venue Name</label>
                <input v-model="form.name" type="text" placeholder="e.g. Skybar 25" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Venue Type</label>
                <select v-model="form.type" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all">
                  <option value="restaurant">Restaurant</option>
                  <option value="bar">Bar</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Location / Area</label>
              <input v-model="form.location" type="text" placeholder="e.g. Villagio, Airport" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Discount Label</label>
              <input v-model="form.discount_label" type="text" placeholder="e.g. 15% OFF TOTAL BILL" class="w-full px-4 py-3 bg-rose-50 border border-rose-100 text-rose-600 placeholder:text-rose-300 font-bold rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Description</label>
              <textarea v-model="form.description" rows="3" placeholder="Tell users why this spot is great for a date..." class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all resize-none"></textarea>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Cover Image URL</label>
              <input v-model="form.image_url" type="text" placeholder="https://..." class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
              <p class="text-[9px] text-stone-400 pl-1">Use a direct image link from Unsplash for best results.</p>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <input type="checkbox" v-model="form.is_active" id="venue-active" class="w-5 h-5 accent-black rounded" />
              <label for="venue-active" class="text-xs font-bold text-stone-600">Active and visible to users</label>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Visibility Tier</label>
                <select v-model="form.visibility_tier" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all">
                  <option value="all">Everywhere (All Users)</option>
                  <option value="premium">Premium Holders Only</option>
                  <option value="matchmaker_curated">Matchmaker Choice</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Expiration Date</label>
                <input v-model="form.expires_at" type="date" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
              </div>
            </div>
          </div>


          <div class="p-6 bg-stone-50 border-t border-stone-100 flex gap-4">
            <button @click="closeModal" class="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-all">Cancel</button>
            <button 
              @click="saveVenue" 
              :disabled="saving"
              class="flex-[2] py-3 bg-black text-white rounded-xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="saving" class="animate-pulse">Saving...</span>
              <span v-else>{{ isEditing ? 'Update Partner' : 'Create Partner' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import type { M2MDatabase } from '~/types/database.types'

useHead({ title: 'Partner Venues | Admin' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const toast = useToast()

// State
const activeTab = ref('venues') // 'venues' or 'redemptions'
const venues = ref<any[]>([])
const redemptions = ref<any[]>([])
const loading = ref(true)
const loadingRedemptions = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  type: 'restaurant',
  location: '',
  description: '',
  discount_label: '',
  image_url: '',
  is_active: true,
  visibility_tier: 'all',
  expires_at: ''
})

// Fetch venues
const fetchVenues = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .schema('m2m')
      .from('partner_venues')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    venues.value = data || []
  } catch (error) {
    console.error('Error fetching venues:', error)
    toast.error('Error', 'Failed to fetch venues')
  } finally {
    loading.value = false
  }
}

// Fetch redemptions
const fetchRedemptions = async () => {
  loadingRedemptions.value = true
  try {
    const { data, error } = await supabase
      .schema('m2m')
      .from('venue_redemptions')
      .select('*, venue:partner_venues(name, type, discount_label), profile:profiles(display_name, phone, photo_url, gender, location)')
      .order('redeemed_at', { ascending: false })

    
    if (error) throw error
    redemptions.value = data || []
  } catch (error) {
    console.error('Error fetching redemptions:', error)
    toast.error('Error', 'Failed to fetch redemptions')
  } finally {
    loadingRedemptions.value = false
  }
}

// Watch active tab to refresh data
watch(activeTab, (newTab) => {
  if (newTab === 'redemptions') fetchRedemptions()
  else fetchVenues()
})

// Modal actions
const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  Object.assign(form, {
    name: '',
    type: 'restaurant',
    location: '',
    description: '',
    discount_label: '',
    image_url: '',
    is_active: true,
    visibility_tier: 'all',
    expires_at: ''
  })
  showModal.value = true
}

const openEditModal = (venue: any) => {
  isEditing.value = true
  editingId.value = venue.id
  
  // Set form properties individually for clearer reactivity tracking
  form.name = venue.name || ''
  form.type = venue.type || 'restaurant'
  form.location = venue.location || ''
  form.description = venue.description || ''
  form.discount_label = venue.discount_label || ''
  form.image_url = venue.image_url || ''
  form.is_active = !!venue.is_active
  form.visibility_tier = venue.visibility_tier || 'all'
  form.expires_at = venue.expires_at ? new Date(venue.expires_at).toISOString().split('T')[0] : ''
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  isEditing.value = false
}

// Save venue
const saveVenue = async () => {
  if (!form.name || !form.discount_label) {
    toast.error('Missing Data', 'Please fill in at least the name and discount label.')
    return
  }

  saving.value = true
  try {
    const venueData = {
      name: form.name,
      type: form.type,
      location: form.location,
      description: form.description,
      discount_label: form.discount_label,
      image_url: form.image_url,
      is_active: Boolean(form.is_active),
      visibility_tier: form.visibility_tier,
      expires_at: form.expires_at || null
    }

    if (isEditing.value && editingId.value) {
      console.log('Updating venue:', editingId.value, venueData)
      const { error } = await supabase
        .schema('m2m')
        .from('partner_venues')
        .update(venueData)
        .eq('id', editingId.value)
      
      if (error) throw error
      toast.success('Updated', 'Partner updated successfully')
    } else {
      console.log('Creating new venue:', venueData)
      const { error } = await supabase
        .schema('m2m')
        .from('partner_venues')
        .insert([venueData])
      
      if (error) throw error
      toast.success('Created', 'Partner added successfully')
    }
    
    closeModal()
    // Small delay to ensure DB propagation isn't an issue for the fresh fetch
    setTimeout(() => {
       fetchVenues()
    }, 300)
  } catch (error: any) {
    console.error('Error saving venue:', error)
    toast.error('Save Failed', error.message || 'Failed to preserve changes. Check permissions.')
  } finally {
    saving.value = false
  }
}

// Toggle status
const toggleVenueStatus = async (venue: any) => {
  try {
    const { error } = await supabase
      .schema('m2m')
      .from('partner_venues')
      .update({ is_active: !venue.is_active })
      .eq('id', venue.id)
    
    if (error) throw error
    venue.is_active = !venue.is_active
    toast.info('Status Updated', `${venue.name} is now ${venue.is_active ? 'active' : 'inactive'}`)
  } catch (error) {
    toast.error('Error', 'Failed to update status')
  }
}

// Delete venue
const confirmDelete = async (venue: any) => {
  if (confirm(`Are you sure you want to remove ${venue.name}? This action cannot be undone.`)) {
    try {
      const { error } = await supabase
        .schema('m2m')
        .from('partner_venues')
        .delete()
        .eq('id', venue.id)
      
      if (error) throw error
      toast.success('Deleted', 'Partner removed successfully')
      fetchVenues()
    } catch (error) {
      toast.error('Error', 'Failed to delete venue')
    }
  }
}

// Helpers
const getVenueIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'restaurant': return '🍽️'
    case 'bar': return '🍸'
    case 'activity': return '🎳'
    default: return '📍'
  }
}

const formatDate = (dateStr: string, includeTime = false) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (includeTime) return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const isExpired = (dateStr: string | null) => {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

const getTierClass = (tier: string) => {
  switch (tier) {
    case 'premium': return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'matchmaker_curated': return 'bg-rose-50 text-rose-600 border-rose-100'
    default: return 'bg-stone-50 text-stone-500 border-stone-100'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'verified': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'expired': return 'bg-stone-100 text-stone-400 border-stone-100'
    default: return 'bg-rose-50 text-rose-600 border-rose-100' // pending
  }
}

onMounted(() => {
  fetchVenues()
})

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
