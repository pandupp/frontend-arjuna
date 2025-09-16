<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  lastPage: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  perPage: {
    type: Number,
    required: true
  },
  from: {
    type: Number,
    required: true
  },
  to: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['page-change']);

// Computed properties untuk navigasi pagination
const hasNextPage = computed(() => props.currentPage < props.lastPage);
const hasPrevPage = computed(() => props.currentPage > 1);

// Generate page numbers dengan logic untuk menampilkan maksimal 7 halaman
const visiblePages = computed(() => {
  const current = props.currentPage;
  const total = props.lastPage;
  const pages = [];

  if (total <= 7) {
    // Jika total halaman <= 7, tampilkan semua
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Logic untuk menampilkan halaman dengan ellipsis
    if (current <= 4) {
      // Tampilkan 1,2,3,4,5,...,last
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      // Tampilkan 1,...,last-4,last-3,last-2,last-1,last
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Tampilkan 1,...,current-1,current,current+1,...,last
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    }
  }

  return pages;
});

// Functions untuk navigasi
const goToPage = (page) => {
  if (page !== '...' && page !== props.currentPage && page >= 1 && page <= props.lastPage) {
    emit('page-change', page);
  }
};

const goToPrevPage = () => {
  if (hasPrevPage.value) {
    emit('page-change', props.currentPage - 1);
  }
};

const goToNextPage = () => {
  if (hasNextPage.value) {
    emit('page-change', props.currentPage + 1);
  }
};
</script>

<template>
  <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between mt-6 px-6 py-4 bg-white border-t border-gray-200">
    <!-- Info showing entries -->
    <div class="text-sm text-gray-700 mb-4 sm:mb-0">
      Menampilkan {{ from }} hingga {{ to }} dari {{ total }} data
    </div>

    <!-- Pagination buttons -->
    <nav class="flex items-center space-x-1">
      <!-- Previous button -->
      <button
        @click="goToPrevPage"
        :disabled="!hasPrevPage"
        :class="[
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          hasPrevPage
            ? 'text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 border border-gray-300'
            : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
        ]"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Page numbers -->
      <template v-for="page in visiblePages" :key="page">
        <span
          v-if="page === '...'"
          class="px-3 py-2 text-sm font-medium text-gray-500"
        >
          ...
        </span>
        <button
          v-else
          @click="goToPage(page)"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-md transition-colors',
            page === currentPage
              ? 'text-white bg-[#E84D43] border border-[#E84D43]'
              : 'text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 border border-gray-300'
          ]"
        >
          {{ page }}
        </button>
      </template>

      <!-- Next button -->
      <button
        @click="goToNextPage"
        :disabled="!hasNextPage"
        :class="[
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          hasNextPage
            ? 'text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 border border-gray-300'
            : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
        ]"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </nav>
  </div>
</template>
