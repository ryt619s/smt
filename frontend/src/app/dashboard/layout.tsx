'use client';
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Zap, Users, RefreshCcw, Download, ShieldCheck, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/mining', label: 'GPU Mining', icon: Zap },
    { href: '/dashboard/team', label: 'MLM Team', icon: Users },
    { href: '/dashboard/swap', label: 'Swap SMT', icon: RefreshCcw },
    { href: '/dashboard/withdraw', label: 'Withdraw', icon: Download },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('smt_token');
    localStorage.removeItem('smt_user');
    router.push('/login');
  };

  if (!mounted) return <div className="h-screen bg-[#070b14] w-full" />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#05080f] text-white relative font-sans">
      
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-purple-900/20 blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0], opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/20 blur-[150px]" 
        />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Floating Sidebar */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: isSidebarOpen ? 0 : 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 m-4 rounded-3xl flex flex-col justify-between overflow-hidden
          border border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-2xl shadow-purple-900/20
          transform lg:translate-x-0 transition-transform duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}
        `}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black/20">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-emerald-400 drop-shadow-sm">SMT Core</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/80 font-bold mt-1">Yield Ecosystem</p>
            </motion.div>
            <button onClick={closeSidebar} className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition">
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {links.map((link, idx) => {
              const active = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} onClick={closeSidebar}>
                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                      ${active ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                               : 'text-slate-400 hover:text-white border border-transparent hover:border-white/5 hover:bg-white/[0.04]'}`}
                  >
                    {active && <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-emerald-400 rounded-r-full" />}
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`p-2 rounded-xl transition-colors duration-300 ${active ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-emerald-400'}`}>
                        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                      </div>
                      <span className={`text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>{link.label}</span>
                    </div>

                    <ChevronRight size={16} className={`transition-transform duration-300 ${active ? 'opacity-100 translate-x-0 text-purple-400' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent">
             <Link href="/admin" onClick={closeSidebar}>
               <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 transition border border-transparent hover:border-white/5 text-sm font-semibold mb-2 group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="group-hover:text-amber-400 transition-colors"/> Admin Hub
                  </div>
               </motion.div>
             </Link>
             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="flex items-center justify-between px-4 py-3 rounded-2xl text-red-400/80 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20 text-sm font-semibold group cursor-pointer">
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="group-hover:text-red-400 transition-colors"/> System Logout
                </div>
             </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full h-full p-2 md:p-4 pl-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center p-4 border border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-2xl mb-4 relative z-20 shadow-lg">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition">
             <Menu size={20} />
          </button>
          <span className="ml-4 font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 uppercase text-sm">SMT Dashboard</span>
        </header>

        {/* Content Wrapper */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto w-full h-full rounded-3xl border border-white/5 bg-black/20 backdrop-blur-3xl shadow-2xl relative scrollbar-hide"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
