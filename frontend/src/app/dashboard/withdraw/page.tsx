'use client';
import { DownloadOutline, Key, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function WithdrawPage() {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');

  const handleRequestWithdraw = () => {
    // In real app: call API to /api/withdraw/request-otp first
    // If success, show modal
    if (!amount || !address) return alert('Please fill details');
    setShowOtpModal(true);
  };

  const handleConfirmWithdraw = () => {
    // Call API /api/withdraw/confirm
    alert(`Confirming withdrawal with OTP: ${otp}`);
    setShowOtpModal(false);
    setOtp('');
  };

  return (
    <div className="min-h-screen p-8 lg:p-16 text-white flex justify-center items-start">
      <div className="glass-panel w-full max-w-md p-8 relative">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>
        
        <h2 className="text-2xl font-bold mb-2">Withdraw Funds</h2>
        <p className="text-slate-400 text-sm mb-6">20% goes to Auto-Reinvest. 5% withdrawal fee.</p>

        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
          <p className="text-xs text-slate-400 mb-2">Current Balance</p>
          <div className="text-xl">
            <span className="font-bold">150.50</span> <span className="text-sm text-slate-400">USDT (BEP20)</span>
          </div>
        </div>

        <div className="mb-4">
           <label className="text-sm text-slate-400 mb-1 block">Withdraw Amount (USDT)</label>
           <input 
             type="number" 
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500 transition" 
             placeholder="0.00" 
           />
        </div>

        <div className="mb-6">
           <label className="text-sm text-slate-400 mb-1 block">BEP20 Address</label>
           <input 
             type="text" 
             value={address}
             onChange={(e) => setAddress(e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500 transition font-mono text-sm" 
             placeholder="0x..." 
           />
        </div>

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6 text-sm text-yellow-200">
           <p className="font-bold mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Breakdown Overview</p>
           <p>Net to Wallet: 75%</p>
           <p>Auto-Reinvest: 20% | Platform Fee: 5%</p>
        </div>

        <button onClick={handleRequestWithdraw} className="w-full bg-emerald-600 hover:bg-emerald-700 transition py-4 rounded-xl font-bold flex items-center justify-center gap-2">
           Request Withdraw (OTP Required) 
        </button>

        {/* OTP Security Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
               <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                 <X size={20} />
               </button>
               
               <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                 <Key className="text-purple-500"/> Security Check
               </h3>
               <p className="text-sm text-slate-400 mb-6">An OTP has been sent to your registered email address. It expires in 10 minutes.</p>
               
               <input 
                 type="text" 
                 maxLength={6}
                 value={otp}
                 onChange={(e) => setOtp(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500 transition font-mono text-center tracking-[0.5em] text-lg mb-6" 
                 placeholder="------" 
               />

               <button onClick={handleConfirmWithdraw} className="w-full bg-purple-600 hover:bg-purple-700 transition py-3 rounded-xl font-bold">
                 Verify & Withdraw
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
