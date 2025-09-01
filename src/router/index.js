// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import InventoryView from '../views/InventoryView.vue';
import InvoiceView from '../views/InvoiceView.vue';
import ReportView from '../views/ReportView.vue';
import UserManagementView from '../views/UserManagementView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryView,
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: InvoiceView,
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportView,
  },
  {
    path: '/users',
    name: 'Users',
    component: UserManagementView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;