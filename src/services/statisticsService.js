import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tambahkan interceptor untuk menyisipkan Bearer token
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

export const statisticsService = {
  /**
   * Ambil ringkasan statistik invoice untuk dashboard/stat card
   * Endpoint: GET /statistics/invoice-summary
   * Response: { total_income, total_receivable, top_products, monthly_sales, customer_sources }
   */
  async getSummary() {
    try {
      const response = await apiClient.get("/statistics/invoice-summary");
      return response.data;
    } catch (error) {
      // TODO: Tambahkan notifikasi error jika diperlukan
      return null;
    }
  },

  /**
   * Ambil statistik detail laporan invoice untuk report
   * Endpoint: GET /statistics/invoice-report?period=thisMonth|lastMonth|thisYear
   * Response: { total_income, total_receivable, top_product, weekly_income, product_sales, invoices }
   */
  async getReport(period = "thisMonth") {
    try {
      const response = await apiClient.get("/statistics/invoice-report", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      // TODO: Tambahkan notifikasi error jika diperlukan
      return null;
    }
  },
};
