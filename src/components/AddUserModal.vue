<script setup>
import { ref } from 'vue';

defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(['close', 'save']);

// State lokal untuk menampung data dari form
const newUserData = ref({
  name: '',
  email: '',
  password: '',
  role: 'Staf', // Nilai default untuk peran
});

const handleSubmit = () => {
  // Validasi sederhana
  if (!newUserData.value.name || !newUserData.value.email || !newUserData.value.password) {
    alert('Semua field wajib diisi!');
    return;
  }
  // Kirim data baru ke parent (UserManagementView)
  emit('save', { ...newUserData.value });
  // Tutup modal
  emit('close');
  // Reset form
  newUserData.value = { name: '', email: '', password: '', role: 'Staf' };
};
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
      <div @click="$emit('close')" class="absolute inset-0"></div>
      <div class="relative bg-white rounded-2xl shadow-lg w-full max-w-md" @click.stop>
        <div class="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">Tambah User Baru</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-700 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="p-6 space-y-4">
            <div>
              <label for="userName" class="block text-sm font-medium text-gray-700">Nama</label>
              <input v-model="newUserData.name" type="text" id="userName" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3" required>
            </div>
            <div>
              <label for="userEmail" class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="newUserData.email" type="email" id="userEmail" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3" required>
            </div>
            <div>
              <label for="userPassword" class="block text-sm font-medium text-gray-700">Password</label>
              <input v-model="newUserData.password" type="password" id="userPassword" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3" required>
            </div>
            <div>
              <label for="userRole" class="block text-sm font-medium text-gray-700">Peran (Role)</label>
              <select v-model="newUserData.role" id="userRole" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3">
                <option>Staf</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end items-center p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button @click="$emit('close')" type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2">
              Batal
            </button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

