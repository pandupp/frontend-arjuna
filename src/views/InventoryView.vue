<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

// ## PERUBAHAN 1: Impor store Pinia ##
import { useInventoryStore } from '../stores/inventory';

// Komponen lokal
import AddItemModal from '../components/AddItemModal.vue';

// ## PERUBAHAN 2: Buat instance dari store ##
const inventoryStore = useInventoryStore();

// ## PERUBAHAN 3: Ambil state `inventoryItems` secara reaktif ##
const { inventoryItems } = storeToRefs(inventoryStore);

// State lokal untuk UI, tidak ada perubahan
const isModalOpen = ref(false);
const openMenuId = ref(null); 
const activeItem = ref(null); 

// Semua logika computed dan fungsi UI Anda tidak perlu diubah
const getStockStatus = (stock) => {
  if (stock >= 50) {
    return { label: 'High', dotClass: 'bg-green-500', textClass: 'text-green-600' };
  } else if (stock >= 10 && stock < 50) {
    return { label: 'Medium', dotClass: 'bg-yellow-500', textClass: 'text-yellow-600' };
  } else {
    return { label: 'Low', dotClass: 'bg-red-500', textClass: 'text-red-600' };
  }
};

const searchQuery = ref('');
const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return inventoryItems.value;
  }
  const query = searchQuery.value.toLowerCase();
  return inventoryItems.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.code.toLowerCase().includes(query)
  );
});

const openAddModal = () => {
  // ## PERUBAHAN 4: Gunakan getter `nextItemCode` dari store ##
  activeItem.value = { code: inventoryStore.nextItemCode };
  isModalOpen.value = true;
};
const openEditModal = (item) => {
  activeItem.value = { ...item };
  isModalOpen.value = true;
  openMenuId.value = null;
};

// ## PERUBAHAN 5: Fungsi CRUD memanggil 'actions' dari store ##

const deleteItem = (itemId) => {
  openMenuId.value = null;
  Swal.fire({
    title: 'Anda Yakin?',
    text: "Data yang dihapus tidak bisa dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      inventoryStore.deleteItem(itemId); // Panggil action
      Swal.fire('Dihapus!', 'Item Anda telah berhasil dihapus.', 'success')
    }
  })
};

const handleAddItem = (newItem) => {
  inventoryStore.addNewItem(newItem); // Panggil action
};
const handleUpdateItem = (updatedItem) => {
  inventoryStore.updateItem(updatedItem); // Panggil action
};
</script>

<template>
  <!-- Template Anda tidak perlu diubah sama sekali -->
  <div class="relative" @click="openMenuId = null">
    <div class="mb-6">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Cari berdasarkan nama, kode..."
        class="w-full md:w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
      >
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="border-b-2 border-gray-200">
            <tr>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">#</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Code</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Name</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Unit</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Stock</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="(item, index) in filteredItems" :key="item.id" class="border-b border-gray-200 hover:bg-white">
              <td class="py-5 px-6 text-gray-500">{{ index + 1 }}</td>
              <td class="py-5 px-6 font-medium text-gray-900">{{ item.code }}</td>
              <td class="py-5 px-6 text-gray-600">{{ item.name }}</td>
              <td class="py-5 px-6 text-gray-600">{{ item.unit }}</td>
              <td class="py-5 px-6 font-medium text-gray-900">{{ item.stock }}</td>
              <td class="py-5 px-6">
                <span class="inline-flex items-center py-1.5 px-3 rounded-full bg-gray-100">
                  <span :class="getStockStatus(item.stock).dotClass" class="w-2 h-2 rounded-full mr-2"></span>
                  <span :class="getStockStatus(item.stock).textClass" class="font-semibold text-xs">{{ getStockStatus(item.stock).label }}</span>
                </span>
              </td>
              <td class="py-5 px-6 text-right relative">
                <button @click.stop="openMenuId = openMenuId === item.id ? null : item.id" class="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
                </button>
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div v-if="openMenuId === item.id" class="absolute right-8 top-0 mt-2 w-40 bg-white rounded-lg shadow-xl border z-10">
                    <div class="py-1">
                      <a @click.prevent="openEditModal(item)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-3"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                        Edit
                      </a>
                      <a @click.prevent="deleteItem(item.id)" href="#" class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-3"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        Hapus
                      </a>
                    </div>
                  </div>
                </Transition>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AddItemModal 
      :isOpen="isModalOpen" 
      :itemData="activeItem"
      @close="isModalOpen = false"
      @addItem="handleAddItem"
      @updateItem="handleUpdateItem"
    />

    <button @click="openAddModal" class="fixed bottom-8 right-8 bg-[#E84D43] hover:bg-[#BF202F] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
    </button>
  </div>
</template>
