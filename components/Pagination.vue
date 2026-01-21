<template>
  <div class="pagination-container">
    <div class="pagination-info">
      Showing feature
      <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
      to
      <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
      of
      <span class="font-medium">{{ totalItems }}</span>
      results
    </div>
    <div class="pagination-controls">
      <button 
        class="pagination-btn" 
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Previous
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="page-number-btn"
          :class="{ 'active': page === currentPage, 'dots': page === '...' }"
          @click="typeof page === 'number' ? changePage(page) : null"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>

      <button 
        class="pagination-btn" 
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        Next
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  totalItems: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['page-change'])

const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

const visiblePages = computed(() => {
  const pages = []
  const { currentPage, totalPages } = props
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(currentPage - 1)
      pages.push(currentPage)
      pages.push(currentPage + 1)
      pages.push('...')
      pages.push(totalPages)
    }
  }
  return pages
})
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number-btn {
  min-width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  border: 1px solid transparent;
  cursor: pointer;
}

.page-number-btn.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
  font-weight: 600;
}

.page-number-btn:hover:not(.active):not(.dots) {
  background-color: #f3f4f6;
}

.page-number-btn.dots {
  cursor: default;
  color: #9ca3af;
}

@media (max-width: 640px) {
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .page-numbers {
    display: none;
  }
}
</style>
