import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";

// --- DATA AWAL STATIS ---
const INITIAL_PRODUCTS = [
    { id: "PRD-001", name: "NVIDIA GeForce RTX 4060 Ti", category: "VGA", price: 7500000, stock: 14, status: "Ready", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60", salesGrowth: 85 },
    { id: "PRD-002", name: "ASUS ROG Strix G16 Laptop", category: "Laptop", price: 19500000, stock: 5, status: "Ready", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150&auto=format&fit=crop&q=60", salesGrowth: 62 },
    { id: "PRD-003", name: "AMD Ryzen 7 7800X3D Processor", category: "CPU", price: 6200000, stock: 0, status: "Habis", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=150&auto=format&fit=crop&q=60", salesGrowth: 15 },
];

const STATS_DATA = [
    { title: "Pendapatan", value: "Rp 250 JT", change: "+18%", isPositive: true, sparkline: [30, 45, 40, 65, 50, 85, 90] },
    { title: "Pesanan", value: "1.250", change: "+12%", isPositive: true, sparkline: [20, 35, 60, 45, 70, 65, 80] },
    { title: "Customer", value: "850", change: "+9%", isPositive: true, sparkline: [40, 45, 50, 55, 60, 75, 85] },
    { title: "Performa Toko", value: "94%", change: "Optimal", isPositive: false, sparkline: [80, 82, 85, 88, 90, 92, 94] },
];

const RECENT_ORDERS = [
    { id: "#001", product: "RTX 4060", status: "Selesai", statusColor: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", total: "Rp 7.500.000", progress: 100 },
    { id: "#002", product: "ASUS ROG", status: "Diproses", statusColor: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400", total: "Rp 15.000.000", progress: 65 },
    { id: "#003", product: "Ryzen 7", status: "Validasi", statusColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", total: "Rp 6.200.000", progress: 35 },
];

const TOP_PRODUCTS = [
    { name: "RTX 4060", width: "w-[90%]", color: "bg-blue-600", percentage: "90%" },
    { name: "ASUS ROG", width: "w-[75%]", color: "bg-indigo-600", percentage: "75%" },
    { name: "Ryzen 7", width: "w-[60%]", color: "bg-cyan-600", percentage: "60%" },
];

const CHART_MONTHLY_DATA = [
    { label: "Jan", value: 40, units: 80 }, { label: "Feb", value: 60, units: 120 },
    { label: "Mar", value: 55, units: 110 }, { label: "Apr", value: 80, units: 160 },
    { label: "Mei", value: 75, units: 150 }, { label: "Jun", value: 90, units: 180 },
    { label: "Jul", value: 70, units: 140 }, { label: "Agu", value: 100, units: 200 },
    { label: "Sep", value: 85, units: 170 }, { label: "Okt", value: 95, units: 190 },
    { label: "Nov", value: 110, units: 220 }, { label: "Des", value: 120, units: 240 }
];

const CHART_WEEKLY_DATA = [
    { label: "Minggu 1", value: 45, units: 90 },
    { label: "Minggu 2", value: 85, units: 170 },
    { label: "Minggu 3", value: 60, units: 120 },
    { label: "Minggu 4", value: 115, units: 230 }
];

const CATEGORIES = ["Laptop", "VGA", "CPU", "RAM", "Storage"];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [chartTimeframe, setChartTimeframe] = useState("bulanan");

    // Management Produk States
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
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
    const [formImage, setFormImage] = useState("");

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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
            setFormImage(URL.createObjectURL(file));
        }
    };

    const openAddModal = () => {
        setIsEditing(false); setFormName(""); setFormCategory("Laptop"); setFormPrice(""); setFormStock(""); setFormImage(""); setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEditing(true); setCurrentProductId(product.id); setFormName(product.name); setFormCategory(product.category); setFormPrice(product.price); setFormStock(product.stock); setFormImage(product.image || ""); setIsModalOpen(true);
    };

    const handleSaveProduct = (e) => {
        e.preventDefault();
        const priceNum = Number(formPrice);
        const stockNum = Number(formStock);
        let statusStr = "Ready";
        if (stockNum === 0) statusStr = "Habis";
        else if (stockNum <= 3) statusStr = "Menipis";

        const fallbackImg = formImage || "https://images.unsplash.com/photo-1588702547313-2a3b836bc3f1?w=150&auto=format&fit=crop&q=60";

        if (isEditing) {
            setProducts(products.map(p => p.id === currentProductId ? { ...p, name: formName, category: formCategory, price: priceNum, stock: stockNum, status: statusStr, image: fallbackImg } : p));
            triggerToast("Produk berhasil diperbarui!", "success");
        } else {
            const newId = `PRD-00${products.length + 1}`;
            setProducts([{ id: newId, name: formName, category: formCategory, price: priceNum, stock: stockNum, status: statusStr, image: fallbackImg, salesGrowth: Math.floor(Math.random() * 100) }, ...products]);
            triggerToast("Produk baru berhasil ditambahkan!", "success");
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            setProducts(products.filter(p => p.id !== id));
            triggerToast("Produk berhasil dihapus", "error");
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const currentChartData = chartTimeframe === "bulanan" ? CHART_MONTHLY_DATA : CHART_WEEKLY_DATA;

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
                                    <button onClick={() => setActiveTab("laporan")} className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-6 py-3 rounded-2xl font-bold hover:bg-zinc-700 transition text-sm">Lihat Laporan</button>
                                </div>
                            </div>
                        </div>

                        {/* CARD STATISTIK */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {STATS_DATA.map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-40 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{stat.title}</p>
                                            <h2 className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">{stat.value}</h2>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${stat.isPositive ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <div className="h-10 flex items-end gap-1 pt-2">
                                        {stat.sparkline.map((val, idx) => (
                                            <div key={idx} className={`flex-1 rounded-t-sm ${stat.isPositive ? 'bg-blue-500/40' : 'bg-zinc-400/30'}`} style={{ height: `${val}%` }} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CHART UTAMA DENGAN FILTER TIMEFRAME */}
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

                        {/* ========================================================= */}
                        {/* BAGIAN YANG KEMBALI DITAMBAHKAN (JALUR PENGIRIMAN & TOP)  */}
                        {/* ========================================================= */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-6">📦 Status Jalur Pengiriman</h2>
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 font-bold text-xs uppercase">
                                            <th className="pb-3">ID</th>
                                            <th className="pb-3">Produk</th>
                                            <th className="pb-3">Tahapan Ring</th>
                                            <th className="pb-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                        {RECENT_ORDERS.map((order) => (
                                            <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                                                <td className="py-3.5 font-bold text-zinc-400">{order.id}</td>
                                                <td className="py-3.5 font-bold text-zinc-900 dark:text-white">{order.product}</td>
                                                <td className="py-3.5 flex items-center gap-3">
                                                    <div className="relative w-7 h-7 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                            <path className="text-zinc-100 dark:text-zinc-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                            <path className="text-indigo-500" strokeDasharray={`${order.progress}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                        </svg>
                                                        <span className="absolute text-[8px] font-black text-zinc-800 dark:text-zinc-200">{order.progress}%</span>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md ${order.statusColor}`}>{order.status}</span>
                                                </td>
                                                <td className="py-3.5 text-right font-black text-zinc-900 dark:text-white">{order.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md border border-zinc-100 dark:border-zinc-800">
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-6">🔥 Top Kategori Efisiensi</h2>
                                <div className="space-y-5">
                                    {TOP_PRODUCTS.map((prod, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                <span>{prod.name}</span>
                                                <span>{prod.percentage}</span>
                                            </div>
                                            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden border dark:border-zinc-700">
                                                <div className={`${prod.color} ${prod.width} h-full rounded-full`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================= */}
                {/* TAMPILAN 2: HALAMAN KELOLA PRODUK                          */}
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
                                            <th className="py-4 px-6">Grafik Laju</th>
                                            <th className="py-4 px-6">Status</th>
                                            <th className="py-4 px-6 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                                                <td className="py-4 px-6">
                                                    <img src={product.image} alt="thumb" className="w-11 h-11 rounded-xl object-cover border dark:border-zinc-700 bg-zinc-100" />
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-zinc-900 dark:text-white">{product.name}</div>
                                                    <div className="text-[10px] text-zinc-400 font-bold mt-0.5">{product.id}</div>
                                                </td>
                                                <td className="py-4 px-6"><span className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2.5 py-1 text-xs font-bold rounded-lg border dark:border-zinc-700">{product.category}</span></td>
                                                <td className="py-4 px-6 font-black text-zinc-900 dark:text-zinc-100">{formatRupiah(product.price)}</td>
                                                <td className="py-4 px-6 text-center font-bold">{product.stock}</td>
                                                <td className="py-4 px-6 w-32">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${product.salesGrowth || 30}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-400">{product.salesGrowth || 30}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-md ${product.status === "Ready" ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400" : product.status === "Menipis" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"}`}>{product.status}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button onClick={() => openEditModal(product)} className="text-blue-600 font-bold text-xs bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-xl">Edit</button>
                                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 font-bold text-xs bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-xl">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* MODAL POP-UP */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border dark:border-zinc-800">
                            <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-4">{isEditing ? "🔧 Modifikasi Data Komponen" : "📦 Registrasi Komponen Baru"}</h2>
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-dashed dark:border-zinc-700">
                                    <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden border">
                                        {formImage ? <img src={formImage} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">📷</div>}
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
                                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border dark:border-zinc-700 outline-none text-sm font-bold">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Harga (Rp)</label>
                                        <input type="number" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border dark:border-zinc-700 outline-none text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Stok Gudang</label>
                                        <input type="number" required value={formStock} onChange={(e) => setFormStock(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border dark:border-zinc-700 outline-none text-sm font-bold" />
                                    </div>
                                </div>
                                <div className="pt-2 flex items-center justify-end gap-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl">Batalkan</button>
                                    <button type="submit" className="px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-lg">Simpan Data</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}