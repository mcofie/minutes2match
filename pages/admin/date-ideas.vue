<template>
  <div class="ad-page ad-page--wide">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Date ideas</h1>
        <p class="ad-sub">What members see on their match. Each pair gets the three that fit them best, picked from the active ideas here.</p>
      </div>
      <button class="btn-primary" :disabled="!tableReady" @click="openEditor()">New idea</button>
    </header>

    <div v-if="!tableReady && !loading" class="ad-panel">
      <div class="ad-empty">
        <p class="ad-empty__title">Not set up yet</p>
        <p>Run migration 079 to manage date ideas here. Until then members see the built-in list.</p>
      </div>
    </div>

    <template v-else>
      <div class="ad-stats">
        <div class="ad-stat">
          <div class="ad-stat__label">Active ideas</div>
          <div class="ad-stat__value">{{ ideas.filter(i => i.is_active).length }}</div>
          <div class="ad-stat__hint">{{ ideas.length - ideas.filter(i => i.is_active).length }} retired</div>
        </div>
        <div class="ad-stat">
          <div class="ad-stat__label">"We went"</div>
          <div class="ad-stat__value">{{ totals.went }}</div>
        </div>
        <div class="ad-stat">
          <div class="ad-stat__label">"Sounds fun"</div>
          <div class="ad-stat__value">{{ totals.keen }}</div>
        </div>
        <div class="ad-stat">
          <div class="ad-stat__label">"Not for us"</div>
          <div class="ad-stat__value">{{ totals.notForUs }}</div>
        </div>
      </div>

      <div class="ad-toolbar">
        <div class="ad-tabs" role="tablist" aria-label="Where">
          <button v-for="w in WHERE_TABS" :key="w.key" class="ad-tab" :class="{ 'is-active': where === w.key }" @click="where = w.key">
            {{ w.label }} <span class="ad-tab__count">{{ countWhere(w.key) }}</span>
          </button>
        </div>
        <label class="ad-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
          <input v-model="search" type="search" placeholder="Search ideas or places" aria-label="Search ideas" />
        </label>
        <select v-model="kindFilter" class="ad-select" aria-label="Kind">
          <option value="">All kinds</option>
          <option v-for="(label, key) in KINDS" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="statusFilter" class="ad-select" aria-label="Status">
          <option value="active">Active</option>
          <option value="retired">Retired</option>
          <option value="">All</option>
        </select>
      </div>

      <div class="data-table-container">
        <div v-if="loading" class="ad-empty"><span class="ad-spinner"></span></div>
        <div v-else-if="filtered.length === 0" class="ad-empty">
          <p class="ad-empty__title">No ideas here</p>
          <p>Try another filter, or add one.</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Idea</th>
              <th>Where</th>
              <th>Kind</th>
              <th>Details</th>
              <th>Reactions</th>
              <th class="ad-right"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="idea in filtered" :key="idea.id" class="align-top" :class="{ 'opacity-50': !idea.is_active }">
              <td class="max-w-[22rem]">
                <button class="text-left font-semibold hover:underline" @click="openEditor(idea)">{{ idea.title }}</button>
                <span class="ad-clip text-xs ad-muted">{{ idea.description }}</span>
                <span v-if="idea.venue" class="mt-1 inline-flex ad-pill ad-pill--green" :title="idea.venue.is_active ? 'Offer is live' : 'Partner venue is inactive; offer hidden'">
                  {{ idea.venue.name }}<template v-if="idea.venue.discount_label"> · {{ idea.venue.discount_label }}</template>
                </span>
              </td>
              <td class="text-sm">
                {{ placeLabel(idea) }}
                <span v-if="idea.zone" class="block text-xs ad-faint">{{ ZONES[idea.zone] }}</span>
                <span v-if="idea.place" class="block text-xs ad-faint">{{ idea.place }}</span>
              </td>
              <td class="text-sm">{{ KINDS[idea.kind] }} <span class="block text-xs capitalize ad-faint">{{ idea.slot }} · {{ idea.energy === 'any' ? 'any energy' : idea.energy }}</span></td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span class="ad-pill ad-pill--plain">{{ '₵'.repeat(idea.price) }}</span>
                  <span v-if="idea.alcohol" class="ad-pill ad-pill--plain">Drinks</span>
                  <span v-if="idea.outdoor" class="ad-pill ad-pill--plain">Outdoors</span>
                  <span v-if="idea.day_trip" class="ad-pill ad-pill--plain">Day trip</span>
                  <span v-if="idea.deep" class="ad-pill ad-pill--plain">For talking</span>
                </div>
                <span class="mt-1 block text-xs ad-faint">{{ (idea.tags || []).join(', ') || 'No interest tags' }}</span>
              </td>
              <td class="ad-num text-sm">
                <template v-if="statsFor(idea.id).total">
                  <span title="We went">{{ statsFor(idea.id).went }} went</span> ·
                  <span title="Sounds fun">{{ statsFor(idea.id).keen }} keen</span> ·
                  <span title="Not for us" :class="statsFor(idea.id).notForUs > statsFor(idea.id).went + statsFor(idea.id).keen ? 'text-[#b4232a]' : ''">{{ statsFor(idea.id).notForUs }} no</span>
                </template>
                <span v-else class="ad-faint">—</span>
              </td>
              <td class="ad-right whitespace-nowrap">
                <button class="btn-ghost btn-sm" @click="toggleActive(idea)">{{ idea.is_active ? 'Retire' : 'Bring back' }}</button>
                <button class="btn-secondary btn-sm" @click="openEditor(idea)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Editor -->
    <Teleport to="body">
      <div v-if="editing" class="m2m-app m2m-admin modal-overlay" @click.self="editing = null">
        <div class="modal modal--large" role="dialog" aria-modal="true" aria-labelledby="idea-editor-title">
          <div class="modal__header">
            <h2 id="idea-editor-title" class="modal__title">{{ editing.isNew ? 'New date idea' : 'Edit date idea' }}</h2>
            <button class="modal__close" aria-label="Close" @click="editing = null">×</button>
          </div>

          <form class="modal__content space-y-6" @submit.prevent="saveIdea">
            <fieldset class="space-y-4">
              <legend class="ad-label">The idea</legend>
              <div>
                <label class="form-label" for="idea-title">Title</label>
                <input id="idea-title" v-model="form.title" class="form-input" required placeholder="e.g. Sunset at Labadi Beach" @input="editing.isNew && autoSlug()" />
              </div>
              <div>
                <label class="form-label" for="idea-desc">What to do</label>
                <textarea id="idea-desc" v-model="form.description" rows="3" class="form-input" required placeholder="One or two sentences members read on the card"></textarea>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label class="form-label" for="idea-kind">Kind</label>
                  <select id="idea-kind" v-model="form.kind" class="ad-select w-full !h-[44px]">
                    <option v-for="(label, key) in KINDS" :key="key" :value="key">{{ label }}</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" for="idea-slot">Best time</label>
                  <select id="idea-slot" v-model="form.slot" class="ad-select w-full !h-[44px]">
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" for="idea-energy">Energy</label>
                  <select id="idea-energy" v-model="form.energy" class="ad-select w-full !h-[44px]">
                    <option value="any">Any</option>
                    <option value="quiet">Quiet, low-key</option>
                    <option value="social">Social, lively</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset class="space-y-4">
              <legend class="ad-label">Where</legend>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label class="form-label" for="idea-scope">Available in</label>
                  <select id="idea-scope" v-model="scope" class="ad-select w-full !h-[44px]">
                    <option value="anywhere">Anywhere</option>
                    <option value="gh">Anywhere in Ghana</option>
                    <option value="ke">Anywhere in Kenya</option>
                    <option value="accra">Accra only</option>
                    <option value="nairobi">Nairobi only</option>
                  </select>
                </div>
                <div v-if="scope === 'accra' || scope === 'nairobi'">
                  <label class="form-label" for="idea-zone">Part of the city</label>
                  <select id="idea-zone" v-model="form.zone" class="ad-select w-full !h-[44px]">
                    <option :value="null">Not specific</option>
                    <option v-for="(label, key) in zonesFor(scope)" :key="key" :value="key">{{ label }}</option>
                  </select>
                </div>
                <div :class="scope === 'accra' || scope === 'nairobi' ? '' : 'sm:col-span-2'">
                  <label class="form-label" for="idea-place">Place <span class="ad-faint">(optional)</span></label>
                  <input id="idea-place" v-model="form.place" class="form-input" placeholder="e.g. Gallery 1957" />
                </div>
              </div>
              <div>
                <label class="form-label" for="idea-venue">Partner venue <span class="ad-faint">(shows their offer on the idea)</span></label>
                <select id="idea-venue" v-model="form.venue_id" class="ad-select w-full !h-[44px]">
                  <option :value="null">None</option>
                  <option v-for="v in venues" :key="v.id" :value="v.id">{{ v.name }}{{ v.discount_label ? ` · ${v.discount_label}` : '' }}{{ v.is_active ? '' : ' (inactive)' }}</option>
                </select>
              </div>
            </fieldset>

            <fieldset class="space-y-4">
              <legend class="ad-label">Who it suits</legend>
              <div>
                <span class="form-label">Interests it's built around</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="tag in tagOptions"
                    :key="tag"
                    type="button"
                    class="h-8 rounded-full border px-3 text-sm transition-colors"
                    :class="form.tags.includes(tag) ? 'border-[#393737] bg-[#393737] text-white' : 'border-[#ded9d2] text-[#6c6862] hover:border-[#393737]'"
                    @click="toggleTag(tag)"
                  >{{ tag }}</button>
                  <input v-model="newTag" class="h-8 w-32 rounded-full border border-dashed border-[#ded9d2] px-3 text-sm" placeholder="+ new tag" @keydown.enter.prevent="addTag" @blur="addTag" />
                </div>
                <p class="mt-1.5 text-xs ad-faint">Use the same interest ids as member profiles (music, food, art …) so shared interests count.</p>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="form-label" for="idea-price">Cost for two</label>
                  <select id="idea-price" v-model.number="form.price" class="ad-select w-full !h-[44px]">
                    <option :value="1">₵ Cheap or free</option>
                    <option :value="2">₵₵ Moderate</option>
                    <option :value="3">₵₵₵ A splurge</option>
                  </select>
                </div>
                <div class="flex flex-col justify-end gap-2 text-sm">
                  <label class="flex items-center gap-2.5"><input v-model="form.alcohol" type="checkbox" class="h-4 w-4" /> Drinks are a big part of it</label>
                  <label class="flex items-center gap-2.5"><input v-model="form.outdoor" type="checkbox" class="h-4 w-4" /> Mostly outdoors</label>
                  <label class="flex items-center gap-2.5"><input v-model="form.day_trip" type="checkbox" class="h-4 w-4" /> Takes most of a day</label>
                  <label class="flex items-center gap-2.5"><input v-model="form.deep" type="checkbox" class="h-4 w-4" /> Calm enough to really talk</label>
                </div>
              </div>
            </fieldset>

            <p v-if="saveError" class="ad-callout ad-callout--red">{{ saveError }}</p>
          </form>

          <div class="modal__footer">
            <span v-if="!editing.isNew" class="mr-auto self-center font-mono text-xs ad-faint">{{ form.id }}</span>
            <button class="btn-secondary" @click="editing = null">Cancel</button>
            <button class="btn-primary" :disabled="saving || !form.title || !form.description" @click="saveIdea">{{ saving ? 'Saving…' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient() as any
const db = () => supabase.schema('m2m')

const KINDS: Record<string, string> = { food: 'Food', outdoors: 'Outdoors', culture: 'Culture', active: 'Get moving', nightlife: 'Night out', cosy: 'Low-key', adventure: 'Day out' }
const ZONES: Record<string, string> = {
  'accra-central': 'Central Accra (Osu, Cantonments, Labone, Jamestown)',
  'accra-north': 'North Accra (East Legon, Legon, Madina)',
  'accra-east': 'East Accra (Spintex, Tema)',
  'nairobi-central': 'Nairobi CBD',
  'nairobi-west': 'West Nairobi (Westlands, Kilimani, Lavington)',
  'nairobi-south': 'South Nairobi (Karen, Langata)',
  'nairobi-north': 'North Nairobi (Runda, Ruaka, Kiambu)'
}
const zonesFor = (city: string) => Object.fromEntries(Object.entries(ZONES).filter(([k]) => k.startsWith(city)))

const WHERE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'accra', label: 'Accra' },
  { key: 'nairobi', label: 'Nairobi' },
  { key: 'anywhere', label: 'Anywhere' }
]

