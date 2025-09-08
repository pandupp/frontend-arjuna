import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useInvoiceStore = defineStore('invoice', () => {
  // --- STATE ---
  const invoices = ref([
    // ... data invoice Anda yang sudah ada ...
    { 
      id: 1, 
      invoiceNumber: 'INV-2025-001', 
      customerName: 'Toko Roti Enak', 
      issueDate: '2025-09-05',
      dueDate: '2025-09-20', 
      totalAmount: 350000, 
      status: 'Tertunda',
      items: [{ selectedItem: { name: 'Stiker Vinyl A3+'}, quantity: 10, unitPrice: 15000, total: 150000 }, { selectedItem: { name: 'Spanduk Flexi 280gr'}, quantity: 8, unitPrice: 25000, total: 200000 }],
      dp: 100000,
    },
    { 
      id: 2, 
      invoiceNumber: 'INV-2025-002', 
      customerName: 'Kafe Pagi', 
      issueDate: '2025-09-12',
      dueDate: '2025-09-27', 
      totalAmount: 800000, 
      status: 'Tertunda',
      items: [{ selectedItem: { name: 'Spanduk Flexi 280gr'}, quantity: 32, unitPrice: 25000, total: 800000 }],
      dp: 200000,
    },
  ]);

  // --- GETTERS ---
  const nextInvoiceNumber = computed(() => {
    if (invoices.value.length === 0) return 'INV-2025-001';
    const lastNumber = Math.max(...invoices.value.map(inv => parseInt(inv.invoiceNumber.split('-')[2])));
    return `INV-2025-${String(lastNumber + 1).padStart(3, '0')}`;
  });

  // --- ACTIONS ---
  function addNewInvoice(invoiceData) {
    const nextId = invoices.value.length ? Math.max(...invoices.value.map(i => i.id)) + 1 : 1;
    invoices.value.unshift({ id: nextId, ...invoiceData });
  }

  function updateInvoice(updatedInvoice) {
    const index = invoices.value.findIndex(inv => inv.id === updatedInvoice.id);
    if (index !== -1) {
      invoices.value[index] = updatedInvoice;
    }
  }

  function deleteInvoice(invoiceId) {
    invoices.value = invoices.value.filter(inv => inv.id !== invoiceId);
  }

  // ## TAMBAHKAN ACTION INI ##
  // Fungsi untuk mengubah status invoice menjadi 'Lunas'
  function markInvoiceAsPaid(invoiceId) {
    const invoice = invoices.value.find(inv => inv.id === invoiceId);
    if (invoice) {
      invoice.status = 'Lunas';
      // Secara opsional, kita bisa menganggap sisa tagihan lunas dengan menyamakan DP dan Total
      invoice.sisaTagihan = 0;
      invoice.dp = invoice.totalAmount;
    }
  }

  return { 
    invoices, 
    nextInvoiceNumber,
    addNewInvoice,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsPaid // <-- Jangan lupa expose action-nya di sini
  };
});

