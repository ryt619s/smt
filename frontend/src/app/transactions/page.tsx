'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownToLine, ArrowUpFromLine, Clock, Loader2, ArrowLeft } from 'lucide-react';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('smt_token');
      if (!token) { router.push('/login'); return; }
      
      try {
        const res = await fetch('/api/wallet/transactions?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) { localStorage.clear(); router.push('/login'); return; }
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="text-purple-400" /> Transaction History
          </h1>
          <p className="text-slate-500 text-sm mt-1">Your recent deposits and withdrawals</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-slate-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-left py-3 pr-4">Amount</th>
                  <th className="text-left py-3 pr-4">Asset</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Date</th>
                  <th className="text-left py-3">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2 capitalize font-semibold">
                        {tx.type === 'deposit' ? <ArrowDownToLine size={16} className="text-emerald-400" /> : <ArrowUpFromLine size={16} className="text-red-400" />}
                        {tx.type}
                      </div>
                    </td>
                    <td className={`py-4 pr-4 font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-4 pr-4 text-slate-300 font-mono">{tx.asset}</td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : tx.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="py-4 text-slate-500 text-xs font-mono max-w-[120px] truncate">
                      {tx.metadata?.txHash || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
