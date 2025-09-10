// src/services/inventoryService.js

import axios from 'axios';

// Konfigurasi instance axios yang sama dengan service lain
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Kumpulan fungsi untuk berinteraksi dengan endpoint inventory
export const inventoryService = {

  /**
   * Mengambil semua item inventaris dari backend.
   */
  async getAll() {
    try {
      console.log("SERVICE: Menghubungi backend untuk mengambil data inventory...");
      const response = await apiClient.get('/inventory');
      return response.data;
    } catch (error) {
      console.error("SERVICE ERROR: Gagal mengambil data inventory:", error);
      return []; // Kembalikan array kosong jika gagal
    }
  },

  /**
   * Membuat item inventaris baru di backend.
   * @param {object} itemData - Data item baru yang akan dikirim.
   */
  async create(itemData) {
    try {
      console.log("SERVICE: Mengirim data item baru ke backend...", itemData);
      const response = await apiClient.post('/inventory', itemData);
      return response.data;
    } catch (error) {
      console.error("SERVICE ERROR: Gagal membuat item baru:", error);
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
      console.log(`SERVICE: Mengupdate data item ID ${id}...`, itemData);
      const response = await apiClient.put(`/inventory/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error(`SERVICE ERROR: Gagal mengupdate item ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Menghapus item inventaris dari backend.
   * @param {number|string} id - ID dari item yang akan dihapus.
   */
  async delete(id) {
    try {
      console.log(`SERVICE: Menghapus item ID ${id}...`);
      const response = await apiClient.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`SERVICE ERROR: Gagal menghapus item ID ${id}:`, error);
      throw error;
    }
  }
};