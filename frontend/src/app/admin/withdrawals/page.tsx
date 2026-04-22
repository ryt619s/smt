'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';

export default function AdminWithdrawals() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('admin_token') || localStorage.getItem('smt_token'))
    : '';

  const fetchWithdrawals = async () => {
    setLoading(true);
    const res  = await fetch(`/api/admin/withdrawals?status=${filter}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setWithdrawals(data.withdrawals || []);
    setLoading(false);
  };

  useEffect(() => { fetchWithdrawals(); }, [filter]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    const txHash = action === 'approve' ? prompt('Enter transaction hash (optional):') || '' : '';
    const res = await fetch(`/api/admin/withdrawals/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ txHash }),
    });
    if (res.ok) fetchWithdrawals();
    setProcessing(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Withdrawal Management</h1>
          <p className="text-slate-500 text-sm">Approve or reject user withdrawal requests</p>
        </div>
        <button onClick={() => router.push('/admin/dashboard')} className="text-slate-400 hover:text-white text-sm">← Dashboard</button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending','completed','rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${filter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-purple-500" size={32} /></div> : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 bg-slate-900/50 border-b border-slate-800">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Net (75%)</th>
                <th className="text-left p-4">Wallet</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                {filter === 'pending' && <th className="text-left p-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">No {filter} withdrawals found</td></tr>
              )}
              {withdrawals.map((w: any) => (
                <tr key={w._id} className="border-b border-slate-800/50 hover:bg-white/2 transition">
                  <td className="p-4">
                    <p className="text-white font-medium">{w.userId?.name || 'N/A'}</p>
                    <p className="text-slate-500 text-xs">{w.userId?.email}</p>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">${w.amount.toFixed(2)}</td>
                  <td className="p-4 font-mono text-emerald-400">${w.netAmount.toFixed(2)}</td>
                  <td className="p-4 font-mono text-slate-400 text-xs max-w-[140px] truncate">{w.walletAddress}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      w.status === 'rejected'  ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'}`}>{w.status}</span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(w.createdAt).toLocaleDateString()}</td>
                  {filter === 'pending' && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(w._id, 'approve')} disabled={processing === w._id}
                          className="flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50">
                          {processing === w._id ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle2 size={12}/>} Approve
                        </button>
                        <button onClick={() => handleAction(w._id, 'reject')} disabled={processing === w._id}
                          className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50">
                          <XCircle size={12}/> Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
