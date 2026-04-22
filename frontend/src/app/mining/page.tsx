'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Cpu, Zap, CreditCard, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const PACKAGES = [
  { type: 'Basic', cost: 50, hashrate: 100, dailySMT: 5, color: 'blue' },
  { type: 'Pro', cost: 100, hashrate: 220, dailySMT: 12, color: 'purple' },
  { type: 'Ultra', cost: 500, hashrate: 1200, dailySMT: 65, color: 'emerald' },
];

export default function Mining() {
  const router = useRouter();
  const [activePackages, setActivePackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('smt_token');
      if (!token) return router.push('/login');
      const res = await fetch('http://localhost:5000/api/user/mining/packages', { headers: { Authorization: `Bearer ${token}` }});
      if (res.status === 401) { localStorage.clear(); router.push('/login'); return; }
      const data = await res.json();
      setActivePackages(data.packages || []);
    } catch {
      console.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handlePurchase = async (type: string, cost: number) => {
    if (!confirm(`Are you sure you want to purchase the ${type} package for $${cost} USDT?`)) return;
    setPurchasing(type); setError(''); setSuccess('');

    try {
      const token = localStorage.getItem('smt_token');
      const res = await fetch('http://localhost:5000/api/user/mining/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to purchase package');
      
      setSuccess(`Successfully acquired ${type} rig!`);
      setTimeout(() => setSuccess(''), 5000);
      fetchPackages();
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Cpu className="text-blue-400" /> SMT Cloud Mining</h1>
          <p className="text-slate-500 mt-1 text-sm">Purchase hashpower to start earning daily SMT tokens</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-slate-400 hover:text-white transition">
           <ArrowLeft size={16}/> Back
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-semibold text-center">{error}</div>}
      {success && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-semibold text-center flex justify-center items-center gap-2"><CheckCircle2/> {success}</div>}

      {/* Cloud Rigs */}
      <h2 className="text-xl font-bold mb-4">Available Hardware Rigs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {PACKAGES.map((pkg) => (
          <div key={pkg.type} className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition group relative">
            <div className={`h-2 w-full bg-${pkg.color}-500 transition-all duration-300`}></div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{pkg.type}</h3>
              <p className="text-slate-400 text-sm mb-6">Optimized for stable yield generation</p>
              
              <div className="my-6">
                <span className="text-4xl font-bold font-mono text-white">${pkg.cost}</span>
                <span className="text-slate-500 ml-1">USDT</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400 flex items-center gap-2"><Activity size={16}/> Hashrate</span>
                  <span className="font-bold text-white font-mono">{pkg.hashrate} TH/s</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400 flex items-center gap-2"><Zap size={16} className={`text-${pkg.color}-400`}/> Daily Output</span>
                  <span className={`font-bold text-${pkg.color}-400 font-mono`}>{pkg.dailySMT} SMT</span>
                </div>
              </div>

              <button 
                onClick={() => handlePurchase(pkg.type, pkg.cost)} 
                disabled={purchasing !== null}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                  purchasing === pkg.type ? 'bg-slate-800 text-slate-400' : 
                  `bg-${pkg.color}-600/20 hover:bg-${pkg.color}-600 border border-${pkg.color}-500/50 text-${pkg.color}-400 hover:text-white`
                }`}
              >
                {purchasing === pkg.type ? <Loader2 className="animate-spin" size={20}/> : <><CreditCard size={20} /> Purchase Rig</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Mining Machines */}
      <h2 className="text-xl font-bold mb-4">Your Active Mining Farms</h2>
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : activePackages.length === 0 ? (
           <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
             <Cpu className="mx-auto mb-3 opacity-20" size={48} />
             <p>No active mining hardware.</p>
             <p className="text-sm mt-1">Purchase a package above to initiate yielding protocol.</p>
             <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-4 text-blue-400 font-semibold text-sm hover:underline">Explore Packages ↑</button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePackages.map((p) => {
               const config = PACKAGES.find(c => c.type === p.packageType) || PACKAGES[0];
               return (
                <div key={p._id} className={`border border-${config.color}-900/50 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] p-5 rounded-xl`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2"><Activity size={18} className={`text-${config.color}-400`}/> {p.packageType} Rig</h3>
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">ONLINE</span>
                  </div>
                  <div className="flex justify-between text-sm mt-4 text-slate-300 font-mono bg-slate-900/50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500">Hashrate</p>
                      <p className="font-bold">{p.hashrate} TH/s</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Gross Return Rate</p>
                      <p className={`font-bold text-${config.color}-400`}>~{config.dailySMT} SMT/day</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 text-center">Acquired: {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
