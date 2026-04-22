'use client';
import { Mail, Lock, User, Link2, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', referralCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Point directly to backend server to avoid Next.js routing issues
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data;
      try {
          data = await response.json();
      } catch (parseError) {
          throw new Error('API routing failed. Ensure backend server is running on port 5000.');
      }

      console.log('[SIGNUP RESPONSE]', data);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to email verification...');
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 2000);

    } catch (err: any) {
      console.error('[SIGNUP ERROR]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]">
      <div className="glass-panel w-full max-w-md p-8 relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2">Join the SMT Cloud Mining Network</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-1">Full Name</label>
            <div className="relative">
               <User className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
               <input 
                 type="text" 
                 placeholder="John Doe" 
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" 
               />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-1">Email</label>
            <div className="relative">
               <Mail className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
               <input 
                 type="email" 
                 placeholder="you@example.com" 
                 value={formData.email}
                 onChange={(e) => setFormData({...formData, email: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" 
               />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
               <Lock className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
               <input 
                 type="password" 
                 placeholder="••••••••" 
                 value={formData.password}
                 onChange={(e) => setFormData({...formData, password: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" 
               />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-1">Sponsor Code (Optional)</label>
            <div className="relative">
               <Link2 className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
               <input 
                 type="text" 
                 placeholder="e.g. SMTABC123" 
                 value={formData.referralCode}
                 onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" 
               />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-600/30 transition mt-6 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account? <Link href="/login" className="text-purple-400 font-bold hover:text-purple-300">Log in</Link>
        </p>
      </div>
    </div>
  );
}
