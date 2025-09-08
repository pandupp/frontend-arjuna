import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth'; 

// ## PERUBAHAN 1: Impor komponen Layout ##
import DefaultLayout from '../layouts/DefaultLayout.vue';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import InventoryView from '../views/InventoryView.vue';
import InvoiceView from '../views/InvoiceView.vue';
import ReportView from '../views/ReportView.vue';
import UserManagementView from '../views/UserManagementView.vue';

const routes = [
  // Rute untuk login berada di luar layout utama
  {
    path: '/login', 
    name: 'Login',
    component: LoginView,
  },
  // ## PERUBAHAN 2: Buat satu rute utama yang menggunakan DefaultLayout ##
  {
    path: '/',
    component: DefaultLayout, // Komponen ini akan menjadi "pembungkus"
    redirect: '/dashboard', // Jika akses '/', langsung ke dashboard
    children: [ // Semua halaman di bawah ini akan ditampilkan DI DALAM DefaultLayout
      {
        path: '/dashboard', 
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, role: 'Admin' } 
      },
      { 
        path: '/inventory',
        name: 'Inventory',
        component: InventoryView,
        meta: { requiresAuth: true } 
      },
      {
        path: '/invoices',
        name: 'Invoices',
        component: InvoiceView,
        meta: { requiresAuth: true } 
      },
      {
        path: '/reports',
        name: 'Reports',
        component: ReportView,
        meta: { requiresAuth: true, role: 'Admin' }
      },
      {
        path: '/users',
        name: 'Users',
        component: UserManagementView,
        meta: { requiresAuth: true, role: 'Admin'} 
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard tidak perlu diubah, sudah benar
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  const userIsLoggedIn = authStore.isLoggedIn;
  const currentUserRole = authStore.userRole;
  const requiredRole = to.meta.role;
  
  if (to.meta.requiresAuth && !userIsLoggedIn) {
    next({ name: 'Login' });
  } 
  else if (to.name === 'Login' && userIsLoggedIn) {
    next({ path: '/dashboard' });
  }
  else if (requiredRole && requiredRole !== currentUserRole) {
    alert('Anda tidak memiliki hak akses untuk halaman ini.');
    next({ path: from.path || '/inventory' }); // Kembali atau ke halaman default
  }
  else {
    next();
  }
});

export default router;