const loading = ref(true)
const tableReady = ref(true)
const ideas = ref<any[]>([])
const venues = ref<any[]>([])
const stats = ref<Record<string, { went: number; keen: number; notForUs: number; total: number }>>({})

const where = ref('all')
const search = ref('')
const kindFilter = ref('')
const statusFilter = ref('active')

const load = async () => {
  loading.value = true
  const { data, error } = await db().from('date_ideas')
    .select('*, venue:partner_venues(id, name, discount_label, is_active)')
    .order('sort_order')
  if (error) {
    tableReady.value = false
    loading.value = false
    return
  }
  ideas.value = data || []

  const [{ data: venueRows }, { data: reactionRows }] = await Promise.all([
    db().from('partner_venues').select('id, name, discount_label, is_active').order('name'),
    db().from('date_idea_reactions').select('idea_id, reaction').limit(10000)
  ])
  venues.value = venueRows || []
  const next: typeof stats.value = {}
  for (const r of reactionRows || []) {
    const s = (next[r.idea_id] ||= { went: 0, keen: 0, notForUs: 0, total: 0 })
    s.total++
    if (r.reaction === 'went') s.went++
    else if (r.reaction === 'keen') s.keen++
    else s.notForUs++
  }
  stats.value = next
  loading.value = false
}

