import AdminLayout from "@/Layouts/AdminLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";

export default function Reports() {
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // State data dari API
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    // State untuk hasil olahan chart & statistik
    const [salesData, setSalesData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [stats, setStats] = useState({
        pendapatanKotor: 0,
        totalPesanan: 0,
        totalCustomer: 0,
        katalogProduk: 0
    });

    // Format Rupiah utilitas
    const formatRupiah = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(value);
    };

    useEffect(() => {
        setIsMounted(true);

        const BASE_URL = "http://192.168.115.151:8000";
        const token = localStorage.getItem("token");

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        };

        // Mengambil data secara bersamaan dengan Promise.all
        Promise.all([
            axios.get(`${BASE_URL}/api/orders`, config),
            axios.get(`${BASE_URL}/api/customers`, config),
            axios.get(`${BASE_URL}/api/products`, config)
        ])
        .then(([ordersRes, customersRes, productsRes]) => {
            const dataOrders = ordersRes.data || [];
            const dataCustomers = customersRes.data || [];
            const dataProducts = productsRes.data || [];

            setOrders(dataOrders);
            setCustomers(dataCustomers);
            setProducts(dataProducts);

            // ====================================================
            // 1. HITUNG CARD STATISTIK UTAMA
            // ====================================================
            const totalPendapatan = dataOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
            setStats({
                pendapatanKotor: totalPendapatan,
                totalPesanan: dataOrders.length,
                totalCustomer: dataCustomers.length,
                katalogProduk: dataProducts.length
            });

            // ====================================================
            // 2. OLAH DATA GRAFIK PENJUALAN BULANAN
            // ====================================================
            const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
            const monthlySalesMap = {};
            
            monthsOrder.forEach(m => { monthlySalesMap[m] = 0; });

            dataOrders.forEach(order => {
                if (order.created_at) {
                    const date = new Date(order.created_at);
                    const monthName = monthsOrder[date.getMonth()];
                    monthlySalesMap[monthName] += 1; 
                }
            });

            const formattedSalesData = monthsOrder.map(month => ({
                month: month,
                sales: monthlySalesMap[month]
            }));
            setSalesData(formattedSalesData);

            // ====================================================
            // 3. REFACTOR: OLAH DATA PRODUK TERLARIS (From order.items)
            // ====================================================
            console.log("🛠️ Debug API - Struktur orders & items diterima:", dataOrders);

            const productMap = {};

            dataOrders.forEach((order, index) => {
                // Pengecekan jika order.items kosong, undefined, atau bukan sebuah array
                if (!order.items || !Array.isArray(order.items)) {
                    console.warn(`⚠️ Debug API: Order indeks ke-${index} (${order.order_code || 'Tanpa Kode'}) tidak memiliki array 'items'.`);
                    return; // Loncat ke data order berikutnya
                }

                // Masuk ke dalam array items untuk menjumlahkan qty hardware
                order.items.forEach(item => {
                    const pName = item.product_name;
                    const pQty = Number(item.qty || 0);

                    if (pName) {
                        productMap[pName] = (productMap[pName] || 0) + pQty;
                    }
                });
            });

            console.log("📊 Debug API - Hasil Mapping Akumulasi Kuantitas:", productMap);

            // Transformasi map object ke format Array Recharts [{ name, sold }]
            const formattedProductData = Object.keys(productMap).map(name => ({
                name: name,
                sold: productMap[name]
            }))
            .sort((a, b) => b.sold - a.sold) // Urutkan peringkat tertinggi ke terendah
            .slice(0, 5); // Ambil maksimal 5 hardware teratas

            console.log("📈 Debug API - Hasil Akhir 5 Produk Terlaris untuk BarChart:", formattedProductData);
            
            setProductData(formattedProductData);

            // ====================================================
            // 4. OLAH DATA TOP CUSTOMER
            // ====================================================
            const formattedTopCustomers = [...dataCustomers]
                .sort((a, b) => Number(b.totalBelanja || 0) - Number(a.totalBelanja || 0))
                .slice(0, 5);

            setTopCustomers(formattedTopCustomers);
            setLoading(false);
        })
        .catch(error => {
            console.error("Gagal mengambil data laporan:", error);
            setLoading(false);
        });
    }, []);

    return (
        <AdminLayout>
            <div className="space-y-6 bg-transparent text-slate-800 dark:text-zinc-400 font-sans pb-12">

                {/* BANNER HEADER */}
                <div className="relative bg-[#0d1520] dark:bg-zinc-900/50 border-none text-white rounded-3xl p-8 overflow-hidden shadow-sm dark:shadow-none">
                    <div className="space-y-1.5 z-10">
                        <span className="inline-block bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            ANALYTICS ENGINE V2.0
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Laporan Penjualan
                        </h1>
                        <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal max-w-xl leading-relaxed">
                            Statistik performa keuangan marketplace, grafik pertumbuhan volume transaksi, dan komparasi komoditas terlaris secara real-time.
                        </p>
                    </div>
                </div>

                {loading ? (
                    /* LOADING STATE */
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-100 dark:border-zinc-900">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-zinc-400">Memuat data analisis...</p>
                    </div>
                ) : (
                    /* MAIN CONTENT */
                    <>
                        {/* STATS CARD COUNTER */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                                <p className="text-gray-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Pendapatan kotor</p>
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {formatRupiah(stats.pendapatanKotor)}
                                </h2>
                                <span className="inline-block text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2">Bruto</span>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                                <p className="text-blue-500 font-bold text-[10px] uppercase tracking-wider">Total Pesanan</p>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.totalPesanan}
                                </h2>
                                <span className="inline-block text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2">Checkout</span>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                                <p className="text-amber-500 font-bold text-[10px] uppercase tracking-wider">Total Customer</p>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.totalCustomer}
                                </h2>
                                <span className="inline-block text-[9px] bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2">Terdaftar</span>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-900 dark:shadow-none">
                                <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-wider">Katalog Produk</p>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.katalogProduk}
                                </h2>
                                <span className="inline-block text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2">Live SKU</span>
                            </div>
                        </div>

                        {/* VISUAL CHART GRID SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* GRAFIK PENJUALAN BULANAN */}
                            <div className="border border-slate-100 bg-white dark:border-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Grafik Penjualan Bulanan</h3>
                                    <p className="text-slate-400 dark:text-zinc-500 text-[11px] mt-0.5">Tren volume kurva omset komparatif semester awal.</p>
                                </div>
                                <div className="h-72 text-[11px] [&_.recharts-cartesian-grid-horizontal_line]:stroke-slate-100 [&_.recharts-cartesian-grid-vertical_line]:stroke-slate-100 dark:[&_.recharts-cartesian-grid-horizontal_line]:stroke-zinc-800/60 dark:[&_.recharts-cartesian-grid-vertical_line]:stroke-zinc-800/60">
                                    {isMounted ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                                                <XAxis dataKey="month" stroke="#94a3b8" className="dark:stroke-zinc-600 font-medium" tickLine={false} axisLine={false} dy={10} />
                                                <YAxis stroke="#94a3b8" className="dark:stroke-zinc-600 font-medium" tickLine={false} axisLine={false} dx={-5} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                                                    labelStyle={{ fontWeight: 'bold', color: 'var(--label-color, #0f172a)' }}
                                                    itemStyle={{ color: '#3b82f6' }}
                                                    wrapperClassName="dark:[--tooltip-bg:#000] dark:border-zinc-800 dark:[--label-color:#fff]"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#3b82f6" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                                                    activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full w-full bg-slate-50 dark:bg-zinc-900/40 animate-pulse rounded-xl" />
                                    )}
                                </div>
                            </div>

                            {/* PRODUK TERLARIS */}
                            <div className="border border-slate-100 bg-white dark:border-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kuantitas Produk Terlaris</h3>
                                    <p className="text-slate-400 dark:text-zinc-500 text-[11px] mt-0.5">Daftar komoditas hardware dengan rasio peminat tertinggi.</p>
                                </div>
                                <div className="h-72 text-[11px] [&_.recharts-cartesian-grid-horizontal_line]:stroke-slate-100 [&_.recharts-cartesian-grid-vertical_line]:stroke-slate-100 dark:[&_.recharts-cartesian-grid-horizontal_line]:stroke-zinc-800/60 dark:[&_.recharts-cartesian-grid-vertical_line]:stroke-zinc-800/60">
                                    {isMounted ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={productData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                                                <XAxis dataKey="name" stroke="#94a3b8" className="dark:stroke-zinc-600 font-medium" tickLine={false} axisLine={false} dy={10} />
                                                <YAxis stroke="#94a3b8" className="dark:stroke-zinc-600 font-medium" tickLine={false} axisLine={false} dx={-5} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                                                    labelStyle={{ fontWeight: 'bold', color: 'var(--label-color, #0f172a)' }}
                                                    itemStyle={{ color: '#a855f7' }}
                                                    wrapperClassName="dark:[--tooltip-bg:#000] dark:border-zinc-800 dark:[--label-color:#fff]"
                                                />
                                                <Bar
                                                    dataKey="sold"
                                                    fill="#a855f7"
                                                    radius={[6, 6, 0, 0]}
                                                    maxBarSize={32}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full w-full bg-slate-50 dark:bg-zinc-900/40 animate-pulse rounded-xl" />
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* TOP CUSTOMER */}
                        <div className="border border-slate-100 bg-white dark:border-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none">
                            <div className="mb-5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Apresiasi Customer Terbaik</h3>
                                <p className="text-slate-400 dark:text-zinc-500 text-[11px] mt-0.5">Loyalitas kontribusi kapital belanja user teratas.</p>
                            </div>
                            
                            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                                {topCustomers.length > 0 ? (
                                    topCustomers.map((customer, index) => (
                                        <div key={index} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full font-bold text-[10px] ${
                                                    index === 0 
                                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500' 
                                                    : 'bg-slate-50 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}>
                                                    {index + 1}
                                                </span>
                                                <span className="font-bold text-slate-800 dark:text-zinc-200">{customer.name}</span>
                                            </div>
                                            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono bg-blue-50/50 dark:bg-zinc-950 px-2.5 py-1 rounded-lg">
                                                {formatRupiah(customer.totalBelanja || 0)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-slate-400">Tidak ada data customer.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </AdminLayout>
    );
}