import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// Impor inventoryStore agar kita bisa menautkan data item secara langsung
import { useInventoryStore } from './inventory';

export const useInvoiceStore = defineStore('invoice', () => {
  // Inisialisasi inventoryStore untuk mengakses datanya
  const inventoryStore = useInventoryStore();

  // --- STATE ---
  // Data dummy diperbanyak dengan rasio 90:10 (Lunas:Tertunda) dan terhubung ke inventori
  const invoices = ref([
    // Data Bulan Ini (September 2025)
    { id: 1, invoiceNumber: 'INV-2025-020', customerName: 'CV. Maju Jaya', issueDate: '2025-09-08', totalAmount: 1200000, status: 'Lunas', source: 'Project', items: [{ selectedItem: inventoryStore.inventoryItems[4], quantity: 10, unitPrice: 120000, total: 1200000 }], dp: 1200000, sisaTagihan: 0 },
    { id: 2, invoiceNumber: 'INV-2025-019', customerName: 'Sekolah Harapan Bangsa', issueDate: '2025-09-05', totalAmount: 550000, status: 'Tertunda', source: 'Customer Order', items: [{ selectedItem: inventoryStore.inventoryItems[12], quantity: 10, unitPrice: 55000, total: 550000 }], dp: 200000, sisaTagihan: 350000 },
    
    // Data Bulan Lalu (Agustus 2025)
    { id: 3, invoiceNumber: 'INV-2025-018', customerName: 'Restoran Padang Sederhana', issueDate: '2025-08-25', totalAmount: 750000, status: 'Lunas', source: 'Customer Order', items: [{ selectedItem: inventoryStore.inventoryItems[1], quantity: 50, unitPrice: 15000, total: 750000 }], dp: 750000, sisaTagihan: 0 },
    { id: 4, invoiceNumber: 'INV-2025-017', customerName: 'Kafe Kopi Kenangan', issueDate: '2025-08-22', totalAmount: 1750000, status: 'Lunas', source: 'Social Media', items: [{ selectedItem: inventoryStore.inventoryItems[9], quantity: 50, unitPrice: 35000, total: 1750000 }], dp: 1750000, sisaTagihan: 0 },
    { id: 5, invoiceNumber: 'INV-2025-016', customerName: 'Universitas Andalas', issueDate: '2025-08-15', totalAmount: 900000, status: 'Lunas', source: 'Project', items: [{ selectedItem: inventoryStore.inventoryItems[3], quantity: 2, unitPrice: 450000, total: 900000 }], dp: 900000, sisaTagihan: 0 },
    { id: 6, invoiceNumber: 'INV-2025-015', customerName: 'Budi Santoso', issueDate: '2025-08-10', totalAmount: 425000, status: 'Lunas', source: 'Other', items: [{ selectedItem: inventoryStore.inventoryItems[10], quantity: 5, unitPrice: 85000, total: 425000 }], dp: 425000, sisaTagihan: 0 },

    // Data 2 Bulan Lalu (Juli 2025)
    { id: 7, invoiceNumber: 'INV-2025-014', customerName: 'Event Organizer Ceria', issueDate: '2025-07-30', totalAmount: 750000, status: 'Lunas', source: 'Project', items: [{ selectedItem: inventoryStore.inventoryItems[7], quantity: 3, unitPrice: 250000, total: 750000 }], dp: 750000, sisaTagihan: 0 },
    { id: 8, invoiceNumber: 'INV-2025-013', customerName: 'Toko ATK Pintar', issueDate: '2025-07-18', totalAmount: 220000, status: 'Lunas', source: 'Customer Order', items: [{ selectedItem: inventoryStore.inventoryItems[12], quantity: 4, unitPrice: 55000, total: 220000 }], dp: 220000, sisaTagihan: 0 },
    { id: 9, invoiceNumber: 'INV-2025-012', customerName: 'Citra Lestari', issueDate: '2025-07-11', totalAmount: 300000, status: 'Tertunda', source: 'Social Media', items: [{ selectedItem: inventoryStore.inventoryItems[6], quantity: 30, unitPrice: 10000, total: 300000 }], dp: 100000, sisaTagihan: 200000 },
    { id: 10, invoiceNumber: 'INV-2025-011', customerName: 'Percetakan Grafika', issueDate: '2025-07-05', totalAmount: 1125000, status: 'Lunas', source: 'Other', items: [{ selectedItem: inventoryStore.inventoryItems[0], quantity: 45, unitPrice: 25000, total: 1125000 }], dp: 1125000, sisaTagihan: 0 },

    // Data 3 Bulan Lalu (Juni 2025)
    { id: 11, invoiceNumber: 'INV-2025-010', customerName: 'Dinas Pariwisata', issueDate: '2025-06-28', totalAmount: 225000, status: 'Lunas', source: 'Project', items: [{ selectedItem: inventoryStore.inventoryItems[5], quantity: 5, unitPrice: 45000, total: 225000 }], dp: 225000, sisaTagihan: 0 },
    { id: 12, invoiceNumber: 'INV-2025-009', customerName: 'Komunitas Fotografi', issueDate: '2025-06-15', totalAmount: 500000, status: 'Lunas', source: 'Social Media', items: [{ selectedItem: inventoryStore.inventoryItems[8], quantity: 100, unitPrice: 5000, total: 500000 }], dp: 500000, sisaTagihan: 0 },

    // Data 4 Bulan Lalu (Mei 2025)
    { id: 13, invoiceNumber: 'INV-2025-008', customerName: 'PT. Sukses Selalu', issueDate: '2025-05-20', totalAmount: 1000000, status: 'Lunas', source: 'Customer Order', items: [{ selectedItem: inventoryStore.inventoryItems[2], quantity: 20, unitPrice: 50000, total: 1000000 }], dp: 1000000, sisaTagihan: 0 },
    { id: 14, invoiceNumber: 'INV-2025-007', customerName: 'Warung Makan Sehat', issueDate: '2025-05-12', totalAmount: 150000, status: 'Lunas', source: 'Social Media', items: [{ selectedItem: inventoryStore.inventoryItems[14], quantity: 20, unitPrice: 7500, total: 150000 }], dp: 150000, sisaTagihan: 0 },

    // Data 5 Bulan Lalu (April 2025)
    { id: 15, invoiceNumber: 'INV-2025-006', customerName: 'Amaik Syahroni', issueDate: '2025-04-25', totalAmount: 500000, status: 'Lunas', source: 'Other', items: [{ selectedItem: inventoryStore.inventoryItems[11], quantity: 2, unitPrice: 150000, total: 300000 }, { selectedItem: inventoryStore.inventoryItems[13], quantity: 20, unitPrice: 10000, total: 200000 }], dp: 500000, sisaTagihan: 0 },
    { id: 16, invoiceNumber: 'INV-2025-005', customerName: 'Toko Roti Enak', issueDate: '2025-04-18', totalAmount: 450000, status: 'Lunas', source: 'Customer Order', items: [{ selectedItem: inventoryStore.inventoryItems[1], quantity: 30, unitPrice: 15000, total: 450000 }], dp: 450000, sisaTagihan: 0 },
    { id: 17, invoiceNumber: 'INV-2025-004', customerName: 'Kafe Kopi Kenangan', issueDate: '2025-04-10', totalAmount: 625000, status: 'Lunas', source: 'Social Media', items: [{ selectedItem: inventoryStore.inventoryItems[0], quantity: 25, unitPrice: 25000, total: 625000 }], dp: 625000, sisaTagihan: 0 },

    // Data 6 Bulan Lalu (Maret 2025)
    { id: 18, invoiceNumber: 'INV-2025-003', customerName: 'Bimbingan Belajar Cerdas', issueDate: '2025-03-22', totalAmount: 1350000, status: 'Lunas', source: 'Customer Order', items: [{ selectedItem: inventoryStore.inventoryItems[3], quantity: 3, unitPrice: 450000, total: 1350000 }], dp: 1350000, sisaTagihan: 0 },
    { id: 19, invoiceNumber: 'INV-2025-002', customerName: 'Pemerintah Kota Padang', issueDate: '2025-03-14', totalAmount: 2400000, status: 'Lunas', source: 'Project', items: [{ selectedItem: inventoryStore.inventoryItems[4], quantity: 20, unitPrice: 120000, total: 2400000 }], dp: 2400000, sisaTagihan: 0 },
    { id: 20, invoiceNumber: 'INV-2025-001', customerName: 'CV. Maju Jaya', issueDate: '2025-03-05', totalAmount: 350000, status: 'Lunas', source: 'Project', items: [{ selectedItem: inventoryStore.inventoryItems[9], quantity: 10, unitPrice: 35000, total: 350000 }], dp: 350000, sisaTagihan: 0 },
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

  function markInvoiceAsPaid(invoiceId) {
    const invoice = invoices.value.find(inv => inv.id === invoiceId);
    if (invoice) {
      invoice.status = 'Lunas';
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
    markInvoiceAsPaid
  };
});

