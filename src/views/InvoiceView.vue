<script setup>
// ## PERUBAHAN 1: Impor onMounted untuk mengambil data saat komponen dimuat ##
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

// ## PERUBAHAN 2: Impor 'invoiceService' yang baru saja kita buat ##
import { invoiceService } from '../services/invoiceService';
import { useInvoiceStore } from '../stores/invoice';
import { useInventoryStore } from '../stores/inventory';

import CreateInvoiceModal from '../components/CreateInvoiceModal.vue';
import PrintInvoice from '../components/PrintInvoice.vue';

const invoiceStore = useInvoiceStore();
const inventoryStore = useInventoryStore();

// Kita masih butuh store untuk getter (nextInvoiceNumber) dan data lain (inventoryItems)
const { nextInvoiceNumber } = storeToRefs(invoiceStore);
const { inventoryItems } = storeToRefs(inventoryStore);

// ## PERUBAHAN 3: Buat state lokal untuk menampung data invoice ##
// 'invoices' dari store tidak lagi digunakan secara langsung di template
const viewInvoices = ref([]);
const isLoading = ref(true); // Tambahkan state untuk loading

// State lokal lainnya tetap sama
const isModalOpen = ref(false);
const openMenuId = ref(null);
const editingInvoice = ref(null);
const invoiceToPrint = ref(null);

// ## PERUBAHAN 4: Buat fungsi untuk mengambil data melalui service ##
const fetchInvoices = async () => {
  isLoading.value = true;
  try {
    // Meminta data ke "jembatan", bukan langsung ke store
    viewInvoices.value = await invoiceService.getAll();
  } catch (error) {
    // Di sini bisa ditambahkan notifikasi error untuk pengguna
  } finally {
    isLoading.value = false;
  }
};

// Panggil fungsi fetchInvoices dan fetchInventory saat komponen pertama kali dimuat
onMounted(async () => {
  await Promise.all([
    fetchInvoices(),
    inventoryStore.fetchAllItems()
  ]);
});

// ## PERUBAHAN 5: Ubah 'handleSaveInvoice' menjadi async dan gunakan service ##
const handleSaveInvoice = async (newInvoiceData) => {
  try {
    // Kirim data ke "jembatan"
    await invoiceService.create(newInvoiceData);
    // Jika berhasil, ambil kembali daftar invoice terbaru untuk me-refresh tampilan
    await fetchInvoices();
  } catch (error) {
    // TODO: Tambahkan notifikasi error untuk pengguna jika diperlukan
  }
};

// ## PERUBAHAN 7: Ubah deleteInvoice untuk menggunakan service dan refresh data ##
const deleteInvoice = async (invoiceId) => {
    openMenuId.value = null;
    const result = await Swal.fire({
        title: 'Anda Yakin?',
        text: "Invoice yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            // Gunakan invoiceService.delete untuk menghapus
            await invoiceService.delete(invoiceId);
            // Refresh data setelah berhasil menghapus
            await fetchInvoices();
            Swal.fire('Dihapus!', 'Invoice telah berhasil dihapus.', 'success');
        } catch (error) {
            Swal.fire('Error!', 'Gagal menghapus invoice. Silakan coba lagi.', 'error');
        }
    }
};

const markAsPaid = async (invoiceId) => {
    try {
        // ## PERUBAHAN 8: Gunakan invoiceService.updateStatus ##
        await invoiceService.updateStatus(invoiceId, 'Lunas');
        // Refresh data setelah update
        await fetchInvoices();
        openMenuId.value = null;
    } catch (error) {
        // TODO: Tambahkan notifikasi error jika diperlukan
    }
}

const handleUpdateInvoice = async (updatedInvoice) => {
    try {
        // ## PERUBAHAN 9: Gunakan invoiceService.update ##
        await invoiceService.update(updatedInvoice.id, updatedInvoice);
        // Refresh data setelah update
        await fetchInvoices();
    } catch (error) {
        // TODO: Tambahkan notifikasi error jika diperlukan
    }
}

// Fungsi-fungsi UI tidak perlu diubah
const printInvoice = async (invoice) => {
    // Ambil data terbaru dari backend
    const freshInvoice = await invoiceService.getById(invoice.id);
    invoiceToPrint.value = freshInvoice;
    setTimeout(() => {
        window.print();
        invoiceToPrint.value = null;
    }, 100);
    openMenuId.value = null;
};

const handlePrintInvoice = async (invoice) => {
    await printInvoice(invoice);
};
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
const openEditModal = async (invoice) => {
    // Ambil data invoice terbaru dari backend (atau store jika demo)
    const freshInvoice = await invoiceService.getById(invoice.id);

    // Mapping field dari backend ke struktur form modal
    const mappedInvoice = {
      id: freshInvoice.id,
      customerName: freshInvoice.customer_name,
      invoiceNumber: freshInvoice.invoice_number,
      issueDate: freshInvoice.issue_date?.substr(0, 10) || '', // format YYYY-MM-DD
      dueDate: freshInvoice.due_date || '',
      dueDateEnabled: !!freshInvoice.due_date,
      source: freshInvoice.source,
      status: freshInvoice.status,
      discount: parseFloat(freshInvoice.discount ?? 0),
      taxEnabled: !!freshInvoice.tax_enabled,
      dp: 0, // default jika tidak ada
      items: (freshInvoice.items || []).map(item => ({
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
        total: parseFloat(item.sub_total),
        selectedItem: null, // bisa diisi dari inventoryItems jika perlu
        unit: '', // isi jika ada info satuan
        availableStock: 0, // isi jika ada info stok
        error: '',
      })),
    };

    editingInvoice.value = JSON.parse(JSON.stringify(mappedInvoice));
    isModalOpen.value = true;
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
        <!-- Tampilkan pesan loading -->
        <div v-if="isLoading" class="text-center p-10 text-gray-500">
          Memuat data invoice...
        </div>
        <!-- Tampilkan tabel jika sudah selesai loading DAN ada data -->
        <table v-else-if="viewInvoices.length > 0" class="w-full text-left">
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
            <!-- ## PERUBAHAN 6: Ganti 'invoices' menjadi 'viewInvoices' ## -->
            <tr v-for="invoice in viewInvoices" :key="invoice.id" class="border-t border-gray-100 hover:bg-gray-50">
              <td class="py-4 px-6 font-medium text-gray-900">{{ invoice.invoice_number }}</td>
              <td class="py-4 px-6 text-gray-600">{{ invoice.customer_name }}</td>
              <td class="py-4 px-6 text-gray-600">{{ new Date(invoice.issue_date).toLocaleDateString('id-ID') }}</td>
              <td class="py-4 px-6 font-medium text-gray-900">Rp {{ parseFloat(invoice.grand_total || 0).toLocaleString('id-ID') }}</td>
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
                      <a @click.prevent="handlePrintInvoice(invoice)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
        <!-- Tampilkan pesan jika sudah selesai loading TAPI tidak ada data -->
        <div v-else class="text-center p-10 text-gray-500">
          Belum ada invoice yang dibuat.
        </div>
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
