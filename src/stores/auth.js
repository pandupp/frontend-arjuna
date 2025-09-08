import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    userRole: null,
    users: [
      { id: 1, name: 'Amaik Syahroni', email: 'admin@arjuna.com', password: 'password123', role: 'Admin', status: 'Aktif', joinDate: '2025-01-15' },
      { id: 2, name: 'Budi Santoso', email: 'budi@arjuna.com', password: 'password456', role: 'Staf', status: 'Aktif', joinDate: '2025-02-20' },
      { id: 3, name: 'Citra Lestari', email: 'citra@arjuna.com', password: 'password789', role: 'Staf', status: 'Tidak Aktif', joinDate: '2025-03-10' },
    ],
  }),

  getters: {
    isAdmin: (state) => state.userRole === 'Admin',
  },

  actions: {
    // ## TAMBAHKAN ACTION INI ##
    // Fungsi untuk menambah user baru ke dalam state
    addUser(userData) {
      this.users.push(userData);
    },

    // ## TAMBAHKAN JUGA ACTION INI UNTUK TOMBOL HAPUS ##
    deleteUser(userId) {
      this.users = this.users.filter(user => user.id !== userId);
    },

    // --- Sisa actions (login, logout, dll) tidak berubah ---
    login(email, password) {
      const user = this.users.find(
        u => u.email === email && u.password === password && u.status === 'Aktif'
      );
      if (user) {
        this.isLoggedIn = true;
        this.userRole = user.role;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', user.role);
        return true;
      }
      this.isLoggedIn = false;
      this.userRole = null;
      return false;
    },
    logout() {
      this.isLoggedIn = false;
      this.userRole = null;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
    },
    checkLoginStatus() {
      const loggedInStatus = localStorage.getItem('isLoggedIn');
      const storedRole = localStorage.getItem('userRole');
      if (loggedInStatus === 'true' && storedRole) {
        this.isLoggedIn = true;
        this.userRole = storedRole;
      }
    },
  },
});

