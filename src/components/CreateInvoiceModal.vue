<script setup>
import { ref, computed, watch, watchEffect } from 'vue';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

const props = defineProps({
  isOpen: Boolean,
  nextInvoiceNumber: String,
  inventoryItems: Array,
  invoiceToEdit: Object,
});



const emit = defineEmits(['close', 'saveInvoice', 'updateInvoice']);
const isEditMode = computed(() => !!props.invoiceToEdit);
const createNewInvoiceTemplate = () => ({
  invoiceNumber: '',
  customerName: '',
  customerPhone: '',
  description: '',
  issueDate: new Date().toISOString().substr(0, 10),
  dueDateEnabled: false,
  dueDate: '',
  source: 'Customer Order',
  items: [{ selectedItem: null, quantity: 1, unitPrice: 0, total: 0, unit: '', availableStock: 0, error: '', inventory_id: null }],
  discount: 0,
  taxEnabled: false,
  dp: 0,
  status: 'Tertunda'
});
const newInvoice = ref(createNewInvoiceTemplate());

// Helper function to map inventory ID to inventory item
const findInventoryItem = (inventoryId) => {
  if (!props.inventoryItems || !Array.isArray(props.inventoryItems)) return null;
  return props.inventoryItems.find(item => item.id === parseInt(inventoryId));
};

watchEffect(() => {
  if (props.isOpen) {
    if (isEditMode.value && props.invoiceToEdit) {
      console.log('=== EDIT MODE DEBUG ===');
      console.log('Original invoiceToEdit:', props.invoiceToEdit);
      console.log('Available inventoryItems:', props.inventoryItems);

      const invoiceData = JSON.parse(JSON.stringify(props.invoiceToEdit));

      // Map data from API format to form format
      const mappedInvoice = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoice_number || invoiceData.invoiceNumber || '',
        customerName: invoiceData.customer_name || invoiceData.customerName || '',
        customerPhone: invoiceData.customer_phone || invoiceData.customerPhone || '',
        description: invoiceData.description || '',
        issueDate: invoiceData.issue_date ? invoiceData.issue_date.substr(0, 10) : invoiceData.issueDate || new Date().toISOString().substr(0, 10),
        dueDateEnabled: !!(invoiceData.due_date || invoiceData.dueDate),
        dueDate: invoiceData.due_date ? invoiceData.due_date.substr(0, 10) : invoiceData.dueDate || '',
        source: invoiceData.source || 'Customer Order',
        discount: parseFloat(invoiceData.discount || 0),
        taxEnabled: !!(invoiceData.tax_enabled || invoiceData.taxEnabled),
        dp: parseFloat(invoiceData.down_payment || invoiceData.dp || 0),
        status: invoiceData.status || 'Tertunda',
        // Additional fields from API response
        grand_total: parseFloat(invoiceData.grand_total || 0),
        remaining_payment: parseFloat(invoiceData.remaining_payment || 0),
        user_name: invoiceData.user_name || '',
        created_at: invoiceData.created_at || '',
        updated_at: invoiceData.updated_at || '',
        items: []
      };

      // Map items with proper inventory data
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        console.log('Mapping items:', invoiceData.items);
        mappedInvoice.items = invoiceData.items.map((item, index) => {
          console.log(`Processing item ${index}:`, item);
          const inventoryItem = findInventoryItem(item.inventory_id);
          console.log(`Found inventory item for ID ${item.inventory_id}:`, inventoryItem);

          const mappedItem = {
            selectedItem: inventoryItem,
            quantity: parseFloat(item.quantity || 1),
            unitPrice: parseFloat(item.price || item.unitPrice || 0),
            total: parseFloat(item.sub_total || item.total || 0),
            unit: inventoryItem ? inventoryItem.unit : (item.unit || ''),
            availableStock: inventoryItem ? inventoryItem.stock : (item.availableStock || 0),
            error: '',
            inventory_id: parseInt(item.inventory_id || item.inventory_id)
          };

          console.log(`Mapped item ${index}:`, mappedItem);
          return mappedItem;
        });
      }

      // Ensure at least one item exists
      if (mappedInvoice.items.length === 0) {
        mappedInvoice.items = [{ selectedItem: null, quantity: 1, unitPrice: 0, total: 0, unit: '', availableStock: 0, error: '', inventory_id: null }];
      }

      console.log('Final mapped invoice:', mappedInvoice);
      newInvoice.value = mappedInvoice;
    } else {
      newInvoice.value = createNewInvoiceTemplate();
      newInvoice.value.invoiceNumber = props.nextInvoiceNumber;
    }
  }
});
watch(() => newInvoice.value.items, (items) => {
    if (Array.isArray(items)) {
        items.forEach(item => {
            item.total = item.quantity * item.unitPrice;
            validateStock(item);
        });
    }
}, { deep: true });

