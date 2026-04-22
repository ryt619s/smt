'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpFromLine, Key, Loader2, AlertCircle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function Withdraw() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [withdrawalId, setWithdrawalId] = useState('');
  const [breakdown, setBreakdown] = useState<any>(null);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem('smt_token');
      if (!token) { router.push('/login'); return; }
      try {
        const res  = await fetch('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        if (!data.error) setAvailableBalance(data.availableBalance ?? 0);
      } catch { console.error('Failed fetching balance'); }
      finally { setFetching(false); }
    };
    fetchBalance();
  }, [router]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletAddress) { setError('Amount and wallet address are required'); return; }
    if (Number(amount) < 10) { setError('Minimum withdrawal is 10 USDT'); return; }
    if (Number(amount) > availableBalance) { setError(`Amount exceeds your available balance of $${availableBalance.toFixed(2)}`); return; }

    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('smt_token');
      const res = await fetch('/api/withdraw/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, walletAddress })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal request failed');
      
      setWithdrawalId(data.withdrawalId);
      setBreakdown(data.breakdown);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError('Enter 6-digit OTP'); return; }

    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('smt_token');
      const res = await fetch('/api/withdraw/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp, withdrawalId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <ArrowUpFromLine className="text-purple-400" /> Withdraw Funds
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {step === 1 && "Submit your withdrawal details"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Withdrawal Successfully Confirmed!"}
            </p>
          </div>

          {/* Available Balance Banner */}
          {step === 1 && !fetching && (
            <div className="mb-6 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm">
              <span className="text-slate-400">Available Balance</span>
              <span className="font-bold font-mono text-emerald-400">${availableBalance.toFixed(2)} USDT</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* STEP 1: AMOUNT & WALLET */}
          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Withdraw Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 font-bold">$</span>
                  <input type="number" min="10" max={availableBalance} step="any" placeholder="0.00" autoFocus required value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-8 pr-16 text-white outline-none focus:border-purple-500 transition font-mono" />
                  <span className="absolute right-4 top-3.5 text-slate-500 font-bold">USDT</span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Min: $10 USDT</span>
                  <span className="text-purple-400">Fee: 5% | Reinvest: 20%</span>
                </div>
                {Number(amount) > availableBalance && availableBalance > 0 && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <Lock size={12}/> Exceeds available balance of ${availableBalance.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Destination Wallet (TRC20)</label>
                <input type="text" placeholder="T..." required value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white outline-none focus:border-purple-500 transition font-mono text-sm" />
              </div>

              <button type="submit" disabled={loading || Number(amount) > availableBalance}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg transition mt-4">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Request Withdrawal'} <ArrowRight size={18} />
              </button>
              <button type="button" onClick={() => router.push('/dashboard')} className="w-full mt-3 text-slate-400 hover:text-white text-sm transition">Cancel</button>
            </form>
          )}

          {/* STEP 2: OTP VERIFY */}
          {step === 2 && (
            <form onSubmit={handleConfirm} className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-sm mb-6">
                <p className="text-slate-400 mb-2 border-b border-slate-800 pb-2">Withdrawal Breakdown</p>
                <div className="flex justify-between py-1 text-slate-300"><span>Gross Amount:</span> <span className="font-mono">${breakdown?.total.toFixed(2)}</span></div>
                <div className="flex justify-between py-1 text-red-400"><span>Platform Fee (5%):</span> <span className="font-mono">-${breakdown?.platformFee.toFixed(2)}</span></div>
                <div className="flex justify-between py-1 text-blue-400"><span>Auto-Reinvest (20%):</span> <span className="font-mono">-${breakdown?.autoReinvest.toFixed(2)}</span></div>
                <div className="flex justify-between py-2 mt-2 border-t border-slate-800 font-bold text-emerald-400">
                  <span>Net You Receive:</span> <span className="font-mono text-lg">${breakdown?.netToWallet.toFixed(2)}</span>
                </div>
                <p className="text-yellow-500/70 text-xs text-center mt-2 pt-2 border-t border-slate-800">
                  🔒 Funds are locked and pending admin release
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Check your email for the OTP</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                  <input type="text" maxLength={6} required placeholder="• • • • • •" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500 transition tracking-[0.5em] font-mono text-center text-lg" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm & Withdraw'}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Locked In</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                Your <span className="text-emerald-400 font-bold font-mono">${breakdown?.netToWallet.toFixed(2)} USDT</span> is locked pending admin approval. 
                You can track its status on your dashboard.
              </p>
              <button onClick={() => router.push('/dashboard')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 font-bold rounded-xl transition">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
