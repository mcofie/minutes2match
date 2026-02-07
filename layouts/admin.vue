<template>
  <div class="admin-layout">
    <!-- Mobile Header -->
    <header class="admin-mobile-header">
      <button class="mobile-menu-toggle" @click="sidebarOpen = !sidebarOpen">
        ☰
      </button>
      <span class="mobile-brand">Minutes 2 Match</span>
    </header>

    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'admin-sidebar--open': sidebarOpen }">
      <div class="sidebar-header">
        <h1 class="sidebar-brand">M2M Admin</h1>
        <button class="mobile-close" @click="sidebarOpen = false">×</button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/admin" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span class="label">Overview</span>
        </NuxtLink>
        <NuxtLink to="/admin/users" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
             <circle cx="9" cy="7" r="4"/>
             <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
             <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span class="label">Users</span>
        </NuxtLink>
        <NuxtLink to="/admin/matches" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="label">Matchmaker</span>
        </NuxtLink>
        <NuxtLink to="/admin/matches/queue" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="label">Match Queue</span>
        </NuxtLink>
        <NuxtLink to="/admin/events" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="label">Events</span>
        </NuxtLink>
        <NuxtLink to="/admin/messaging" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="label">SMS Messaging</span>
        </NuxtLink>
        <NuxtLink to="/admin/questions" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span class="label">Questions</span>
        </NuxtLink>
        <NuxtLink to="/admin/payments" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span class="label">Payments</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" x2="4" y1="22" y2="15"/>
          </svg>
          <span class="label">Reports</span>
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="sidebar-link" @click="sidebarOpen = false">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="3"/>
             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span class="label">Settings</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-user">
          <div class="admin-avatar">{{ userInitial }}</div>
          <div class="admin-info">
            <span class="admin-name">Admin</span>
            <span class="admin-role">{{ role }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Top Bar -->
      <header class="admin-topbar">
        <h2 class="page-title">{{ pageTitle }}</h2>
        <div class="topbar-actions">
           <!-- Placeholder for global search or notifications -->
           <span class="date-display">{{ currentDate }}</span>
        </div>
      </header>

      <!-- Page Content Slot -->
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

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dashboard Overview'
  if (path.startsWith('/admin/users')) return 'User Management'
  if (path === '/admin/matches/queue') return 'Smart Match Queue'
  if (path.startsWith('/admin/matches')) return 'Matchmaker Tool'
  if (path.startsWith('/admin/events')) return 'Event Management'
  if (path === '/admin/messaging/history') return 'SMS History'
  if (path.startsWith('/admin/messaging')) return 'SMS Messaging'
  if (path.startsWith('/admin/questions')) return 'Vibe Questions'
  if (path.startsWith('/admin/payments')) return 'Payments'
  if (path.startsWith('/admin/reports')) return 'User Reports'
  if (path.startsWith('/admin/settings')) return 'Platform Settings'
  return 'Admin Portal'
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
/* Layout Architecture */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #F9FAFB;
}

/* Sidebar Styling */
.admin-sidebar {
  width: 260px;
  background-color: #000000;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  transition: transform 0.3s ease;
  box-shadow: 1px 0 0 rgba(255,255,255,0.1);
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sidebar-brand {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  color: white;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.75rem;
  color: #9CA3AF;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
}

.sidebar-link:hover {
  background-color: rgba(255,255,255,0.05);
  color: white;
}

.sidebar-link.router-link-active {
  background-color: white;
  color: black;
  font-weight: 600;
}

.sidebar-link .icon {
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.7;
}

.sidebar-link.router-link-active .icon {
  opacity: 1;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-avatar {
  width: 2.25rem;
  height: 2.25rem;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.admin-info {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.admin-role {
  font-size: 0.7rem;
  color: #9CA3AF;
  text-transform: uppercase;
}

.logout-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.logout-btn:hover {
  color: white;
}

/* Main Content Area */
.admin-main {
  flex: 1;
  margin-left: 260px; /* Width of sidebar */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-topbar {
  height: 70px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.page-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.date-display {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

.admin-page-content {
  flex: 1;
  padding: 2rem;
  overflow-x: hidden;
}

/* Mobile Styling */
.admin-mobile-header {
  display: none; /* Hidden on desktop */
  height: 60px;
  background: #000000;
  color: white;
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
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-brand {
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}

.mobile-close {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
  z-index: 45;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar--open {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0;
    padding-top: 60px; /* Space for mobile header */
  }

  .admin-topbar {
    display: none; /* Hide topbar on mobile to save space, rely on mobile header */
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
