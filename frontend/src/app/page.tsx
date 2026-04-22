'use client';
import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, Activity, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [prices, setPrices] = useState({ BTC: 0, ETH: 0, BNB: 0, SMT: 0.50 });
  const [smtPrice, setSmtPrice] = useState(0.500);

  // Fetch real crypto prices from public Binance API + Simulate SMT
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","BNBUSDT"]');
        const data = await res.json();
        const priceMap: any = {};
        data.forEach((item: any) => {
          if (item.symbol === 'BTCUSDT') priceMap.BTC = parseFloat(item.price);
          if (item.symbol === 'ETHUSDT') priceMap.ETH = parseFloat(item.price);
          if (item.symbol === 'BNBUSDT') priceMap.BNB = parseFloat(item.price);
        });
        setPrices(prev => ({ ...prev, ...priceMap }));
      } catch (e) {
        console.error("Price fetch failed", e);
      }
    };

    fetchPrices();
    const interval = setInterval(() => {
      fetchPrices();
      // Simulate SMT price moving slightly every 5 seconds
      setSmtPrice(prev => prev + (Math.random() > 0.5 ? 0.001 : -0.001));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#060a14] overflow-hidden relative font-sans text-slate-200">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[150px] opacity-50 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[150px] opacity-50 mix-blend-screen pointer-events-none" />
      
      {/* Navbar Minimal */}
      <nav className="relative z-50 flex justify-between items-center px-8 md:px-16 py-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            S
          </div>
          <span className="text-2xl font-black tracking-tight text-white">SMT</span>
        </nav>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-10 pb-24 text-center">
        
        {/* Interactive Advanced 3D Coin Logo */}
        <motion.div 
          className="relative w-48 h-48 md:w-64 md:h-64 mb-12 perspective-[1000px] cursor-pointer group flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
        >
          {/* Outer glow ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30 w-full h-full"
          />
          
          <motion.div
            className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 shadow-[0_0_80px_rgba(139,92,246,0.6)] flex flex-col items-center justify-center border-4 border-white/10 preserve-3d"
            whileHover={{ 
              rotateX: [0, 45, -45, 0], 
              rotateY: [0, 45, -45, 0],
              scale: 1.1,
              boxShadow: "0 0 120px rgba(139,92,246,0.9)"
            }}
            transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
          >
            <Sparkles className="text-yellow-300 w-8 h-8 absolute top-8 left-8 opacity-70" />
            <span className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">SMT</span>
            <span className="text-indigo-200 mt-1 font-bold tracking-widest text-sm">TOKEN</span>
          </motion.div>
        </motion.div>

        {/* Hero Text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white mb-6">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Yield Mining</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Acquire GPU power, stake your position, and earn hyper-dynamic multi-tier network rewards directly to your autonomous wallet.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] flex items-center gap-2"
                >
                  Start Mining Now <ArrowRight size={20} />
                </motion.button>
             </Link>
             <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-lg backdrop-blur-md"
                >
                  Access Ecosystem
                </motion.button>
             </Link>
          </div>
        </motion.div>

        {/* Live Market Price Ticker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 w-full max-w-5xl"
        >
           <h3 className="text-left text-slate-400 font-bold mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
             <Activity className="text-emerald-400 w-4 h-4"/> Live Market Correlators
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* BTC */}
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition cursor-default">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#F7931A] flex items-center justify-center text-white text-[10px] font-bold">₿</div> <span className="font-bold text-lg">BTC</span></div>
                </div>
                <p className="text-2xl font-black text-white">${prices.BTC > 0 ? prices.BTC.toLocaleString('en-US', {minimumFractionDigits: 2}) : '...' }</p>
             </div>
             {/* ETH */}
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition cursor-default">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#627EEA] flex items-center justify-center text-white text-[10px] font-bold">Ξ</div> <span className="font-bold text-lg">ETH</span></div>
                </div>
                <p className="text-2xl font-black text-white">${prices.ETH > 0 ? prices.ETH.toLocaleString('en-US', {minimumFractionDigits: 2}) : '...' }</p>
             </div>
             {/* BNB */}
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition cursor-default">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#F3BA2F] flex items-center justify-center text-white text-[10px] font-bold">BNB</div> <span className="font-bold text-lg">BNB</span></div>
                </div>
                <p className="text-2xl font-black text-white">${prices.BNB > 0 ? prices.BNB.toLocaleString('en-US', {minimumFractionDigits: 2}) : '...' }</p>
             </div>
             {/* SMT (Custom) */}
             <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_10px_purple]">S</div> 
                    <span className="font-bold text-lg text-white">SMT</span>
                  </div>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-bold">NATIVE</span>
                </div>
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-emerald-300 relative z-10">
                  ${smtPrice.toFixed(4)}
                </p>
             </div>
           </div>
        </motion.div>
      </main>
    </div>
  );
}
