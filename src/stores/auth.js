import { defineStore } from "pinia";
import { ref } from "vue";
import { userService } from "../services/userService"; // Impor service

// Data dummy untuk mode demo
const DUMMY_USER_DATA = [
  {
    id: 1,
    name: "Amaik Syahroni",
    email: "admin@arjuna.com",
    password: "password123",
    role: "Admin",
    status: "Aktif",
    joinDate: "2025-01-15",
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "budi@arjuna.com",
    password: "password456",
    role: "Staf",
    status: "Aktif",
    joinDate: "2025-02-20",
  },
  {
    id: 3,
    name: "Citra Lestari",
    email: "citra@arjuna.com",
    password: "password789",
    role: "Staf",
    status: "Tidak Aktif",
    joinDate: "2025-03-10",
  },
];

// Menggunakan sintaks Composition API agar konsisten dengan store lain
export const useAuthStore = defineStore("auth", () => {
  // --- STATE ---
  const users = ref([]);
  // Inisialisasi awal sebagai false, akan diisi oleh checkLoginStatus
  const isLoggedIn = ref(false);
  const userRole = ref(null);

  // --- ACTIONS ---

  // ## Action utama dengan "saklar cerdas" ##
  async function fetchAllUsers() {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const allUsers = [...DUMMY_USER_DATA];
      users.value = allUsers.filter((u) => u.role !== "Admin"); // Tampilkan semua kecuali admin utama
      return;
    }

    try {
      // Production: log removed
      // Gunakan endpoint /user sesuai permintaan
      const response = await userService.getAll("/user");
      if (
        response &&
        response.status === "success" &&
        Array.isArray(response.data)
      ) {
        users.value = response.data;
      } else {
        users.value = [];
      }
    } catch (error) {
      users.value = [];
      throw error;
    }
  }

  async function addUser(newUserData) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const nextId = users.value.length
        ? Math.max(
            ...DUMMY_USER_DATA.map((u) => u.id),
            ...users.value.map((u) => u.id),
          ) + 1
        : 1;
      const userToSave = {
        id: nextId,
        ...newUserData,
        status: "Aktif",
        joinDate: new Date().toISOString().slice(0, 10),
      };
      users.value.unshift(userToSave);
      DUMMY_USER_DATA.push(userToSave);
      return userToSave;
    }
    // Pastikan field role dikirim ke backend
    const payload = {
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password,
      role: newUserData.role,
    };
    const createdUserResponse = await userService.create(payload);
    // Jika backend mengembalikan format {status, data, message}
    if (
      createdUserResponse &&
      createdUserResponse.status === "success" &&
      createdUserResponse.data
    ) {
      users.value.unshift(createdUserResponse.data);
      return createdUserResponse.data;
    } else {
      // fallback jika format tidak sesuai
      users.value.unshift(createdUserResponse);
      return createdUserResponse;
    }
  }

  async function deleteUser(userId) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      users.value = users.value.filter((user) => user.id !== userId);
      return;
    }
    await userService.delete(userId);
    users.value = users.value.filter((user) => user.id !== userId);
  }

  async function login(email, password) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const user = DUMMY_USER_DATA.find(
        (u) =>
          u.email === email && u.password === password && u.status === "Aktif",
      );
      if (user) {
        isLoggedIn.value = true;
        userRole.value = user.role;
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", user.role);
        return {
          success: true,
          message: "Login successful",
          data: { user, roles: [user.role], token: "dummy-token" },
        };
      }
      isLoggedIn.value = false;
      userRole.value = null;
      return {
        success: false,
        message: "Email atau password salah, atau akun tidak aktif.",
      };
    }

    // Mode produksi: login ke backend
    try {
      const loginData = { email, password };
      const response = await userService.login(loginData);

      if (response.success && response.data && response.data.token) {
        isLoggedIn.value = true;
        userRole.value =
          response.data.roles && response.data.roles.length > 0
            ? response.data.roles[0]
            : null;
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", userRole.value);
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        return response;
      } else {
        isLoggedIn.value = false;
        userRole.value = null;
        return { success: false, message: response.message || "Login gagal." };
      }
    } catch (error) {
      isLoggedIn.value = false;
      userRole.value = null;
      return {
        success: false,
        message:
          error?.response?.data?.message || "Terjadi kesalahan saat login.",
      };
    }
  }

  function logout() {
    isLoggedIn.value = false;
    userRole.value = null;
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
  }

  // ## PERBAIKAN: Tambahkan kembali fungsi ini untuk kompatibilitas ##
  function checkLoginStatus() {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    const storedRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("authToken");
    if (loggedInStatus === "true" && storedRole && token) {
      isLoggedIn.value = true;
      userRole.value = storedRole;
    }
  }

  return {
    users,
    isLoggedIn,
    userRole,
    fetchAllUsers,
    addUser,
    deleteUser,
    login,
    logout,
    checkLoginStatus, // <-- Pastikan fungsi diekspor
  };
});
