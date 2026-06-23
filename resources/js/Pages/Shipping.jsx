import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "@/Layouts/AdminLayout";

const BASE_URL = "http://192.168.115.151:8000";

export default function Shipping() {
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State form disesuaikan dengan ketiadaan POST route (hanya untuk UI modal jika dibuka)
    const [formData, setFormData] = useState({
        customer_name: "",
        tracking_number: "",
        shipping_status: "Menunggu",
    });

    const [shipping, setShipping] = useState([]);

    useEffect(() => {
        fetchShipping();
    }, []);

    // Membaca data orders dari backend Laravel
    const fetchShipping = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${BASE_URL}/api/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );
            // Menyesuaikan jika response berbentuk objek pembungkus pagination/data array langsung
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setShipping(data);
        } catch (error) {
            console.error("Error fetching data:", error.response?.data || error);
        }
    };

    // Placeholder pencegahan tambah data langsung via React
    const handleTambahPengiriman = async (e) => {
        e.preventDefault();
        alert("Fitur Tambah Pengiriman langsung belum didukung oleh API (Gunakan sistem Checkout/Order).");
        setIsModalOpen(false);
    };

    // Mengubah status pengiriman menggunakan endpoint PUT /api/orders/{order_code}/status
            const updateStatus = async (
                order_code,
                shipping_status,
                tracking_number
            ) => {
                try {
                    const token = localStorage.getItem("token");

                    await axios.put(
                        `${BASE_URL}/api/orders/${order_code}/status`,
                        {
                            shipping_status,
                            tracking_number
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: "application/json"
                            }
                        }
                    );

                    await fetchShipping();
                } catch (error) {
                    console.error(
                        "Error updating status:",
                        error.response?.data || error
                    );

                    alert(
                        error.response?.data?.message ||
                        "Terjadi kesalahan saat memperbarui data"
                    );
                }
            };
    // Menghapus data pengiriman menggunakan endpoint DELETE /api/orders/{order_code}
    const handleHapusPengiriman = async (order_code) => {
        if (confirm("Apakah Anda yakin ingin menghapus data pengiriman ini?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${BASE_URL}/api/orders/${order_code}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                });

                // Menghapus item dari state lokal menggunakan callback prev state setelah berhasil
                setShipping(prev =>
                    prev.filter(item => item.order_code !== order_code)
                );
            } catch (error) {
                console.error("Error menghapus data:", error.response?.data || error);
                alert(error.response?.data?.message || "Terjadi kesalahan saat menghapus data");
            }
        }
    };

    // Filter pencarian berdasarkan customer_name, order_code, dan tracking_number
    const filteredShipping = shipping.filter(
        (item) => 
            item.customer_name?.toLowerCase().includes(search.toLowerCase()) || 
            item.order_code?.toLowerCase().includes(search.toLowerCase()) ||
            item.tracking_number?.toLowerCase().includes(search.toLowerCase())
    );

    // Pewarnaan status logistik sesuai instruksi
    const getStatusStyle = (status) => {
        switch (status) {
            case "Menunggu": return "bg-zinc-500/10 text-zinc-500 dark:bg-zinc-500/5";
            case "Diproses": return "bg-amber-500/10 text-amber-500 dark:bg-amber-500/5";
            case "Dikirim": return "bg-blue-500/10 text-blue-400 dark:bg-blue-500/5";
            case "Selesai": return "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/5";
            case "Dibatalkan": return "bg-rose-500/10 text-rose-500 dark:bg-rose-500/5";
            default: return "bg-zinc-800 text-zinc-400 dark:bg-zinc-900";
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 bg-transparent text-slate-800 dark:text-zinc-400 font-sans pb-12 relative">
                
                {/* BANNER HEADER */}
                <div className="relative bg-[#0d1520] dark:bg-zinc-900/50 border-none text-white rounded-3xl p-8 overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5 z-10">
                        <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            DISTRIBUTION LOG V1.4
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Manajemen Pengiriman</h1>
                        <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal max-w-xl">
                            Sistem pemantauan alur ekspedisi logistik secara real-time.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="z-10 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-xs transition active:scale-95 shadow-lg shadow-blue-600/10"
                    >
                        + Tambah Pengiriman
                    </button>
                </div>

                {/* STATS CARDS (Mendukung 6 Status) */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[
                        { label: "Total Resi", val: shipping.length, color: "text-slate-900 dark:text-white" },
                        { label: "Menunggu", val: shipping.filter(s => s.shipping_status === "Menunggu").length, color: "text-zinc-500" },
                        { label: "Diproses", val: shipping.filter(s => s.shipping_status === "Diproses").length, color: "text-amber-500" },
                        { label: "Dikirim", val: shipping.filter(s => s.shipping_status === "Dikirim").length, color: "text-blue-500" },
                        { label: "Selesai", val: shipping.filter(s => s.shipping_status === "Selesai").length, color: "text-emerald-500" },
                        { label: "Dibatalkan", val: shipping.filter(s => s.shipping_status === "Dibatalkan").length, color: "text-rose-500" },
                    ].map((card, i) => (
                        <div key={i} className="rounded-2xl bg-white p-4 border border-slate-100 dark:bg-zinc-900 dark:border-zinc-900 shadow-sm dark:shadow-none">
                            <p className="text-gray-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider leading-tight">{card.label}</p>
                            <h2 className={`text-2xl font-extrabold mt-1 ${card.color}`}>{card.val}</h2>
                        </div>
                    ))}
                </div>

                {/* SEARCH BAR */}
                <div className="bg-white border border-slate-100 dark:bg-zinc-900 dark:border-zinc-900 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 w-full max-w-md bg-slate-50/50 dark:bg-black transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari customer, order code atau nomor resi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent text-xs placeholder-slate-400 dark:placeholder-zinc-700 text-slate-700 dark:text-zinc-200 outline-none border-none p-0 focus:ring-0"
                        />
                    </div>
                </div>

                {/* DATA TABLE */}
                <div className="border border-slate-100 bg-white dark:border-zinc-900 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 font-bold bg-slate-50/70 dark:bg-black/40">
                                    <th className="p-4 pl-6 uppercase">Kode Order</th>
                                    <th className="p-4 uppercase">Customer</th>
                                    <th className="p-4 uppercase">No. Tracking / Resi</th>
                                    <th className="p-4 uppercase text-center">Status</th>
                                    <th className="p-4 pr-6 text-center uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-600 dark:text-zinc-400">
                                {filteredShipping.map((item) => (
                                    <tr key={item.order_code} className="hover:bg-slate-50/80 dark:hover:bg-black/40 transition-colors">
                                        <td className="p-4 pl-6 font-mono text-zinc-500">{item.order_code}</td>
                                        <td className="p-4 text-slate-900 dark:text-white font-bold">{item.customer_name}</td>
                                        <td className="p-4"> <input type="text" placeholder="Masukkan resi"value={item.tracking_number || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                setShipping(prev =>
                                                    prev.map(order =>
                                                        order.order_code === item.order_code
                                                            ? {
                                                                ...order,
                                                                tracking_number: value
                                                            }
                                                            : order
                                                    )
                                                );
                                            }}
                                            className="
                                                w-full
                                                rounded-lg
                                                border
                                                border-slate-200
                                                dark:border-zinc-800
                                                bg-transparent
                                                px-3
                                                py-2
                                                text-xs
                                                outline-none
                                            "
                                        />
                                    </td>
                                        <td className="p-4 text-center">
                                            <select
                                                value={item.shipping_status}
                                                onChange={(e) => updateStatus(item.order_code,e.target.value,item.tracking_number )}
                                                className={`border-none rounded-full px-4 py-1 text-[10px] font-bold outline-none focus:ring-0 cursor-pointer ${getStatusStyle(item.shipping_status)} dark:bg-zinc-950`}
                                            >
                                                <option value="Menunggu">Menunggu</option>
                                                <option value="Diproses">Diproses</option>
                                                <option value="Dikirim">Dikirim</option>
                                                <option value="Selesai">Selesai</option>
                                                <option value="Dibatalkan">Dibatalkan</option>
                                            </select>
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <button 
                                                onClick={() => handleHapusPengiriman(item.order_code)} 
                                                className="text-rose-500 font-bold opacity-60 hover:opacity-100 transition"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredShipping.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-zinc-500">
                                            Tidak ada data pengiriman ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL INPUT */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#0c0d12] rounded-3xl max-w-lg w-full p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Tambah Data Pengiriman</h3>
                                <p className="text-zinc-500 text-xs mt-1 font-medium">Lengkapi detail ekspedisi untuk mencatat resi baru.</p>
                            </div>
                            
                            <form onSubmit={handleTambahPengiriman} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Nama Customer</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="Contoh: Budi Santoso"
                                            className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                            value={formData.customer_name} 
                                            onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Status</label>
                                            <select 
                                                className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer" 
                                                value={formData.shipping_status} 
                                                onChange={(e) => setFormData({...formData, shipping_status: e.target.value})}
                                            >
                                                <option value="Menunggu">Menunggu</option>
                                                <option value="Diproses">Diproses</option>
                                                <option value="Dikirim">Dikirim</option>
                                                <option value="Selesai">Selesai</option>
                                                <option value="Dibatalkan">Dibatalkan</option>
                                            </select>
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest">No. Tracking / Resi</label>
                                            <input
                                                type="text"
                                                value={item.tracking_number || "-"}
                                                readOnly
                                                className=" w-fullrounded-lgborderborder-slate-200dark:border-zinc-800
                                                    bg-transparentpx-3py-2 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setFormData({ customer_name: "", shipping_status: "Menunggu", tracking_number: "" });
                                        }} 
                                        className="flex-1 px-4 py-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                                    >
                                        Batal
                                    </button>
                                   
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}