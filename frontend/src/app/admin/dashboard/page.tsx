'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, TrendingDown, Activity, Clock, Ban } from 'lucide-react';

interface Stats {
  users: { total: number; active: number; banned: number };
  balances: { usdt: number; smt: number };
  deposits: { totalApproved: number; pending: number };
  withdrawals: { totalCompleted: number; pending: number };
  fraud: { flaggedUsers: number };
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [flaggedUsers, setFlaggedUsers] = useState<any[]>([]);

  const fetchStats = async () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('smt_token');
    if (!token) { router.push('/admin/login'); return; }
    try {
      const [statsRes, flagRes] = await Promise.all([
        fetch('/api/admin/stats',         { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/flagged-users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.status === 403) { router.push('/admin/login'); return; }
      const data    = await statsRes.json();
      const flagData = await flagRes.json();
      setStats(data);
      setFlaggedUsers(flagData.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">Loading...</div>;
  if (!stats)  return null;

  const statCards = [
    { label: 'Total Users',     value: stats.users.total,                icon: Users,        color: 'purple' },
    { label: 'Active Users',    value: stats.users.active,               icon: Activity,     color: 'emerald' },
    { label: 'Banned Users',    value: stats.users.banned,               icon: Ban,          color: 'red' },
    { label: 'System USDT',     value: `$${stats.balances.usdt.toFixed(2)}`, icon: TrendingUp, color: 'blue' },
    { label: 'Total Deposited', value: `$${stats.deposits.totalApproved.toFixed(2)}`, icon: TrendingUp, color: 'green' },
    { label: 'Total Withdrawn', value: `$${stats.withdrawals.totalCompleted.toFixed(2)}`, icon: TrendingDown, color: 'orange' },
    { label: 'Flagged Users',   value: stats.fraud?.flaggedUsers ?? 0,   icon: Ban,          color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">SMT Ecosystem Control Center</p>
        </div>
        <div className="flex gap-3">
          {stats.deposits.pending > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1.5 rounded-full font-semibold">
              {stats.deposits.pending} Pending Deposits
            </span>
          )}
          {stats.withdrawals.pending > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full font-semibold">
              {stats.withdrawals.pending} Pending Withdrawals
            </span>
          )}
        </div>
      </div>

      {/* Fraud Alert */}
      {flaggedUsers.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 text-xl">⚠️</div>
          <div>
            <p className="text-red-400 font-bold">Suspicious Activity Detected</p>
            <p className="text-red-400/70 text-sm">{flaggedUsers.length} account(s) have been automatically flagged by the fraud detection engine.</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm">{label}</p>
              <Icon size={18} className="text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Users',        href: '/admin/users' },
          { label: 'Deposits',     href: '/admin/deposits' },
          { label: 'Withdrawals',  href: '/admin/withdrawals' },
          { label: 'Transactions', href: '/admin/transactions' },
        ].map(({ label, href }) => (
          <button key={href} onClick={() => router.push(href)}
            className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 rounded-xl p-4 text-center text-purple-300 font-semibold transition">
            {label}
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock size={18}/> Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-2 pr-4">User</th>
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-left py-2 pr-4">Amount</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((tx: any) => (
                <tr key={tx._id} className="border-b border-slate-800/50 hover:bg-white/2">
                  <td className="py-3 pr-4 text-slate-300">{tx.userId?.email || 'N/A'}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-white">${tx.amount?.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs ${tx.status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}`}>{tx.status}</span>
                  </td>
                  <td className="py-3 text-slate-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Flagged Users */}
      {flaggedUsers.length > 0 && (
        <div className="bg-[#0f172a] border border-red-900/50 rounded-xl p-5 mt-6">
          <h2 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
            🚨 Flagged Accounts ({flaggedUsers.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Risk Level</th>
                  <th className="text-left py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {flaggedUsers.map((u: any) => (
                  <tr key={u._id} className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 text-slate-300 font-mono text-xs">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        u.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                        u.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{u.riskLevel?.toUpperCase()}</span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs max-w-[300px] truncate">{u.fraudReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
