'use client';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Zap, Users, RefreshCcw, Download, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/mining', label: 'GPU Mining', icon: Zap },
    { href: '/referrals', label: 'MLM Team', icon: Users },
    { href: '/swap', label: 'Swap SMT', icon: RefreshCcw },
    { href: '/withdraw', label: 'Withdraw', icon: Download },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('smt_token');
    localStorage.removeItem('smt_user');
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] text-white relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (Slide System) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 glass-panel border-r border-white/5 m-4 rounded-2xl flex flex-col justify-between overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
      `}>
        <div>
          <div className="p-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">SMT Network</h1>
              <p className="text-xs text-slate-400">Yield ecosystem</p>
            </div>
            <button onClick={closeSidebar} className="lg:hidden text-slate-300 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <nav className="px-4 space-y-2 mt-4">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} onClick={closeSidebar}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${active ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <Icon size={18} />
                    <span className="font-semibold text-sm">{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4">
           <Link href="/admin" onClick={closeSidebar}>
             <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition border border-transparent hover:border-white/5 text-sm font-semibold mb-2 cursor-pointer">
                <ShieldCheck size={18}/> Admin Hub
             </div>
           </Link>
           <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20 text-sm font-semibold cursor-pointer">
              <LogOut size={18}/> Logout
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full h-full">
        {/* Mobile Header (Hamburger Menu) */}
        <header className="lg:hidden flex items-center p-4 border-b border-white/5 glass-panel m-4 mb-0 rounded-2xl">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 bg-white/5 rounded-lg border border-white/10">
             <Menu size={24} />
          </button>
          <span className="ml-4 font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">SMT DASHBOARD</span>
        </header>

        <div className="flex-1 overflow-y-auto w-full h-full pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
