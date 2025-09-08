<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: String,
});
</script>

<template>
  <div 
    :class="color" 
    class="p-6 rounded-xl shadow-sm transform hover:-translate-y-1 transition-transform duration-300"
  >
    <div class="flex justify-between items-start">
      <span class="text-sm font-medium text-gray-500">{{ title }}</span>
      
    </div>
    <div class="mt-4">
      <p class="text-4xl font-bold text-gray-900">{{ value }}</p>
    </div>
  </div>
</template>