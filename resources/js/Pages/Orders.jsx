import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "@/Layouts/AdminLayout";

// BASE_URL dideklarasikan sekali di luar komponen agar global dan aman dari hoisting error
const BASE_URL = "http://192.168.115.151:8000"; 

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Semua");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        customer: "",
        product: "",
        total: "",
        payment: "Lunas"
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    // 1. Ketentuan Mapping Data API & items array fallback
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${BASE_URL}/api/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = response.data.map((item) => ({
                db_id: item.id,
                id: item.order_code, // order.id === order_code untuk kebutuhan parameter route backend
                customer: item.customer_name,
                items: item.items || [], // Menyimpan array asli untuk iterasi badge hardware
                product: item.items?.map(i => i.product_name).join(", ") || "-",
                total: Number(item.total_price),
                status: item.shipping_status,
                payment: item.payment_status,
                payment_method: item.payment_method,
                tracking_number: item.tracking_number,
                date: new Date(item.created_at).toLocaleDateString("id-ID"),
            }));

            setOrders(data);
        } catch (error) {
            console.error("Gagal mengambil data order", error);
        }
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", { 
            style: "currency", 
            currency: "IDR", 
            maximumFractionDigits: 0 
        }).format(angka);
    };

    const openAddModal = () => {
        setForm({ customer: "", product: "", total: "", payment: "Lunas" });
        setShowModal(true);
    };

    const simpanPesanan = (e) => {
        e.preventDefault();
        if (!form.customer || !form.product || !form.total) {
            alert("Lengkapi semua data utama transaksi!");
            return;
        }

        const newOrder = {
            id: "ORD" + Math.floor(100 + Math.random() * 900),
            customer: form.customer,
            product: form.product,
            items: [{ product_name: form.product, qty: 1, subtotal: Number(form.total) }],
            total: Number(form.total),
            status: "Diproses",
            payment: form.payment,
            payment_method: "COD",
            tracking_number: null,
            date: new Date().toLocaleDateString("id-ID"),
        };

        setOrders([newOrder, ...orders]);
        setShowModal(false);
    };

    // 5. Ketentuan Tombol Hapus menggunakan order_code (order.id)
    const hapusPesanan = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus arsip transaksi ini dari database secara permanen?")) {
            try {
                const token = localStorage.getItem("token");
                
                await axios.delete(`${BASE_URL}/api/orders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                // Mengeluarkan pesanan dari state lokal setelah berhasil
                setOrders(orders.filter((order) => order.id !== id));
                alert("Pesanan berhasil dihapus.");
            } catch (error) {
                console.error("Gagal menghapus pesanan:", error);
                alert("Gagal menghapus data dari database. Silakan coba lagi.");
            }
        }
    };

    // 3 & 4. Ketentuan Dropdown Update Status & Auto Refresh untuk Resi Otomatis Backend
    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `${BASE_URL}/api/orders/${id}/status`,
                { shipping_status: status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            // Cukup refresh data setelah update status agar nomor resi baru dari backend langsung termuat
            await fetchOrders();
        } catch (error) {
            console.error("Gagal memperbarui status alur:", error);
            alert("Gagal menyimpan perubahan status ke database.");
        }
    };

    const detailPesanan = (order) => {
        setSelectedOrder(order);
    };

    const filteredOrders = orders.filter((order) => {
        const cocokSearch = order.customer.toLowerCase().includes(search.toLowerCase()) || order.product.toLowerCase().includes(search.toLowerCase());
        const cocokFilter = filter === "Semua" ? true : order.status === filter;
        return !search ? cocokFilter : cocokSearch && cocokFilter;
    });

    const totalPendapatan = orders.reduce((total, item) => total + item.total, 0);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Diproses":
                return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
            case "Dikirim":
                return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
            case "Selesai":
                return "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30";
            case "Dibatalkan":
                return "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
            default:
                return "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
        }
    };

    const getDotStyle = (status) => {
        switch (status) {
            case "Diproses": return "bg-amber-500";
            case "Dikirim": return "bg-blue-500";
            case "Selesai": return "bg-green-500";
            case "Dibatalkan": return "bg-red-500";
            default: return "bg-zinc-400";
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 p-6 max-w-7xl mx-auto select-none text-zinc-800 dark:text-zinc-100">

                {/* HERO / HEADER PANEL */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-slate-950 to-zinc-950 p-8 text-white shadow-xl border border-zinc-800">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-500/20">Distribution Log v1.4</span>
                            <h1 className="text-4xl font-black tracking-tight mt-2 text-white">Manajemen Pesanan</h1>
                            <p className="text-sm text-zinc-400 font-medium mt-1">Sistem pemantauan alur transaksi dan status pengiriman unit ekosistem.</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition text-sm flex-shrink-0"
                        >
                            ＋ Tambah Pesanan
                        </button>
                    </div>
                </div>

                {/* CARDS STATISTIK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { title: "Total Pesanan", value: orders.length, suffix: "Transaksi" },
                        { title: "Antrean Proses", value: orders.filter((o) => o.status === "Diproses").length, suffix: "Pending" },
                        { title: "Sedang Dikirim", value: orders.filter((o) => o.status === "Dikirim").length, suffix: "Kurir" },
                        { title: "Selesai Serah Terima", value: orders.filter((o) => o.status === "Selesai").length, suffix: "Sukses" },
                        { title: "Akumulasi Pendapatan", value: formatRupiah(totalPendapatan), suffix: "Gross Profit", isPrice: true },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-36 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider truncate">{card.title}</p>
                                <h2 className={`font-black mt-2 tracking-tight text-zinc-900 dark:text-white ${card.isPrice ? "text-xl text-blue-600 dark:text-blue-400" : "text-3xl"}`}>{card.value}</h2>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{card.suffix}</span>
                        </div>
                    ))}
                </div>

                {/* SEARCH FILTER BOX */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Cari transaksi berdasarkan nama customer atau produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full flex-1 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-2xl px-5 py-3 text-sm placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full sm:w-48 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="Semua">📌 Semua Status</option>
                        <option value="Diproses">⏳ Diproses</option>
                        <option value="Dikirim">📦 Dikirim</option>
                        <option value="Selesai">✅ Selesai</option>
                        <option value="Dibatalkan">❌ Dibatalkan</option>
                    </select>
                </div>

                {/* TABEL DATA TRANSAKSI */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 font-bold text-xs uppercase bg-zinc-50/50 dark:bg-zinc-800/30 whitespace-nowrap">
                                    <th className="py-4 px-6">ID Transaksi</th>
                                    <th className="py-4 px-6">Customer</th>
                                    <th className="py-4 px-6">Item Hardware</th>
                                    <th className="py-4 px-6">Total Nilai</th>
                                    <th className="py-4 px-6">Status Bayar</th>
                                    <th className="py-4 px-6">Metode Bayar</th>
                                    <th className="py-4 px-6 text-center">Status Alur</th>
                                    <th className="py-4 px-6">Tanggal</th>
                                    <th className="py-4 px-6 text-center">Aksi Operasional</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 transition duration-150">
                                        <td className="py-4 px-6 font-mono text-xs font-bold text-zinc-400">{order.id}</td>
                                        <td className="py-4 px-6 font-bold text-zinc-900 dark:text-white text-base">{order.customer}</td>
                                        
                                        {/* 2. Ketentuan Format Baru Item Hardware dari array items */}
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                {order.items?.map((item, index) => (
                                                    <span
                                                        key={index}
                                                        className="
                                                            bg-zinc-100
                                                            dark:bg-zinc-800
                                                            px-2
                                                            py-1
                                                            rounded-lg
                                                            text-xs
                                                            font-bold
                                                            w-fit
                                                        "
                                                    >
                                                        {item.product_name} x{item.qty}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatRupiah(order.total)}</td>
                                        
                                        {/* Status Bayar */}
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${order.payment === "PAID" || order.payment === "Lunas" ? "text-green-500 bg-green-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                                                {order.payment}
                                            </span>
                                        </td>
                                        
                                        {/* Metode Bayar */}
                                        <td className="py-4 px-6">
                                            <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold">
                                                {order.payment_method || "COD"}
                                            </span>
                                        </td>
                                        
                                        {/* Status Alur Dropdown */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex justify-center items-center">
                                                <div className={`relative inline-flex items-center gap-2 pl-3.5 pr-8 py-1.5 text-xs font-black rounded-full border tracking-wider transition ${getStatusStyle(order.status)}`}>
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${getDotStyle(order.status)}`}></span>
                                                    <span className="select-none pointer-events-none">{order.status}</span>
                                                    <span className="absolute right-3 pointer-events-none text-[9px] opacity-70 font-sans">▼</span>

                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                    >
                                                        <option value="Pending" className="text-zinc-900 bg-white">Pending</option>
                                                        <option value="Diproses" className="text-zinc-900 bg-white">Diproses</option>
                                                        <option value="Dikirim" className="text-zinc-900 bg-white">Dikirim</option>
                                                        <option value="Selesai" className="text-zinc-900 bg-white">Selesai</option>
                                                        <option value="Dibatalkan" className="text-zinc-900 bg-white">Dibatalkan</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{order.date}</td>
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex gap-1.5 justify-center">
                                                <button
                                                    onClick={() => detailPesanan(order)}
                                                    className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:opacity-80 transition"
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() => hapusPesanan(order.id)}
                                                    className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:opacity-80 transition"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* POP-UP MODAL INPUT TAMBAH PESANAN */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto text-zinc-900 dark:text-white">
                        <div className="mb-5">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                                📦 Registrasi Transaksi Baru
                            </h2>
                            <p className="text-xs text-zinc-400 font-medium mt-1">Lengkapi data invoice penjualan untuk meregistrasikan pesanan ke sistem log distribusi.</p>
                        </div>

                        <form onSubmit={simpanPesanan} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Nama Customer / Pembeli</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Masukkan nama lengkap customer..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={form.customer}
                                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Item Komponen / Hardware</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: RTX 4060, ASUS ROG..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={form.product}
                                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Harga (IDR)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Contoh: 8000000"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-bold"
                                        value={form.total}
                                        onChange={(e) => setForm({ ...form, total: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Verifikasi Finansial</label>
                                    <select
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-bold"
                                        value={form.payment}
                                        onChange={(e) => setForm({ ...form, payment: e.target.value })}
                                    >
                                        <option value="Lunas">🟢 Lunas</option>
                                        <option value="Pending">🟡 Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3 border-t dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-zinc-900 text-white dark:bg-white dark:text-black py-2.5 rounded-xl text-xs font-bold transition shadow-md hover:opacity-90"
                                >
                                    Buat Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6 & 7. MODAL DETAIL PESANAN YANG DIPERBAIKI */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl w-full max-w-md shadow-2xl text-zinc-900 dark:text-white">
                        <div className="mb-6 text-center">
                            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">{selectedOrder.id}</span>
                            <h2 className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">Arsip Detail Transaksi</h2>
                        </div>

                        <div className="space-y-3.5 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border dark:border-zinc-800/80">
                            
                            {/* Kode Order */}
                            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Kode Order</span>
                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedOrder.id}</span>
                            </div>

                            {/* Customer */}
                            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Customer</span>
                                <span className="font-black text-zinc-950 dark:text-white text-base">{selectedOrder.customer}</span>
                            </div>

                            {/* Semua Item Hardware (.items?.map) */}
                            <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="block font-bold text-zinc-400 text-xs uppercase tracking-wider mb-2">Semua Item Hardware</span>
                                <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl text-xs font-medium">
                                            <span className="text-zinc-700 dark:text-zinc-300">{item.product_name}</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">x{item.qty}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Nilai */}
                            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Total</span>
                                <span className="font-black text-blue-600 dark:text-blue-400">{formatRupiah(selectedOrder.total)}</span>
                            </div>

                            {/* Metode Pembayaran */}
                            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Metode Pembayaran</span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedOrder.payment_method || "COD"}</span>
                            </div>

                            {/* Status Pembayaran */}
                            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Status Pembayaran</span>
                                <span className={`font-bold ${selectedOrder.payment === "PAID" || selectedOrder.payment === "Lunas" ? "text-green-500" : "text-amber-500"}`}>
                                    {selectedOrder.payment}
                                </span>
                            </div>

                            {/* Status Pengiriman */}
                            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Status Pengiriman</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase border tracking-wider ${getStatusStyle(selectedOrder.status)}`}>
                                    <span className={`w-1 h-1 rounded-full ${getDotStyle(selectedOrder.status)}`}></span>
                                    {selectedOrder.status}
                                </span>
                            </div>

                            {/* Tracking Number (Ketentuan Baru) */}
                            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Tracking Number</span>
                                <span className="font-mono text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-300">
                                    {selectedOrder.tracking_number || "-"}
                                </span>
                            </div>

                            {/* Tanggal */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Tanggal</span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedOrder.date}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full mt-6 bg-zinc-900 text-white dark:bg-white dark:text-black py-3 rounded-2xl text-xs font-bold shadow-md hover:opacity-90 transition"
                        >
                            Tutup Riwayat
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}