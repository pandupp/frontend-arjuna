<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Impor store auth dari Pinia
import { useAuthStore } from '../stores/auth';

const router = useRouter();
// Buat instance dari auth store
const authStore = useAuthStore();

// State lokal untuk form Anda
const email = ref('admin@arjuna.com');
const password = ref('password123');
const errorMessage = ref('');

const handleLogin = () => {
  errorMessage.value = ''; 
  
  // Panggil action 'login' dari store
  const loginSuccess = authStore.login(email.value, password.value);

  if (loginSuccess) {
    // ## INI ADALAH PERUBAHAN UTAMA: Logika Smart Redirect ##
    // Setelah login berhasil, periksa peran pengguna dari store
    if (authStore.userRole === 'Admin') {
      router.push('/dashboard');
    } else {
      // Untuk peran lain (misalnya 'Staf'), arahkan ke halaman inventori
      router.push('/inventory');
    }
  } else {
    // Jika gagal, tampilkan pesan error
    errorMessage.value = 'Email atau password salah, atau akun tidak aktif.';
  }
};
</script>

<template>
  <!-- Template Anda tidak diubah sama sekali untuk menjaga konsistensi UI -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
    <div class="w-full max-w-sm">
      <div class="text-left mb-10">
          <h2 class="text-4xl font-bold text-gray-800">Hello!</h2>
          <p class="text-gray-500 mt-2">Sign in to get started.</p>
      </div>
      
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="email-address" class="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
          <input 
            id="email-address" 
            name="email" 
            type="email" 
            v-model="email" 
            required
            class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="admin@arjuna.com">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            v-model="password" 
            required
            class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="••••••••">
        </div>

        <div v-if="errorMessage" class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {{ errorMessage }}
        </div>

        <div class="pt-4">
          <button type="submit"
            class="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-md font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105">
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

