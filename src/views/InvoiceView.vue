<script setup>
// ## PERUBAHAN 1: Impor onMounted untuk mengambil data saat komponen dimuat ##
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

// ## PERUBAHAN 2: Impor 'invoiceService' yang baru saja kita buat ##
import { invoiceService } from '../services/invoiceService';
import { useInvoiceStore } from '../stores/invoice';
import { useInventoryStore } from '../stores/inventory';

import CreateInvoiceModal from '../components/CreateInvoiceModal.vue';
import PrintInvoice from '../components/PrintInvoice.vue';
import PaginationComponent from '../components/ui/PaginationComponent.vue';

const invoiceStore = useInvoiceStore();
const inventoryStore = useInventoryStore();

// Pagination states
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 10,
  from: 1,
  to: 1,
});
const currentPage = ref(1);
const perPage = ref(10);
const perPageOptions = [
  { value: 5, label: '5 per halaman' },
  { value: 10, label: '10 per halaman' },
  { value: 25, label: '25 per halaman' },
  { value: 50, label: '50 per halaman' }
];
const isPaginationLoading = ref(false);
const searchQuery = ref('');

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
const fetchInvoices = async (page = 1, showPaginationLoading = false) => {
  if (showPaginationLoading) {
    isPaginationLoading.value = true;
  } else {
    isLoading.value = true;
  }
  try {
    // Meminta data ke "jembatan", bukan langsung ke store
    const response = await invoiceService.getAll(page, perPage.value, searchQuery.value);
    // response: { data: [], pagination: {...} }
    viewInvoices.value = response.data;
    pagination.value = response.pagination;
    currentPage.value = page;
  } catch (error) {
    // Di sini bisa ditambahkan notifikasi error untuk pengguna
  } finally {
    if (showPaginationLoading) {
      isPaginationLoading.value = false;
    } else {
      isLoading.value = false;
    }
  }
};

// Panggil fungsi fetchInvoices dan fetchInventory saat komponen pertama kali dimuat
onMounted(async () => {
  await Promise.all([
    fetchInvoices(1),
    inventoryStore.fetchAllItems()
  ]);
});

