'use client';
import { ShieldCheck, Users, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-8 bg-[#0f172a]">
      <header className="mb-10 flex justify-between items-center text-white">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-red-500" /> Admin Control Center
          </h1>
          <p className="text-slate-400 mt-2">Full system override and monitoring.</p>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-white">
        <div className="glass-panel p-6 border-l-4 border-l-purple-500">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-3xl font-bold mt-2 flex justify-between items-center">
            18,452 <Users className="text-purple-500"/>
          </p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-emerald-500">
          <p className="text-sm text-slate-400">System USDT Balance</p>
          <p className="text-3xl font-bold mt-2 flex justify-between items-center">
            $450,230 <DollarSign className="text-emerald-500"/>
          </p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-blue-500">
          <p className="text-sm text-slate-400">Total Network Hashrate</p>
          <p className="text-3xl font-bold mt-2 flex justify-between items-center">
            4.2 PH/s <Activity className="text-blue-500"/>
          </p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-red-500">
          <p className="text-sm text-slate-400">Daily Reward Pool</p>
          <p className="text-3xl font-bold mt-2 flex justify-between items-center">
            $10,000 <DollarSign className="text-red-500"/>
          </p>
        </div>
      </main>
      
      {/* System Logs */}
      <section className="glass-panel p-6 text-white h-96 overflow-y-auto">
         <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Live System Activity Logs</h2>
         <div className="space-y-3 font-mono text-sm">
            <p><span className="text-emerald-400">[DEPOSIT]</span> 500 USDT received on wallet 0x1A2...4cD</p>
            <p><span className="text-purple-400">[MINING]</span> User ID #1042 purchased Ultra Package (1200 TH/s)</p>
            <p className="text-blue-400"><span className="text-blue-500">[SWAP]</span> 100 USDT swapped for 200 SMT (Price: 0.50)</p>
            <p><span className="text-yellow-500">[SWEEP]</span> 500 USDT swept to cold wallet via BNB relay.</p>
         </div>
      </section>
    </div>
  );
}
