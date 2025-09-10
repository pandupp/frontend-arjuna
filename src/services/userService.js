import axios from 'axios';

// Konfigurasi koneksi ke backend.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Kumpulan fungsi yang HANYA berbicara dengan endpoint backend '/users'.
export const userService = {

  /**
   * Mengambil semua data pengguna dari backend.
   */
  async getAll() {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error("SERVICE ERROR: Gagal mengambil data pengguna:", error);
      throw error; // Lemparkan error agar bisa ditangani oleh store.
    }
  },
  
  /**
   * Membuat pengguna baru di backend.
   * @param {object} newUserData - Data pengguna baru.
   */
  async create(newUserData) {
    try {
      const response = await apiClient.post('/users', newUserData);
      return response.data;
    } catch (error) {
      console.error("SERVICE ERROR: Gagal membuat pengguna baru:", error);
      throw error;
    }
  },

  /**
   * Memperbarui data pengguna di backend.
   * @param {string|number} id - ID pengguna.
   * @param {object} updatedData - Data yang akan diupdate.
   */
  async update(id, updatedData) {
    try {
      const response = await apiClient.put(`/users/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`SERVICE ERROR: Gagal mengupdate pengguna ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Menghapus pengguna dari backend.
   * @param {string|number} id - ID pengguna.
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`SERVICE ERROR: Gagal menghapus pengguna ID ${id}:`, error);
      throw error;
    }
  }
};
