import axios from "axios";

// Konfigurasi koneksi ke backend.
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
  (error) => Promise.reject(error),
);

// Kumpulan fungsi yang berbicara dengan endpoint backend terkait user.
export const userService = {
  /**
   * Mengambil semua data pengguna dari backend.
   * @param {string} endpoint - Endpoint custom, default '/users'
   */
  async getAll(endpoint = "/user") {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      // TODO: Tambahkan notifikasi error untuk pengguna jika diperlukan
      throw error; // Lemparkan error agar bisa ditangani oleh store.
    }
  },

  /**
   * Membuat pengguna baru di backend.
   * @param {object} newUserData - Data pengguna baru.
   */
  async create(newUserData) {
    try {
      const response = await apiClient.post("/user", newUserData);
      return response.data;
    } catch (error) {
      // TODO: Tambahkan notifikasi error untuk pengguna jika diperlukan
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
      const response = await apiClient.put(`/user/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(
        `SERVICE ERROR: Gagal mengupdate pengguna ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Menghapus pengguna dari backend.
   * @param {string|number} id - ID pengguna.
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error(`SERVICE ERROR: Gagal menghapus pengguna ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Melakukan login user ke backend.
   * @param {object} loginData - Data login berisi email dan password.
   * @returns {Promise<object>} - Response dari backend berisi token dan data user.
   */
  async login(loginData) {
    try {
      const response = await apiClient.post("/login", loginData);
      return response.data;
    } catch (error) {
      console.error("SERVICE ERROR: Gagal login:", error);
      throw error;
    }
  },
};
