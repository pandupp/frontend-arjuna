<script setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// Mendaftarkan komponen-komponen dari Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

// Menerima data dan opsi dari parent component
defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false,
    }),
  },
});
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>