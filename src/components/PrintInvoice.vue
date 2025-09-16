<script setup>
const props = defineProps({
  invoice: Object,
  inventoryItems: Array,
});

// Debug: Log invoice data to console
console.log('Invoice data:', props.invoice);
console.log('Invoice items:', props.invoice?.items);
console.log('Available inventoryItems:', props.inventoryItems);

// Helper function to map inventory ID to inventory item
const findInventoryItem = (inventoryId) => {
  if (!props.inventoryItems || !Array.isArray(props.inventoryItems)) return null;
  return props.inventoryItems.find(item => item.id === parseInt(inventoryId));
};

const formatCurrency = (value) => {
  console.log('Formatting currency for value:', value, 'Type:', typeof value);
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Helper function to get item name
const getItemName = (item) => {
    console.log('Getting item name for:', item);
    // First try direct properties
    if (item.description) return item.description;
    if (item.selectedItem && item.selectedItem.name) return item.selectedItem.name;
    if (item.name) return item.name;
    if (item.item_name) return item.item_name;

    // If none found, try to fetch from inventory items using inventory_id
    if (item.inventory_id) {
        const inventoryItem = findInventoryItem(item.inventory_id);
        console.log(`Found inventory item for ID ${item.inventory_id}:`, inventoryItem);
        if (inventoryItem) {
            return `${inventoryItem.name}`;
        }
    }

    return `Item ID: ${item.inventory_id || item.id || 'Unknown'}`;
}

// Helper function to get item price
const getItemPrice = (item) => {
    console.log('Getting item price for:', item);
    const price = item.price || item.unit_price || item.harga || 0;
    console.log('Final price:', price);
    return price;
}

// Helper function to get item total
const getItemTotal = (item) => {
    console.log('Getting item total for:', item);
    const total = item.sub_total || item.total || item.subtotal || (item.quantity * getItemPrice(item));
    console.log('Final total:', total);
    return total;
}
</script>

<template>
  <div class="print-area bg-white font-sans text-gray-800">
    <div class="p-10">
        <div class="border rounded-lg shadow-sm">
            <!-- Header -->
            <div class="flex justify-between items-start p-6 bg-gray-50 rounded-t-lg border-b">
                <div>
                    <h2 class="text-2xl font-bold tracking-wider text-gray-800">ARJUNA PRINT</h2>
                    <p class="text-xs text-gray-500 mt-1">WE MAKE IT BETTER</p>
                </div>
                <div class="text-right">
                    <h1 class="text-3xl font-bold text-blue-600">INVOICE</h1>
                    <p class="text-sm text-gray-600 mt-1">#{{ invoice.invoice_number || invoice.invoiceNumber }}</p>
                </div>
            </div>

            <div class="p-6">
                <!-- Info Pelanggan & Tanggal -->
                <div class="grid grid-cols-2 gap-12 mb-8">
                    <div>
                        <p class="font-semibold text-sm text-gray-500 mb-1">DITAGIHKAN KEPADA</p>
                        <p class="text-base font-bold text-gray-900">{{ invoice.customer_name || invoice.customerName }}</p>
                        <p class="text-sm text-gray-600 mt-2">Sumber: {{ invoice.source }}</p>
                        <p class="text-sm text-gray-600 mt-2">Status: <span :class="invoice.status === 'Lunas' ? 'text-green-600' : 'text-red-600'">{{ invoice.status }}</span></p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-sm text-gray-500 mb-1">TANGGAL TERBIT</p>
                        <p class="text-base text-gray-800">{{ formatDate(invoice.issue_date || invoice.issueDate) }}</p>
                        <p class="text-sm text-gray-600 mt-2">Dibuat: {{ formatDate(invoice.created_at) }}</p>
                        <p class="text-sm text-gray-600 mt-2">Diupdate: {{ formatDate(invoice.updated_at) }}</p>
                        <!-- JATUH TEMPO (KONDISIONAL) -->
                        <div v-if="(invoice.dueDateEnabled && invoice.dueDate) || invoice.due_date" class="mt-3">
                            <p class="font-semibold text-sm text-gray-500 mb-1">JATUH TEMPO</p>
                            <p class="text-base font-bold text-red-600">{{ formatDate(invoice.due_date || invoice.dueDate) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Tabel Item -->
                <div class="w-full overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-blue-50 text-sm font-semibold text-blue-800 uppercase">
                                <th class="py-3 px-4 w-1/2 rounded-l-lg">Deskripsi</th>
                                <th class="py-3 px-4 text-center">Jumlah</th>
                                <th class="py-3 px-4 text-right">Harga Satuan</th>
                                <th class="py-3 px-4 text-right rounded-r-lg">Total</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr v-for="(item, index) in invoice.items" :key="index" class="border-b border-gray-100">
                                <td class="py-3 px-4 font-medium">
                                    {{ getItemName(item) }}
                                </td>
                                <td class="py-3 px-4 text-center">{{ item.quantity || 0 }}</td>
                                <td class="py-3 px-4 text-right">{{ formatCurrency(getItemPrice(item)) }}</td>
                                <td class="py-3 px-4 text-right font-semibold">{{ formatCurrency(getItemTotal(item)) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Kalkulasi Total -->
                <div class="flex justify-end mt-8">
                    <div class="w-full max-w-sm sm:w-2/5">
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Subtotal</span>
                                <span class="text-sm font-medium">
                                    {{ formatCurrency(
                                        invoice.items && invoice.items.length
                                            ? invoice.items.reduce((sum, item) => sum + (parseFloat(item.sub_total) || 0), 0)
                                            : 0
                                    ) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Diskon</span>
                                <span class="text-sm font-medium">- {{ formatCurrency(invoice.discount || 0) }}</span>
                            </div>
                            <div v-if="invoice.taxEnabled" class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">PPN (11%)</span>
                                <span class="text-sm font-medium">{{ formatCurrency(invoice.taxAmount || 0) }}</span>
                            </div>
                            <div class="flex justify-between items-center border-t pt-2 mt-2">
                                <span class="text-sm font-bold">Grand Total</span>
                                <span class="text-sm font-bold">{{ formatCurrency(invoice.grand_total || invoice.totalAmount || 0) }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Uang Muka (DP)</span>
                                <span class="text-sm font-medium">- {{ formatCurrency(invoice.down_payment || invoice.dp || 0) }}</span>
                            </div>
                            <div class="flex justify-between items-center border-t-2 border-blue-600 pt-2 mt-2">
                                <span class="text-base font-bold text-blue-600">SISA TAGIHAN</span>
                                <span class="text-base font-bold text-blue-600">
                                    {{ formatCurrency(
                                        invoice.remaining_payment || (parseFloat(invoice.grand_total || 0) - parseFloat(invoice.down_payment || invoice.dp || 0)) || 0
                                    ) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Pembayaran & Catatan -->
                <div class="border-t mt-8 pt-6">
                    <div class="grid grid-cols-2 gap-8">
                        <div>
                            <p class="font-semibold text-sm text-gray-500 mb-2">Informasi Pembayaran:</p>
                            <p class="text-sm"><span class="font-medium text-gray-700">Bank:</span> BCA</p>
                            <p class="text-sm"><span class="font-medium text-gray-700">No. Rekening:</span> 0322295322</p>
                            <p class="text-sm"><span class="font-medium text-gray-700">Atas Nama:</span> CV. Arjuna</p>
                        </div>
                        <div>
                            <p class="font-semibold text-sm text-gray-500 mb-2">Catatan:</p>
                            <p class="text-sm text-gray-600">{{ invoice.description || invoice.notes || 'Tidak ada catatan tambahan.' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-gray-50 rounded-b-lg text-center">
                <p class="text-sm font-semibold text-gray-700">Terima kasih atas kepercayaan Anda!</p>
                <p class="text-xs text-gray-500 mt-1">Arjuna Print | Kota Padang | cvarjunapadang@gmail.com</p>
            </div>
        </div>
    </div>
  </div>
</template>

<style>
/* ... styles remain the same ... */
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: white;
  }
  .print-area > div > div {
    border: none;
    box-shadow: none;
  }
}
</style>
