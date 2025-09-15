// src/services/inventoryService.js

import axios from "axios";

// Konfigurasi instance axios yang sama dengan service lain
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan Bearer token ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Kumpulan fungsi untuk berinteraksi dengan endpoint inventory
export const inventoryService = {
  /**
   * Mengambil semua item inventaris dari backend.
   */
  async getAll() {
    try {
      // Production: log removed
      const response = await apiClient.get("/inventory");
      // API mengembalikan { status, data: [...], message }
      // Kita perlu mengambil array dari response.data.data dan transform ke format yang diharapkan
      const inventoryData = response.data.data || [];
      return inventoryData.map((item) => ({
        id: item.id,
        code: item.kode_inventory,
        name: item.product_name,
        price: 0, // Default karena API tidak menyediakan
        stock: parseFloat(item.stock) || 0,
        unit: item.unit,
        lowStockThreshold: 10, // Default karena API tidak menyediakan
        type: item.type,
        quality: item.quality,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      // TODO: handle error (production: log removed)
      return []; // Kembalikan array kosong jika gagal
    }
  },

  /**
   * Membuat item inventaris baru di backend.
   * @param {object} itemData - Data item baru yang akan dikirim.
   */
  async create(itemData) {
    try {
      // Production: log removed
      // Transform data dari format aplikasi ke format API
      const apiData = {
        kode_inventory: itemData.code,
        product_name: itemData.name,
        type: itemData.type || "General",
        quality: itemData.quality || "Standard",
        unit: itemData.unit,
        stock: itemData.stock.toString(),
      };
      const response = await apiClient.post("/inventory", apiData);

      // Transform response kembali ke format aplikasi
      if (response.data.status === "success" && response.data.data) {
        const item = response.data.data;
        return {
          id: item.id,
          code: item.kode_inventory,
          name: item.product_name,
          price: itemData.price || 0,
          stock: parseFloat(item.stock) || 0,
          unit: item.unit,
          lowStockThreshold: itemData.lowStockThreshold || 10,
          type: item.type,
          quality: item.quality,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      }
      return response.data;
    } catch (error) {
      // TODO: handle error (production: log removed)
      throw error; // Lemparkan error agar bisa ditangani oleh komponen
    }
  },

  /**
   * Memperbarui item inventaris yang ada di backend.
   * @param {number|string} id - ID dari item yang akan diperbarui.
   * @param {object} itemData - Data baru untuk item tersebut.
   */
  async update(id, itemData) {
    try {
      // Production: log removed
      // Transform data dari format aplikasi ke format API
      const apiData = {
        kode_inventory: itemData.code,
        product_name: itemData.name,
        type: itemData.type || "General",
        quality: itemData.quality || "Standard",
        unit: itemData.unit,
        stock: itemData.stock.toString(),
      };
      const response = await apiClient.put(`/inventory/${id}`, apiData);

      // Transform response kembali ke format aplikasi
      if (response.data.status === "success" && response.data.data) {
        const item = response.data.data;
        return {
          id: item.id,
          code: item.kode_inventory,
          name: item.product_name,
          price: itemData.price || 0,
          stock: parseFloat(item.stock) || 0,
          unit: item.unit,
          lowStockThreshold: itemData.lowStockThreshold || 10,
          type: item.type,
          quality: item.quality,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      }
      return response.data;
    } catch (error) {
      // TODO: handle error (production: log removed)
      throw error;
    }
  },

  /**
   * Menghapus item inventaris dari backend.
   * @param {number|string} id - ID dari item yang akan dihapus.
   */
  async delete(id) {
    try {
      // Production: log removed
      const response = await apiClient.delete(`/inventory/${id}`);
      // Return response untuk konsistensi, biasanya delete hanya return status
      return response.data;
    } catch (error) {
      // TODO: handle error (production: log removed)
      throw error;
    }
  },
};
