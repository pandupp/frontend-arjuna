<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

// 1. Impor store dan komponen modal
import { useAuthStore } from '../stores/auth';
import AddUserModal from '../components/AddUserModal.vue'; 

// 2. Inisialisasi store
const authStore = useAuthStore();
const { users } = storeToRefs(authStore);

// 3. State lokal untuk UI
const isLoading = ref(true);
const isModalOpen = ref(false);
const editingUser = ref(null); // Disimpan untuk fungsionalitas edit nanti

// 4. Ambil data saat komponen dimuat
onMounted(async () => {
  isLoading.value = true;
  try {
    await authStore.fetchAllUsers();
  } catch(error) {
    Swal.fire('Error', 'Gagal memuat data pengguna.', 'error');
  } finally {
    isLoading.value = false;
  }
});

const openAddModal = () => {
  editingUser.value = null;
  isModalOpen.value = true;
};

// 5. Logika simpan dan hapus yang memanggil store
async function handleSaveUser(newUserData) {
  try {
    await authStore.addUser(newUserData);
    isModalOpen.value = false;
    Swal.fire('Berhasil!', 'User baru telah ditambahkan.', 'success');
  } catch (error) {
    Swal.fire('Gagal', 'Tidak dapat menambahkan user baru.', 'error');
  }
};

function deleteUser(userId) {
    Swal.fire({
        title: 'Anda Yakin?',
        text: "Data user yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
              await authStore.deleteUser(userId);
              Swal.fire('Dihapus!', 'User telah berhasil dihapus.', 'success');
            } catch (error) {
              Swal.fire('Gagal', 'User tidak dapat dihapus.', 'error');
            }
        }
    });
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">User Management</h1>
      <button @click="openAddModal" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
        + Tambah User
      </button>
    </div>

    <!-- Tampilkan pesan loading -->
    <div v-if="isLoading" class="text-center py-16">
      <p class="text-gray-500 text-lg">Memuat data pengguna...</p>
    </div>

    <!-- Tampilkan tabel setelah loading selesai -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <div v-if="!users.length" class="text-center py-16">
        <p class="text-gray-500 text-lg">Belum ada data pengguna.</p>
      </div>
      <table v-else class="w-full text-left">
        <thead>
          <tr class="border-b-2 border-gray-200">
            <th class="py-4 px-6 text-sm font-semibold uppercase text-gray-500">Nama</th>
            <th class="py-4 px-6 text-sm font-semibold uppercase text-gray-500">Email</th>
            <th class="py-4 px-6 text-sm font-semibold uppercase text-gray-500">Password</th>
            <th class="py-4 px-6 text-sm font-semibold uppercase text-gray-500">Role</th>
            <th class="py-4 px-6 text-sm font-semibold uppercase text-gray-500">Aksi</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="user in users" :key="user.id" class="border-b border-gray-100">
            <td class="py-4 px-6 font-medium text-gray-900">{{ user.name }}</td>
            <td class="py-4 px-6 text-gray-600">{{ user.email }}</td>
            <td class="py-4 px-6 text-gray-600">••••••••</td>
            <td class="py-4 px-6 text-gray-600">{{ user.role }}</td>
            <td class="py-4 px-6">
              <div class="flex items-center space-x-2">
                <button class="text-blue-600 hover:text-blue-800">
                  <!-- Ikon Edit -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                </button>
                <button @click="deleteUser(user.id)" class="text-red-600 hover:text-red-800">
                  <!-- Ikon Hapus -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" /></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Panggil komponen modal -->
    <AddUserModal 
      :isOpen="isModalOpen" 
      @close="isModalOpen = false"
      @save="handleSaveUser"
    />
  </div>
</template>
