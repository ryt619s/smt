'use client';
import { useState } from 'react';
import { Copy, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const [copied, setCopied] = useState(false);
  const depositAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Simulated BEP20 address

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-8 lg:p-16 text-white flex justify-center items-center">
      <div className="glass-panel w-full max-w-md p-8 relative">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>
        
        <h2 className="text-2xl font-bold mb-2">Deposit USDT</h2>
        <p className="text-slate-400 text-sm mb-6">Send only USDT over the <strong className="text-white">BNB Smart Chain (BEP20)</strong> network.</p>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-xl flex justify-center items-center w-48 h-48 mx-auto mb-8 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
           <QrCode className="text-slate-900 w-full h-full" strokeWidth={1} />
        </div>

        <div className="mb-6">
           <label className="text-sm text-slate-400 mb-2 block font-semibold">Your Wallet Address</label>
           <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-2 items-center">
              <input 
                type="text" 
                readOnly 
                value={depositAddress} 
                className="bg-transparent w-full outline-none text-sm text-slate-300 px-2 font-mono"
              />
              <button 
                onClick={handleCopy}
                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-md transition flex items-center justify-center shrink-0"
              >
                 {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
           </div>
        </div>

        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-200 flex items-start gap-3">
           <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
           <p>Sending any other token or using a different network will result in permanent loss of funds. Minimum deposit is 10 USDT.</p>
        </div>
      </div>
    </div>
  );
}
