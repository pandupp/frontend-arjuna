<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useInvoiceStore } from '../stores/invoice';
import StatCard from '../components/StatCard.vue';
import LineChart from '../components/charts/LineChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';

const invoiceStore = useInvoiceStore();
const { invoices } = storeToRefs(invoiceStore);

const isMobile = ref(window.innerWidth < 768);
const handleResize = () => { isMobile.value = window.innerWidth < 768; };
onMounted(() => { window.addEventListener('resize', handleResize); });
onUnmounted(() => { window.removeEventListener('resize', handleResize); });

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: !isMobile.value },
    tooltip: { 
      backgroundColor: '#111827',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
    }
  },
  scales: {
    y: { 
      grid: { color: '#e5e7eb' },
      border: { display: false },
      ticks: { padding: 10 }
    },
    x: { 
      grid: { display: false }, 
      border: { display: false },
      ticks: {
        maxRotation: isMobile.value ? 90 : 0,
        minRotation: isMobile.value ? 90 : 0,
      }
    }
  }
}));

const lineChartData = computed(() => {
  // Jika tidak ada invoice, kembalikan null agar tidak error
  if (!invoices.value || invoices.value.length === 0) {
    return null;
  }

  const labels = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('id-ID', { month: 'short' }));
  }
  const monthlySales = Array(6).fill(0);
  invoices.value.forEach(invoice => {
    const invoiceDate = new Date(invoice.issueDate);
    const monthDiff = (now.getFullYear() - invoiceDate.getFullYear()) * 12 + (now.getMonth() - invoiceDate.getMonth());
    if (monthDiff >= 0 && monthDiff < 6) {
      const index = 5 - monthDiff;
      monthlySales[index] += invoice.totalAmount;
    }
  });
  
  return {
    labels: labels,
    datasets: [{
      label: 'Total Penjualan',
      data: monthlySales,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#3b82f6',
    }],
  };
});

const topSellingItems = computed(() => {
  const salesCount = {};
  invoices.value.forEach(invoice => {
    invoice.items.forEach(item => {
      if (item.selectedItem) {
        const name = item.selectedItem.name;
        salesCount[name] = (salesCount[name] || 0) + item.quantity;
      }
    });
  });
  return Object.entries(salesCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, totalSold]) => ({
      name,
      totalSold: Math.round(totalSold)
    }));
});

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
      backgroundColor: ['#374151', '#a2d2ff', '#b8f1cc', '#e0e7ff'],
      data: data,
      borderWidth: 0,
      borderRadius: 12,
      spacing: 8,
      hoverOffset: 15,
    }],
  };
});

const doughnutChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { /* ... Opsi Anda ... */ },
    cutout: '75%',
});

const cardColors = ['bg-[#E3F3E9]', 'bg-[#F2F2FF]', 'bg-[#E6F1FD]'];
</script>

<template>
  <div>
    <!-- Kartu Statistik -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        v-for="(item, index) in topSellingItems"
        :key="item.name"
        :title="item.name" 
        :value="`${item.totalSold} Terjual`" 
        :color="cardColors[index]"
      />
      <div v-if="topSellingItems.length === 0" class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
        Belum ada data penjualan.
      </div>
    </div>

    <!-- Grafik -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Statistik Penjualan Bulanan</h3>
        <div class="h-80">
          <!-- ## PERBAIKAN: Tambahkan v-if untuk memastikan data sudah siap ## -->
          <LineChart v-if="lineChartData" :chart-data="lineChartData" :chart-options="lineChartOptions" />
          <p v-else class="text-center text-gray-500">Memuat data chart...</p>
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

