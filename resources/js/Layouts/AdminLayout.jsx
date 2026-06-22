import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Menu,
    Moon,
    Sun,
    LogOut,
    LayoutDashboard,
    ShoppingBag,
    Package,
    Truck,
    Users,
    BarChart3,
    Settings as SettingsIcon
} from "lucide-react";

export default function AdminLayout({ children }) {
    const [darkMode, setDarkMode] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [time, setTime] = useState(new Date());
    const [showNotifications, setShowNotifications] = useState(false);

    const [settings, setSettings] = useState({
        storeName: "PC Marketplace",
        email: "admin@pcstore.com",
    });

    const notifications = [
        { title: "Pesanan Baru", message: "ORD001 berhasil dibuat" },
        { title: "Customer Baru", message: "Customer baru mendaftar" },
        { title: "Stok Menipis", message: "RTX 4060 tersisa 2 unit" },
    ];

    const currentPath = window.location.pathname;

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const savedMode = localStorage.getItem("theme") !== "light";
        setDarkMode(savedMode);
    }, []);

    useEffect(() => {
        if (darkMode) {
            localStorage.setItem("theme", "dark");
            document.documentElement.classList.add('dark');
        } else {
            localStorage.setItem("theme", "light");
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const menuClass = (path) =>
        currentPath === path
            ? "flex items-center gap-3.5 px-4 py-3 rounded-xl bg-white text-black font-bold relative shadow-[0_4px_25px_rgba(255,255,255,0.12)] border border-white transition-all duration-300"
            : "flex items-center gap-3.5 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900/60 font-semibold border border-transparent transition-all duration-300 group";

    const premiumSpring = {
        type: "spring",
        stiffness: 280,
        damping: 26,
        mass: 0.75
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -15 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className={`min-h-screen flex w-full relative overflow-hidden ${darkMode ? "bg-[#07080a] text-zinc-100" : "bg-slate-50 text-slate-900"}`}>
            
            <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1, width: sidebarOpen ? 280 : 90 }}
                transition={{
                    x: { type: "spring", stiffness: 160, damping: 22 },
                    width: premiumSpring
                }}
                className="bg-[#0c0d12] text-white flex flex-col z-30 shadow-[6px_0_35px_rgba(0,0,0,0.6)] border-r border-zinc-900/80 fixed left-0 top-0 bottom-0 h-screen overflow-hidden"
            >
                <div className="p-6 border-b border-zinc-900/60 flex justify-between items-center h-24 flex-shrink-0">
                    <div className="min-w-0 flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait">
                            {sidebarOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h1 className="text-base font-black tracking-wider text-white truncate whitespace-nowrap bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                                        {settings.storeName}
                                    </h1>
                                    <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest whitespace-nowrap mt-0.5 font-mono">
                                        Core Control Panel
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSidebarOpen(!sidebarOpen)} 
                        className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex-shrink-0 border border-zinc-800/50"
                    >
                        <Menu size={16} />
                    </motion.button>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar"
                >
                    {sidebarOpen && (
                        <motion.span variants={itemVariants} className="block px-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">
                            Main Navigation
                        </motion.span>
                    )}
                    {[
                        { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
                        { path: "/admin/products", label: "Produk", icon: ShoppingBag },
                        { path: "/admin/orders", label: "Pesanan", icon: Package },
                        { path: "/admin/shipping", label: "Pengiriman", icon: Truck },
                        { path: "/admin/users", label: "Customer", icon: Users },
                        { path: "/admin/reports", label: "Laporan", icon: BarChart3 },
                        { path: "/admin/settings", label: "Pengaturan", icon: SettingsIcon },
                    ].map((item, index) => {
                        const isMenuActived = currentPath === item.path;
                        const IconComponent = item.icon;
                        
                        return (
                            <motion.a 
                                key={index} 
                                href={item.path} 
                                className={menuClass(item.path)}
                                variants={itemVariants}
                                whileTap={{ scale: 0.98 }}
                            >
                                <IconComponent 
                                    size={18} 
                                    className={`flex-shrink-0 transition-all duration-300 ${
                                        isMenuActived ? 'text-black stroke-[2.5]' : 'text-zinc-500 group-hover:text-zinc-200'
                                    }`} 
                                />
                                <AnimatePresence mode="wait">
                                    {sidebarOpen && (
                                        <motion.span 
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="text-[11px] tracking-wider uppercase font-bold whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.a>
                        );
                    })}
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="p-4 border-t border-zinc-900/60 bg-[#0c0d12] flex-shrink-0"
                >
                    <div className="bg-zinc-900/30 p-3 rounded-2xl border border-zinc-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs font-black text-black flex-shrink-0 shadow-md">
                                A
                            </div>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="truncate text-[10px] font-bold text-zinc-500 font-mono tracking-wide whitespace-nowrap"
                                    >
                                        {settings.email}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.1, color: "#f87171" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.post(route('logout'))}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div 
                animate={{ paddingLeft: sidebarOpen ? 280 : 90 }}
                transition={premiumSpring}
                className="flex-1 flex flex-col min-w-0"
            >
                <motion.div 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.1 }}
                    className="flex justify-between items-center px-10 py-6 bg-gradient-to-r from-[#031330] via-[#050b14] to-[#041a35] border-b border-blue-500/15 shadow-[0_10px_40px_rgba(0,0,0,0.45)] sticky top-0 z-20 flex-shrink-0"
                >
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
                            Admin Control Hub
                        </h1>
                        <p className="text-[10px] font-bold text-cyan-400 mt-1 uppercase tracking-widest font-mono">
                            {time.toLocaleTimeString('id-ID')} WIB — {time.toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="px-4 py-2 text-xs rounded-xl border focus:outline-none transition-all duration-300 w-64 shadow-inner font-semibold bg-[#0e1c38] border-blue-900/60 text-white focus:border-cyan-400 focus:bg-[#122447] placeholder-blue-300/40"
                        />

                        <div className="relative">
                            <motion.button 
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setShowNotifications(!showNotifications)} 
                                className="p-2.5 rounded-xl border transition-all relative bg-[#0e1c38] border-blue-900/60 text-cyan-400 hover:text-white hover:border-cyan-400/50 shadow-md"
                            >
                                <Bell size={16} />
                                <span className="absolute -top-0.5 -right-0.5 bg-cyan-400 text-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black shadow-md">
                                    {notifications.length}
                                </span>
                            </motion.button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                                        transition={premiumSpring}
                                        className="absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden bg-[#050e21] border-blue-900/60 text-white"
                                    >
                                        <div className="p-4 font-black text-[10px] border-b border-blue-950 uppercase tracking-widest text-cyan-400">Center Notifications</div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {notifications.map((n, i) => (
                                                <div key={i} className="p-4 border-b last:border-0 border-blue-950/50 hover:bg-blue-950/20 transition-colors cursor-pointer">
                                                    <div className="text-xs font-bold text-zinc-100">{n.title}</div>
                                                    <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">{n.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.button 
                            whileTap={{ scale: 0.9, rotate: 12 }}
                            onClick={() => setDarkMode(!darkMode)} 
                            className="p-2.5 rounded-xl border transition-colors bg-[#0e1c38] border-blue-900/60 text-cyan-400 hover:text-white hover:border-cyan-400/50 shadow-md"
                        >
                            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 22, 
                        delay: 0.35 
                    }}
                    className="flex-1 p-10 overflow-x-auto w-full"
                >
                    <div className="min-w-full inline-block align-middle">
                        {children}
                    </div>
                </motion.div>
            </motion.div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
}