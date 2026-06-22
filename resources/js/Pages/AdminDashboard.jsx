import { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";

const BASE_URL = "http://192.168.115.151:8000";
const CATEGORIES = ["Laptop", "VGA", "CPU", "RAM", "Storage"];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [chartTimeframe, setChartTimeframe] = useState("bulanan");
    const [loading, setLoading] = useState(true);

    // API Data States
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Management Produk States (Filter & Search)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");

    // Modal Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState("Laptop");
    const [formPrice, setFormPrice] = useState("");
    const [formStock, setFormStock] = useState("");
    const [formImageFile, setFormImageFile] = useState(null); // Menyimpan file asli untuk FormData
    const [formImagePreview, setFormImagePreview] = useState(""); // Menyimpan URL preview

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    // API Configurations
    const token = localStorage.getItem("token");
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    };

    // 1. FETCH ALL DATA (Promise.all)
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resProducts, resOrders, resCustomers] = await Promise.all([
                axios.get(`${BASE_URL}/api/products`, config),
                axios.get(`${BASE_URL}/api/orders`, config),
                axios.get(`${BASE_URL}/api/customers`, config),
            ]);
            setProducts(resProducts.data);
            setOrders(resOrders.data);
            setCustomers(resCustomers.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Gagal mengambil data dari server. Silakan periksa koneksi atau token Anda.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const triggerToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormImageFile(file);
            setFormImagePreview(URL.createObjectURL(file));
        }
    };

    const openAddModal = () => {
        setIsEditing(false); 
        setCurrentProductId(null);
        setFormName(""); 
        setFormCategory("Laptop"); 
        setFormPrice(""); 
        setFormStock(""); 
        setFormImageFile(null);
        setFormImagePreview(""); 
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEditing(true); 
        setCurrentProductId(product.id); 
        setFormName(product.name); 
        setFormCategory(product.category?.name || "Laptop"); 
        setFormPrice(product.price); 
        setFormStock(product.stock); 
        setFormImageFile(null);
        setFormImagePreview(product.image ? `${BASE_URL}/products/${product.image}` : ""); 
        setIsModalOpen(true);
    };

    // 2. CRUD: TAMBAH & EDIT PRODUK
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        
        // Gunakan FormData karena terdapat upload gambar
        const formData = new FormData();
        formData.append("name", formName);
        formData.append("category", formCategory);
        formData.append("price", formPrice);
        formData.append("stock", formStock);
        if (formImageFile) {
            formData.append("image", formImageFile);
        }

        // Untuk metode PUT di Laravel dengan FormData, seringkali membutuhkan spoofing method _method=PUT
        if (isEditing) {
            formData.append("_method", "PUT");
        }

        try {
            setLoading(true);
            if (isEditing) {
                await axios.post(`${BASE_URL}/api/products/${currentProductId}`, formData, {
                    headers: {
                        ...config.headers,
                        "Content-Type": "multipart/form-data",
                    }
                });
                triggerToast("Produk berhasil diperbarui!", "success");
            } else {
                await axios.post(`${BASE_URL}/api/products`, formData, {
                    headers: {
                        ...config.headers,
                        "Content-Type": "multipart/form-data",
                    }
                });
                triggerToast("Produk baru berhasil ditambahkan!", "success");
            }
            setIsModalOpen(false);
            fetchData(); // Refresh data setelah menyimpan
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Gagal menyimpan produk. Silakan periksa kembali inputan Anda.");
            setLoading(false);
        }
    };

    // 3. CRUD: HAPUS PRODUK
    const handleDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            try {
                setLoading(true);
                await axios.delete(`${BASE_URL}/api/products/${id}`, config);
                triggerToast("Produk berhasil dihapus", "error");
                fetchData(); // Refresh data setelah menghapus
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Gagal menghapus produk.");
                setLoading(false);
            }
        }
    };

    // =========================================================
    // DATA KONTROL OTOMATIS BERDASARKAN REAL API
    // =========================================================
    
    // Total Pendapatan / Revenue
    const totalRevenue = orders.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

    // Pemetaan Progress Pengiriman
    const getShippingProgress = (status) => {
        switch (status?.toLowerCase()) {
            case "menunggu": return 20;
            case "diproses": return 50;
            case "dikirim": return 80;
            case "selesai": return 100;
            case "dibatalkan": return 0;
            default: return 0;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "selesai": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
            case "diproses": return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "menunggu": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
            case "dikirim": return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
            default: return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
        }
    };

    // Hitung Top Produk Terlaris (Berdasarkan kemunculan nama produk terbanyak di orders)
    const getTopProducts = () => {
        const counts = {};
        orders.forEach(order => {
            if (order.product_name) {
                counts[order.product_name] = (counts[order.product_name] || 0) + Number(order.qty || 1);
            }
        });

        const sorted = Object.keys(counts).map(name => ({
            name,
            count: counts[name]
        })).sort((a, b) => b.count - a.count).slice(0, 5);

        const maxCount = sorted[0]?.count || 1;
        const colors = ["bg-blue-600", "bg-indigo-600", "bg-cyan-600", "bg-purple-600", "bg-emerald-600"];

        return sorted.map((item, idx) => {
            const percentage = Math.round((item.count / maxCount) * 100);
            return {
                name: item.name,
                width: `w-[${percentage}%]`,
                styleWidth: { width: `${percentage}%` },
                color: colors[idx % colors.length],
                percentage: `${percentage}%`
            };
        });
    };

    // Pembuatan Data Chart Otomatis (Bulanan & Mingguan)
    const getChartData = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        
        if (chartTimeframe === "bulanan") {
            const monthlyRevenue = Array(12).fill(0);
            const monthlyUnits = Array(12).fill(0);

            orders.forEach(order => {
                // Asumsi format data order_code mengandung tanggal (ORD-YYYYMMDD) atau mengelompokkan manual
                // Untuk demo ekstraksi aman, jika tidak ada create_at kita gunakan bulan acak dari order_code atau default Jan
                const match = order.order_code?.match(/(\d{4})(\d{2})(\d{2})/);
                let monthIdx = 0; // default Januari jika gagal parsing
                if (match && match[2]) {
                    monthIdx = parseInt(match[2], 10) - 1;
                }
                if (monthIdx >= 0 && monthIdx < 12) {
                    monthlyRevenue[monthIdx] += Number(order.total_price || 0);
                    monthlyUnits[monthIdx] += Number(order.qty || 1);
                }
            });

            const maxRevenue = Math.max(...monthlyRevenue, 1);

            return months.map((month, idx) => ({
                label: month,
                value: (monthlyRevenue[idx] / maxRevenue) * 100 || 5, // minimal tinggi 5% agar tetap terlihat batangnya
                units: monthlyUnits[idx]
            }));
        } else {
            // Logika Mingguan Sederhana (Membagi order berdasarkan digit terakhir order_code atau hari)
            const weeklyRevenue = Array(4).fill(0);
            const weeklyUnits = Array(4).fill(0);

            orders.forEach((order, idx) => {
                const weekIdx = idx % 4; // Mengelompokkan rotasi sebagai perwakilan mingguan
                weeklyRevenue[weekIdx] += Number(order.total_price || 0);
                weeklyUnits[weekIdx] += Number(order.qty || 1);
            });

            const maxRevenue = Math.max(...weeklyRevenue, 1);
            return Array(4).fill(0).map((_, idx) => ({
                label: `Minggu ${idx + 1}`,
                value: (weeklyRevenue[idx] / maxRevenue) * 100 || 5,
                units: weeklyUnits[idx]
            }));
        }
    };

    // Filter Produk untuk Halaman Kelola Produk
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || product.id?.toString().includes(searchQuery);
        const matchesCategory = selectedCategory === "Semua" || product.category?.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const currentChartData = getChartData();
    const topProductsData = getTopProducts();

    // Logic Status Stok Produk
    const getStockStatus = (stock) => {
        if (stock === 0) return { text: "Habis", class: "bg-red-50 text-red-600" };
        if (stock <= 5) return { text: "Menipis", class: "bg-yellow-50 text-yellow-600" };
        return { text: "Ready", class: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400" };
    };

    return (
        <AdminLayout>
            <div className="space-y-8 p-6 max-w-7xl mx-auto relative select-none">
                
                {/* TOAST ALERT */}
                {toast.show && (
                    <div className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-zinc-900 border border-zinc-800 text-white font-bold text-sm">
                        <span className="text-green-400">{toast.type === 'success' ? '⚡' : '🗑️'}</span>
                        {toast.message}
                    </div>
                )}

                {/* LOADING SPINNER STATE */}
                {loading && (
                    <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600"></div>
                    </div>
                )}

                {/* BACK BUTTON */}
                {activeTab !== "dashboard" && (
                    <button 
                        onClick={() => setActiveTab("dashboard")}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl hover:bg-blue-100 transition"
                    >
                        ← Kembali ke Dashboard Utama
                    </button>
                )}

                {/* ========================================================= */}
                {/* TAMPILAN 1: MAIN DASHBOARD                                */}
                {/* ========================================================= */}
                {activeTab === "dashboard" && (
                    <>
                        {/* HERO BANNER */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-blue-950 to-indigo-950 p-8 md:p-10 text-white shadow-xl border border-zinc-800">
                            <div className="relative z-10 max-w-xl">
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-500/20">V2.2 Core Engine</span>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-3">Dashboard Marketplace</h1>
                                <p className="mt-2 text-zinc-400 font-medium text-sm">Sistem visualisasi inventori dan kontrol distribusi produk otomatis.</p>
                                <div className="mt-6 flex flex-wrap gap-4">
                                    <button onClick={() => setActiveTab("produk")} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg text-sm">Kelola Produk</button>
                                    <button onClick={() => setActiveTab("produk")} className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-6 py-3 rounded-2xl font-bold hover:bg-zinc-700 transition text-sm">Lihat Laporan</button>
                                </div>
                            </div>
                        </div>

                        {/* CARD STATISTIK REAL API */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Pendapatan */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-40 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pendapatan</p>
                                        <h2 className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">{formatRupiah(totalRevenue)}</h2>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">Live</span>
                                </div>
                                <div className="h-10 flex items-end gap-1 pt-2">
                                    {[40, 55, 45, 60, 55, 75, 90].map((val, idx) => <div key={idx} className="flex-1 rounded-t-sm bg-blue-500/40" style={{ height: `${val}%` }} />)}
                                </div>
                            </div>

                            {/* Pesanan */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-40 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pesanan</p>
                                        <h2 className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">{orders.length}</h2>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">Total</span>
                                </div>
                                <div className="h-10 flex items-end gap-1 pt-2">
                                    {[30, 45, 35, 50, 65, 55, 80].map((val, idx) => <div key={idx} className="flex-1 rounded-t-sm bg-blue-500/40" style={{ height: `${val}%` }} />)}
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-40 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Customer</p>
                                        <h2 className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">{customers.length}</h2>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">Aktif</span>
                                </div>
                                <div className="h-10 flex items-end gap-1 pt-2">
                                    {[50, 40, 60, 55, 70, 65, 85].map((val, idx) => <div key={idx} className="flex-1 rounded-t-sm bg-blue-500/40" style={{ height: `${val}%` }} />)}
                                </div>
                            </div>

                            {/* Total Produk */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-40 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Produk</p>
                                        <h2 className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">{products.length}</h2>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800">Items</span>
                                </div>
                                <div className="h-10 flex items-end gap-1 pt-2">
                                    {[80, 82, 85, 88, 90, 92, 94].map((val, idx) => <div key={idx} className="flex-1 rounded-t-sm bg-zinc-400/30" style={{ height: `${val}%` }} />)}
                                </div>
                            </div>
                        </div>

                        {/* CHART DENGAN DATA API KELOMPOK BULANAN / MINGGUAN */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md border border-zinc-100 dark:border-zinc-800">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                        📊 Volume Distribusi Penjualan
                                    </h2>
                                    <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex items-center border dark:border-zinc-700">
                                        <button onClick={() => setChartTimeframe("bulanan")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartTimeframe === "bulanan" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500"}`}>Bulanan</button>
                                        <button onClick={() => setChartTimeframe("mingguan")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartTimeframe === "mingguan" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500"}`}>Mingguan</button>
                                    </div>
                                </div>

                                <div className="h-64 flex items-end gap-3 pt-4 border-b dark:border-zinc-800 px-2">
                                    {currentChartData.map((data, i) => (
                                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 rounded-t-xl relative group cursor-pointer transition-all duration-500" style={{ height: `${data.value}%` }}>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 border border-zinc-800">
                                                {data.units} Unit Keluar
                                            </div>
                                            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{data.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-4" />
                            </div>

                            {/* TARGET RING */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">🎯 Target Konversi</h2>
                                <div className="flex flex-col items-center justify-center py-4 relative">
                                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" className="text-zinc-100 dark:text-zinc-800" fill="transparent" />
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" className="text-blue-600" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 78) / 100} />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-zinc-900 dark:text-white">78%</span>
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Selesai</span>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-zinc-400 text-center">Kurang 22% lagi untuk memenuhi kuota bonus bulanan.</p>
                            </div>
                        </div>

                        {/* JALUR PENGIRIMAN & TOP PRODUK DARI REAL API */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* DATA JALUR PENGIRIMAN REAL */}
                            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-6">📦 Status Jalur Pengiriman</h2>
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 font-bold text-xs uppercase">
                                            <th className="pb-3">Kode Order</th>
                                            <th className="pb-3">Customer</th>
                                            <th className="pb-3">Produk</th>
                                            <th className="pb-3">Tahapan Ring</th>
                                            <th className="pb-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                        {orders.slice(0, 5).map((order, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                                                <td className="py-3.5 font-bold text-zinc-400">{order.order_code}</td>
                                                <td className="py-3.5 font-medium">{order.customer_name}</td>
                                                <td className="py-3.5 font-bold text-zinc-900 dark:text-white">{order.product_name}</td>
                                                <td className="py-3.5 flex items-center gap-3">
                                                    <div className="relative w-7 h-7 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                            <path className="text-zinc-100 dark:text-zinc-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                            <path className="text-indigo-500" strokeDasharray={`${getShippingProgress(order.shipping_status)}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                        </svg>
                                                        <span className="absolute text-[8px] font-black text-zinc-800 dark:text-zinc-200">{getShippingProgress(order.shipping_status)}%</span>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md ${getStatusColor(order.shipping_status)}`}>{order.shipping_status}</span>
                                                </td>
                                                <td className="py-3.5 text-right font-black text-zinc-900 dark:text-white">{formatRupiah(order.total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* TOP PRODUK TERLARIS DIHITUNG OTOMATIS */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md border border-zinc-100 dark:border-zinc-800">
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-6">🔥 Top 5 Produk Terlaris</h2>
                                <div className="space-y-5">
                                    {topProductsData.length === 0 ? (
                                        <p className="text-xs text-zinc-400 font-medium">Belum ada data pesanan.</p>
                                    ) : (
                                        topProductsData.map((prod, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                    <span className="truncate max-w-[150px]">{prod.name}</span>
                                                    <span>{prod.percentage}</span>
                                                </div>
                                                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden border dark:border-zinc-700">
                                                    <div className={`${prod.color} h-full rounded-full transition-all duration-500`} style={prod.styleWidth} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================= */}
                {/* TAMPILAN 2: HALAMAN KELOLA PRODUK REAL                    */}
                {/* ========================================================= */}
                {activeTab === "produk" && (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-zinc-800 dark:text-zinc-100">Kelola Produk</h1>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Total {filteredProducts.length} produk terdisplay</p>
                            </div>
                            <button onClick={openAddModal} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:opacity-90 transition text-sm">＋ Tambah Produk</button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800">
                            <input
                                type="text" placeholder="Cari ID atau nama produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full lg:max-w-md pl-6 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-2xl border dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {["Semua", ...CATEGORIES].map((cat) => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-xs font-bold rounded-xl transition ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400"}`}>{cat}</button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 font-bold text-xs uppercase bg-zinc-50/50 dark:bg-zinc-800/30">
                                            <th className="py-4 px-6">Gambar</th>
                                            <th className="py-4 px-6">Nama Produk</th>
                                            <th className="py-4 px-6">Kategori</th>
                                            <th className="py-4 px-6">Harga</th>
                                            <th className="py-4 px-6 text-center">Stok</th>
                                            <th className="py-4 px-6">Status</th>
                                            <th className="py-4 px-6 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                        {filteredProducts.map((product) => {
                                            const stockStatus = getStockStatus(product.stock);
                                            return (
                                                <tr key={product.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                                                    <td className="py-4 px-6">
                                                        <img 
                                                            src={product.image ? `${BASE_URL}/products/${product.image}` : "https://via.placeholder.com/150?text=No+Image"} 
                                                            alt={product.name} 
                                                            className="w-11 h-11 rounded-xl object-cover border dark:border-zinc-700 bg-zinc-100" 
                                                        />
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-zinc-900 dark:text-white">{product.name}</div>
                                                        <div className="text-[10px] text-zinc-400 font-bold mt-0.5">ID: {product.id}</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2.5 py-1 text-xs font-bold rounded-lg border dark:border-zinc-700">
                                                            {product.category?.name || product.category || "General"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 font-black text-zinc-900 dark:text-zinc-100">{formatRupiah(product.price)}</td>
                                                    <td className="py-4 px-6 text-center font-bold">{product.stock}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-md ${stockStatus.class}`}>{stockStatus.text}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button onClick={() => openEditModal(product)} className="text-blue-600 font-bold text-xs bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-xl">Edit</button>
                                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 font-bold text-xs bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-xl">Hapus</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* MODAL POP-UP FORM REGISTRASI / MODIFIKASI DATA */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border dark:border-zinc-800">
                            <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-4">{isEditing ? "🔧 Modifikasi Data Komponen" : "📦 Registrasi Komponen Baru"}</h2>
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-dashed dark:border-zinc-700">
                                    <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden border">
                                        {formImagePreview ? <img src={formImagePreview} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">📷</div>}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-blue-500 cursor-pointer hover:underline">
                                            Pilih Berkas Foto
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">Mendukung format PNG atau JPG</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Nama Produk / Hardware</label>
                                    <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border dark:border-zinc-700 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Kategori</label>
                                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border dark:border-zinc-700 outline-none text-sm font-bold text-zinc-800 dark:text-white">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Harga (Rp)</label>
                                        <input type="number" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border dark:border-zinc-700 outline-none text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Jumlah Stok</label>
                                        <input type="number" required value={formStock} onChange={(e) => setFormStock(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border dark:border-zinc-700 outline-none text-sm font-bold" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-zinc-800 mt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs hover:opacity-80 transition">Batal</button>
                                    <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition shadow-md shadow-blue-500/20">Simpan Data</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}