<template>
  <div class="m2m-app m2m-admin admin-layout">
    <!-- Soft glow, like the landing hero -->
    <div aria-hidden="true" class="pointer-events-none fixed left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ed1c24]/[0.035] blur-3xl"></div>
    <div aria-hidden="true" class="pointer-events-none fixed -right-32 top-40 h-72 w-72 rounded-full bg-[#f3c7bd]/25 blur-3xl"></div>

    <!-- Mobile Header -->
    <header class="admin-mobile-header">
      <button class="mobile-menu-toggle" aria-label="Open menu" @click="sidebarOpen = !sidebarOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="22" height="22"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
      </button>
      <NuxtLink to="/admin" aria-label="Minutes 2 Match admin" class="brand-logo">
        <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="brand-logo__img" />
      </NuxtLink>
      <span class="w-9"></span>
    </header>

    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'admin-sidebar--open': sidebarOpen }">
      <div class="sidebar-header">
        <NuxtLink to="/admin" aria-label="Minutes 2 Match admin" class="brand-logo" @click="sidebarOpen = false">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="brand-logo__img" />
        </NuxtLink>
        <span class="sidebar-tag">Admin</span>
        <button class="mobile-close" aria-label="Close menu" @click="sidebarOpen = false">×</button>
      </div>

      <nav class="sidebar-nav">
        <div v-for="group in navGroups" :key="group.label" class="nav-group">
          <div class="nav-group__label">{{ group.label }}</div>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="sidebar-link"
            :class="{ 'is-active': isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined"
            @click="sidebarOpen = false"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="item.icon"></svg>
            <span class="label">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-user">
          <div class="admin-avatar">{{ userInitial }}</div>
          <div class="admin-info">
            <span class="admin-name">{{ user?.email || 'Admin' }}</span>
            <span class="admin-role">{{ role }}</span>
          </div>
        </div>
        <button class="logout-btn" aria-label="Log out" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="admin-main">
      <header class="admin-topbar">
        <p class="page-crumb"><span>Admin</span><span aria-hidden="true">/</span><span class="page-crumb__current">{{ pageTitle }}</span></p>
        <span class="date-display">{{ currentDate }}</span>
      </header>

      <div class="admin-page-content">
        <slot />
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const sidebarOpen = ref(false)

const userInitial = computed(() => user.value?.email?.charAt(0).toUpperCase() || 'A')
const role = ref('Matchmaker')

interface NavItem { to: string; label: string; icon: string; exact?: boolean }

