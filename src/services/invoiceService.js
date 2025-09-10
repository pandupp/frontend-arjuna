import axios from 'axios';
// Kita tetap butuh store untuk mengambil data dummy di mode demo
import { useInvoiceStore } from '../stores/invoice';

// 1. Konfigurasi koneksi ke backend menggunakan URL dari file .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Di sini Anda bisa menambahkan header lain seperti token otentikasi nanti
  }
});

// 2. Inilah "Jembatan" atau "Pusat Logistik" kita
export const invoiceService = {

  // Fungsi untuk mengambil SEMUA invoice
  async getAll() {
    // 3. Cek "saklar" VITE_MOCK_API dari file .env
    if (import.meta.env.VITE_MOCK_API === 'true') {
      console.log("MODE DEMO: Mengambil data invoice dari Pinia Store.");
      const invoiceStore = useInvoiceStore();
      // Mengembalikan data dummy sebagai Promise agar perilakunya sama seperti panggilan API
      return Promise.resolve(invoiceStore.invoices);
    } else {
      console.log("MODE PRODUKSI: Menghubungi backend untuk mengambil data invoice...");
      try {
        const response = await apiClient.get('/invoices');
        return response.data; // Mengembalikan data dari backend
      } catch (error) {
        console.error("Gagal mengambil data invoice dari backend:", error);
        return []; // Kembalikan array kosong jika terjadi error
      }
    }
  },
  
  // Contoh fungsi untuk membuat invoice BARU
  async create(newInvoiceData) {
     if (import.meta.env.VITE_MOCK_API === 'true') {
        console.log("MODE DEMO: Menyimpan invoice baru ke Pinia Store.");
        const invoiceStore = useInvoiceStore();
        invoiceStore.addNewInvoice(newInvoiceData); // Panggil action di store
        return Promise.resolve(newInvoiceData);
     } else {
        console.log("MODE PRODUKSI: Mengirim data invoice baru ke backend...");
        try {
            const response = await apiClient.post('/invoices', newInvoiceData);
            return response.data;
        } catch (error) {
            console.error("Gagal membuat invoice baru di backend:", error);
            throw error; // Lemparkan error agar komponen bisa menanganinya
        }
     }
  }
  
  // Di sini nanti kita bisa tambahkan fungsi lain seperti:
  // async getById(id) { ... }
  // async update(id, data) { ... }
  // async delete(id) { ... }
};
