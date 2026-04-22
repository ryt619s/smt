'use client';
import { useEffect, useState } from 'react';
import { Zap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function MiningPage() {
  const [packages, setPackages] = useState<any>({});
  const [activePackages, setActivePackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const colors: Record<string, string> = {
    Basic: 'from-blue-600 to-blue-400',
    Pro: 'from-purple-600 to-purple-400',
    Ultra: 'from-emerald-600 to-emerald-400'
  };

  const fetchMiningData = async () => {
    try {
      const token = localStorage.getItem('smt_token');
      if (!token) return;

      const [availRes, activeRes] = await Promise.all([
        fetch('/api/user/mining/available', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/mining/packages', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const availData = await availRes.json();
      const activeData = await activeRes.json();

      setPackages(availData.packages || {});
      setActivePackages(activeData.packages || []);
    } catch (err) {
      console.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiningData();
  }, []);

  const handleLease = async (type: string) => {
    setError('');
    setSuccess('');
    setPurchasing(type);

    try {
      const token = localStorage.getItem('smt_token');
      const res = await fetch('/api/user/mining/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to purchase package');

      setSuccess(`Successfully leased the ${type} GPU package!`);
      fetchMiningData(); // Refresh active packages list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;
  }

  return (
    <div className="min-h-screen p-8 lg:p-16 text-white max-w-6xl mx-auto">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>
      
      <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Zap className="text-yellow-400" /> GPU Hashrate Marketplace
      </h2>
      <p className="text-slate-400 mb-8">Purchase dynamic hashrate. Your share of the total network decides your daily payout.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 font-semibold">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 font-semibold">
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      {/* Available Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {Object.entries(packages).map(([name, pkg]: [string, any]) => {
          const isPurchasing = purchasing === name;
          return (
            <div key={name} className="glass-panel p-8 relative overflow-hidden group border border-slate-800">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[name] || 'from-slate-600 to-slate-400'} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              <h3 className="text-2xl font-black mb-2">{name}</h3>
              <p className="text-4xl pr-4 font-bold my-4">${pkg.cost} <span className="text-sm font-normal text-slate-400">USDT</span></p>
              
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 mb-6 relative z-10">
                <p className="text-sm text-slate-400">Guaranteed Power</p>
                <p className="font-mono text-xl text-white">{pkg.hashrate} TH/s</p>
              </div>

              <button 
                onClick={() => handleLease(name)}
                disabled={isPurchasing}
                className="w-full relative z-10 bg-white hover:bg-slate-200 text-slate-900 border border-transparent transition py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPurchasing ? <Loader2 className="animate-spin" size={18} /> : 'Lease GPU'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Hashrate Packages */}
      <h3 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Your Active Rigs</h3>
      {activePackages.length === 0 ? (
        <p className="text-slate-500 bg-white/5 border border-white/5 p-6 rounded-xl text-center">You have no active mining packages. Lease a GPU to start earning daily SMT yields!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePackages.map((ap) => (
            <div key={ap._id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-white">{ap.packageType} Rig</p>
                <p className="text-xs text-slate-500">Leased: {new Date(ap.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-emerald-400 font-bold text-xl">{ap.hashrate} TH/s</p>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded mt-1 inline-block font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
