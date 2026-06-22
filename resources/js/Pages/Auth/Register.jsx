import InputError from "@/Components/InputError";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Register() {
    // State untuk mengatur visibilitas password & konfirmasi password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Daftar Akun Admin" />

            <div className="min-h-screen bg-slate-100 flex overflow-hidden">
                
                {/* LEFT SIDE (Identik dengan Login agar tidak patah saat transisi) */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:flex w-1/2 relative"
                >
                    <motion.img
                        src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1920"
                        alt="Gaming PC"
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 2 }}
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="absolute inset-0 flex flex-col justify-center px-16 text-white">
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-6xl font-black mb-4"
                        >
                            Marketplace Admin
                        </motion.h1>
                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="text-xl text-gray-200 max-w-lg"
                        >
                            Kelola produk, pesanan, customer, pengiriman dan laporan marketplace dalam satu dashboard.
                        </motion.p>
                    </div>
                </motion.div>

                {/* RIGHT SIDE (Form Registrasi) */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto max-h-screen">
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-md my-auto"
                    >
                        <div className="mb-6">
                            <h2 className="text-4xl font-bold text-slate-900">
                                Daftar Admin
                            </h2>
                            <p className="text-gray-500 mt-2">
                                Buat akun baru untuk mengelola marketplace
                            </p>
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="bg-white rounded-3xl shadow-xl border p-8"
                        >
                            <form onSubmit={submit} className="space-y-4">
                                {/* INPUT: NAMA */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                        placeholder="Nama lengkap Anda"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                {/* INPUT: EMAIL */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                        placeholder="admin@email.com"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                {/* INPUT: PASSWORD */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            className="w-full border rounded-xl pl-4 pr-12 py-2.5 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 17.772 17.772m-10.8-10.8a10.46 10.46 0 0 0-1.03 3.477m10.8-10.8a10.458 10.458 0 0 1 1.03 3.477m-4.526 2.723a3 3 0 0 0-4.122 4.122m0 0a3 3 0 0 0 4.122-4.122" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1" />
                                </div>

                                {/* INPUT: KONFIRMASI PASSWORD */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">
                                        Konfirmasi Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData("password_confirmation", e.target.value)}
                                            className="w-full border rounded-xl pl-4 pr-12 py-2.5 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 17.772 17.772m-10.8-10.8a10.46 10.46 0 0 0-1.03 3.477m10.8-10.8a10.458 10.458 0 0 1 1.03 3.477m-4.526 2.723a3 3 0 0 0-4.122 4.122m0 0a3 3 0 0 0 4.122-4.122" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1" />
                                </div>

                                {/* TOMBOL REGISTER */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-black text-white py-3 mt-2 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-3 font-semibold text-sm"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mendaftarkan...
                                        </>
                                    ) : (
                                        "Daftar Sekarang"
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-slate-100 px-4 text-sm text-gray-500">
                                    atau
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-500">
                            Sudah punya akun?
                            <Link
                                href={route("login")}
                                className="ml-2 font-semibold text-black hover:underline"
                            >
                                Masuk di sini
                            </Link>
                        </p>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            © 2026 Marketplace Admin
                        </p>
                    </motion.div>
                </div>

            </div>
        </>
    );
}