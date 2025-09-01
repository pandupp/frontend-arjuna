<script setup>
import { ref } from 'vue';

const emit = defineEmits(['addItem']);

const name = ref('');
const quantity = ref(0);
const price = ref(0);

const handleSubmit = () => {
  if (!name.value || quantity.value <= 0 || price.value <= 0) {
    alert('Harap isi semua data dengan benar!');
    return;
  }

  emit('addItem', {
    name: name.value,
    quantity: quantity.value,
    price: price.value,
  });

  // Reset form
  name.value = '';
  quantity.value = 0;
  price.value = 0;
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Tambah Barang Baru</h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="name" class="block mb-2 text-sm font-medium text-gray-700">Nama Barang</label>
        <input
          type="text"
          id="name"
          v-model="name"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Contoh: Stiker Vinyl A3+"
        />
      </div>
      <div class="mb-4">
        <label for="quantity" class="block mb-2 text-sm font-medium text-gray-700">Jumlah</label>
        <input
          type="number"
          id="quantity"
          v-model.number="quantity"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0"
        />
      </div>
      <div class="mb-4">
        <label for="price" class="block mb-2 text-sm font-medium text-gray-700">Harga Satuan</label>
        <input
          type="number"
          id="price"
          v-model.number="price"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="15000"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
      >
        Tambah ke Inventori
      </button>
    </form>
  </div>
</template>