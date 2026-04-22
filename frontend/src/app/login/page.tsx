'use client';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error.includes('verified')) {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      // Store auth info
      localStorage.setItem('smt_token', data.token);
      localStorage.setItem('smt_user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        localStorage.setItem('admin_token', data.token);
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      console.error('[LOGIN ERROR]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]">
      <div className="glass-panel w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Log in to your SMT Ecosystem account</p>
        </div>
        
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-1">Email</label>
            <div className="relative">
               <Mail className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
               <input 
                 type="email" 
                 placeholder="you@example.com" 
                 value={formData.email}
                 onChange={e => setFormData({ ...formData, email: e.target.value })}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" 
               />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
               <label className="text-sm font-semibold text-slate-300">Password</label>
               <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition">Forgot password?</Link>
            </div>
            <div className="relative">
               <Lock className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
               <input 
                 type="password" 
                 placeholder="••••••••" 
                 value={formData.password}
                 onChange={e => setFormData({ ...formData, password: e.target.value })}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" 
               />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-600/30 transition mt-6 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Authenticating...</> : 'Log In'}
          </button>
        </form>
        
        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account? <Link href="/signup" className="text-purple-400 font-bold hover:text-purple-300 transition">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
