'use client';
import { Mail, Key, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

// Wrapped in Suspense because useSearchParams() requires it in Next.js App Router
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read email from query param: /verify-email?email=user@example.com
  const emailFromQuery = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync if query param changes
  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otp || otp.length < 6) {
      setError('Please enter a valid email and 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log('[VERIFY RESPONSE]', data);

      if (!response.ok) throw new Error(data.error || 'Verification failed');

      // Store token and redirect to dashboard
      if (data.token) {
        localStorage.setItem('smt_token', data.token);
        localStorage.setItem('smt_user', JSON.stringify(data.user));
      }

      setSuccess('Email verified! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 1500);

    } catch (err: any) {
      console.error('[VERIFY ERROR]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) { setError('Email address is missing'); return; }
    setError('');
    setResending(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Resend failed');
      setSuccess('New OTP sent to your email!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]">
      <div className="glass-panel w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verify Account</h1>
          <p className="text-slate-400 mt-2 text-sm">
            We sent a 6-digit OTP to{' '}
            <span className="text-purple-400 font-semibold">
              {email || 'your email'}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 size={15} /> {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {/* Email — pre-filled and locked from query param */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                readOnly={!!emailFromQuery}  // lock if passed from signup
                className={`w-full bg-slate-900 border rounded-lg py-3 pl-10 pr-4 text-white outline-none transition
                  ${emailFromQuery
                    ? 'border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'border-slate-700 focus:border-purple-500'}`}
              />
            </div>
          </div>

          {/* OTP */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-1">Verification OTP</label>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="• • • • • •"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // digits only
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition tracking-[0.5em] font-mono text-center text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Verifying...</> : 'Verify & Login'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Didn't receive code?{' '}
          <button
            onClick={handleResendOTP}
            disabled={resending}
            className="text-purple-400 font-bold hover:text-purple-300 inline-flex items-center gap-1 disabled:opacity-50"
          >
            {resending ? <><RefreshCw size={13} className="animate-spin" /> Sending...</> : 'Resend OTP'}
          </button>
        </p>
      </div>
    </div>
  );
}

// Suspense boundary required by Next.js for useSearchParams()
export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
