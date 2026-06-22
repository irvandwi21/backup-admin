import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "@/Layouts/AdminLayout";

const BASE_URL = "http://192.168.115.151:8000";

export default function Users() {
    // 1. SEMUA STATE DIJADIKAN SATU DI ATAS
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // 2. FUNGSI FETCH DATA API
    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${BASE_URL}/api/customers`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil customer", error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // 3. FUNGSI AKSI & HANDLER
    const hapusUser = (id) => {
        if (confirm("Yakin hapus customer?")) {
            setUsers(users.filter((user) => user.id !== id));
        }
    };

    const updateStatus = (id, status) => {
        setUsers(
            users.map((user) =>
                user.id === id ? { ...user, status } : user
            )
        );
    };

    const detailCustomer = (customer) => {
        setSelectedCustomer(customer);
    };

    const filteredUsers = users.filter((user) =>
        user.name ? user.name.toLowerCase().includes(search.toLowerCase()) : false
    );

    // Helper styling warna badge status
    const getStatusStyle = (status) => {
        return status === "Aktif"
            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-transparent"
            : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-500 dark:border-transparent";
    };

    // 4. RETURN JSX UNTUK TAMPILAN
    return (
        <AdminLayout>
            <div className="space-y-6 bg-transparent text-slate-800 dark:text-zinc-400 font-sans pb-12 relative">

                {/* BANNER HEADER */}
                <div className="relative bg-[#0d1520] dark:bg-zinc-900/50 border-none text-white rounded-3xl p-8 overflow-hidden shadow-sm dark:shadow-none">
                    <div className="space-y-1.5 z-10">
                        <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            CUSTOMER DATABASE V1.2
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Manajemen Customer
                        </h1>
                        <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal max-w-xl">
                            Kelola data keanggotaan pelanggan, pantau akumulasi loyalitas belanja, serta konfigurasi status akun.
                        </p>
                    </div>
                </div>

                {/* STATS CARD COUNTER */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                        <p className="text-gray-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Total Customer</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{users.length}</h2>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                        <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider">Customer Aktif</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {users.filter((u) => u.status === "Aktif").length}
                        </h2>
                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mt-1 block">Live Users</span>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                        <p className="text-blue-500 font-bold text-[10px] uppercase tracking-wider">Customer VIP</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {users.filter((u) => u.totalOrder >= 10).length}
                        </h2>
                        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider mt-1 block">&gt;= 10 Orders</span>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                        <p className="text-amber-500 font-bold text-[10px] uppercase tracking-wider">Total Akumulasi Order</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {users.reduce((total, user) => total + (user.totalOrder || 0), 0)}
                        </h2>
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mt-1 block">Checkout Berhasil</span>
                    </div>
                </div>

                {/* FILTERS & SEARCH BOX */}
                <div className="bg-white border border-slate-100 dark:bg-zinc-900 dark:border-zinc-900 rounded-2xl p-4 shadow-sm dark:shadow-none flex items-center justify-between">
                    <div className="flex items-center gap-3 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 w-full max-w-md bg-slate-50/50 dark:bg-black focus-within:border-slate-400 dark:focus-within:border-zinc-700 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 dark:text-zinc-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari data nama customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent text-xs placeholder-slate-400 dark:placeholder-zinc-700 text-slate-700 dark:text-zinc-200 outline-none border-none p-0 focus:ring-0"
                        />
                    </div>
                </div>

                {/* TABLE DATA */}
                <div className="border border-slate-100 bg-white dark:border-zinc-900 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-wider bg-slate-50/70 dark:bg-black/40">
                                    <th className="p-4 pl-6">Nama</th>
                                    <th className="p-4">No HP</th>
                                    <th className="p-4">Total Order</th>
                                    <th className="p-4">Total Belanja</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-center">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-black/40 transition-colors duration-150">
                                            <td className="p-4 pl-6 text-slate-900 dark:text-white font-bold">{user.name}</td>
                                            <td className="p-4 font-mono text-slate-700 dark:text-zinc-400">{user.phone}</td>
                                            <td className="p-4 font-semibold text-slate-800 dark:text-zinc-300">{user.totalOrder}x</td>
                                            <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">
                                                {new Intl.NumberFormat("id-ID", {
                                                    style: "currency", currency: "IDR", maximumFractionDigits: 0,
                                                }).format(user.totalBelanja || 0)}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={user.status}
                                                    onChange={(e) => updateStatus(user.id, e.target.value)}
                                                    className={`border-none rounded-full px-4 py-1 text-[10px] font-bold outline-none focus:ring-0 cursor-pointer transition ${getStatusStyle(user.status)} dark:bg-zinc-950`}
                                                >
                                                    <option value="Aktif">Aktif</option>
                                                    <option value="Nonaktif">Nonaktif</option>
                                                </select>
                                            </td>
                                            <td className="p-4 pr-6">
                                                <div className="flex justify-center gap-1.5">
                                                    <button
                                                        onClick={() => detailCustomer(user)}
                                                        className="text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 dark:bg-zinc-950 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-transparent transition-all font-semibold"
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        onClick={() => hapusUser(user.id)}
                                                        className="text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent transition-all font-semibold"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400 dark:text-zinc-500 font-normal">
                                            Tidak ada data customer yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* MODAL DETAIL CUSTOMER */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-black rounded-2xl max-w-md w-full p-8 border border-slate-100 dark:border-zinc-900 shadow-2xl dark:shadow-none relative">
                        
                        {/* Header Modal */}
                        <div className="mb-6 pb-3 border-b border-slate-100 dark:border-zinc-900">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detail Profile Customer</h3>
                            <p className="text-slate-400 dark:text-zinc-500 text-xs">Informasi lengkap rincian akun dan performa belanja.</p>
                        </div>

                        {/* Detail Info Grid */}
                        <div className="space-y-5 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Nama Lengkap</p>
                                    <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{selectedCustomer.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Status Akun</p>
                                    <div className="mt-1">
                                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border-none ${getStatusStyle(selectedCustomer.status)}`}>
                                            {selectedCustomer.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Alamat Email</p>
                                <p className="font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">{selectedCustomer.email}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Nomor Handphone</p>
                                    <p className="font-mono font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">{selectedCustomer.phone}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Domisili Wilayah</p>
                                    <p className="font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">{selectedCustomer.address || "-"}</p>
                                </div>
                            </div>

                            {/* Inner Card */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-900">
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Frekuensi Order</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{selectedCustomer.totalOrder || 0} Kali Trx</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Akumulasi Belanja</p>
                                    <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency", currency: "IDR", maximumFractionDigits: 0,
                                        }).format(selectedCustomer.totalBelanja || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-zinc-900 mt-6">
                            <button
                                type="button"
                                onClick={() => setSelectedCustomer(null)}
                                className="px-4 py-3 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition text-xs text-center"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}