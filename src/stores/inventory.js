import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useInventoryStore = defineStore('inventory', () => {
  // --- STATE ---
  const inventoryItems = ref([
    // ## PERUBAHAN 1: Tambahkan properti 'lowStockThreshold' pada setiap item ##
    { id: 1, code: 'ITM-001', name: 'Spanduk Flexi 280gr', price: 25000, stock: 150, unit: 'meter', lowStockThreshold: 20 },
    { id: 2, code: 'ITM-002', name: 'Stiker Vinyl A3+', price: 15000, stock: 8, unit: 'pcs', lowStockThreshold: 10 },
    { id: 3, code: 'ITM-003', name: 'Kartu Nama (box)', price: 50000, stock: 50, unit: 'box', lowStockThreshold: 5 },
    { id: 4, code: 'ITM-004', name: 'Brosur A5 (rim)', price: 450000, stock: 3, unit: 'rim', lowStockThreshold: 5 },
  ]);

  // --- GETTERS ---
  // ## PERUBAHAN 2: Buat getter baru untuk memfilter item dengan stok rendah ##
  const lowStockItems = computed(() => 
    inventoryItems.value.filter(item => item.stock <= item.lowStockThreshold)
  );

  const nextItemCode = computed(() => {
    if (inventoryItems.value.length === 0) return 'ITM-001';
    const lastId = Math.max(...inventoryItems.value.map(item => item.id));
    return `ITM-${String(lastId + 1).padStart(3, '0')}`;
  });

  // --- ACTIONS ---
  // (Fungsi-fungsi di bawah ini tidak diubah, hanya dirapikan)
  function addItem(itemData) {
    const nextId = inventoryItems.value.length ? Math.max(...inventoryItems.value.map(item => item.id)) + 1 : 1;
    const newItem = {
      id: nextId,
      ...itemData,
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
    lowStockItems, // <-- 3. Expose getter baru agar bisa diakses
    addItem,
    updateItem,
    deleteItem,
    reduceStockFromInvoice
  };
});

