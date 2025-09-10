import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useInventoryStore = defineStore('inventory', () => {
  // --- STATE ---
  const inventoryItems = ref([
    // Data Dummy Diperbanyak
    { id: 1, code: 'ITM-001', name: 'Spanduk Flexi 280gr', price: 25000, stock: 150, unit: 'meter', lowStockThreshold: 50 },
    { id: 2, code: 'ITM-002', name: 'Stiker Vinyl A3+', price: 15000, stock: 8, unit: 'pcs', lowStockThreshold: 20 },
    { id: 3, code: 'ITM-003', name: 'Kartu Nama (box)', price: 50000, stock: 50, unit: 'box', lowStockThreshold: 10 },
    { id: 4, code: 'ITM-004', name: 'Brosur A5 Art Paper (rim)', price: 450000, stock: 3, unit: 'rim', lowStockThreshold: 5 },
    { id: 5, code: 'ITM-005', name: 'Banner X-Stand 60x160', price: 120000, stock: 25, unit: 'pcs', lowStockThreshold: 10 },
    { id: 6, code: 'ITM-006', name: 'Spanduk Albatros', price: 45000, stock: 80, unit: 'meter', lowStockThreshold: 30 },
    { id: 7, code: 'ITM-007', name: 'Stiker Chromo A3+', price: 10000, stock: 500, unit: 'pcs', lowStockThreshold: 100 },
    { id: 8, code: 'ITM-008', name: 'Roll Banner 85x200', price: 250000, stock: 15, unit: 'pcs', lowStockThreshold: 5 },
    { id: 9, code: 'ITM-009', name: 'Cetak Foto 10R', price: 5000, stock: 1000, unit: 'pcs', lowStockThreshold: 200 },
    { id: 10, code: 'ITM-010', name: 'Mug Putih Polos', price: 35000, stock: 48, unit: 'pcs', lowStockThreshold: 12 },
    { id: 11, code: 'ITM-011', name: 'Kaos Cotton Combed 30s', price: 85000, stock: 75, unit: 'pcs', lowStockThreshold: 20 },
    { id: 12, code: 'ITM-012', name: 'Tinta Printer Epson (botol)', price: 150000, stock: 30, unit: 'botol', lowStockThreshold: 10 },
    { id: 13, code: 'ITM-013', name: 'Kertas A4 80gr (rim)', price: 55000, stock: 9, unit: 'rim', lowStockThreshold: 10 },
    { id: 14, code: 'ITM-014', name: 'ID Card PVC', price: 10000, stock: 250, unit: 'pcs', lowStockThreshold: 50 },
    { id: 15, code: 'ITM-015', name: 'Gantungan Kunci Akrilik', price: 7500, stock: 300, unit: 'pcs', lowStockThreshold: 100 },
  ]);

  // --- GETTERS ---
  const lowStockItems = computed(() => 
    inventoryItems.value.filter(item => item.stock <= item.lowStockThreshold)
  );

  const nextItemCode = computed(() => {
    if (inventoryItems.value.length === 0) return 'ITM-001';
    const lastId = Math.max(...inventoryItems.value.map(item => item.id));
    return `ITM-${String(lastId + 1).padStart(3, '0')}`;
  });

  // --- ACTIONS ---
  function addItem(itemData) {
    const nextId = inventoryItems.value.length ? Math.max(...inventoryItems.value.map(item => item.id)) + 1 : 1;
    const newItem = {
      id: nextId,
      ...itemData,
      lowStockThreshold: 10 // Default threshold for new items
    };
    inventoryItems.value.unshift(newItem);
  }

  function updateItem(updatedItem) {
    const index = inventoryItems.value.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      inventoryItems.value[index] = updatedItem;
    }
  }

  function deleteItem(itemId) {
    inventoryItems.value = inventoryItems.value.filter(item => item.id !== itemId);
  }

  function reduceStockFromInvoice(invoice) {
    invoice.items.forEach(itemFaktur => {
      if (itemFaktur.selectedItem && itemFaktur.selectedItem.id) {
        const itemDiInventori = inventoryItems.value.find(
          invItem => invItem.id === itemFaktur.selectedItem.id
        );
        if (itemDiInventori) {
          itemDiInventori.stock -= itemFaktur.quantity;
        }
      }
    });
  }

  return { 
    inventoryItems, 
    nextItemCode,
    lowStockItems,
    addItem,
    updateItem,
    deleteItem,
    reduceStockFromInvoice
  };
});

