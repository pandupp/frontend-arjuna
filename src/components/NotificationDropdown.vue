<script setup>
import { useRouter } from 'vue-router';

defineProps({
  notifications: Array,
});

const emit = defineEmits(['close']);
const router = useRouter();

const handleNotificationClick = (notification) => {
  router.push('/inventory');
  emit('close');
};
</script>

<template>
  <!-- ## DESAIN BARU UNTUK DROPDOWN NOTIFIKASI ## -->
  <div 
    class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-20"
    @click.stop
  >
    <!-- Header Dropdown -->
    <div class="p-4 border-b flex justify-between items-center">
      <h3 class="font-semibold text-gray-800">Notifikasi</h3>
      <span v-if="notifications && notifications.length > 0" class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
        {{ notifications.length }} Baru
      </span>
    </div>

    <!-- Daftar Notifikasi -->
    <div v-if="notifications && notifications.length > 0" class="max-h-96 overflow-y-auto">
      <ul>
        <li v-for="notif in notifications" :key="notif.id" class="border-b last:border-b-0">
          <a @click.prevent="handleNotificationClick(notif)" href="#" class="flex items-start p-4 hover:bg-gray-50 transition-colors duration-150">
            <!-- Ikon Notifikasi -->
            <div class="flex-shrink-0 mr-4 mt-1">
              <div class="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <!-- Konten Teks Notifikasi -->
            <div>
              <p class="font-semibold text-sm text-gray-800">Stok Kritis Menipis</p>
              <p class="text-sm text-gray-600 mt-1">
                Stok untuk <span class="font-bold text-gray-900">{{ notif.name }}</span> tersisa 
                <span class="font-bold text-red-600">{{ notif.stock }} {{ notif.unit }}</span>.
              </p>
              <p class="text-xs text-gray-400 mt-2">Segera pesan ulang.</p>
            </div>
          </a>
        </li>
      </ul>
    </div>
    
    <!-- Tampilan Jika Tidak Ada Notifikasi -->
    <div v-else class="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p class="font-semibold">Semua aman!</p>
        <p>Tidak ada notifikasi baru untuk saat ini.</p>
    </div>

    <!-- Footer Dropdown -->
    <div class="p-2 bg-gray-50 rounded-b-xl text-center">
        <a href="#" @click.prevent class="text-xs text-gray-500 hover:text-gray-800 font-medium">Lihat Semua Notifikasi</a>
    </div>
  </div>
</template>

