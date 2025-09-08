<script setup>
// ## PERBAIKAN: Tambahkan 'ref' ke dalam import ##
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

// Impor store, hapus data dummy
import { useInvoiceStore } from '../stores/invoice';

import StatCard from '../components/StatCard.vue';
import BarChart from '../components/charts/BarChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';

// Inisialisasi store dan ambil data invoice
const invoiceStore = useInvoiceStore();
const { invoices } = storeToRefs(invoiceStore);

// --- STATISTIK DINAMIS BERDASARKAN DATA INVOICE ASLI ---

// Hitung 3 produk terlaris dari data invoice
const topSellingItems = computed(() => {
  const salesCount = {};
  
  // Loop semua invoice dan semua item di dalamnya
  invoices.value.forEach(invoice => {
    invoice.items.forEach(item => {
      if (item.selectedItem) {
        const name = item.selectedItem.name;
        salesCount[name] = (salesCount[name] || 0) + item.quantity;
      }
    });
  });

  // Urutkan dari yang paling banyak terjual dan ambil 3 teratas
  return Object.entries(salesCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, totalSold]) => ({
      name,
      totalSold: Math.round(totalSold) // Pembulatan jika ada angka desimal
    }));
});

// Hitung data untuk chart penjualan bulanan
const barChartData = computed(() => {
  // Siapkan label untuk 6 bulan terakhir
  const labels = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('id-ID', { month: 'short' }));
  }

  // Inisialisasi data penjualan untuk 6 bulan dengan nilai 0
  const monthlySales = Array(6).fill(0);

  // Loop data invoice dan akumulasikan total penjualan per bulan
  invoices.value.forEach(invoice => {
    const invoiceDate = new Date(invoice.issueDate);
    const monthDiff = (now.getFullYear() - invoiceDate.getFullYear()) * 12 + (now.getMonth() - invoiceDate.getMonth());
    
    // Hanya proses data dari 6 bulan terakhir
    if (monthDiff >= 0 && monthDiff < 6) {
      const index = 5 - monthDiff;
      monthlySales[index] += invoice.totalAmount;
    }
  });

  return {
    labels: labels,
    datasets: [{
      label: 'Total Penjualan',
      backgroundColor: '#3b82f6',
      hoverBackgroundColor: '#2563eb',
      data: monthlySales,
      borderRadius: 6,
      barThickness: 20,
    }],
  };
});


// Hitung data untuk chart sumber customer
const customerSourceChartData = computed(() => {
  const sourceCount = {};
  
  invoices.value.forEach(invoice => {
    const source = invoice.source || 'Other';
    sourceCount[source] = (sourceCount[source] || 0) + 1;
  });

  const labels = Object.keys(sourceCount);
  const data = Object.values(sourceCount);
  
  return {
    labels: labels,
    datasets: [{
      backgroundColor: ['#374151', '#a2d2ff', '#b8f1cc', '#e0e7ff'], // Warna bisa ditambah jika sumber lebih dari 4
      data: data,
      borderWidth: 0,
      borderRadius: 12,
      spacing: 8,
      hoverOffset: 15,
    }],
  };
});


// Opsi chart tidak perlu diubah
const barChartOptions = ref({ /* ... Opsi Anda ... */ });
const doughnutChartOptions = ref({ /* ... Opsi Anda ... */ });
const cardColors = ['bg-[#E3F3E9]', 'bg-[#F2F2FF]', 'bg-[#E6F1FD]'];
</script>

<template>
  <div>
    <!-- Kartu Statistik (Sekarang menampilkan data asli) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        v-for="(item, index) in topSellingItems"
        :key="item.name"
        :title="item.name" 
        :value="`${item.totalSold} Terjual`" 
        :color="cardColors[index]"
      />
      <!-- Tampilkan pesan jika tidak ada data penjualan -->
      <div v-if="topSellingItems.length === 0" class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
        Belum ada data penjualan.
      </div>
    </div>

    <!-- Grafik (Sekarang menampilkan data asli) -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Statistik Penjualan Bulanan</h3>
        <div class="h-80">
          <BarChart :chart-data="barChartData" :chart-options="barChartOptions" />
        </div>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Traffic by Customer</h3>
        <div class="h-80 flex items-center justify-center">
           <DoughnutChart v-if="invoices.length > 0" :chart-data="customerSourceChartData" :chart-options="doughnutChartOptions" />
           <p v-else class="text-gray-500">Belum ada data invoice.</p>
        </div>
      </div>
    </div>
  </div>
</template>

