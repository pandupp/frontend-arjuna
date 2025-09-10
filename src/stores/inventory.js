import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// Impor service untuk digunakan saat mode non-dummy
import { inventoryService } from '../services/inventoryService';

// Data dummy kita pindahkan ke sini, di luar defineStore agar bersih
const DUMMY_INVENTORY_DATA = [
  { id: 1, code: 'ITM-001', name: 'Spanduk Flexi 280gr', price: 25000, stock: 150, unit: 'meter', lowStockThreshold: 50 },
  { id: 2, code: 'ITM-002', name: 'Stiker Vinyl A3+', price: 15000, stock: 8, unit: 'pcs', lowStockThreshold: 20 },
  { id: 3, code: 'ITM-003', name: 'Kartu Nama (box)', price: 50000, stock: 50, unit: 'box', lowStockThreshold: 10 },
  { id: 4, code: 'ITM-004', name: 'Brosur A5 Art Paper (rim)', price: 450000, stock: 3, unit: 'rim', lowStockThreshold: 5 },
  { id: 5, code: 'ITM-005', name: 'Banner X-Stand 60x160', price: 120000, stock: 25, unit: 'pcs', lowStockThreshold: 10 },
  // ...dan seterusnya
];

export const useInventoryStore = defineStore('inventory', () => {
  // --- STATE ---
  const inventoryItems = ref([]);

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

  // ## INI ADALAH ACTION UTAMA DENGAN "SAKLAR" CERDAS ##
  async function fetchAllItems() {
    if (import.meta.env.VITE_MOCK_API === 'true') {
      console.log("MODE DEMO: Menggunakan data dummy dari store.");
      inventoryItems.value = DUMMY_INVENTORY_DATA;
      return; // Selesai
    }
    
    try {
      console.log("MODE PRODUKSI: Menghubungi service untuk data inventory...");
      const itemsFromApi = await inventoryService.getAll();
      inventoryItems.value = itemsFromApi;
    } catch (error) {
      console.error("Gagal mengambil data dari service:", error);
      // Jika gagal, bisa diisi data kosong atau dummy sebagai fallback
      inventoryItems.value = []; 
    }
  }
  
  // Fungsi-fungsi lain tetap memanipulasi state secara langsung (Optimistic UI)
  function addNewItem(item) {
    inventoryItems.value.unshift(item);
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

  // (fungsi reduceStockFromInvoice tidak berubah)
  function reduceStockFromInvoice(invoice) {
    // ...
  }

  return { 
    inventoryItems, 
    nextItemCode,
    lowStockItems,
    fetchAllItems, // <-- Ganti setItems dengan ini
    addNewItem,
    updateItem,
    deleteItem,
    reduceStockFromInvoice,
  };
});

