'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Wallet, Copy, ArrowDownToLine, ArrowUpFromLine, Activity, Clock, 
  CheckCircle2, Cpu, Fan, Users, TrendingUp, BarChart3, Zap, 
  Server, Terminal, ShieldAlert, ChevronRight, Loader, RefreshCcw
} from 'lucide-react';

interface User { name: string; email: string; referralCode: string; rank: string; }
interface Balances { availableBalance: number; lockedBalance: number; totalBalance: number; smt: number; walletAddress: string; }

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeMining, setActiveMining] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('smt_token');
      const ustr  = localStorage.getItem('smt_user');
      if (!token || !ustr) { router.push('/login'); return; }
      setUser(JSON.parse(ustr));

      try {
        const [balRes, txRes, miningRes, teamRes] = await Promise.all([
          fetch('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` }}),
          fetch('/api/wallet/transactions?limit=5', { headers: { Authorization: `Bearer ${token}` }}),
          fetch('/api/user/mining/packages', { headers: { Authorization: `Bearer ${token}` }}),
          fetch('/api/user/team', { headers: { Authorization: `Bearer ${token}` }})
        ]);
        
        if (balRes.status === 401) { localStorage.clear(); router.push('/login'); return; }
        
        const balData = await balRes.json();
        const txData  = await txRes.json();
        const miningData = await miningRes.json();
        const tStats = teamRes.ok ? await teamRes.json() : null;
        
        setBalances(balData.error ? { availableBalance: 0, lockedBalance: 0, totalBalance: 0, smt: 0, walletAddress: '' } : balData);
        setTransactions(txData.transactions || []);
        setActiveMining(miningData.packages || []);
        setTeamStats(tStats);
      } catch (e) {
        console.error('Failed to load dashboard data');
      }
    };
    fetchDashboardData();
  }, [router]);

  const copyReferral = () => {
    if (!user) return;
    // Fallback to origin if window exists
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard.writeText(`${origin}/signup?ref=${user.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted || !user || !balances) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader size={40} className="text-purple-500" />
        </motion.div>
      </div>
    );
  }

  const totalHashrate = activeMining.reduce((acc, p) => acc + p.hashrate, 0);

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-4 md:p-8 font-sans overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5">
            <div className="w-full h-full bg-[#0a0f1e] rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">{user.name}</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30 uppercase tracking-wider">
                Rank: {user.rank}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-end">
          <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest font-semibold">Your Invite Link</p>
          <div 
            onClick={copyReferral}
            className="flex items-center gap-3 bg-black/40 border border-white/10 hover:border-purple-500/50 rounded-xl p-3 cursor-pointer transition-all group backdrop-blur-md"
          >
            <span className="font-mono text-purple-300 font-bold tracking-wider">{user.referralCode}</span>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-400 group-hover:text-purple-300" />}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity"><Wallet size={64} className="text-emerald-500" /></div>
          <p className="text-emerald-400/80 text-sm font-bold uppercase tracking-wider mb-2">Total USDT</p>
          <h2 className="text-4xl font-black font-mono text-white mb-4">${balances.totalBalance.toFixed(2)}</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Available: <span className="text-white font-bold">${balances.availableBalance.toFixed(2)}</span></span>
            <span className="text-yellow-500/80">Locked: <span className="text-yellow-400 font-bold">${balances.lockedBalance.toFixed(2)}</span></span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity"><Activity size={64} className="text-purple-500" /></div>
          <p className="text-purple-400/80 text-sm font-bold uppercase tracking-wider mb-2">SMT Tokens</p>
          <h2 className="text-4xl font-black font-mono text-white mb-4">{balances.smt.toLocaleString(undefined, { maximumFractionDigits: 4 })}</h2>
          <div className="flex gap-2">
            <button onClick={() => router.push('/swap')} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-purple-500/20">Swap to USDT</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity"><Zap size={64} className="text-blue-500" /></div>
          <p className="text-blue-400/80 text-sm font-bold uppercase tracking-wider mb-2">Active Hashrate</p>
          <h2 className="text-4xl font-black font-mono text-white mb-4">{totalHashrate.toFixed(1)} <span className="text-xl text-blue-400">TH/s</span></h2>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">{activeMining.length} Active Rigs</span>
            <button onClick={() => router.push('/mining')} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">Upgrade <ChevronRight size={14}/></button>
          </div>
        </motion.div>
      </div>

      {/* Middle Section: Chart & Mining Rig */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Live Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[450px] relative">
          <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center backdrop-blur-md">
            <h3 className="font-bold text-lg flex items-center gap-2"><TrendingUp className="text-emerald-400"/> Live Market (SMT/USDT)</h3>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded animate-pulse border border-emerald-500/30">LIVE</span>
          </div>
          <div className="flex-1 w-full h-full bg-[#131722]">
            <iframe 
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=BINANCE%3ABTCUSDT&interval=D&symboledit=1&saveimage=1&toolbarbg=131722&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3ABTCUSDT" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allowTransparency={true} 
              scrolling="no" 
              allowFullScreen>
            </iframe>
          </div>
        </motion.div>

        {/* Mining Rig Terminal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-3xl border border-white/5 bg-gradient-to-b from-[#0f172a] to-[#020617] overflow-hidden flex flex-col h-[450px] relative shadow-[0_0_40px_rgba(59,130,246,0.1)]">
          <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-blue-400"><Server size={16}/> Mining Subsystem</h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between relative">
            {totalHashrate > 0 ? (
              <>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                <div className="flex justify-center mb-6 relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="relative z-10">
                    <Fan size={80} className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  </motion.div>
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                </div>
                
                <div className="space-y-4 font-mono text-sm relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-400 animate-pulse">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-slate-400">Current Hashrate</span>
                    <span className="text-white font-bold">{totalHashrate.toFixed(2)} TH/s</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-slate-400">Temp</span>
                    <span className="text-yellow-400">68°C</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-slate-400">Yield / Day</span>
                    <span className="text-purple-400 font-bold">~{(totalHashrate * 0.5).toFixed(2)} SMT</span>
                  </div>
                </div>

                <div className="mt-4 bg-black/50 rounded-lg p-3 border border-white/5 h-20 overflow-hidden relative">
                   <div className="text-[10px] text-emerald-500 font-mono flex flex-col gap-1 opacity-80 absolute bottom-3 w-full">
                     <p className="animate-pulse">{'>'} block solved 0x1A4...9F2</p>
                     <p>{'>'} accepting shares...</p>
                     <p>{'>'} hash rate stable at {totalHashrate.toFixed(2)}T</p>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 relative z-10">
                <ShieldAlert size={64} className="text-slate-500 mb-4" />
                <p className="text-slate-400 font-mono mb-2">NO ACTIVE RIGS</p>
                <button onClick={() => router.push('/mining')} className="mt-4 px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition">Deploy Hardware</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: MLM & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* MLM Team Stats */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-panel rounded-3xl border border-white/5 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><Users className="text-indigo-400"/> Referral Network</h3>
            <button onClick={() => router.push('/referrals')} className="text-xs font-bold text-indigo-400 hover:text-white transition bg-indigo-500/10 px-3 py-1.5 rounded-full">View Tree</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Direct Referrals</p>
              <p className="text-3xl font-black">{teamStats?.directCount || 0}</p>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Team Earnings</p>
              <p className="text-3xl font-black text-emerald-400">${teamStats?.totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs text-slate-500 uppercase font-bold tracking-widest border-b border-white/5 pb-2">Network Levels Overview</h4>
             {[1, 2, 3].map((level) => {
               const membersInLevel = teamStats?.network?.filter((n: any) => n.level === level).length || 0;
               const hashrateInLevel = teamStats?.network?.filter((n: any) => n.level === level).reduce((acc: number, n: any) => acc + n.hashrate, 0) || 0;
               return (
                 <div key={level} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 hover:bg-white/5 transition">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">L{level}</div>
                     <div>
                       <p className="text-sm font-bold">{membersInLevel} Members</p>
                       <p className="text-xs text-slate-500">{(level === 1 ? 12 : level === 2 ? 6 : 5)}% Commission Tier</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-mono text-blue-400">{hashrateInLevel.toFixed(1)} TH/s</p>
                   </div>
                 </div>
               );
             })}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="glass-panel rounded-3xl border border-white/5 p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><Clock className="text-slate-400"/> Recent Activity</h3>
            <button onClick={() => router.push('/transactions')} className="text-xs font-bold text-slate-400 hover:text-white transition">See All</button>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 opacity-50">
              <Activity size={40} className="text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-mono">No recent transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-900/60 border border-white/5 rounded-2xl hover:bg-slate-800/80 transition group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                      tx.type === 'deposit' ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 text-emerald-400 border border-emerald-500/20' : 
                      tx.type === 'withdraw' ? 'bg-gradient-to-br from-red-500/20 to-red-900/40 text-red-400 border border-red-500/20' : 
                      'bg-gradient-to-br from-purple-500/20 to-purple-900/40 text-purple-400 border border-purple-500/20'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownToLine size={20} /> : tx.type === 'withdraw' ? <ArrowUpFromLine size={20} /> : <RefreshCcw size={20}/>}
                    </div>
                    <div>
                      <p className="font-bold text-white capitalize text-sm">{tx.type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-black tracking-tight ${tx.type === 'deposit' ? 'text-emerald-400' : tx.type === 'mlm_reward' ? 'text-indigo-400' : 'text-white'}`}>
                      {tx.type === 'deposit' || tx.type.includes('reward') ? '+' : '-'}{tx.amount.toFixed(2)} {tx.asset}
                    </p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${tx.status === 'completed' ? 'text-emerald-500' : tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