const EMPTY_STATS = { went: 0, keen: 0, notForUs: 0, total: 0 }
const statsFor = (id: string) => stats.value[id] || EMPTY_STATS
const totals = computed(() => Object.values(stats.value).reduce(
  (t, s) => ({ went: t.went + s.went, keen: t.keen + s.keen, notForUs: t.notForUs + s.notForUs }),
  { went: 0, keen: 0, notForUs: 0 }
))

const matchesWhere = (idea: any, key: string) =>
  key === 'all' ||
  (key === 'anywhere' && !idea.city) ||
  idea.city === key
const countWhere = (key: string) => ideas.value.filter(i => (statusFilter.value === '' || i.is_active === (statusFilter.value === 'active')) && matchesWhere(i, key)).length

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ideas.value.filter(i => {
    if (statusFilter.value && i.is_active !== (statusFilter.value === 'active')) return false
    if (!matchesWhere(i, where.value)) return false
    if (kindFilter.value && i.kind !== kindFilter.value) return false
    if (q && !`${i.title} ${i.place || ''} ${i.description}`.toLowerCase().includes(q)) return false
    return true
  })
})

const placeLabel = (idea: any) =>
  idea.city ? (idea.city === 'accra' ? 'Accra' : 'Nairobi') : idea.country === 'gh' ? 'Ghana' : idea.country === 'ke' ? 'Kenya' : 'Anywhere'

