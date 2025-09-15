<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import StatCard from '../components/StatCard.vue';
import LineChart from '../components/charts/LineChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';
import { statisticsService } from '../services/statisticsService';

const summary = ref(null);
const isLoading = ref(true);

const isMobile = ref(window.innerWidth < 768);
const handleResize = () => { isMobile.value = window.innerWidth < 768; };
onMounted(() => {
  window.addEventListener('resize', handleResize);
  fetchSummary();
});
onUnmounted(() => { window.removeEventListener('resize', handleResize); });

const fetchSummary = async () => {
  isLoading.value = true;
  summary.value = await statisticsService.getSummary();
  isLoading.value = false;
};

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
  if (!summary.value || !summary.value.monthly_sales) {
    return null;
  }
  const labels = summary.value.monthly_sales.map(m => m.month);
  const monthlySales = summary.value.monthly_sales.map(m => m.total);
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
  if (!summary.value || !summary.value.top_products) return [];
  return summary.value.top_products.map(item => ({
    name: item.name,
    totalSold: item.total_sold
  }));
});

const customerSourceChartData = computed(() => {
  if (!summary.value || !summary.value.customer_sources) return { labels: [], datasets: [] };
  const labels = Object.keys(summary.value.customer_sources);
  const data = Object.values(summary.value.customer_sources);
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
    <div v-if="isLoading" class="text-center p-10 text-gray-500">Memuat data statistik...</div>
    <div v-else>
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
            <LineChart v-if="lineChartData" :chart-data="lineChartData" :chart-options="lineChartOptions" />
            <p v-else class="text-center text-gray-500">Memuat data chart...</p>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Traffic by Customer</h3>
          <div class="h-80 flex items-center justify-center">
             <DoughnutChart v-if="summary && summary.customer_sources && Object.keys(summary.customer_sources).length > 0" :chart-data="customerSourceChartData" :chart-options="doughnutChartOptions" />
             <p v-else class="text-gray-500">Belum ada data invoice.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
