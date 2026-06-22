import { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";

const BASE_URL = "http://192.168.115.151:8000";

export default function Products() {
    // State Manajemen Data API
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Untuk opsi dropdown form
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);

    // State Input Fields Form
    const [form, setForm] = useState({
        image: null,          // Menyimpan file biner asli
        imagePreview: "",     // Menyimpan URL blob temporer untuk preview UI
        name: "",
        category_id: "",      // Menggunakan ID sesuai struktur database relational
        price: "",
        stock: "",
        description: "",
    });

    // Konfigurasi Instance Axios dengan Sanctum Token
    console.log(localStorage.getItem("token"));
    const api = axios.create({
        baseURL: `${BASE_URL}/api`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
        },
    });

    // Mengambil data pertama kali saat halaman diakses
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // GET: Ambil Data Produk dari API Laravel
    const fetchProducts = async () => {
        try {
            const response = await api.get("/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Gagal memuat data produk:", error);
        }
    };

    // GET: Ambil Data Kategori untuk Dropdown
    const fetchCategories = async () => {
        try {
            // Mengasumsikan Anda memiliki endpoint /api/categories di backend
            const response = await api.get("/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Gagal memuat data kategori:", error);
        }
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
    };

    // Pemicu Modal Tambah Produk
    const openAddModal = () => {
        setIsEditing(false);
        setCurrentProductId(null);
        setForm({ image: null, imagePreview: "", name: "", category_id: "", price: "", stock: "", description: "" });
        setShowModal(true);
    };

    // Pemicu Modal Edit Produk (Mengisi field dengan data lama)
    const editProduk = (product) => {
        setIsEditing(true);
        setCurrentProductId(product.id);
        setForm({
            image: null, // Biarkan null jika user tidak ingin mengganti gambar
            imagePreview: product.image? `${BASE_URL}/products/${product.image}`: "",
            name: product.name,
            category_id: product.category_id || product.category?.id || "",
            price: product.price,
            stock: product.stock,
            description: product.description || "",
        });
        setShowModal(true);
    };

    // Handle Upload Gambar Dini & Generate Object URL Preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({
                ...form,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    // POST / PUT: Simpan Data ke Laravel Database
        const simpanProduk = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category_id || !form.price || !form.stock) {
        alert("Lengkapi semua data utama!");
        return;
    }

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category_id", form.category_id);

    if (form.image) {
        formData.append("image", form.image);
    }

    try {

        console.log("isEditing =", isEditing);
        console.log("currentProductId =", currentProductId);

       if (isEditing) {

                formData.append("_method", "PUT");

                await api.post(
                    `/products/${currentProductId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

            } else {

                await api.post(
                    "/products",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

            }

        alert("Produk berhasil disimpan");

        setShowModal(false);

        fetchProducts();

    } catch (error) {

        console.error(
            "ERROR SIMPAN PRODUK :",
            error.response?.data || error
        );

        alert("Gagal menyimpan produk");
    }
};

    // DELETE: Hapus Data Produk dari Database
    const hapusProduk = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts(); // Refresh data otomatis dari database tanpa reload
            } catch (error) {
                console.error("Gagal menghapus produk:", error);
                alert("Gagal menghapus produk dari server.");
            }
        }
    };

    // Simulasi frontend toggle status (Opsional, sesuaikan endpoint jika butuh sync DB)
    const toggleStatus = (id) => {
        setProducts(
            products.map((item) =>
                item.id === id 
                    ? { ...item, status: item.status === "Aktif" ? "Nonaktif" : "Aktif" } 
                    : item
            )
        );
    };

    // Kriteria Filter Search: Bersifat dinamis dari nama & relasi object category
    const filteredProducts = products.filter((product) => {
        const matchesName = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = product.category?.name?.toLowerCase().includes(search.toLowerCase());
        return matchesName || matchesCategory;
    });

    return (
        <AdminLayout>
            <div className="space-y-8 p-6 max-w-7xl mx-auto select-none text-zinc-800 dark:text-zinc-100">
                
                {/* HERO / HEADER PANEL */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-slate-950 to-zinc-950 p-8 text-white shadow-xl border border-zinc-800">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-500/20">Master Stock v2.2</span>
                            <h1 className="text-4xl font-black tracking-tight mt-2 text-white">Kelola Produk</h1>
                            <p className="text-sm text-zinc-400 font-medium mt-1">Sistem kontrol repositori inventori komponen dan unit distribusi terpusat.</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition text-sm flex-shrink-0"
                        >
                            ＋ Upload Produk
                        </button>
                    </div>
                </div>

                {/* CARDS STATISTIK MINGGUAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Total Ragam Produk", value: products.length, suffix: "Item" },
                        { title: "Produk Status Aktif", value: products.filter((item) => item.status === "Aktif" || item.status === undefined).length, suffix: "Ready" },
                        { title: "Akumulasi Stok", value: products.reduce((total, item) => total + Number(item.stock), 0), suffix: "Unit" },
                        { title: "Kondisi Stok Menipis", value: products.filter((item) => item.stock <= 5).length, suffix: "Perlu Restock" },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-36 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{card.title}</p>
                                <h2 className="text-3xl font-black mt-2 text-zinc-900 dark:text-white tracking-tight">{card.value}</h2>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{card.suffix}</span>
                        </div>
                    ))}
                </div>

                {/* SEARCH FILTER BOX */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800 flex items-center">
                    <input
                        type="text"
                        placeholder="Cari hardware berdasarkan nama atau kategori..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-2xl px-5 py-3 text-sm placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                {/* TABEL DATA DISTRIBUSI */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 font-bold text-xs uppercase bg-zinc-50/50 dark:bg-zinc-800/30 whitespace-nowrap">
                                    <th className="py-4 px-6">Foto</th>
                                    <th className="py-4 px-6">Nama Komponen</th>
                                    <th className="py-4 px-6">Kategori</th>
                                    <th className="py-4 px-6">Harga Jual</th>
                                    <th className="py-4 px-6 text-center">Stok</th>
                                    <th className="py-4 px-6 text-center">Status Jalur</th>
                                    <th className="py-4 px-6">Deskripsi Ringkas</th>
                                    <th className="py-4 px-6 text-center">Aksi Operasional</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 transition duration-150 items-center">
                                        <td className="py-4 px-6">
                                            <img
                                                src={`${BASE_URL}/products/${product.image}`}
                                                alt={product.name}
                                                className="w-14 h-14 object-cover rounded-xl"
                                                onError={(e) => {
                                                    console.log("Gagal load:", e.target.src);
                                                }}
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-bold text-zinc-900 dark:text-white text-base">{product.name}</td>
                                        <td className="py-4 px-6">
                                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2.5 py-1 text-xs font-bold rounded-lg border dark:border-zinc-700 whitespace-nowrap">
                                                {product.category?.name || "Tanpa Kategori"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-black text-blue-600 dark:text-blue-400 text-lg whitespace-nowrap">
                                            {formatRupiah(product.price)}
                                        </td>
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span className={`inline-block px-3 py-1.5 rounded-xl font-bold text-xs ${product.stock <= 3 ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300'}`}>
                                                {product.stock} Unit
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center justify-center gap-1.5 w-28 py-1.5 text-[10px] font-black rounded-xl uppercase border tracking-wider ${
                                                    product.status === "Nonaktif" 
                                                        ? "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                                                        : "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${product.status === "Nonaktif" ? "bg-zinc-400" : "bg-green-500"}`}></span>
                                                    {product.status || "Aktif"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-[180px] truncate text-xs text-zinc-400 dark:text-zinc-500">
                                            {product.description || "-"}
                                        </td>
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex gap-1.5 justify-center">
                                                <button
                                                    onClick={() => editProduk(product)}
                                                    className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:opacity-80 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(product.id)}
                                                    className="border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                                                >
                                                    Status
                                                </button>
                                                <button
                                                    onClick={() => hapusProduk(product.id)}
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

            {/* POP-UP FORM MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto text-zinc-900 dark:text-white">
                        <div className="mb-5">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                                {isEditing ? "🔧 Modifikasi Komponen" : "📦 Registrasi Komponen Baru"}
                            </h2>
                            <p className="text-xs text-zinc-400 font-medium mt-1">Lengkapi form struktur data untuk sinkronisasi inventori pergudangan.</p>
                        </div>

                        <form onSubmit={simpanProduk} className="space-y-4">
                            {/* PREVIEW IMAGE LOADER */}
                            <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed dark:border-zinc-700">
                                <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden border dark:border-zinc-600">
                                    {form.imagePreview ? <img src={form.imagePreview} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">📷</div>}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-blue-500 cursor-pointer hover:underline">
                                        Pilih Berkas Foto
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">Mendukung resolusi rasio persegi (PNG/JPG)</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Nama Produk / Hardware</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Masukkan nama tipe hardware..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Kategori</label>
                                    <select
                                        required
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-bold"
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                    >
                                        <option value="" disabled>-- Pilih --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Stok Gudang</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-bold"
                                        value={form.stock}
                                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Harga Satuan (Rupiah)</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="Contoh: 5000000"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-bold"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Deskripsi Informasi</label>
                                <textarea
                                    placeholder="Detail deskripsi spesifikasi produk..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border dark:border-zinc-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[60px] max-h-[100px]"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
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
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}