const tagOptions = computed(() => {
  const all = new Set<string>(ideas.value.flatMap(i => i.tags || []))
  for (const t of form.tags) all.add(t)
  return [...all].sort()
})

// ---------- Editor ----------
const blankForm = () => ({
  id: '', title: '', description: '', tags: [] as string[], energy: 'any', slot: 'evening', kind: 'food',
  city: null as string | null, country: null as string | null, place: '', zone: null as string | null,
  day_trip: false, deep: false, price: 2, alcohol: false, outdoor: false, venue_id: null as string | null, is_active: true
})
const form = reactive(blankForm())
const editing = ref<{ isNew: boolean } | null>(null)
const saving = ref(false)
const saveError = ref('')
const newTag = ref('')

// One select for city / country / anywhere
const scope = computed({
  get: () => form.city || form.country || 'anywhere',
  set: (v: string) => {
    form.city = v === 'accra' || v === 'nairobi' ? v : null
    form.country = v === 'gh' || v === 'ke' ? v : null
    if (!form.city) form.zone = null
    else if (form.zone && !form.zone.startsWith(form.city)) form.zone = null
  }
})

const openEditor = (idea?: any) => {
  Object.assign(form, blankForm(), idea ? {
    ...idea,
    tags: [...(idea.tags || [])],
    place: idea.place || '',
    venue_id: idea.venue_id || null
  } : {})
  saveError.value = ''
  newTag.value = ''
  editing.value = { isNew: !idea }
}

const slugify = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
const autoSlug = () => {
  const prefix = form.city === 'accra' ? 'acc-' : form.city === 'nairobi' ? 'nbo-' : form.country ? `${form.country}-` : ''
  form.id = prefix + slugify(form.title)
}

const toggleTag = (tag: string) => {
  form.tags = form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag]
}
const addTag = () => {
  const tag = slugify(newTag.value)
  if (tag && !form.tags.includes(tag)) form.tags = [...form.tags, tag]
  newTag.value = ''
}

const saveIdea = async () => {
  if (!editing.value) return
  saving.value = true
  saveError.value = ''
  if (editing.value.isNew && !form.id) autoSlug()
  const row = {
    title: form.title.trim(),
    description: form.description.trim(),
    tags: form.tags,
    energy: form.energy,
    slot: form.slot,
    kind: form.kind,
    city: form.city,
    country: form.country,
    place: form.place.trim() || null,
    zone: form.city ? form.zone : null,
    day_trip: form.day_trip,
    deep: form.deep,
    price: form.price,
    alcohol: form.alcohol,
    outdoor: form.outdoor,
    venue_id: form.venue_id,
    updated_at: new Date().toISOString()
  }
  try {
    const { error } = editing.value.isNew
      ? await db().from('date_ideas').insert({ ...row, id: form.id, is_active: true, sort_order: (Math.max(0, ...ideas.value.map(i => i.sort_order || 0)) + 10) })
      : await db().from('date_ideas').update(row).eq('id', form.id)
    if (error) throw error
    editing.value = null
    await load()
  } catch (e: any) {
    saveError.value = e?.code === '23505' ? 'An idea with this id already exists. Change the title a little.' : e?.message || 'Could not save.'
  } finally {
    saving.value = false
  }
}

const toggleActive = async (idea: any) => {
  const next = !idea.is_active
  idea.is_active = next
  const { error } = await db().from('date_ideas').update({ is_active: next, updated_at: new Date().toISOString() }).eq('id', idea.id)
  if (error) {
    idea.is_active = !next
    alert('Could not update. Please try again.')
  }
}

onMounted(load)
</script>