// Watch for dueDateEnabled changes to reset dueDate when unchecked
watch(() => newInvoice.value.dueDateEnabled, (enabled) => {
    if (!enabled) {
        newInvoice.value.dueDate = '';
    }
});
const onSelectItem = (lineItem) => {
  console.log('=== ITEM SELECTION DEBUG ===');
  console.log('Selected item:', lineItem.selectedItem);
  if (lineItem.selectedItem) {
    console.log('Selected item properties:', {
      id: lineItem.selectedItem.id,
      price: lineItem.selectedItem.price,
      unit: lineItem.selectedItem.unit,
      stock: lineItem.selectedItem.stock
    });

    // Only update price if not in edit mode or if price is 0/empty
    if (!isEditMode.value || !lineItem.unitPrice || lineItem.unitPrice === 0) {
      lineItem.unitPrice = lineItem.selectedItem.price || 0;
    }

    lineItem.unit = lineItem.selectedItem.unit || '';
    lineItem.availableStock = lineItem.selectedItem.stock || 0;
    // Store the inventory ID for API submission
    lineItem.inventory_id = lineItem.selectedItem.id;

    // Recalculate total
    lineItem.total = lineItem.quantity * lineItem.unitPrice;

    console.log('Updated line item:', {
      unitPrice: lineItem.unitPrice,
      unit: lineItem.unit,
      availableStock: lineItem.availableStock,
      inventory_id: lineItem.inventory_id,
      total: lineItem.total
    });
    validateStock(lineItem);
  }
};
const validateStock = (lineItem) => {
  if (lineItem.selectedItem && lineItem.quantity > lineItem.availableStock) {
    lineItem.error = `Stok tidak cukup! (Tersedia: ${lineItem.availableStock})`;
  } else {
    lineItem.error = '';
  }
};
const taxRate = 0.11;
const subtotal = computed(() => {
    if (!newInvoice.value || !Array.isArray(newInvoice.value.items)) return 0;
    return newInvoice.value.items.reduce((sum, item) => sum + item.total, 0);
});
const taxAmount = computed(() => newInvoice.value.taxEnabled ? subtotal.value * taxRate : 0);
const grandTotal = computed(() => (subtotal.value - (newInvoice.value.discount || 0)) + taxAmount.value);
const sisaTagihan = computed(() => grandTotal.value - (newInvoice.value.dp || 0));
const addItemRow = () => { newInvoice.value.items.push({ selectedItem: null, quantity: 1, unitPrice: 0, total: 0, unit: '', availableStock: 0, error: '', inventory_id: null }); };
const removeItemRow = (index) => { newInvoice.value.items.splice(index, 1); };
const setDueDate = (days) => {
  const date = new Date(newInvoice.value.issueDate);
  date.setDate(date.getDate() + days);
  newInvoice.value.dueDate = date.toISOString().substr(0, 10);
};
const handleSubmit = () => {
  console.log('=== DEBUG: Starting form submission ===');
  console.log('Form data:', newInvoice.value);

  // Validate required fields
  console.log('=== FIELD VALIDATION ===');
  console.log('Customer name:', newInvoice.value.customerName);
  console.log('Customer phone:', newInvoice.value.customerPhone);
  console.log('Description:', newInvoice.value.description);
  console.log('Source:', newInvoice.value.source);
  console.log('Due date enabled:', newInvoice.value.dueDateEnabled);
  console.log('Due date value:', `"${newInvoice.value.dueDate}"`);
  console.log('Due date type:', typeof newInvoice.value.dueDate);

  if (!newInvoice.value.customerName || newInvoice.value.customerName.trim() === '') {
    console.error('Customer name is required');
    alert('Nama pelanggan wajib diisi.');
    return;
  }

  // Due date validation: only validate if checkbox is enabled
  if (newInvoice.value.dueDateEnabled && (!newInvoice.value.dueDate || newInvoice.value.dueDate.trim() === '')) {
    console.warn('Due date is enabled but empty');
    alert('Tanggal jatuh tempo wajib diisi jika fitur ini diaktifkan.');
    return;
  }

  // Validate that all items have selectedItem
  const invalidItems = newInvoice.value.items.filter(item => !item.selectedItem);
  if (invalidItems.length > 0) {
    console.error('Invalid items (no selectedItem):', invalidItems);
    alert('Mohon pilih item untuk semua baris sebelum menyimpan invoice.');
    return;
  }

  // Validate quantities and prices
  const invalidQuantities = newInvoice.value.items.filter(item => !item.quantity || item.quantity <= 0);
  if (invalidQuantities.length > 0) {
    console.error('Invalid quantities:', invalidQuantities);
    alert('Mohon masukkan quantity yang valid untuk semua item.');
    return;
  }

  const invalidPrices = newInvoice.value.items.filter(item => !item.unitPrice || item.unitPrice <= 0);
  if (invalidPrices.length > 0) {
    console.error('Invalid prices:', invalidPrices);
    alert('Mohon pastikan harga untuk semua item sudah terisi dengan benar.');
    return;
  }

  // Validate inventory_id exists
  const missingInventoryId = newInvoice.value.items.filter(item => !item.inventory_id);
  if (missingInventoryId.length > 0) {
    console.error('Items missing inventory_id:', missingInventoryId);
    alert('Ada item yang belum memiliki inventory_id. Mohon pilih ulang item.');
    return;
  }

  // Transform items to API format
  const transformedItems = newInvoice.value.items.map(item => ({
    inventory_id: parseInt(item.selectedItem.id),
    quantity: parseFloat(item.quantity),
    price: parseFloat(item.unitPrice)
  }));

  console.log('Transformed items:', transformedItems);

  // Prepare due_date with proper validation
  let dueDate = null;
  if (newInvoice.value.dueDateEnabled && newInvoice.value.dueDate && newInvoice.value.dueDate.trim() !== '') {
    dueDate = newInvoice.value.dueDate;
  }

  // Create API-compatible data structure
  const invoiceData = {
    customer_name: newInvoice.value.customerName,
    customer_phone: newInvoice.value.customerPhone,
    description: newInvoice.value.description,
    source: newInvoice.value.source,
    status: sisaTagihan.value <= 0 ? 'Lunas' : 'Tertunda',
    discount: parseFloat(newInvoice.value.discount) || 0,
    down_payment: parseFloat(newInvoice.value.dp) || 0,
    tax_enabled: newInvoice.value.taxEnabled,
    items: transformedItems,
    // Keep additional data for internal use
    invoiceNumber: newInvoice.value.invoiceNumber,
    subtotal: subtotal.value,
    taxAmount: taxAmount.value,
    totalAmount: grandTotal.value,
    sisaTagihan: sisaTagihan.value
  };

  // Only add due_date if it has a valid value
  if (dueDate) {
    invoiceData.due_date = dueDate;
  }

  console.log('=== FINAL INVOICE DATA TO BE SENT ===');
  console.log('Due date debug:');
  console.log('- dueDateEnabled:', newInvoice.value.dueDateEnabled);
  console.log('- dueDate value:', `"${newInvoice.value.dueDate}"`);
  console.log('- final due_date in payload:', invoiceData.due_date);
  console.log('- due_date included in payload:', 'due_date' in invoiceData);
  console.log('Invoice data:', invoiceData);
  console.log('Invoice data (JSON):', JSON.stringify(invoiceData, null, 2));
  console.log('Data types:');
  console.log('- customer_name:', typeof invoiceData.customer_name, `"${invoiceData.customer_name}"`);
  console.log('- customer_phone:', typeof invoiceData.customer_phone, `"${invoiceData.customer_phone}"`);
  console.log('- description:', typeof invoiceData.description, `"${invoiceData.description}"`);
  console.log('- source:', typeof invoiceData.source, `"${invoiceData.source}"`);
  if ('due_date' in invoiceData) {
    console.log('- due_date:', typeof invoiceData.due_date, invoiceData.due_date);
  } else {
    console.log('- due_date: NOT INCLUDED IN PAYLOAD');
  }
  console.log('- status:', typeof invoiceData.status, `"${invoiceData.status}"`);
  console.log('- discount:', typeof invoiceData.discount, invoiceData.discount);
  console.log('- down_payment:', typeof invoiceData.down_payment, invoiceData.down_payment);
  console.log('- tax_enabled:', typeof invoiceData.tax_enabled, invoiceData.tax_enabled);
  console.log('- items length:', invoiceData.items.length);

  // Validate each item before sending
  console.log('=== ITEMS VALIDATION ===');
  invoiceData.items.forEach((item, index) => {
    console.log(`Item ${index + 1}:`, item);
    console.log(`- inventory_id: ${typeof item.inventory_id} - ${item.inventory_id} - isNaN: ${isNaN(item.inventory_id)}`);
    console.log(`- quantity: ${typeof item.quantity} - ${item.quantity} - isNaN: ${isNaN(item.quantity)}`);
    console.log(`- price: ${typeof item.price} - ${item.price} - isNaN: ${isNaN(item.price)}`);

    if (!item.inventory_id || isNaN(item.inventory_id)) {
      console.error(`Item ${index + 1} has invalid inventory_id:`, item.inventory_id);
    }
    if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
      console.error(`Item ${index + 1} has invalid quantity:`, item.quantity);
    }
    if (!item.price || isNaN(item.price) || item.price <= 0) {
      console.error(`Item ${index + 1} has invalid price:`, item.price);
    }
  });

  // Check for empty or null values
  console.log('=== NULL/EMPTY CHECK ===');
  Object.keys(invoiceData).forEach(key => {
    if (invoiceData[key] === null || invoiceData[key] === undefined || invoiceData[key] === '') {
      console.warn(`Warning: ${key} is null/undefined/empty:`, invoiceData[key]);
    }
  });

  if (isEditMode.value) {
    console.log('Emitting updateInvoice event with ID:', newInvoice.value.id);
    // Add invoice ID for update operations
    const updateData = { ...invoiceData, id: newInvoice.value.id };
    emit('updateInvoice', updateData);
  } else {
    console.log('Emitting saveInvoice event');
    emit('saveInvoice', invoiceData);
  }
  emit('close');
};
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
      <div @click="$emit('close')" class="absolute inset-0"></div>
      <div class="relative bg-white rounded-2xl shadow-lg w-full max-w-4xl" @click.stop>
        <!-- ... header dan form bagian atas tidak berubah ... -->
        <div class="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">{{ isEditMode ? `Edit Invoice #${newInvoice.invoiceNumber}` : 'Buat Invoice Baru' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-700 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <!-- Form fields ... -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div class="lg:col-span-2">
                <label for="customerName" class="block text-sm font-medium text-gray-600 mb-2">Nama Pelanggan</label>
                <input v-model="newInvoice.customerName" type="text" id="customerName" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg" required>
              </div>
              <div>
                <label for="source" class="block text-sm font-medium text-gray-600 mb-2">Sumber Pelanggan</label>
                <select v-model="newInvoice.source" id="source" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg">
                  <option>Customer Order</option>
                  <option>Project</option>
                  <option>Social Media</option>
                  <option>Other</option>
                </select>
              </div>
                <div>
                <label for="invoiceNumber" class="block text-sm font-medium text-gray-600 mb-2">Nomor Invoice</label>
                <input v-model="newInvoice.invoiceNumber" type="text" id="invoiceNumber" class="w-full px-4 py-2.5 bg-gray-200 border-gray-300 border rounded-lg cursor-not-allowed" disabled readonly>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label for="customerPhone" class="block text-sm font-medium text-gray-600 mb-2">No. HP Pelanggan</label>
                <input v-model="newInvoice.customerPhone" type="tel" id="customerPhone" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg" placeholder="081234567890">
              </div>
              <div>
                <label for="description" class="block text-sm font-medium text-gray-600 mb-2">Keterangan</label>
                <input v-model="newInvoice.description" type="text" id="description" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg" placeholder="Deskripsi pekerjaan atau layanan">
              </div>
              <div v-if="isEditMode">
                <label for="invoiceStatus" class="block text-sm font-medium text-gray-600 mb-2">Status Invoice</label>
                <select v-model="newInvoice.status" id="invoiceStatus" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg">
                  <option value="Tertunda">Tertunda</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-end">
              <div>
                <label for="issueDate" class="block text-sm font-medium text-gray-600 mb-2">Tanggal Terbit</label>
                <input v-model="newInvoice.issueDate" type="date" id="issueDate" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg">
              </div>
              <div v-if="isEditMode" class="text-sm">
                <label class="block text-sm font-medium text-gray-600 mb-2">Grand Total</label>
                <div class="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-semibold">
                  Rp {{ (newInvoice.grand_total || grandTotal).toLocaleString('id-ID') }}
                </div>
              </div>
              <div class="flex items-center">
                <input v-model="newInvoice.dueDateEnabled" type="checkbox" id="dueDateEnabled" class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500">
                <label for="dueDateEnabled" class="ml-2 text-sm font-medium text-gray-600">Tambahkan Tanggal Jatuh Tempo</label>
              </div>
            </div>
            <div v-if="newInvoice.dueDateEnabled" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div></div>
                <div v-if="isEditMode" class="text-sm">
                  <label class="block text-sm font-medium text-gray-600 mb-2">Sisa Pembayaran</label>
                  <div class="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold">
                    Rp {{ (newInvoice.remaining_payment || sisaTagihan).toLocaleString('id-ID') }}
                  </div>
                </div>
                <div>
                    <label for="dueDate" class="block text-sm font-medium text-gray-600 mb-2">Jatuh Tempo</label>
                    <div class="flex items-center gap-2">
                        <input v-model="newInvoice.dueDate" type="date" id="dueDate" class="w-full px-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg">
                        <button @click="setDueDate(7)" type="button" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md">7D</button>
                        <button @click="setDueDate(14)" type="button" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md">14D</button>
                        <button @click="setDueDate(30)" type="button" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md">30D</button>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-200 pt-4">
              <div v-for="(item, index) in newInvoice.items" :key="index" class="p-3 bg-gray-50/50 rounded-lg mb-3">
                   <div class="grid grid-cols-12 gap-3 items-start">
                      <div class="col-span-12 md:col-span-4">
                           <!-- ## PERUBAHAN UTAMA ADA DI SINI ## -->
                           <v-select
                             :options="inventoryItems || []"
                             v-model="item.selectedItem"
                             @update:modelValue="onSelectItem(item)"
                             :placeholder="(inventoryItems && inventoryItems.length > 0) ? 'Cari item berdasarkan kode atau nama...' : 'Memuat data inventory...'"
                             label="name"
                             :reduce="item => item"
                             :filter-by="['code', 'name']"
                             :disabled="!inventoryItems || inventoryItems.length === 0"

                           >
                            <!-- Kustomisasi tampilan setiap opsi di dropdown -->
                            <template #option="option">
                                <div class="flex justify-between">
                                    <span>
                                        <span class="font-bold">{{ option.code }}</span> - {{ option.name }}
                                    </span>
                                    <span class="text-xs text-gray-500">Stok: {{ option.stock }}</span>
                                </div>
                            </template>
                            <!-- Kustomisasi tampilan item yang sudah terpilih -->
                            <template #selected-option="option">
                                <span><span class="font-semibold">{{ option.code }}</span> - {{ option.name }}</span>
                            </template>
                            <!-- Template untuk menampilkan pesan ketika tidak ada opsi -->
                            <template #no-options>
                                <div class="text-gray-500 text-sm p-2">
                                    {{ (!inventoryItems || inventoryItems.length === 0) ? 'Data inventory sedang dimuat...' : 'Tidak ada item yang ditemukan' }}
                                </div>
                            </template>
                           </v-select>
                      </div>
                      <div class="col-span-6 md:col-span-2">
                       <div class="flex items-center">
                           <input v-model.number="item.quantity" type="number" step="any" placeholder="Jml" min="0.01"
                                  :class="item.error ? 'border-red-500' : 'border-gray-200'"
                                  class="w-full px-3 py-2 bg-white border rounded-lg">
                           <span class="ml-2 text-sm text-gray-500 flex-shrink-0">{{ item.unit }}</span>
                       </div>
                      </div>
                      <div class="col-span-6 md:col-span-3">
                       <input v-model.number="item.unitPrice" type="number" placeholder="Harga" min="0" class="w-full px-3 py-2 bg-white border-gray-200 border rounded-lg">
                      </div>
                      <div class="col-span-12 md:col-span-2 flex items-end">
                         <p class="text-right font-semibold text-gray-800 pr-2 w-full">Rp {{ (item.total || 0).toLocaleString('id-ID') }}</p>
                      </div>
                      <div class="col-span-12 md:col-span-1 flex items-end justify-end">
                       <button @click="removeItemRow(index)" type="button" class="text-red-500 hover:text-red-700 p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                       </button>
                      </div>
                      <p v-if="item.error" class="col-span-12 text-xs text-red-600 -mt-1">{{ item.error }}</p>
                   </div>
               </div>
               <button @click="addItemRow" type="button" class="mt-2 text-sm font-semibold text-red-600 hover:text-red-800">+ Tambah Baris</button>
            </div>
            <!-- Invoice metadata for edit mode -->
            <div v-if="isEditMode" class="border-t border-gray-200 pt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Informasi Invoice</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div v-if="newInvoice.user_name">
                  <span class="text-gray-500">Dibuat oleh:</span>
                  <span class="font-medium ml-1">{{ newInvoice.user_name }}</span>
                </div>
                <div v-if="newInvoice.created_at">
                  <span class="text-gray-500">Tanggal dibuat:</span>
                  <span class="font-medium ml-1">{{ new Date(newInvoice.created_at).toLocaleDateString('id-ID') }}</span>
                </div>
                <div v-if="newInvoice.updated_at && newInvoice.updated_at !== newInvoice.created_at">
                  <span class="text-gray-500">Terakhir diupdate:</span>
                  <span class="font-medium ml-1">{{ new Date(newInvoice.updated_at).toLocaleDateString('id-ID') }}</span>
                </div>
              </div>
            </div>

            <!-- Totals section -->
            <div class="border-t border-gray-200 pt-4 flex justify-end">
              <div class="w-full md:w-1/2 lg:w-1/3 space-y-3">
                <div class="flex justify-between items-center"><span class="text-gray-600">Subtotal</span><span class="font-semibold">Rp {{ subtotal.toLocaleString('id-ID') }}</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-600">Diskon (Rp)</span><input v-model.number="newInvoice.discount" type="number" class="w-2/5 px-3 py-1 bg-gray-50 border-gray-200 border rounded-lg text-right"></div>
                <div class="flex justify-between items-center"><div class="flex items-center"><input v-model="newInvoice.taxEnabled" type="checkbox" id="tax" class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"><label for="tax" class="ml-2 text-gray-600">PPN (11%)</label></div><span class="font-semibold">Rp {{ taxAmount.toLocaleString('id-ID') }}</span></div>
                <div class="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2 mt-2"><span class="text-gray-800">Grand Total</span><span class="text-red-600">Rp {{ grandTotal.toLocaleString('id-ID') }}</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-600">DP (Rp)</span><input v-model.number="newInvoice.dp" type="number" class="w-2/5 px-3 py-1 bg-gray-50 border-gray-200 border rounded-lg text-right"></div>
                <div class="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2 mt-2 bg-yellow-50 p-2 rounded-lg"><span class="text-gray-800">Sisa Tagihan</span><span class="text-red-600">Rp {{ sisaTagihan.toLocaleString('id-ID') }}</span></div>
              </div>
            </div>
          </div>
          <!-- Buttons -->
          <div class="flex justify-end items-center p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button @click="$emit('close')" type="button" class="bg-transparent hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-lg mr-2">Batal</button>
            <button type="submit" class="bg-[#E84D43] hover:bg-[#BF202F] text-white font-bold py-2.5 px-5 rounded-lg">
              {{ isEditMode ? 'Simpan Perubahan' : 'Buat Invoice' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style>
/* ... styles tidak berubah ... */
:root {
  --vs-colors--lightest: rgba(239, 68, 68, 0.1);
  --vs-colors--light: #F87171;
  --vs-colors--dark: #DC2626;
  --vs-colors--darkest: #B91C1C;
  --vs-border-color: #e5e7eb;
  --vs-border-radius: 0.5rem;
  --vs-line-height: 1.5;
  --vs-search-input-padding: 0.5rem 1rem;
}
.vs__dropdown-toggle {
  background-color: #F9FAFB !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}
.vs__search {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.vs--error .vs__dropdown-toggle {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}
</style>