// ## PERUBAHAN 5: Ubah 'handleSaveInvoice' menjadi async dan gunakan service ##
const handleSaveInvoice = async (newInvoiceData) => {
  try {
    console.log("=== INVOICE VIEW: Saving invoice ===");
    console.log("Data received from modal:", newInvoiceData);

    // Kirim data ke "jembatan"
    const result = await invoiceService.create(newInvoiceData);
    console.log("Invoice created successfully:", result);

    // Jika berhasil, ambil kembali daftar invoice terbaru untuk me-refresh tampilan
    await fetchInvoices(1);

    // Show success message
    Swal.fire({
      title: 'Berhasil!',
      text: 'Invoice berhasil dibuat.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error("=== INVOICE VIEW: Error creating invoice ===");
    console.error("Full error:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);

    let errorMessage = 'Gagal membuat invoice. Silakan coba lagi.';

    if (error.response?.status === 422) {
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        console.error("Validation errors:", validationErrors);

        const errorMessages = [];
        for (const field in validationErrors) {
          if (validationErrors[field] && Array.isArray(validationErrors[field])) {
            errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
          }
        }

        if (errorMessages.length > 0) {
          errorMessage = `Error validasi:\n${errorMessages.join('\n')}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
    }

    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK'
    });
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
            // Refresh data dan cek apakah perlu ke halaman sebelumnya
            const itemsOnCurrentPage = pagination.value.to - pagination.value.from + 1;
            const shouldGoToPreviousPage =
              currentPage.value > 1 &&
              itemsOnCurrentPage === 1; // Jika ini adalah item terakhir di halaman ini

            const targetPage = shouldGoToPreviousPage ? currentPage.value - 1 : currentPage.value;
            await fetchInvoices(targetPage, true);

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
        console.log("=== INVOICE VIEW: Updating invoice ===");
        console.log("Data received from modal:", updatedInvoice);

        // ## PERUBAHAN 9: Gunakan invoiceService.update ##
        const result = await invoiceService.update(updatedInvoice.id, updatedInvoice);
        console.log("Invoice updated successfully:", result);

        // Refresh data setelah update
        await fetchInvoices(currentPage.value);

        // Show success message
        Swal.fire({
            title: 'Berhasil!',
            text: 'Invoice berhasil diperbarui.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error("=== INVOICE VIEW: Error updating invoice ===");
        console.error("Full error:", error);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);

        let errorMessage = 'Gagal memperbarui invoice. Silakan coba lagi.';

        if (error.response?.status === 422) {
            if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                console.error("Validation errors:", validationErrors);

                const errorMessages = [];
                for (const field in validationErrors) {
                    if (validationErrors[field] && Array.isArray(validationErrors[field])) {
                        errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
                    }
                }

                if (errorMessages.length > 0) {
                    errorMessage = `Error validasi:\n${errorMessages.join('\n')}`;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
        }

        Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
};

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

// Pagination handlers
const handlePageChange = (page) => {
  fetchInvoices(page, true);
};

const handlePerPageChange = async () => {
  currentPage.value = 1; // Reset ke halaman pertama
  await fetchInvoices(1, true);
};

// Search handler (optional, can be expanded)
const filteredInvoices = computed(() => {
  if (!searchQuery.value) return viewInvoices.value;
  const query = searchQuery.value.toLowerCase();
  return viewInvoices.value.filter(inv =>
    inv.customer_name.toLowerCase().includes(query) ||
    inv.invoice_number.toLowerCase().includes(query)
  );
});

// Computed untuk menghitung nomor urut berdasarkan pagination
const getRowNumber = (index) => {
  if (searchQuery.value) {
    // Jika sedang searching, gunakan nomor urut biasa
    return index + 1;
  }
  // Jika tidak searching, gunakan nomor berdasarkan pagination
  const from = pagination.value.from || 1;
  return from + index;
};
const openEditModal = async (invoice) => {
    try {
      // Ambil data invoice terbaru dari backend (atau store jika demo)
      const response = await invoiceService.getById(invoice.id);

      // Handle API response format: { status: "success", data: {...}, message: "..." }
      const freshInvoice = response.data || response;

      console.log('Fresh invoice data:', freshInvoice);

      // Mapping field dari backend ke struktur form modal sesuai format JSON yang diberikan
      const mappedInvoice = {
        id: freshInvoice.id,
        invoice_number: freshInvoice.invoice_number,
        customer_name: freshInvoice.customer_name,
        customer_phone: freshInvoice.customer_phone || '',
        description: freshInvoice.description || '',
        source: freshInvoice.source || 'Customer Order',
        issue_date: freshInvoice.issue_date || new Date().toISOString().substr(0, 10),
        due_date: freshInvoice.due_date || null,
        discount: parseFloat(freshInvoice.discount || 0),
        down_payment: parseFloat(freshInvoice.down_payment || 0),
        tax_enabled: freshInvoice.tax_enabled === '1' || freshInvoice.tax_enabled === true,
        status: freshInvoice.status || 'pending',
        grand_total: parseFloat(freshInvoice.grand_total || 0),
        remaining_payment: parseFloat(freshInvoice.remaining_payment || 0),
        items: freshInvoice.items || []
      };

      console.log('Mapped invoice for editing:', mappedInvoice);

      editingInvoice.value = mappedInvoice;
      isModalOpen.value = true;
      openMenuId.value = null;
    } catch (error) {
      console.error('Error loading invoice for edit:', error);
      alert('Gagal memuat data invoice untuk diedit.');
    }
};
</script>

<template>
  <div class="relative" @click="openMenuId = null">
    <!-- Bagian Header dan Search Bar -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

    <!-- Bagian Search Bar -->
    <div class="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari berdasarkan nama pelanggan, nomor invoice..."
        class="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
      >
      <div v-if="searchQuery" class="text-sm text-gray-500">
        Ditemukan {{ filteredInvoices.length }} hasil pencarian
      </div>
    </div>

    <!-- Tampilkan pesan loading jika isLoading === true -->
    <div v-if="isLoading" class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
      <p class="text-gray-500 text-lg">Memuat data invoice...</p>
    </div>

    <!-- Tampilkan tabel jika loading sudah selesai -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="overflow-x-auto">
        <!-- Tampilkan pesan jika data kosong setelah loading -->
        <div v-if="!filteredInvoices.length" class="text-center py-16">
          <div v-if="searchQuery">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p class="text-gray-500 text-lg">Tidak ada data yang cocok dengan pencarian "<span class="font-semibold">{{ searchQuery }}</span>"</p>
            <p class="text-gray-400 text-sm mt-2">Coba gunakan kata kunci yang berbeda</p>
          </div>
          <div v-else>
            <p class="text-gray-500 text-lg">Belum ada invoice yang dibuat.</p>
          </div>
        </div>
        <!-- Tampilkan tabel jika ada data -->
        <table v-else class="w-full text-left">
          <thead class="border-b-2 border-gray-200">
            <tr>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">#</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Invoice #</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Pelanggan</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Keterangan</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Dibuat Oleh</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Tgl. Terbit</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Total</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="(invoice, index) in filteredInvoices" :key="invoice.id" class="border-b border-gray-200 hover:bg-gray-50/50">
              <td class="py-5 px-6 text-gray-500">{{ getRowNumber(index) }}</td>
              <td class="py-5 px-6 font-medium text-gray-900">{{ invoice.invoice_number }}</td>
              <td class="py-5 px-6 text-gray-600">{{ invoice.customer_name }}</td>
              <td class="py-5 px-6 text-gray-600">{{ invoice.description }}</td>
              <td class="py-5 px-6 text-gray-600">{{ invoice.user_name }}</td>
              <td class="py-5 px-6 text-gray-600">{{ new Date(invoice.issue_date).toLocaleDateString('id-ID') }}</td>
              <td class="py-5 px-6 font-medium text-gray-900">Rp {{ parseFloat(invoice.grand_total || 0).toLocaleString('id-ID') }}</td>
              <td class="py-5 px-6">
                <span :class="getInvoiceStatus(invoice.status)" class="inline-flex items-center py-1.5 px-3 rounded-full text-xs font-semibold">{{ invoice.status }}</span>
              </td>
              <td class="py-5 px-6 text-right relative">
                <button @click.stop="openMenuId = openMenuId === invoice.id ? null : invoice.id" class="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors z-100">
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
                  <div v-if="openMenuId === invoice.id" class="absolute right-8 top-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                    <div class="py-1">
                      <a @click.prevent="openEditModal(invoice)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-3"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                        Edit
                      </a>
                      <a @click.prevent="handlePrintInvoice(invoice)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-3"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M18.25 9.456v5.294M6.75 9.456c0-.126 0-.251.013-.375a1.35 1.35 0 0 1 .121-.352C7.012 8.477 7.215 8.5 7.5 8.5h1m-1.25.956V15.75c0 .414.336.75.75.75h9c.414 0 .75-.336.75-.75V9.456M6.75 9.456L7.5 8.5h9l.75.956" /></svg>
                        Cetak
                      </a>
                      <a v-if="invoice.status !== 'Lunas'" @click.prevent="markAsPaid(invoice.id)" href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        Tandai Lunas
                      </a>
                      <a @click.prevent="deleteInvoice(invoice.id)" href="#" class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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

      <!-- Pagination Component -->
      <div v-if="!searchQuery && pagination.total > 0" class="relative">
        <!-- Loading overlay untuk pagination -->
        <div v-if="isPaginationLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div class="flex items-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-[#E84D43]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">Memuat...</span>
          </div>
        </div>

        <PaginationComponent
          :currentPage="pagination.current_page"
          :lastPage="pagination.last_page"
          :total="pagination.total"
          :perPage="pagination.per_page"
          :from="pagination.from"
          :to="pagination.to"
          @page-change="handlePageChange"
        />
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
      <PrintInvoice :invoice="invoiceToPrint" :inventoryItems="inventoryItems" />
    </div>
  </div>
</template>
