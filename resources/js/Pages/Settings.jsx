import { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";

export default function Settings() {
    // State Loading & Submitting
    const [loading, setLoading] = useState(true);
    const [submittingProfile, setSubmittingProfile] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);

    // State Statistik Otomatis dari API
    const [stats, setStats] = useState({
        totalProduk: 0,
        totalCustomer: 0,
        revenue: 0,
    });

    // State Form Profil Utama Toko
    const [storeName, setStoreName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // State Form Kredensial Keamanan
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Konfigurasi API
    const BASE_URL = "http://192.168.115.151:8000";
    const token = localStorage.getItem("token");
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    };

    // Fungsi Format Rupiah
    const formatRupiah = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Mengambil data dari API saat pertama kali komponen dimuat
    useEffect(() => {
        Promise.all([
            axios.get(`${BASE_URL}/api/settings/profile`, config),
            axios.get(`${BASE_URL}/api/orders`, config),
            axios.get(`${BASE_URL}/api/customers`, config),
            axios.get(`${BASE_URL}/api/products`, config)
        ])
        .then(([profileRes, ordersRes, customersRes, productsRes]) => {
            // 1. Isi Form Otomatis dari API Profile
            const profile = profileRes.data || {};
            setStoreName(profile.store_name || "");
            setEmail(profile.email || "");
            setPhone(profile.phone || "");
            setAddress(profile.address || "");

            // 2. Hitung Statistik Otomatis
            const orders = ordersRes.data || [];
            const customers = customersRes.data || [];
            const products = productsRes.data || [];

            const calculatedRevenue = orders.reduce(
                (sum, item) => sum + Number(item.total_price || 0),
                0
            );

            setStats({
                totalProduk: products.length,
                totalCustomer: customers.length,
                revenue: calculatedRevenue,
            });

            setLoading(false);
        })
        .catch((error) => {
            console.error("Gagal mengambil data pengaturan:", error);
            alert("Gagal memuat konfigurasi dari server. Pastikan token valid.");
            setLoading(false);
        });
    }, []);

    // Fungsi menyimpan Profil Toko ke Backend API
    const simpanPerubahan = () => {
        if (!email || !phone || !address) {
            alert("Harap lengkapi email, nomor handphone, dan alamat domisili.");
            return;
        }

        setSubmittingProfile(true);
             axios.put(`${BASE_URL}/api/settings/profile`, {
            store_name: storeName,
            email,
            phone,
            address
        }, config)
        .then((response) => {
            alert(response.data?.message || "Profil berhasil diperbarui!");
        })
        .catch((error) => {
            console.error(error);
            alert(error.response?.data?.message || "Gagal memperbarui profil toko.");
        })
        .finally(() => {
            setSubmittingProfile(false);
        });
    };

    // Fungsi memperbarui Password ke Backend API
    const updatePassword = () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("Lengkapi semua password");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Konfirmasi password tidak cocok");
            return;
        }

        setSubmittingPassword(true);
        axios.put(`${BASE_URL}/api/settings/password`, {
            old_password: oldPassword,
            new_password: newPassword
        }, config)
        .then((response) => {
            alert(response.data?.message || "Password berhasil diubah!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        })
        .catch((error) => {
            console.error(error);
            alert(error.response?.data?.message || "Gagal memperbarui password. Pastikan kata sandi lama benar.");
        })
        .finally(() => {
            setSubmittingPassword(false);
        });
    };

    return (
        <AdminLayout>
            {/* Base Text & Layout: Siang slate-800, Malam zinc-400 */}
            <div className="space-y-6 bg-transparent text-slate-800 dark:text-zinc-400 font-sans pb-12">

                {/* BANNER HEADER */}
                <div className="relative bg-[#0d1520] dark:bg-zinc-900/50 border-none text-white rounded-3xl p-8 overflow-hidden shadow-sm dark:shadow-none">
                    <div className="space-y-1.5 z-10">
                        <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            SYSTEM ENGINE V1.4
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Pengaturan Toko
                        </h1>
                        <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal max-w-xl leading-relaxed">
                            Kelola informasi identitas ekosistem marketplace, konfigurasi kontak operasional, dan perbarui kredensial kata sandi admin.
                        </p>
                    </div>
                </div>

                {loading ? (
                    /* LOADING STATE */
                    <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-100 dark:border-zinc-900">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-zinc-400">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* STATS CARD COUNTER */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                                <p className="text-gray-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Total Produk</p>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.totalProduk}
                                </h2>
                                <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider mt-1 block">Live SKU</span>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                                <p className="text-gray-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Customer</p>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.totalCustomer}
                                </h2>
                                <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider mt-1 block">Terdaftar</span>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                                <p className="text-gray-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Pendapatan</p>
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {formatRupiah(stats.revenue)}
                                </h2>
                                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1 block">Gross Profit</span>
                            </div>
                        </div>

                        {/* CORE SETTINGS CONTENT */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            
                            {/* SECTION: PROFIL TOKO */}
                            <div className="lg:col-span-2 border border-slate-100 bg-white dark:border-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <div className="mb-6 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profil Utama Toko</h3>
                                    <p className="text-slate-400 dark:text-zinc-500 text-[11px]">Konfigurasi informasi publik identitas inti marketplace Anda.</p>
                                </div> 

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                                            Nama Marketplace
                                        </label>
                                        <input
                                            type="text"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50/50 font-medium transition focus:outline-none focus:border-slate-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:focus:border-zinc-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                                            Alamat Email Resmi
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50/50 font-medium transition focus:outline-none focus:border-slate-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:focus:border-zinc-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                                            Nomor Handphone Kontak
                                        </label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50/50 font-mono transition focus:outline-none focus:border-slate-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:focus:border-zinc-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                                            Alamat Domisili Fisik
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50/50 font-medium transition focus:outline-none focus:border-slate-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:focus:border-zinc-700"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                    <button
                                        onClick={simpanPerubahan}
                                        disabled={submittingProfile}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition active:scale-95 shadow-md shadow-blue-600/10 dark:bg-blue-600 dark:hover:bg-blue-700 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submittingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                                    </button>
                                </div>
                            </div>

                            {/* SECTION: UBAH PASSWORD */}
                            <div className="border border-slate-100 bg-white dark:border-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <div className="mb-6 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Keamanan & Kredensial</h3>
                                    <p className="text-slate-400 dark:text-zinc-500 text-[11px]">Perbarui kata sandi untuk mengamankan hak akses modul admin.</p>
                                </div> 

                                <div className="space-y-4 text-xs">
                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">Kata Sandi Lama</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50/50 transition focus:outline-none focus:border-slate-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:focus:border-zinc-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">Kata Sandi Baru</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50/50 transition focus:outline-none focus:border-slate-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:focus:border-zinc-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">Konfirmasi Sandi Baru</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50/50 transition focus:outline-none focus:border-slate-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:focus:border-zinc-700"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                    <button
                                        onClick={updatePassword}
                                        disabled={submittingPassword}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition active:scale-95 shadow-sm dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submittingPassword ? "Memperbarui..." : "Perbarui Password"}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </>
                )}

            </div>
        </AdminLayout>
    );
}