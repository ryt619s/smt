'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Copy, CheckCircle2, TrendingUp, Network, Loader2, ArrowLeft } from 'lucide-react';

export default function Referrals() {
  const router = useRouter();
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('smt_user') || '{}') : {};

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem('smt_token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch('http://localhost:5000/api/user/team', { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        setTeamStats(data);
      } catch (err) {
        console.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [router]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const refUrl = `http://localhost:3000/signup?ref=${user.referralCode}`;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Network className="text-purple-400" /> Affiliate Network</h1>
          <p className="text-slate-500 mt-1 text-sm">Grow your team line to earn up to 10 levels deep</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-slate-400 hover:text-white transition">
           <ArrowLeft size={16}/> Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Referral Link & Code */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4">Your Referral Link</h2>
          
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between mb-4">
             <div className="overflow-hidden">
               <span className="text-xs text-slate-500 block mb-1">Affiliate URL</span>
               <code className="text-emerald-400 text-sm font-semibold truncate block max-w-[250px]">{refUrl}</code>
             </div>
             <button onClick={() => handleCopy(refUrl, 'url')} className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition">
               {copied === 'url' ? <CheckCircle2 size={18}/> : <Copy size={18} />}
             </button>
          </div>

          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
             <div>
               <span className="text-xs text-slate-500 block mb-1">Direct Code</span>
               <code className="text-purple-400 text-lg font-bold font-mono">{user.referralCode}</code>
             </div>
             <button onClick={() => handleCopy(user.referralCode, 'code')} className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition">
               {copied === 'code' ? <CheckCircle2 size={18}/> : <Copy size={18} />}
             </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-purple-900/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <h2 className="text-lg font-bold mb-6">Team Performance</h2>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex flex-shrink-0 items-center justify-center">
                <Users className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Direct Referrals (L1)</p>
                <p className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin w-5 h-5 mt-1" /> : teamStats?.directCount || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex flex-shrink-0 items-center justify-center">
                <TrendingUp className="text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Network Earnings</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">${loading ? '0.00' : (teamStats?.totalEarnings || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Downline Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl mt-6">
        <h2 className="text-lg font-bold mb-6">Direct Affiliates (Level 1)</h2>
        
        {loading ? (
           <div className="flex justify-center py-8"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
        ) : (!teamStats?.directDownlines || teamStats.directDownlines.length === 0) ? (
           <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
             <Users className="mx-auto mb-3 opacity-20" size={48} />
             <p>No affiliates registered yet.</p>
             <p className="text-sm mt-1">Share your referral link to build your team!</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="text-left py-3 pr-4">User</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.directDownlines.map((node: any) => (
                  <tr key={node._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                    <td className="py-4 pr-4">
                      <p className="font-bold text-white">{node.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{node.userId?.email || ''}</p>
                    </td>
                    <td className="py-4 pr-4">
                       <span className={`px-2 py-1 rounded text-xs font-semibold ${node.userId?.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                         {node.userId?.isVerified ? 'Active' : 'Unverified'}
                       </span>
                    </td>
                    <td className="py-4 text-slate-400 text-xs">
                      {new Date(node.userId?.createdAt || Date.now()).toLocaleDateString()}
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
