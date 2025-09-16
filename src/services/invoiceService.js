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
  // Fungsi untuk mengambil SEMUA invoice dengan pagination dan search
  async getAll(page = 1, perPage = 10, search = "") {
    // 3. Cek "saklar" VITE_MOCK_API dari file .env
    if (import.meta.env.VITE_MOCK_API === "true") {
      const invoiceStore = useInvoiceStore();
      // Dummy pagination
      const allInvoices = invoiceStore.invoices;
      const filtered = search
        ? allInvoices.filter(
            (inv) =>
              inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
              inv.invoice_number.toLowerCase().includes(search.toLowerCase()),
          )
        : allInvoices;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paged = filtered.slice(start, end);
      return Promise.resolve({
        data: paged,
        pagination: {
          current_page: page,
          per_page: perPage,
          total: filtered.length,
          last_page: Math.ceil(filtered.length / perPage),
          from: start + 1,
          to: Math.min(end, filtered.length),
          has_more_pages: end < filtered.length,
        },
      });
    } else {
      try {
        const response = await apiClient.get("/invoice", {
          params: {
            page,
            per_page: perPage,
            search,
          },
        });
        // Respons API: { status, data, pagination, message }
        return {
          data: response.data.data,
          pagination: response.data.pagination,
        };
      } catch (error) {
        return {
          data: [],
          pagination: {
            current_page: page,
            per_page: perPage,
            total: 0,
            last_page: 1,
            from: 0,
            to: 0,
            has_more_pages: false,
          },
        };
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
      // Data sudah dalam format yang benar dari modal
      const payload = {
        customer_name: newInvoiceData.customer_name,
        customer_phone: newInvoiceData.customer_phone,
        description: newInvoiceData.description,
        source: newInvoiceData.source,
        due_date: newInvoiceData.due_date,
        status: newInvoiceData.status || "pending",
        discount: parseFloat(newInvoiceData.discount || 0),
        down_payment: parseFloat(newInvoiceData.down_payment || 0),
        tax_enabled: newInvoiceData.tax_enabled || false,
        items: newInvoiceData.items,
      };

      console.log("=== INVOICE SERVICE DEBUG ===");
      console.log("Received data:", newInvoiceData);
      console.log("Payload to send:", payload);
      console.log("Payload JSON:", JSON.stringify(payload, null, 2));

      try {
        const response = await apiClient.post("/invoice", payload);
        console.log("API Response:", response.data);
        return response.data.data;
      } catch (error) {
        console.error("=== API ERROR ===");
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        console.error("Error message:", error.message);
        console.error("Full error:", error);

        if (error.response?.data?.errors) {
          console.error("Validation errors:", error.response.data.errors);
        }

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
      // Data sudah dalam format yang benar dari modal
      const payload = {
        customer_name: updatedData.customer_name,
        customer_phone: updatedData.customer_phone,
        description: updatedData.description,
        source: updatedData.source,
        due_date: updatedData.due_date,
        status: updatedData.status,
        discount: parseFloat(updatedData.discount || 0),
        down_payment: parseFloat(updatedData.down_payment || 0),
        tax_enabled: updatedData.tax_enabled || false,
        items: updatedData.items,
      };

      console.log("=== UPDATE INVOICE SERVICE DEBUG ===");
      console.log("Update ID:", id);
      console.log("Received data:", updatedData);
      console.log("Payload to send:", payload);

      try {
        const response = await apiClient.put(`/invoice/${id}`, payload);
        console.log("Update API Response:", response.data);
        return response.data;
      } catch (error) {
        console.error("=== UPDATE API ERROR ===");
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        console.error("Full error:", error);
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
