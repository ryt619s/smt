'use client';
import { useState } from 'react';
import { RefreshCcw, ArrowDownCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SwapPage() {
  const [amount, setAmount] = useState<string>('');
  const [direction, setDirection] = useState<'USDT_TO_SMT' | 'SMT_TO_USDT'>('USDT_TO_SMT');
  const price = 0.50; // Dynamic from backend in prod

  const isUsdtToSmt = direction === 'USDT_TO_SMT';
  const payAsset = isUsdtToSmt ? 'USDT' : 'SMT';
  const receiveAsset = isUsdtToSmt ? 'SMT' : 'USDT';
  
  let receiveAmount = 0;
  if (amount) {
     if (isUsdtToSmt) {
        receiveAmount = (Number(amount) / price) * 0.99; // 1% slip
     } else {
        receiveAmount = (Number(amount) * price) * 0.99;
     }
  }

  return (
    <div className="min-h-full p-8 lg:p-12 text-white flex justify-center items-center h-full">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel w-full max-w-md p-8 relative">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <RefreshCcw className="text-purple-500"/> Swap Tokens
        </h2>

        {/* Pay Input */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-2">
          <p className="text-xs text-slate-400 mb-2">You Pay</p>
          <div className="flex justify-between items-center text-xl">
            <input 
              type="number" 
              placeholder="0.0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent outline-none font-bold w-full"
            />
            <span className="font-bold flex items-center gap-2">
               {payAsset}
            </span>
          </div>
        </div>

        {/* Swap Switcher Button */}
        <div className="flex justify-center -my-4 relative z-10">
           <button 
             onClick={() => setDirection(isUsdtToSmt ? 'SMT_TO_USDT' : 'USDT_TO_SMT')}
             className="w-10 h-10 rounded-full bg-slate-800 border-2 border-purple-500 flex items-center justify-center hover:bg-slate-700 transition"
           >
             <ArrowDownCircle size={20} className="text-purple-400" />
           </button>
        </div>

        {/* Receive Output */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mt-2">
          <p className="text-xs text-slate-400 mb-2">You Receive (Est 1% Slippage)</p>
          <div className="flex justify-between items-center text-xl">
            <span className="font-bold">{receiveAmount.toFixed(4)}</span>
            <span className={`font-bold ${isUsdtToSmt ? 'text-emerald-400' : 'text-blue-400'}`}>{receiveAsset}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">1 SMT = ${price} USDT</p>

        <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 transition py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-600/20">
          Confirm Swap
        </button>
      </motion.div>
    </div>
  );
}
