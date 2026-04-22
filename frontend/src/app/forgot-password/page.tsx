'use client';
import { Mail, Key, Lock, Loader2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
      setSuccess(data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError('Enter a valid 6-digit OTP'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      setSuccess(data.message);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess(data.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]">
      <div className="glass-panel w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-slate-400 mt-2 text-sm">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && `We sent a 6-digit code to ${email}`}
            {step === 3 && "Create a new strong password"}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
            <Mail size={15} /> {success}
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-600/30 transition">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-1">Verification OTP</label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="• • • • • •" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition tracking-[0.5em] font-mono text-center text-lg" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-600/30 transition">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify Code'} <ArrowRight size={16} />
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full mt-2 flex justify-center items-center gap-1 text-slate-400 hover:text-white text-sm transition">
              <ArrowLeft size={14} /> Back to email
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-600/30 transition">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save New Password'}
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="text-center text-slate-400 mt-6 text-sm">
            Remembered your password? <Link href="/login" className="text-purple-400 font-bold hover:text-purple-300 transition">Log In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
