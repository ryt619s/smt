'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Globe, Infinity as InfinityIcon, Layers, Shield, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function SystemHomePage() {
  const [prices, setPrices] = useState({ BTC: 64200.50, ETH: 3450.20, BNB: 590.10, SMT: 0.50 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Real API Fetch Logic
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","BNBUSDT"]');
        if (res.ok) {
          const data = await res.json();
          const pMap: any = {};
          data.forEach((i: any) => {
            if (i.symbol === 'BTCUSDT') pMap.BTC = parseFloat(i.price);
            if (i.symbol === 'ETHUSDT') pMap.ETH = parseFloat(i.price);
            if (i.symbol === 'BNBUSDT') pMap.BNB = parseFloat(i.price);
          });
          setPrices(prev => ({ ...prev, ...pMap }));
        }
      } catch (e) {
        // Fallback to initial state
      }
    };
    fetchPrices();
    const int = setInterval(fetchPrices, 10000);
    return () => clearInterval(int);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-purple-500/30 overflow-hidden relative">
      {/* Dynamic Background Matrix Rays */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #4c1d95 0%, transparent 60%)' }} />
      <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent shadow-[0_0_10px_#a855f7]" />
      <div className="absolute top-0 bottom-0 right-[20%] w-[1px] bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent shadow-[0_0_10px_#10b981]" />

      <header className="relative z-50 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/5 border border-white/10 flex justify-center items-center rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.4)]">
             <Layers className="text-purple-400" />
          </div>
          <span className="font-black text-2xl tracking-tighter">SMT <span className="font-light text-slate-400">SYSTEM</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden md:flex items-center gap-2 text-sm font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM ONLINE
          </span>
          <Link href="/login" className="font-bold text-slate-300 hover:text-white transition">LOGIN</Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Block */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
             <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
               <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">DECENTRALIZED</span>
               <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-emerald-400">GPU MINING</span>
             </h1>
             <p className="text-xl text-slate-400 max-w-lg mb-10 font-light">
               The apex architectural ecosystem for algorithmic yield generation natively deployed on the BNB Smart Chain.
             </p>

             <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                   <button className="px-8 py-4 bg-white text-black hover:bg-slate-200 transition font-black text-lg rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto">
                     INITIALIZE ACCOUNT <ArrowRight size={20} />
                   </button>
                </Link>
                <Link href="/dashboard">
                   <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition font-black text-lg rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto backdrop-blur-md">
                     ENTER DASHBOARD
                   </button>
                </Link>
             </div>
          </motion.div>

          {/* Right Floating 3D Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1 }}
            className="relative h-[500px]"
          >
             <motion.div 
               animate={{ y: [0, -20, 0] }} 
               transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
               className="absolute inset-0 flex items-center justify-center"
             >
                <div className="relative w-80 h-80">
                  {/* Central Core */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-emerald-600 opacity-20 blur-3xl" />
                  <div className="absolute inset-4 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center bg-black/50 shadow-[0_0_50px_rgba(168,85,247,0.5)] overflow-hidden">
                     <Cpu size={100} className="text-purple-400 drop-shadow-[0_0_20px_purple]" strokeWidth={1} />
                     
                     <motion.div 
                       animate={{ rotate: 360 }} 
                       transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                       className="absolute inset-[-50%] border-4 border-dashed border-emerald-500/30 rounded-full"
                     />
                  </div>

                  {/* Floating Metric Badges */}
                  <motion.div className="absolute -top-10 -right-10 bg-slate-900/80 border border-emerald-500/30 p-4 rounded-2xl backdrop-blur-xl shadow-xl" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                     <p className="text-xs text-slate-400">NETWORK HASHRATE</p>
                     <p className="text-xl font-black text-emerald-400">4.2 PH/s</p>
                  </motion.div>

                  <motion.div className="absolute -bottom-10 -left-10 bg-slate-900/80 border border-purple-500/30 p-4 rounded-2xl backdrop-blur-xl shadow-xl" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }}>
                     <p className="text-xs text-slate-400">MLM TIERS</p>
                     <p className="text-xl font-black text-purple-400">10-Level Deep</p>
                  </motion.div>
                </div>
             </motion.div>
          </motion.div>
        </div>

        {/* Live Market Tickers */}
        <div className="mt-32 pt-16 border-t border-white/10 relative">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#020617] px-4 flex items-center gap-2 text-sm font-bold text-slate-400 shrink-0 whitespace-nowrap">
             <Terminal size={16} /> LIVE MARKET FEED
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { s: 'BTC', p: prices.BTC, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5' },
                { s: 'ETH', p: prices.ETH, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
                { s: 'BNB', p: prices.BNB, color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' },
                { s: 'SMT', p: prices.SMT, color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10' },
              ].map((coin) => (
                 <div key={coin.s} className={`p-6 rounded-2xl border ${coin.border} ${coin.bg} backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-default inline-block min-w-[150px]`}>
                    <p className="text-sm font-bold text-slate-400 mb-1">{coin.s}</p>
                    <p className={`text-2xl md:text-3xl font-black ${coin.color}`}>
                       ${coin.p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </p>
                 </div>
              ))}
           </div>
        </div>

      </main>
    </div>
  );
}
