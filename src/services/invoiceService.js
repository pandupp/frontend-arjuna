import axios from "axios";
// Kita tetap butuh store untuk mengambil data dummy di mode demo
import { useInvoiceStore } from "../stores/invoice";

// 1. Konfigurasi koneksi ke backend menggunakan URL dari file .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tambahkan interceptor untuk menyisipkan token otentikasi
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 2. Inilah "Jembatan" atau "Pusat Logistik" kita
export const invoiceService = {
  // Fungsi untuk mengambil SEMUA invoice
  async getAll() {
    // 3. Cek "saklar" VITE_MOCK_API dari file .env
    if (import.meta.env.VITE_MOCK_API === "true") {
      const invoiceStore = useInvoiceStore();
      // Mengembalikan data dummy sebagai Promise agar perilakunya sama seperti panggilan API
      return Promise.resolve(invoiceStore.invoices);
    } else {
      try {
        const response = await apiClient.get("/invoice");
        return response.data.data; // Mengembalikan array 'data' dari response backend
      } catch (error) {
        return []; // Kembalikan array kosong jika terjadi error
      }
    }
  },

  // Contoh fungsi untuk membuat invoice BARU
  async create(newInvoiceData) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const invoiceStore = useInvoiceStore();
      invoiceStore.addNewInvoice(newInvoiceData); // Panggil action di store
      return Promise.resolve(newInvoiceData);
    } else {
      // Transformasi data ke format yang diinginkan backend
      const payload = {
        customer_name: newInvoiceData.customerName,
        source: newInvoiceData.source,
        due_date: newInvoiceData.dueDate,
        status: newInvoiceData.status || "Belum Dibayar",
        discount: parseFloat(newInvoiceData.discount || 0),
        tax_enabled: newInvoiceData.taxEnabled || false,
        items: newInvoiceData.items.map((item) => ({
          inventory_id: item.inventory_id,
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(item.price),
        })),
      };

      try {
        const response = await apiClient.post("/invoice", payload);
        return response.data.data;
      } catch (error) {
        throw error; // Lemparkan error agar komponen bisa menanganinya
      }
    }
  },

  // Fungsi untuk mengupdate status invoice (contoh: mark as paid)
  async updateStatus(id, status) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const invoiceStore = useInvoiceStore();
      invoiceStore.markInvoiceAsPaid(id); // Panggil action di store
      return Promise.resolve();
    } else {
      try {
        const response = await apiClient.patch(`/invoice/${id}`, {
          status: status,
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Fungsi untuk mengupdate invoice secara keseluruhan
  async update(id, updatedData) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const invoiceStore = useInvoiceStore();
      invoiceStore.updateInvoice(updatedData); // Panggil action di store
      return Promise.resolve(updatedData);
    } else {
      // Transformasi data ke format yang diinginkan backend
      const payload = {
        customer_name: updatedData.customerName,
        source: updatedData.source,
        due_date: updatedData.dueDate,
        status: updatedData.status,
        discount: parseFloat(updatedData.discount || 0),
        tax_enabled: updatedData.taxEnabled || false,
        items: updatedData.items.map((item) => ({
          inventory_id: item.inventory_id,
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(item.price),
        })),
      };

      try {
        const response = await apiClient.put(`/invoice/${id}`, payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Fungsi untuk mengambil invoice berdasarkan ID
  async getById(id) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const invoiceStore = useInvoiceStore();
      const invoice = invoiceStore.invoices.find((inv) => inv.id === id);
      return Promise.resolve(invoice || null);
    } else {
      try {
        const response = await apiClient.get(`/invoice/${id}`);
        return response.data.data;
      } catch (error) {
        return null;
      }
    }
  },

  async delete(id) {
    if (import.meta.env.VITE_MOCK_API === "true") {
      const invoiceStore = useInvoiceStore();
      invoiceStore.deleteInvoice(id); // Panggil action di store
      return Promise.resolve();
    } else {
      try {
        await apiClient.delete(`/invoice/${id}`);
        return Promise.resolve();
      } catch (error) {
        throw error; // Lemparkan error agar komponen bisa menanganinya
      }
    }
  },
};
