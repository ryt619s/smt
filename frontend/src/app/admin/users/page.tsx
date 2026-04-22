'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle2, Loader2, Search } from 'lucide-react';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers]       = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

  const fetchUsers = async (q = '') => {
    setLoading(true);
    const res  = await fetch(`http://localhost:5000/api/admin/users?search=${q}&limit=50`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(search); };

  const handleToggleBan = async (id: string) => {
    setProcessing(id);
    await fetch(`http://localhost:5000/api/admin/users/${id}/ban`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    fetchUsers(search);
    setProcessing(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-slate-500 text-sm">{total} total users</p>
        </div>
        <button onClick={() => router.push('/admin/dashboard')} className="text-slate-400 hover:text-white text-sm">← Dashboard</button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email or name..."
            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white outline-none focus:border-purple-500 text-sm transition" />
        </div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition">Search</button>
      </form>

      {loading ? <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-purple-500" size={32} /></div> : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 bg-slate-900/50 border-b border-slate-800">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Referral Code</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id} className="border-b border-slate-800/50 hover:bg-white/2 transition">
                  <td className="p-4">
                    <p className="text-white font-medium">{u.name}</p>
                    <p className="text-slate-500 text-xs">{u.email}</p>
                  </td>
                  <td className="p-4 font-mono text-purple-400 text-xs">{u.referralCode}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${u.isBanned ? 'bg-red-500/10 text-red-400' : u.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {u.isBanned ? 'Banned' : u.isVerified ? 'Active' : 'Unverified'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {u.role !== 'admin' && (
                      <button onClick={() => handleToggleBan(u._id)} disabled={processing === u._id}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${u.isBanned ? 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400' : 'bg-red-600/20 hover:bg-red-600/40 text-red-400'}`}>
                        {processing === u._id ? <Loader2 size={12} className="animate-spin"/> : u.isBanned ? <CheckCircle2 size={12}/> : <Ban size={12}/>}
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
