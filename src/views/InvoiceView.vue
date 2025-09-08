<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

import { useInvoiceStore } from '../stores/invoice';
import { useInventoryStore } from '../stores/inventory';

import CreateInvoiceModal from '../components/CreateInvoiceModal.vue';
import PrintInvoice from '../components/PrintInvoice.vue';

const invoiceStore = useInvoiceStore();
const inventoryStore = useInventoryStore();

const { invoices, nextInvoiceNumber } = storeToRefs(invoiceStore);
const { inventoryItems } = storeToRefs(inventoryStore);

const isModalOpen = ref(false);
const openMenuId = ref(null);
const editingInvoice = ref(null);
const invoiceToPrint = ref(null);

const getInvoiceStatus = (status) => {
    switch (status) {
        case 'Lunas': return 'bg-green-100 text-green-700';
        case 'Tertunda': return 'bg-yellow-100 text-yellow-700';
        case 'Jatuh Tempo': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const openAddModal = () => {
    editingInvoice.value = null;
    isModalOpen.value = true;
};

const openEditModal = (invoice) => {
    editingInvoice.value = JSON.parse(JSON.stringify(invoice));
    isModalOpen.value = true;
    openMenuId.value = null;
};

const deleteInvoice = (invoiceId) => {
    openMenuId.value = null;
    Swal.fire({
        title: 'Anda Yakin?',
        text: "Invoice yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            invoiceStore.deleteInvoice(invoiceId);
            Swal.fire('Dihapus!', 'Invoice telah berhasil dihapus.', 'success');
        }
    });
};

const markAsPaid = (invoiceId) => {
    invoiceStore.markInvoiceAsPaid(invoiceId);
    openMenuId.value = null;
}

const handleSaveInvoice = (newInvoiceData) => {
    invoiceStore.addNewInvoice(newInvoiceData);
    inventoryStore.reduceStockFromInvoice(newInvoiceData);
};

const handleUpdateInvoice = (updatedInvoice) => {
    invoiceStore.updateInvoice(updatedInvoice);
}

const printInvoice = (invoice) => {
    invoiceToPrint.value = invoice;
    setTimeout(() => {
        window.print();
        invoiceToPrint.value = null;
    }, 100);
    openMenuId.value = null;
};
</script>

<template>
  <div @click="openMenuId = null">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Daftar Invoice</h1>
        <p class="text-gray-500 mt-1">Kelola semua tagihan untuk pelanggan Anda.</p>
      </div>
      <button @click="openAddModal" class="bg-[#E84D43] hover:bg-[#BF202F] text-white font-bold py-2 px-5 rounded-lg shadow-md transition-colors duration-300 flex items-center w-full md:w-auto">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>Buat Invoice Baru</span>
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-4 md:p-6 border-b border-gray-100">
        <input 
          type="text" 
          placeholder="Cari invoice..."
          class="w-full md:w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-white">
            <tr>
              <th class="py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">Invoice #</th>
              <th class="py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">Pelanggan</th>
              <th class="py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">Tgl. Terbit</th>
              <th class="py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
              <th class="py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="invoice in invoices" :key="invoice.id" class="border-t border-gray-100 hover:bg-gray-50">
              <td class="py-4 px-6 font-medium text-gray-900">{{ invoice.invoiceNumber }}</td>
              <td class="py-4 px-6 text-gray-600">{{ invoice.customerName }}</td>
              <td class="py-4 px-6 text-gray-600">{{ invoice.issueDate }}</td>
              <td class="py-4 px-6 font-medium text-gray-900">Rp {{ (invoice.totalAmount || 0).toLocaleString('id-ID') }}</td>
              <td class="py-4 px-6">
                <span :class="getInvoiceStatus(invoice.status)" class="inline-flex items-center py-1 px-3 rounded-full text-xs font-semibold">{{ invoice.status }}</span>
              </td>
              <td class="py-4 px-6 text-right relative">
                <button @click.stop="openMenuId = openMenuId === invoice.id ? null : invoice.id" class="text-gray-400 hover:text-gray-700 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
                </button>
                <Transition
                  enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                  <div v-if="openMenuId === invoice.id" class="absolute right-8 top-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                    <div class="py-1">
                      <a @click.prevent="openEditModal(invoice)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit
                      </a>
                      <a @click.prevent="printInvoice(invoice)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Cetak
                      </a>
                      <a v-if="invoice.status !== 'Lunas'" @click.prevent="markAsPaid(invoice.id)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Tandai Lunas
                      </a>
                      <a @click.prevent="deleteInvoice(invoice.id)" href="#" class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
    
    <CreateInvoiceModal 
      :isOpen="isModalOpen"
      :nextInvoiceNumber="nextInvoiceNumber"
      :invoiceToEdit="editingInvoice"
      :inventoryItems="inventoryItems" 
      @close="isModalOpen = false"
      @saveInvoice="handleSaveInvoice"
      @updateInvoice="handleUpdateInvoice"
    />
    
    <div v-if="invoiceToPrint" class="hidden print:block">
      <PrintInvoice :invoice="invoiceToPrint" />
    </div>
  </div>
</template>