// The core of running M2M right now: people, matches, events, money, comms and safety.
// Other admin pages (flash lobby, spark deck, venues, vouches, shots, questions, credits,
// integrity) still exist at their URLs but are left out of the menu.
const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Matchmaking',
    items: [
      { to: '/admin', label: 'Overview', exact: true, icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>' },
      { to: '/admin/users', label: 'Users', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
      { to: '/admin/matches/matchmaker', label: 'Matchmaker', icon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>' },
      { to: '/admin/matches', label: 'Matches', exact: true, icon: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>' },
      { to: '/admin/events', label: 'Events', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/payments', label: 'Payments', icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' },
      { to: '/admin/messaging', label: 'SMS', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    ],
  },
  {
    label: 'Trust & safety',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>' },
      { to: '/admin/deletion-requests', label: 'Deletion requests', icon: '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>' },
      { to: '/admin/settings', label: 'Settings', icon: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>' },
    ],
  },
]

const isActive = (item: NavItem) => {
  const path = route.path.replace(/\/+$/, '')
  return item.exact ? path === item.to : path === item.to || path.startsWith(item.to + '/')
}

const pageTitle = computed(() => {
  const path = route.path.replace(/\/+$/, '') || '/'
  if (path === '/admin') return 'Overview'
  if (path.startsWith('/admin/users')) return 'Users'
  if (path === '/admin/matches/queue') return 'Match queue'
  if (path === '/admin/matches/scoring-logic') return 'Scoring logic'
  if (path === '/admin/matches/matchmaker') return 'Matchmaker'
  if (path.startsWith('/admin/matches')) return 'Matches'
  if (path.startsWith('/admin/events')) return 'Events'
  if (path === '/admin/messaging/history') return 'SMS history'
  if (path.startsWith('/admin/messaging')) return 'SMS'
  if (path.startsWith('/admin/payments')) return 'Payments'
  if (path.startsWith('/admin/reports')) return 'Reports'
  if (path.startsWith('/admin/deletion-requests')) return 'Deletion requests'
  if (path.startsWith('/admin/settings')) return 'Settings'
  return 'Admin'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  navigateTo('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  position: relative;
  display: flex;
  min-height: 100vh;
  background: linear-gradient(to bottom, #fff, #fbfbfb 40%, #f7f7f7);
  color: #393737;
}

/* Brand logo: the wide wordmark PNG is cropped into a fixed box, as on the landing header */
.brand-logo {
  position: relative;
  display: block;
  height: 1.75rem;
  width: 124px;
  overflow: hidden;
  transition: opacity 0.15s;
}
.brand-logo:hover { opacity: 0.8; }
.brand-logo__img {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 90px;
  width: auto;
  max-width: none;
  transform: translate(-50%, -50%);
  user-select: none;
}

/* Sidebar */
.admin-sidebar {
  width: 248px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar-header {
  height: 68px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
}

.sidebar-tag {
  border-radius: 9999px;
  background: #fdecec;
  color: #c4161d;
  padding: 0.2rem 0.55rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-group__label {
  padding: 0 0.75rem 0.4rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9b9690;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  height: 2.5rem;
  padding: 0 0.85rem;
  color: #6c6862;
  text-decoration: none;
  border-radius: 9999px;
  transition: background-color 0.15s, color 0.15s;
  font-size: 0.9rem;
  font-weight: 500;
}

.sidebar-link:hover {
  background-color: #f1efec;
  color: #393737;
}

.sidebar-link.is-active {
  background-color: #393737;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(57, 55, 55, 0.18);
}

.sidebar-link .icon {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.sidebar-footer {
  margin: 0.75rem;
  padding: 0.6rem 0.6rem 0.6rem 0.75rem;
  border-radius: 1.25rem;
  background: #f6f4f1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.admin-avatar {
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
  background: #fff;
  color: #ed1c24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(52, 38, 25, 0.08);
}

.admin-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-name {
  font-size: 0.8rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-role {
  font-size: 0.7rem;
  color: #817a72;
}

.logout-btn {
  background: none;
  border: none;
  color: #817a72;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 9999px;
  transition: color 0.15s, background-color 0.15s;
  display: flex;
  align-items: center;
}

.logout-btn:hover {
  color: #ed1c24;
  background: #fff;
}

/* Main Content Area */
.admin-main {
  position: relative;
  flex: 1;
  min-width: 0;
  margin-left: 248px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-topbar {
  height: 60px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.page-crumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.875rem;
  color: #9b9690;
}

.page-crumb__current {
  font-weight: 600;
  color: #393737;
}

.date-display {
  font-size: 0.85rem;
  color: #817a72;
}

.admin-page-content {
  flex: 1;
  padding: 2rem;
  overflow-x: hidden;
}

/* Mobile */
.admin-mobile-header {
  display: none;
  height: 56px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #393737;
  align-items: center;
  padding: 0 1rem;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
}

.mobile-menu-toggle {
  background: none;
  border: none;
  color: #393737;
  cursor: pointer;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
}

.mobile-close {
  display: none;
  margin-left: auto;
  background: none;
  border: none;
  color: #6c6862;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(57, 55, 55, 0.25);
  backdrop-filter: blur(2px);
  z-index: 45;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
    background: #fff;
  }

  .admin-sidebar--open {
    transform: translateX(0);
    box-shadow: 0 18px 50px rgba(52, 38, 25, 0.15);
  }

  .admin-main {
    margin-left: 0;
    padding-top: 56px;
  }

  .admin-topbar {
    display: none;
  }

  .admin-mobile-header {
    display: flex;
  }

  .mobile-close {
    display: block;
  }

  .sidebar-overlay {
    display: block;
  }

  .admin-page-content {
    padding: 1rem;
  }
}
</style>
