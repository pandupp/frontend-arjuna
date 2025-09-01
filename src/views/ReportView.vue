<script setup>
import { ref, computed } from 'vue';
import { invoices } from '../store.js'; // <-- Mengambil data dari store terpusat
import BarChart from '../components/charts/BarChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';

const selectedPeriod = ref('thisMonth');

// --- Logika Filter Tanggal ---
const filteredInvoices = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (selectedPeriod.value === 'thisMonth') {
        return invoices.value.filter(inv => {
            const invDate = new Date(inv.issueDate);
            return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
        });
    }
    
    if (selectedPeriod.value === 'lastMonth') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const yearOfLastMonth = currentMonth === 0 ? currentYear - 1 : currentYear;
        return invoices.value.filter(inv => {
            const invDate = new Date(inv.issueDate);
            return invDate.getMonth() === lastMonth && invDate.getFullYear() === yearOfLastMonth;
        });
    }

    if (selectedPeriod.value === 'thisYear') {
        return invoices.value.filter(inv => {
            const invDate = new Date(inv.issueDate);
            return invDate.getFullYear() === currentYear;
        });
    }

    return invoices.value;
});

// --- STATISTIK (Menggunakan data yang sudah difilter) ---
const totalPendapatan = computed(() =>
    filteredInvoices.value
        .filter(inv => inv.status === 'Lunas')
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
);

const totalPiutang = computed(() =>
    filteredInvoices.value
        .filter(inv => inv.status === 'Tertunda')
        .reduce((sum, inv) => sum + (inv.totalAmount - (inv.dp || 0)), 0)
);

const produkTerlaris = computed(() => {
    if (filteredInvoices.value.length === 0) return 'Tidak ada data';
    
    const productSales = {};
    filteredInvoices.value.forEach(inv => {
        inv.items?.forEach(item => {
            const name = item.selectedItem?.name || 'Produk Dihapus';
            if (!productSales[name]) {
                productSales[name] = 0;
            }
            productSales[name] += item.total;
        });
    });

    if (Object.keys(productSales).length === 0) return 'Tidak ada penjualan';

    return Object.entries(productSales).sort((a, b) => b[1] - a[1])[0][0];
});


// --- DATA GRAFIK ---
const chartDataPendapatan = computed(() => {
    // Logika akurat untuk menghitung pendapatan per minggu
    const weeklyRevenue = [0, 0, 0, 0]; // [Minggu 1, Minggu 2, Minggu 3, Minggu 4]
    
    filteredInvoices.value
      .filter(i => i.status === 'Lunas')
      .forEach(inv => {
        const dayOfMonth = new Date(inv.issueDate).getDate();
        if (dayOfMonth <= 7) weeklyRevenue[0] += inv.totalAmount;
        else if (dayOfMonth <= 14) weeklyRevenue[1] += inv.totalAmount;
        else if (dayOfMonth <= 21) weeklyRevenue[2] += inv.totalAmount;
        else weeklyRevenue[3] += inv.totalAmount;
      });

    return {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        datasets: [
            {
                label: 'Pendapatan (Rp)',
                backgroundColor: '#BF202F',
                borderRadius: 6,
                data: weeklyRevenue,
            },
        ],
    };
});

const chartDataProduk = computed(() => {
    const productSales = {};
    filteredInvoices.value.forEach(inv => {
        inv.items?.forEach(item => {
            const name = item.selectedItem?.name || 'Produk Dihapus';
             if (!productSales[name]) {
                productSales[name] = 0;
            }
            productSales[name] += item.quantity;
        });
    });
    
    const sortedProducts = Object.entries(productSales).sort((a,b) => b[1] - a[1]).slice(0, 4);

    return {
        labels: sortedProducts.map(p => p[0]),
        datasets: [
            {
                backgroundColor: ['#E84D43', '#3B82F6', '#10B981', '#F59E0B'],
                data: sortedProducts.map(p => p[1])
            }
        ]
    };
});

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
</script>

<template>
    <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Laporan Bisnis</h1>

        <!-- Filter & Aksi -->
        <div class="flex justify-between items-center mb-6">
            <select v-model="selectedPeriod" class="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="thisMonth">Bulan Ini</option>
                <option value="lastMonth">Bulan Lalu</option>
                <option value="thisYear">Tahun Ini</option>
            </select>
            <button class="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Ekspor Laporan
            </button>
        </div>

        <!-- Kartu Statistik -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p class="text-sm text-gray-500">Total Pendapatan (Lunas)</p>
                <p class="text-3xl font-bold text-green-600 mt-2">{{ formatCurrency(totalPendapatan) }}</p>
            </div>
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p class="text-sm text-gray-500">Total Piutang (Tertunda)</p>
                <p class="text-3xl font-bold text-yellow-600 mt-2">{{ formatCurrency(totalPiutang) }}</p>
            </div>
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p class="text-sm text-gray-500">Produk Terlaris</p>
                <p class="text-2xl font-bold text-gray-800 mt-2">{{ produkTerlaris }}</p>
            </div>
        </div>

        <!-- Grafik -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 class="font-semibold text-gray-800 mb-4">Tren Pendapatan</h3>
                <!-- Wrapper untuk membatasi tinggi chart -->
                <div class="relative h-80">
                    <BarChart :chart-data="chartDataPendapatan" />
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 class="font-semibold text-gray-800 mb-4">Penjualan per Produk</h3>
                <!-- Wrapper untuk membatasi tinggi chart -->
                <div class="relative h-80">
                    <DoughnutChart :chart-data="chartDataProduk" />
                </div>
            </div>
        </div>
    </div>
</template>

