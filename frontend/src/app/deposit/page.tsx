'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownToLine, CheckCircle2, Copy, Loader2, AlertCircle } from 'lucide-react';

export default function Deposit() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const adminWallet = "TV6x89RjH7hK9Lh6M4M3p9RjH7hK9Lh6X"; // Company Wallet USDT TRC20

  const handleCopy = () => {
    navigator.clipboard.writeText(adminWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!amount || !txHash) { setError('Amount and TX Hash are required'); return; }
    if (Number(amount) < 10) { setError('Minimum deposit is 10 USDT'); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem('smt_token');
      const res = await fetch('/api/wallet/deposit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, txHash })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to submit deposit');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Request Submitted!</h1>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Your deposit request of <span className="text-emerald-400 font-bold font-mono">${amount} USDT</span> has been received. 
          It is currently pending admin approval and will reflect in your wallet shortly.
        </p>
        <button onClick={() => router.push('/dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowDownToLine className="text-emerald-400"/> Deposit USDT</h1>
          <p className="text-slate-500 mt-1 text-sm">Send USDT (TRC20) to the address below</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white text-sm transition">Cancel</button>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-2">Platform Deposit Address (TRON/TRC20)</p>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 p-4 rounded-xl mb-4">
          <code className="text-emerald-400 font-bold overflow-hidden text-ellipsis flex-1 text-sm">{adminWallet}</code>
          <button onClick={handleCopy} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-300">
            {copied ? <CheckCircle2 size={16} className="text-emerald-400"/> : <Copy size={16}/>}
          </button>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-400/90 text-xs">
          <strong className="block mb-1 text-yellow-400">⚠️ IMPORTANT:</strong>
          Send only USDT on the TRON (TRC20) network. Any other tokens or networks will be lost forever.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">Deposit Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-500 font-bold">$</span>
              <input type="number" min="10" step="any" required placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-8 pr-16 text-white outline-none focus:border-purple-500 font-mono transition" />
              <span className="absolute right-4 top-3.5 text-slate-500 font-bold">USDT</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Minimum deposit: 10 USDT</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">Transaction Hash (TxID)</label>
            <input type="text" required placeholder="Enter the hash from your sending wallet..." value={txHash} onChange={e => setTxHash(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white outline-none focus:border-purple-500 transition font-mono text-xs" />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Deposit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
