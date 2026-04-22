'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowDownUp, RefreshCcw, AlertTriangle, Loader2 } from 'lucide-react';

export default function Swap() {
  const router = useRouter();
  
  const [direction, setDirection] = useState<'USDT_TO_SMT' | 'SMT_TO_USDT'>('USDT_TO_SMT');
  const [amount, setAmount] = useState('');
  const [balances, setBalances] = useState({ availableBalance: 0, lockedBalance: 0, totalBalance: 0, smt: 0 });
  const [price, setPrice] = useState(0.50);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBalancesAndPrice = async () => {
    try {
      const token = localStorage.getItem('smt_token');
      if (!token) return router.push('/login');
      
      const [balRes, priceRes] = await Promise.all([
        fetch('http://localhost:5000/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` }}),
        fetch('http://localhost:5000/api/swap/price', { headers: { Authorization: `Bearer ${token}` }})
      ]);
      
      const bData = await balRes.json();
      const pData = await priceRes.json();
      
      if (!bData.error) setBalances(bData);
      if (pData.price) setPrice(pData.price);
    } catch {
      console.error('Failed to load data');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchBalancesAndPrice(); }, []);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return setError('Enter a valid amount');
    
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('smt_token');
      const res = await fetch('http://localhost:5000/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), direction })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Swap failed');
      
      setSuccess(`Swap Successful! You received ${data.received.toFixed(4)} ${data.asset}.`);
      setAmount('');
      fetchBalancesAndPrice();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert display values
  const receives = direction === 'USDT_TO_SMT' 
     ? (Number(amount) / price) * 0.99 
     : (Number(amount) * price) * 0.99;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCcw className="text-purple-400" /> Token Swap
            </h1>
          </div>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-slate-400 hover:text-white transition">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex gap-2"><AlertTriangle size={16}/> {error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-semibold">{success}</div>}

        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl glass-panel relative">
          <div className="absolute top-4 right-6 text-xs text-slate-500 font-mono">1 SMT = ${price.toFixed(4)}</div>
          
          <form onSubmit={handleSwap}>
            {/* FROM BLOCK */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-2">
              <div className="flex justify-between text-sm mb-2 text-slate-400">
                <span>From</span>
                <span className="font-mono">Bal: {direction === 'USDT_TO_SMT' ? balances.availableBalance.toFixed(2) : balances.smt.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="number" min="0.01" step="any" placeholder="0" 
                  value={amount} onChange={e => setAmount(e.target.value)} required
                  className="bg-transparent text-3xl font-bold w-full outline-none font-mono text-white placeholder-slate-600" 
                />
                <div className="bg-slate-800 px-3 py-1 rounded-lg font-bold">
                  {direction === 'USDT_TO_SMT' ? 'USDT' : 'SMT'}
                </div>
              </div>
            </div>

            {/* SWITCH BUTTON */}
            <div className="flex justify-center -my-3 relative z-10">
              <button 
                type="button" 
                onClick={() => setDirection(d => d === 'USDT_TO_SMT' ? 'SMT_TO_USDT' : 'USDT_TO_SMT')}
                className="bg-slate-800 border border-slate-700 p-2 rounded-xl hover:bg-slate-700 transition shadow-lg text-purple-400"
              >
                <ArrowDownUp size={20} />
              </button>
            </div>

            {/* TO BLOCK */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mt-2 mb-6">
              <div className="flex justify-between text-sm mb-2 text-slate-400">
                <span>To (Estimated after 1% slippage fee)</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="text" disabled 
                  value={receives > 0 ? receives.toFixed(4) : '0.00'}
                  className="bg-transparent text-3xl font-bold w-full outline-none font-mono text-emerald-400" 
                />
                <div className="bg-slate-800 px-3 py-1 rounded-lg font-bold">
                  {direction === 'USDT_TO_SMT' ? 'SMT' : 'USDT'}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || fetching} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Swap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
