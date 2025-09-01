<script setup>
import { ref, watchEffect, computed } from 'vue';

// Props dan Emits tetap sama
const props = defineProps({
  isOpen: Boolean,
  itemToEdit: Object,
});
const emit = defineEmits(['close', 'addItem', 'updateItem']);

// Menambahkan 'unit' ke dalam state form
const formData = ref({
  code: '',
  name: '',
  type: '',
  quality: '',
  stock: 0,
  unit: '', // <-- DITAMBAHKAN
});

const isEditMode = computed(() => !!props.itemToEdit);

watchEffect(() => {
  if (props.isOpen && isEditMode.value) {
    formData.value = { ...props.itemToEdit };
  } else {
    // Reset form, termasuk 'unit'
    formData.value = { code: '', name: '', type: '', quality: '', stock: 0, unit: '' };
  }
});

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.code) {
    alert('Kode dan Nama barang wajib diisi!');
    return;
  }
  if (isEditMode.value) {
    emit('updateItem', { ...formData.value });
  } else {
    emit('addItem', { ...formData.value });
  }
  emit('close');
};
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
      <div @click="$emit('close')" class="absolute inset-0"></div>
      <Transition
        enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div class="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl" @click.stop>
          <div class="flex justify-between items-center p-5 border-b border-gray-100">
            <div class="flex items-center space-x-3">
              <div class="bg-gray-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">{{ isEditMode ? 'Edit Item' : 'Tambah Item Baru' }}</h3>
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label for="code" class="block text-sm font-medium text-gray-600 mb-2">Code</label>
                  <input v-model="formData.code" type="text" id="code" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition" required>
                </div>
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-600 mb-2">Name</label>
                  <input v-model="formData.name" type="text" id="name" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition" required>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-600 mb-2">Type</label>
                  <input v-model="formData.type" type="text" id="type" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                </div>
                <div>
                  <label for="quality" class="block text-sm font-medium text-gray-600 mb-2">Quality</label>
                  <input v-model="formData.quality" type="text" id="quality" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label for="stock" class="block text-sm font-medium text-gray-600 mb-2">Stock</label>
                  <input v-model.number="formData.stock" type="number" id="stock" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                </div>
                <div>
                  <label for="unit" class="block text-sm font-medium text-gray-600 mb-2">Unit (pcs, meter, dll)</label>
                  <input v-model="formData.unit" type="text" id="unit" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                </div>
              </div>
            </div>
            <div class="flex justify-end items-center p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button @click="$emit('close')" type="button" class="bg-transparent hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-lg transition-colors mr-2">
                Batal
              </button>
              <button type="submit" class="bg-[#E84D43] hover:bg-[#BF202F] text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all">
                {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Item' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>