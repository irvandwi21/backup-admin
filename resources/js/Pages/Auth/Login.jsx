import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";

export default function Login({ status, canResetPassword }) {
    // 2. State untuk mengatur visibilitas password
    const [showPassword, setShowPassword] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = async (e) => {
    e.preventDefault();

    try {

        const response = await axios.post(
                "http://192.168.115.151:8000/api/admin/login",
                {
                    email: data.email,
                    password: data.password,
                }
            );

        localStorage.setItem(
            "token",
            response.data.token
        );

        console.log("TOKEN:", response.data.token);

        window.location.href = "/admin/products";

    } catch (error) {

        console.error(error);

        alert("Email atau password salah");

    }
};

    return (
        <>
            <Head title="Marketplace Admin" />

            <div className="min-h-screen bg-slate-100 flex overflow-hidden">

                {/* LEFT SIDE */}
                <motion.div
                    initial={{
                        x: -100,
                        opacity: 0,
                    }}
                    animate={{
                        x: 0,
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                    className="hidden lg:flex w-1/2 relative"
                >
                    <motion.img
                        src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1920"
                        alt="Gaming PC"
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{
                            duration: 2,
                        }}
                    />

                    <div className="absolute inset-0 bg-black/60"></div>

                    <div className="absolute inset-0 flex flex-col justify-center px-16 text-white">
                        <motion.h1
                            initial={{
                                y: 30,
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}
                            transition={{
                                delay: 0.4,
                                duration: 0.6,
                            }}
                            className="text-6xl font-black mb-4"
                        >
                            Marketplace Admin
                        </motion.h1>

                        <motion.p
                            initial={{
                                y: 30,
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}
                            transition={{
                                delay: 0.6,
                                duration: 0.6,
                            }}
                            className="text-xl text-gray-200 max-w-lg"
                        >
                            Kelola produk, pesanan, customer,
                            pengiriman dan laporan marketplace
                            dalam satu dashboard.
                        </motion.p>
                    </div>
                </motion.div>

                {/* RIGHT SIDE */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 60,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.8,
                        }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold text-slate-900">
                                Login Admin
                            </h2>
                            <p className="text-gray-500 mt-2">
                                Masuk ke dashboard marketplace
                            </p>
                        </div>

                        <motion.div
                            initial={{
                                scale: 0.9,
                                opacity: 0,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                            }}
                            transition={{
                                delay: 0.2,
                                duration: 0.5,
                            }}
                            className="bg-white rounded-3xl shadow-xl border p-8"
                        >
                            {status && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                                        placeholder="admin@email.com"
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    
                                    {/* 3. Wrapper relative untuk input dan tombol mata */}
                                    <div className="relative">
                                        <input
                                            // Tipe berubah dinamis antara 'password' atau 'text'
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) =>
                                                setData("password", e.target.value)
                                            }
                                            className="w-full border rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                                            placeholder="••••••••"
                                        />
                                        
                                        {/* Tombol Show/Hide dengan Icon SVG */}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
                                        >
                                            {showPassword ? (
                                                // Icon Mata Dicoret (Hide)
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 17.772 17.772m-10.8-10.8a10.46 10.46 0 0 0-1.03 3.477m10.8-10.8a10.458 10.458 0 0 1 1.03 3.477m-4.526 2.723a3 3 0 0 0-4.122 4.122m0 0a3 3 0 0 0 4.122-4.122" />
                                                </svg>
                                            ) : (
                                                // Icon Mata (Show)
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData("remember", e.target.checked)
                                            }
                                        />
                                        <span className="text-sm text-gray-600">
                                            Remember me
                                        </span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-sm text-gray-500 hover:text-black"
                                        >
                                            Lupa Password?
                                        </Link>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-3"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        "Masuk"
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>

                        <div className="relative my-4">

                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>

                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-sm text-gray-500">
                                    atau
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-500">
                            Belum punya akun?
                            <Link
                                href={route("register")}
                                className="ml-2 font-semibold text-black hover:underline"
                            >
                                Daftar Sekarang
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