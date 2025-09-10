import { createRouter, createWebHistory } from 'vue-router';
// 1. Impor store autentikasi kita
import { useAuthStore } from '../stores/auth';

// Impor komponen-komponen halaman Anda
import DefaultLayout from '../layouts/DefaultLayout.vue';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import InventoryView from '../views/InventoryView.vue';
import InvoiceView from '../views/InvoiceView.vue';
import ReportView from '../views/ReportView.vue';
// ## PERBAIKAN: Ganti nama file agar sesuai dengan proyek Anda ##
import UserManagementView from '../views/UserManagementView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/dashboard',
    // 2. Beri penanda pada semua halaman yang butuh login
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: DashboardView },
      { path: 'inventory', name: 'Inventory', component: InventoryView },
      { path: 'invoices', name: 'Invoices', component: InvoiceView },
      { path: 'reports', name: 'Reports', component: ReportView },
      // Contoh: halaman user hanya bisa diakses oleh Admin
      // ## PERBAIKAN: Gunakan komponen yang benar ##
      { path: 'users', name: 'Users', component: UserManagementView, meta: { requiresAdmin: true } }, 
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 3. Inilah "Satpam" atau Route Guard kita yang sudah disempurnakan
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  const isLoggedIn = authStore.isLoggedIn;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // ## LOGIKA TAMBAHAN ##
  // Jika pengguna sudah login dan mencoba mengakses halaman Login
  if (to.name === 'Login' && isLoggedIn) {
    // Lemparkan mereka kembali ke dashboard untuk mencegah kebingungan
    next({ name: 'Dashboard' });
  }
  // Jika rute tujuan butuh login DAN pengguna belum login
  else if (requiresAuth && !isLoggedIn) {
    // Lemparkan pengguna ke halaman login
    next({ name: 'Login' });
  } 
  // Jika rute tujuan butuh role Admin DAN pengguna bukan Admin
  else if (requiresAdmin && authStore.userRole !== 'Admin') {
    // Tampilkan pesan dan lemparkan ke halaman yang aman (misal: Dashboard)
    // Di aplikasi nyata, gunakan komponen notifikasi yang lebih baik daripada alert.
    alert('Anda tidak memiliki hak akses ke halaman ini.');
    next({ name: 'Dashboard' });
  }
  // Jika semua syarat terpenuhi
  else {
    // Izinkan pengguna melanjutkan
    next();
  }
});

export default router;

