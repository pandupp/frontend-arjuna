import { defineStore } from "pinia";
import { ref, computed } from "vue";
// Impor service untuk digunakan saat mode non-dummy
import { inventoryService } from "../services/inventoryService";

// Data dummy kita pindahkan ke sini, di luar defineStore agar bersih
const DUMMY_INVENTORY_DATA = [
  {
    id: 1,
    code: "ITM-001",
    name: "Spanduk Flexi 280gr",
    price: 25000,
    stock: 150,
    unit: "meter",
    lowStockThreshold: 50,
  },
  {
    id: 2,
    code: "ITM-002",
    name: "Stiker Vinyl A3+",
    price: 15000,
    stock: 8,
    unit: "pcs",
    lowStockThreshold: 20,
  },
  {
    id: 3,
    code: "ITM-003",
    name: "Kartu Nama (box)",
    price: 50000,
    stock: 50,
    unit: "box",
    lowStockThreshold: 10,
  },
  {
    id: 4,
    code: "ITM-004",
    name: "Brosur A5 Art Paper (rim)",
    price: 450000,
    stock: 3,
    unit: "rim",
    lowStockThreshold: 5,
  },
  {
    id: 5,
    code: "ITM-005",
    name: "Banner X-Stand 60x160",
    price: 120000,
    stock: 25,
    unit: "pcs",
    lowStockThreshold: 10,
  },
  // ...dan seterusnya
];

export const useInventoryStore = defineStore("inventory", () => {
  // --- STATE ---
  const inventoryItems = ref([]);
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    has_more_pages: false,
  });

  // --- GETTERS ---
  const lowStockItems = computed(() => {
    // Pastikan inventoryItems.value adalah array sebelum menggunakan filter
    if (!Array.isArray(inventoryItems.value)) {
      return [];
    }
    return inventoryItems.value.filter(
      (item) => item.stock <= item.lowStockThreshold,
    );
  });
  const nextItemCode = computed(() => {
    // Pastikan inventoryItems.value adalah array sebelum menggunakannya
    if (
      !Array.isArray(inventoryItems.value) ||
      inventoryItems.value.length === 0
    ) {
      return "ITM-001";
    }
    const lastId = Math.max(...inventoryItems.value.map((item) => item.id));
    return `ITM-${String(lastId + 1).padStart(3, "0")}`;
  });

  // --- ACTIONS ---

  // ## INI ADALAH ACTION UTAMA DENGAN "SAKLAR" CERDAS ##
  async function fetchAllItems(page = 1, perPage = 10) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      // Simulate pagination for dummy data
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = DUMMY_INVENTORY_DATA.slice(startIndex, endIndex);

      inventoryItems.value = paginatedData;
      pagination.value = {
        current_page: page,
        per_page: perPage,
        total: DUMMY_INVENTORY_DATA.length,
        last_page: Math.ceil(DUMMY_INVENTORY_DATA.length / perPage),
        from: startIndex + 1,
        to: Math.min(endIndex, DUMMY_INVENTORY_DATA.length),
        has_more_pages: endIndex < DUMMY_INVENTORY_DATA.length,
      };
      return; // Selesai
    }

    try {
      const response = await inventoryService.getAll(page, perPage);
      // Pastikan response memiliki struktur yang benar
      if (response && response.data && Array.isArray(response.data)) {
        inventoryItems.value = response.data;
        pagination.value = response.pagination || {
          current_page: 1,
          per_page: perPage,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0,
          has_more_pages: false,
        };
      } else {
        inventoryItems.value = [];
        pagination.value = {
          current_page: 1,
          per_page: perPage,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0,
          has_more_pages: false,
        };
      }
    } catch (error) {
      // Jika gagal, bisa diisi data kosong sebagai fallback
      inventoryItems.value = [];
      pagination.value = {
        current_page: 1,
        per_page: perPage,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
        has_more_pages: false,
      };
    }
  }

  // Fungsi-fungsi lain tetap memanipulasi state secara langsung (Optimistic UI)
  function addNewItem(item) {
    inventoryItems.value.unshift(item);
  }
  function updateItem(updatedItem) {
    const index = inventoryItems.value.findIndex(
      (item) => item.id === updatedItem.id,
    );
    if (index !== -1) {
      inventoryItems.value[index] = updatedItem;
    }
  }
  function deleteItem(itemId) {
    inventoryItems.value = inventoryItems.value.filter(
      (item) => item.id !== itemId,
    );
  }

  // (fungsi reduceStockFromInvoice tidak berubah)
  function reduceStockFromInvoice(invoice) {
    // ...
  }

  return {
    inventoryItems,
    pagination,
    nextItemCode,
    lowStockItems,
    fetchAllItems, // <-- Ganti setItems dengan ini
    addNewItem,
    updateItem,
    deleteItem,
    reduceStockFromInvoice,
  };
});
