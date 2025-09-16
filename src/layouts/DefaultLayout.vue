<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia';

// ## PERUBAHAN 1: Impor store inventory dan komponen notifikasi baru ##
import { useAuthStore } from '../stores/auth';
import { useInventoryStore } from '../stores/inventory';
import NotificationDropdown from '../components/NotificationDropdown.vue';

const router = useRouter()
const authStore = useAuthStore();
// ## PERUBAHAN 2: Inisialisasi inventory store ##
const inventoryStore = useInventoryStore();

const { userRole } = storeToRefs(authStore);
// ## PERUBAHAN 3: Ambil data item stok rendah secara reaktif dari store ##
const { lowStockItems } = storeToRefs(inventoryStore);

const isMobileMenuOpen = ref(false)
// ## PERUBAHAN 4: Tambahkan state untuk membuka/menutup dropdown notifikasi ##
const isNotificationsOpen = ref(false);

// ## PERUBAHAN 5: Tambahkan state untuk notifikasi yang sudah dibaca ##
const readNotifications = ref(new Set());

// Load read notifications from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('readNotifications');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      readNotifications.value = new Set(parsed);
    } catch (error) {
      console.error('Error loading read notifications:', error);
    }
  }
});

// Save read notifications to localStorage whenever it changes
watch(readNotifications, (newValue) => {
  localStorage.setItem('readNotifications', JSON.stringify([...newValue]));
}, { deep: true });

// Computed untuk notifikasi yang belum dibaca
const unreadNotifications = computed(() => {
  if (!lowStockItems.value) return [];

  // Clean up read notifications for items that are no longer in lowStockItems
  const currentItemIds = new Set(lowStockItems.value.map(item => item.id));
  const cleanedReadNotifications = new Set([...readNotifications.value].filter(id => currentItemIds.has(id)));

  if (cleanedReadNotifications.size !== readNotifications.value.size) {
    readNotifications.value = cleanedReadNotifications;
  }

  return lowStockItems.value.filter(item => !readNotifications.value.has(item.id));
});

// Function untuk menandai notifikasi sebagai sudah dibaca
const markNotificationAsRead = (notification) => {
  readNotifications.value.add(notification.id);
  // Force reactivity update
  readNotifications.value = new Set(readNotifications.value);
  // Auto-close dropdown if all notifications are read
  if (unreadNotifications.value.length === 0) {
    isNotificationsOpen.value = false;
  }
};

// Function untuk menandai semua notifikasi sebagai sudah dibaca
const markAllNotificationsAsRead = () => {
  if (lowStockItems.value) {
    lowStockItems.value.forEach(item => {
      readNotifications.value.add(item.id);
    });
    // Force reactivity update
    readNotifications.value = new Set(readNotifications.value);
    // Auto-close dropdown after marking all as read
    isNotificationsOpen.value = false;
  }
};

const allNavLinks = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    requiredRole: 'Admin',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`
  },
  {
    name: 'Inventory',
    path: '/inventory',
    requiredRole: 'any',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>`
  },
  {
    name: 'Invoice',
    path: '/invoices',
    requiredRole: 'any',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h4.5v.75h-4.5v-.75Z" /></svg>`
  },
  {
    name: 'Report',
    path: '/reports',
    requiredRole: 'Admin',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3.75A2.25 2.25 0 0 0 18 1.5H6.003A2.25 2.25 0 0 0 3.75 3Zm1.5 0h13.5v11.25a1.5 1.5 0 0 1-1.5 1.5h-10.5a1.5 1.5 0 0 1-1.5-1.5V3Z" /></svg>`
  },
  {
    name: 'User',
    path: '/users',
    requiredRole: 'Admin',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`
  },
]

const navLinks = computed(() => {
  const currentRole = userRole.value;
  return allNavLinks.filter(link => {
    if (!link.requiredRole || link.requiredRole === 'any') {
      return true;
    }
    return link.requiredRole === currentRole;
  });
})

const handleLogout = () => {
  authStore.logout();
  router.push('/login')
}
</script>

<template>
  <div class="relative flex h-screen bg-gray-50 text-gray-900 font-sans">
    <!-- Overlay Mobile -->
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-black/30 z-20 md:hidden"></div>

    <!-- Sidebar -->
    <aside
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
      class="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm fixed inset-y-0 left-0 z-30
             md:relative md:translate-x-0 transition-transform duration-300 ease-in-out"
    >
      <div class="h-16 flex items-center justify-center border-b border-gray-100 flex-shrink-0">
        <img src="../assets/logo.png" alt="Arjuna Inventory Logo" class="h-10 w-auto">
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <p class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Main</p>
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center p-3 rounded-lg text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200"
          active-class="bg-red-50 text-red-600 font-semibold"
        >
          <span v-html="link.icon" class="h-5 w-5 mr-3 flex-shrink-0"></span>
          <span class="truncate">{{ link.name }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4 ml-auto text-gray-400 router-link-arrow"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </router-link>
      </nav>

      <!-- Tombol Logout -->
      <div class="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          @click="handleLogout"
          class="w-full bg-[#BF202F] hover:bg-[#a11a27] text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
        >
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shadow-sm">
        <div class="flex items-center">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden mr-4 p-2 rounded-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <h1 class="text-xl font-bold text-gray-800">{{ $route.name }}</h1>
        </div>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <button @click="isNotificationsOpen = !isNotificationsOpen" class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <!-- Ikon Lonceng -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-600"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
              <!-- ## PERBAIKAN: Tambahkan pengecekan `v-if="lowStockItems"` ## -->
              <span v-if="unreadNotifications && unreadNotifications.length > 0" class="absolute top-0 right-0 h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                {{ unreadNotifications.length }}
              </span>
            </button>
            <!-- Dropdown Notifikasi -->
            <NotificationDropdown
              v-if="isNotificationsOpen"
              :notifications="unreadNotifications || []"
              @close="isNotificationsOpen = false"
              @markAsRead="markNotificationAsRead"
              @markAllAsRead="markAllNotificationsAsRead"
            />
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-8 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.router-link-exact-active .router-link-arrow {
  color: #EF4444; /* text-red-500 */
}
</style>
