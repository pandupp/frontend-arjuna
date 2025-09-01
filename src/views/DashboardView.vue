<script setup>
import { ref, computed } from 'vue';
import StatCard from '../components/StatCard.vue';
import BarChart from '../components/charts/BarChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';

// --- DATA UNTUK KARTU STATISTIK (SAMA SEPERTI SEBELUMNYA) ---
const inventoryItems = ref([
  { id: 1, name: 'Stiker Vinyl A3+', price: 15000 }, { id: 2, name: 'Spanduk Flexi 280gr', price: 25000 },
  { id: 3, name: 'Kartu Nama Art Carton', price: 50000 }, { id: 4, name: 'Brosur A5 Art Paper', price: 450000 },
  { id: 5, name: 'Banner X-Stand', price: 120000 },
]);
const salesData = ref([
  { itemId: 2, quantitySold: 50 }, { itemId: 1, quantitySold: 120 }, { id: 3, quantitySold: 75 },
  { itemId: 2, quantitySold: 80 }, { itemId: 4, quantitySold: 10 }, { itemId: 1, quantitySold: 90 },
  { itemId: 5, quantitySold: 30 }, { itemId: 3, quantitySold: 60 }, { itemId: 2, quantitySold: 45 },
]);
const topSellingItems = computed(() => {
  const salesCount = salesData.value.reduce((acc, sale) => { acc[sale.itemId] = (acc[sale.itemId] || 0) + sale.quantitySold; return acc; }, {});
  const sortedItems = Object.entries(salesCount).sort(([, a], [, b]) => b - a);
  const top3 = sortedItems.slice(0, 3);
  return top3.map(([itemId, totalSold]) => {
    const itemDetails = inventoryItems.value.find(item => item.id == itemId);
    return { ...itemDetails, totalSold: totalSold, };
  });
});
const cardColors = ['bg-[#E3F3E9]', 'bg-[#F2F2FF]', 'bg-[#E6F1FD]'];
const icons = { trophy: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1 9 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 0 9 0Zm0 0c1.162 0 2.22-.323 3.134-.863 1.033-.623 1.5-1.932 1.5-3.262V9.375a1.125 1.125 0 0 0-1.125-1.125h-1.5M16.5 18.75a9.75 9.75 0 0 1-9 0Zm0 0c-1.162 0-2.22-.323-3.134-.863-1.033-.623-1.5-1.932-1.5-3.262V9.375a1.125 1.125 0 0 1 1.125-1.125h1.5M12 14.25v-3.75m-2.625 3.75a2.625 2.625 0 1 1 5.25 0m-5.25 0L12 14.25m2.625-3.75a2.625 2.625 0 1 0-5.25 0m5.25 0L12 14.25m0-3.75a3.375 3.375 0 0 0-3.375 3.375M12 3.75a3.375 3.375 0 0 1 3.375 3.375" /></svg>`, };

// --- DATA FIKTIF INVOICE (TETAP SAMA) ---
const invoicesData = ref([
    { id: 1, source: 'Customer Order' }, { id: 2, source: 'Social Media' },
    { id: 3, source: 'Project' }, { id: 4, source: 'Customer Order' },
    { id: 5, source: 'Other' }, { id: 6, source: 'Social Media' },
    { id: 7, source: 'Customer Order' }, { id: 8, source: 'Customer Order' },
    { id: 9, source: 'Project' }, { id: 10, source: 'Social Media' },
]);

// --- LOGIKA UNTUK CHART ---

// Data untuk Bar Chart (TETAP SAMA)
const barChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
  datasets: [{ label: 'Total Penjualan', backgroundColor: '#3b82f6', hoverBackgroundColor: '#2563eb', data: [40, 20, 12, 39, 10, 80], borderRadius: 6, barThickness: 20, }],
});
const barChartOptions = ref({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false, }, tooltip: { backgroundColor: '#111827', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 12 }, padding: 12, cornerRadius: 8, } },
  scales: { y: { grid: { display: false, }, border: { display: false, }, ticks: { padding: 10, } }, x: { grid: { display: false, }, border: { display: false, }, } }
});

// LOGIKA & DATA BARU UNTUK DOUGHNUT CHART
const customerSourceChartData = computed(() => {
    const sourceCount = invoicesData.value.reduce((acc, invoice) => {
        acc[invoice.source] = (acc[invoice.source] || 0) + 1;
        return acc;
    }, {});

    const labels = ['Customer Order', 'Project', 'Social Media', 'Other'];
    const data = labels.map(label => sourceCount[label] || 0);

    return {
        labels: labels,
        datasets: [{
            backgroundColor: [
              // Fungsi untuk membuat gradient hitam
              (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, '#374151'); // abu-abu gelap
                gradient.addColorStop(1, '#000000'); // hitam
                return gradient;
              },
              '#a2d2ff', // Project (biru muda)
              '#b8f1cc', // Social Media (hijau muda)
              '#e0e7ff', // Other (biru sangat muda/abu-abu kebiruan)
            ],
            data: data,
            borderWidth: 0,
            // Menambahkan sudut tumpul & spasi
            borderRadius: 12,
            spacing: 8,
            hoverOffset: 15,
        }],
    };
});

// OPSI BARU UNTUK DOUGHNUT CHART
const doughnutChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        padding: 20,
        font: { size: 14, weight: '500' },
        color: '#374151', // Warna font legend
        // Fungsi untuk format legend dengan persentase
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i];
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
              return {
                text: `${label} ${percentage}%`,
                fillStyle: Array.isArray(data.datasets[0].backgroundColor) ? data.datasets[0].backgroundColor[i] : data.datasets[0].backgroundColor,
                strokeStyle: 'rgba(0,0,0,0)',
                lineWidth: 0,
                hidden: !chart.isDatasetVisible(0) || chart.getDatasetMeta(0).data[i].hidden,
                index: i
              };
            });
          }
          return [];
        }
      }
    },
    tooltip: {
      backgroundColor: '#111827', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 12 },
      padding: 12, cornerRadius: 8,
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed;
          const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    },
  },
  cutout: '75%',
});
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        v-for="(item, index) in topSellingItems"
        :key="item.id"
        :title="item.name" 
        :value="`${item.totalSold} Terjual`" 
        :icon="icons.trophy"
        :color="cardColors[index]"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
      
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Statistik Penjualan Bulanan</h3>
        <div class="h-80">
          <BarChart :chart-data="barChartData" :chart-options="barChartOptions" />
        </div>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Traffic by customer</h3>
        <div class="h-80 flex items-center justify-center">
          <DoughnutChart :chart-data="customerSourceChartData" :chart-options="doughnutChartOptions" />
        </div>
      </div>

    </div>
  </div>
</template>