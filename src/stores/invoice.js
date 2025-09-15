import { defineStore } from "pinia";
import { ref, computed } from "vue";
// Impor service untuk digunakan saat mode non-dummy
import { invoiceService } from "../services/invoiceService";

// Data dummy kita letakkan di sini. Perhatikan bahwa 'selectedItem' sekarang
// hanya objek biasa, meniru data dari API, bukan tautan langsung ke store lain.
const DUMMY_INVOICE_DATA = [
  {
    id: 1,
    invoiceNumber: "INV-2025-020",
    customerName: "CV. Maju Jaya",
    issueDate: "2025-09-08",
    totalAmount: 1200000,
    status: "Lunas",
    dp: 1200000,
    items: [
      {
        selectedItem: { id: 5, name: "Banner X-Stand 60x160" },
        quantity: 10,
        total: 1200000,
      },
    ],
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-019",
    customerName: "Sekolah Harapan Bangsa",
    issueDate: "2025-09-05",
    totalAmount: 550000,
    status: "Tertunda",
    dp: 200000,
    items: [
      {
        selectedItem: { id: 13, name: "Kertas A4 80gr (rim)" },
        quantity: 10,
        total: 550000,
      },
    ],
  },
  // Anda bisa menambahkan data dummy lainnya di sini
];

export const useInvoiceStore = defineStore("invoice", () => {
  // --- STATE ---
  const invoices = ref([]);

  // --- GETTERS ---
  const nextInvoiceNumber = computed(() => {
    if (invoices.value.length === 0)
      return `INV-${new Date().getFullYear()}-001`;
    const lastNum = Math.max(
      ...invoices.value.map((inv) => parseInt(inv.invoiceNumber.split("-")[2])),
    );
    return `INV-${new Date().getFullYear()}-${String(lastNum + 1).padStart(3, "0")}`;
  });

  // --- ACTIONS ---

  // ## INI ADALAH ACTION UTAMA DENGAN "SAKLAR" CERDAS ##
  async function fetchAllInvoices() {
    // Cek variabel dari file .env
    if (import.meta.env.VITE_MOCK_API === "true") {
      invoices.value = DUMMY_INVOICE_DATA;
      return; // Selesai
    }

    try {
      const invoicesFromApi = await invoiceService.getAll();

      // Validasi data dari API
      if (Array.isArray(invoicesFromApi)) {
        invoices.value = invoicesFromApi;
      } else {
        invoices.value = [];
        throw new Error("Format data invoice dari API tidak sesuai.");
      }
    } catch (error) {
      invoices.value = [];
      throw error;
    }
  }

  // Aksi-aksi lain untuk memanipulasi data
  function addNewInvoice(invoice) {
    invoices.value.unshift(invoice);
  }

  function updateInvoice(updatedInvoice) {
    const index = invoices.value.findIndex(
      (inv) => inv.id === updatedInvoice.id,
    );
    if (index !== -1) {
      invoices.value[index] = updatedInvoice;
    }
  }

  function deleteInvoice(invoiceId) {
    invoices.value = invoices.value.filter((inv) => inv.id !== invoiceId);
  }

  return {
    invoices,
    nextInvoiceNumber,
    fetchAllInvoices, // <-- Action cerdas kita
    addNewInvoice,
    updateInvoice,
    deleteInvoice,
  };
});
