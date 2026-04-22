'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Copy, ArrowDownToLine, ArrowUpFromLine, Activity, Clock, CheckCircle2 } from 'lucide-react';

interface User { name: string; email: string; referralCode: string; rank: string; }
interface Balances { availableBalance: number; lockedBalance: number; totalBalance: number; smt: number; walletAddress: string; }

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeMining, setActiveMining] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('smt_token');
      const ustr  = localStorage.getItem('smt_user');
      if (!token || !ustr) { router.push('/login'); return; }
      setUser(JSON.parse(ustr));

      try {
        const [balRes, txRes, miningRes] = await Promise.all([
          fetch('http://localhost:5000/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` }}),
          fetch('http://localhost:5000/api/wallet/transactions?limit=5', { headers: { Authorization: `Bearer ${token}` }}),
          fetch('http://localhost:5000/api/user/mining/packages', { headers: { Authorization: `Bearer ${token}` }})
        ]);
        if (balRes.status === 401) { localStorage.clear(); router.push('/login'); return; }
        
        const balData = await balRes.json();
        const txData  = await txRes.json();
        const miningData = await miningRes.json();
        
        if (balData.error) {
           setBalances({ availableBalance: 0, lockedBalance: 0, totalBalance: 0, smt: 0, walletAddress: '' });
        } else {
           setBalances(balData);
        }
        
        setTransactions(txData.transactions || []);
        setActiveMining(miningData.packages || []);
      } catch (e) {
        console.error('Failed to load dashboard data');
      }
    };
    fetchDashboardData();
  }, [router]);

  const copyReferral = () => {
    if (!user) return;
    navigator.clipboard.writeText(`http://localhost:3000/signup?ref=${user.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || !balances) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
          <p className="text-slate-400 text-sm">Rank: <span className="text-purple-400 font-semibold">{user.rank}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-800 rounded-lg p-2 cursor-pointer hover:border-purple-500/50 transition relative group" onClick={() => router.push('/referrals')}>
          <div className="flex flex-col px-3 border-r border-slate-700">
            <span className="text-xs text-slate-500 whitespace-nowrap">Referral Code <span className="hidden sm:inline">(Click for Stats)</span></span>
            <span className="font-mono text-purple-400 font-bold">{user.referralCode}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); copyReferral(); }} className="p-2 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white">
            {copied ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Balances Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-purple-900/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Wallet className="text-purple-400" size={20} />
            </div>
            <h2 className="text-lg font-bold">Wallet Balances</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Available</p>
              <p className="text-2xl font-bold font-mono text-emerald-400">${balances.availableBalance?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
              <p className="text-yellow-400 text-xs mb-1 uppercase tracking-wider">🔒 Locked</p>
              <p className="text-2xl font-bold font-mono text-yellow-400">${balances.lockedBalance?.toFixed(2) ?? '0.00'}</p>
              {(balances.lockedBalance ?? 0) > 0 && (
                <p className="text-yellow-500/70 text-xs mt-1">Pending withdrawal</p>
              )}
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Total USDT</p>
              <p className="text-2xl font-bold font-mono">${balances.totalBalance?.toFixed(2) ?? '0.00'}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">SMT Tokens</p>
            <p className="text-3xl font-bold font-mono tracking-tight text-purple-400">{balances.smt?.toLocaleString() ?? '0'}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <button onClick={() => router.push('/deposit')} className="flex-1 min-w-[100px] bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
              Deposit
            </button>
            <button onClick={() => router.push('/withdraw')} className="flex-1 min-w-[100px] bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition border border-slate-700">
              Withdraw
            </button>
            <button onClick={() => router.push('/swap')} className="flex-1 min-w-[100px] bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-purple-500/20 shadow-lg">
              Swap
            </button>
          </div>
        </div>

        {/* Active Mining Package Placeholder */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Activity className="text-blue-400" size={20} />
              </div>
              <h2 className="text-lg font-bold">Active Mining</h2>
            </div>
            
            {activeMining.length === 0 ? (
              <div className="text-center py-6 border border-slate-800 bg-slate-900/50 rounded-xl mb-4">
                <p className="text-slate-500 mb-2">No active mining package</p>
                <p className="text-xs text-slate-400">Start mining to earn daily SMT yields</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {activeMining.slice(0, 2).map((ap) => (
                  <div key={ap._id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">{ap.packageType} Rig</p>
                      <p className="font-mono text-emerald-400 font-bold text-xs">{ap.hashrate} TH/s</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Active</span>
                  </div>
                ))}
                {activeMining.length > 2 && <p className="text-xs text-slate-500 text-center">+ {activeMining.length - 2} more</p>}
              </div>
            )}
          </div>
          <button onClick={() => router.push('/mining')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition">
            {activeMining.length > 0 ? 'Manage Hardware' : 'View Packages'}
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="text-slate-400" size={20} /> Recent Transactions</h2>
          <button onClick={() => router.push('/transactions')} className="text-sm text-purple-400 hover:text-purple-300 font-semibold transition">
            View All
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No recent transactions</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type === 'deposit' ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}
                  </div>
                  <div>
                    <p className="font-bold capitalize">{tx.type}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-white'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs capitalize ${tx.status === 'completed' ? 'text-emerald-500' : tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
