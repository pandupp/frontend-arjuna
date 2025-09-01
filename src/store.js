import { ref } from 'vue';

// Data inventori (sumber utama untuk item)
export const inventoryItems = ref([
    { id: 1, code: 'ITM-333', name: 'Spanduk Flexi 280gr', price: 25000, stock: 150, unit: 'meter' },
    { id: 2, code: 'ITM-334', name: 'Stiker Vinyl A3+', price: 15000, stock: 300, unit: 'pcs' },
    { id: 3, code: 'ITM-335', name: 'Kartu Nama (box)', price: 50000, stock: 50, unit: 'box' },
    { id: 4, code: 'ITM-336', name: 'Brosur A5 (rim)', price: 450000, stock: 10, unit: 'rim' },
]);

// --- DATA SIMULASI BARU UNTUK PENGUJIAN GRAFIK ---
// Data invoice ini sengaja dibuat untuk bulan September 2025 agar grafik terisi
export const invoices = ref([
    // --- Data untuk "Bulan Ini" (September 2025) ---
    { 
        id: 1, 
        invoiceNumber: 'INV-2025-001', 
        customerName: 'Toko Roti Enak', 
        issueDate: '2025-09-05', // <-- Minggu 1
        dueDate: '2025-09-20', 
        totalAmount: 350000, 
        status: 'Lunas',
        items: [{ selectedItem: { name: 'Stiker Vinyl A3+'}, quantity: 10, unitPrice: 15000, total: 150000 }, { selectedItem: { name: 'Spanduk Flexi 280gr'}, quantity: 8, unitPrice: 25000, total: 200000 }],
        dp: 0,
    },
    { 
        id: 2, 
        invoiceNumber: 'INV-2025-002', 
        customerName: 'Kafe Pagi', 
        issueDate: '2025-09-12', // <-- Minggu 2
        dueDate: '2025-09-27', 
        totalAmount: 800000, 
        status: 'Lunas',
        items: [{ selectedItem: { name: 'Spanduk Flexi 280gr'}, quantity: 32, unitPrice: 25000, total: 800000 }],
        dp: 200000,
    },
    { 
        id: 3, 
        invoiceNumber: 'INV-2025-003', 
        customerName: 'Warung Kopi Senja', 
        issueDate: '2025-09-19', // <-- Minggu 3
        dueDate: '2025-10-04', 
        totalAmount: 450000, 
        status: 'Lunas',
        items: [{ selectedItem: { name: 'Brosur A5 (rim)'}, quantity: 1, unitPrice: 450000, total: 450000 }],
        dp: 0,
    },
    { 
        id: 4, 
        invoiceNumber: 'INV-2025-004', 
        customerName: 'Percetakan Cepat', 
        issueDate: '2025-09-26', // <-- Minggu 4
        dueDate: '2025-10-11', 
        totalAmount: 1250000, 
        status: 'Lunas',
        items: [{ selectedItem: { name: 'Spanduk Flexi 280gr'}, quantity: 50, unitPrice: 25000, total: 1250000 }],
        dp: 500000,
    },
    { 
        id: 5, 
        invoiceNumber: 'INV-2025-005', 
        customerName: 'Amaik syahroni', 
        issueDate: '2025-09-28', 
        dueDate: '2025-10-13', 
        totalAmount: 1482000, 
        status: 'Tertunda',
        items: [{ selectedItem: { name: 'Spanduk Flexi 280gr'}, quantity: 98.8, unitPrice: 15000, total: 1482000 }],
        dp: 0,
    },
    // --- Data untuk "Bulan Lalu" (Agustus 2025) ---
    { 
        id: 6, 
        invoiceNumber: 'INV-2025-000', 
        customerName: 'PT. Angin Ribut', 
        issueDate: '2025-08-15', // <-- Agustus
        dueDate: '2025-08-30', 
        totalAmount: 500000, 
        status: 'Lunas',
        items: [{ selectedItem: { name: 'Kartu Nama (box)'}, quantity: 10, unitPrice: 50000, total: 500000 }],
        dp: 0,
    }
]);

