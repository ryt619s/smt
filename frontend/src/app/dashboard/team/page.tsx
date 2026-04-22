'use client';
import { useEffect, useState } from 'react';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TeamPage() {
  const [network, setNetwork] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCount: 0, totalTeamHashrate: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem('smt_token');
        const userStr = localStorage.getItem('smt_user');
        if (!token || !userStr) return;

        const user = JSON.parse(userStr);
        setReferralLink(`http://localhost:3000/signup?ref=${user.referralCode}`);

        const res = await fetch('/api/user/team', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        setNetwork(data.network || []);
        setStats({
           totalCount: data.totalCount || 0,
           totalTeamHashrate: data.totalTeamHashrate || 0,
           totalEarnings: data.totalEarnings || 0
        });
      } catch (err) {
        console.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={40}/></div>;

  return (
    <div className="min-h-screen p-8 lg:p-16 text-white max-w-6xl mx-auto">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
             <Users className="text-blue-500" /> MLM Network
           </h2>
           <p className="text-slate-400">Track your downlines up to 10 levels deep.</p>
        </div>
        <button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
           <UserPlus size={18} /> {copied ? 'Copied!' : 'Copy Invite Link'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div className="glass-panel p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Total Network Size</p>
            <p className="text-2xl font-bold">{stats.totalCount}</p>
         </div>
         <div className="glass-panel p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Active Network Hashrate</p>
            <p className="text-2xl font-bold font-mono">{stats.totalTeamHashrate} <span className="text-sm text-slate-500">TH/s</span></p>
         </div>
         <div className="glass-panel p-4 border-l-2 border-emerald-500 bg-emerald-500/5">
            <p className="text-emerald-500 font-semibold text-sm mb-1">Total Earned (USDT from Network)</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">${stats.totalEarnings.toFixed(2)}</p>
         </div>
      </div>

      <div className="glass-panel overflow-hidden border border-slate-800 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-sm font-bold text-slate-400">
              <th className="p-4">User Email / Account</th>
              <th className="p-4">Level</th>
              <th className="p-4">Active Hashrate</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {network.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-slate-500">No active network members yet. Share your invite link!</td></tr>
            )}
            {network.map((node, idx) => (
              <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition text-sm">
                <td className="p-4">
                  <p className="font-mono text-white">{node.user?.email}</p>
                  <p className="text-xs text-slate-500 mt-1">Joined: {new Date(node.user?.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="p-4">
                   <span className="bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)] text-blue-400 px-2 py-1 rounded text-xs font-bold">Level {node.level}</span>
                </td>
                <td className="p-4 font-mono font-bold text-slate-300">{node.hashrate} TH/s</td>
                <td className="p-4">
                   <span className={`px-2 py-1 rounded pb-[2px] font-semibold text-xs ${node.user?.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                     {node.user?.status === 'active' ? 'Active' : 'Inactive'}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
