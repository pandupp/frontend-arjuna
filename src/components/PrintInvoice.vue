<script setup>
defineProps({
  invoice: Object,
});

const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    value = 0;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
                    <p class="text-sm text-gray-600 mt-1">#{{ invoice.invoiceNumber }}</p>
                </div>
            </div>

            <div class="p-6">
                <!-- Info Pelanggan & Tanggal -->
                <div class="grid grid-cols-2 gap-12 mb-8">
                    <div>
                        <p class="font-semibold text-sm text-gray-500 mb-1">DITAGIHKAN KEPADA</p>
                        <p class="text-base font-bold text-gray-900">{{ invoice.customerName }}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-sm text-gray-500 mb-1">TANGGAL TERBIT</p>
                        <p class="text-base text-gray-800">{{ formatDate(invoice.issueDate) }}</p>
                        
                        <!-- JATUH TEMPO (KONDISIONAL) -->
                        <div v-if="invoice.dueDateEnabled && invoice.dueDate" class="mt-3">
                            <p class="font-semibold text-sm text-gray-500 mb-1">JATUH TEMPO</p>
                            <p class="text-base font-bold text-red-600">{{ formatDate(invoice.dueDate) }}</p>
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
                                <td class="py-3 px-4 font-medium">{{ item.description || (item.selectedItem && item.selectedItem.name) }}</td>
                                <td class="py-3 px-4 text-center">{{ item.quantity }}</td>
                                <td class="py-3 px-4 text-right">{{ formatCurrency(item.unitPrice) }}</td>
                                <td class="py-3 px-4 text-right font-semibold">{{ formatCurrency(item.total) }}</td>
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
                                <span class="text-sm font-medium">{{ formatCurrency(invoice.subtotal || 0) }}</span>
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
                                <span class="text-sm font-bold">{{ formatCurrency(invoice.totalAmount || 0) }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Uang Muka (DP)</span>
                                <span class="text-sm font-medium">- {{ formatCurrency(invoice.dp || 0) }}</span>
                            </div>
                            <div class="flex justify-between items-center border-t-2 border-blue-600 pt-2 mt-2">
                                <span class="text-base font-bold text-blue-600">SISA TAGIHAN</span>
                                <span class="text-base font-bold text-blue-600">{{ formatCurrency(invoice.sisaTagihan || 0) }}</span>
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
                            <p class="text-sm text-gray-600">{{ invoice.notes || 'Tidak ada catatan tambahan.' }}</p>
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
