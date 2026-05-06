import { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Mail, ServerCrash } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;
    api.get('/health')
      .then(() => mounted && setApiStatus('online'))
      .catch(() => mounted && setApiStatus('offline'));
    return () => {
      mounted = false;
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to sign in. Please confirm the API and database are available.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col justify-between bg-[radial-gradient(circle_at_top,#22d3ee_0%,#0f766e_38%,#083344_100%)] p-8 text-white lg:p-12">
        <div className="flex items-center gap-4">
          <img src="/labos-mark.png" alt="LabOS mark" className="h-14 w-14 rounded-2xl bg-white/90 object-cover p-1 shadow-lg" />
          <div>
            <h1 className="text-3xl font-black">LabOS</h1>
            <p className="text-sm text-teal-50">Hospital laboratory inventory</p>
          </div>
        </div>
        <div className="my-12 grid max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-teal-100">LAN-ready | role-based | audit tracked</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Clean stock control for busy Kenyan laboratories.</h2>
            <p className="mt-5 max-w-xl text-lg text-teal-50">Track commodities, approvals, expiry risk, stock movement, and MOH-style reporting from one secure workspace.</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img src="/labos-logo-glow.png" alt="LabOS glowing logo" className="w-full max-w-md rounded-[2rem] object-contain" />
          </div>
          {/* LabOS fix: use the supplied glow logo as the sign-in hero artwork. */}
        </div>
        <div className="grid gap-3 text-sm text-teal-50 sm:grid-cols-3">
          <span>Admin oversight</span>
          <span>Partial approvals</span>
          <span>PDF and Excel exports</span>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="panel w-full max-w-md p-6">
          <img src="/labos-logo-light.png" alt="LabOS logo" className="mx-auto mb-4 w-40 rounded-[1.5rem] object-contain" />
          {/* LabOS fix: replace the generic sign-in brand with the supplied primary logo artwork. */}
          <h2 className="text-2xl font-black text-clinic-ink">Secure sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use the account issued by the laboratory administrator.</p>
          <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${apiStatus === 'online' ? 'bg-emerald-50 text-emerald-700' : apiStatus === 'offline' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-500'}`}>
            {apiStatus === 'online' ? <CheckCircle2 size={15} /> : <ServerCrash size={15} />}
            {apiStatus === 'online' ? 'LabOS API online' : apiStatus === 'offline' ? 'LabOS API unavailable' : 'Checking LabOS API'}
          </div>
          {error && <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}
          <label className="mt-5 block text-sm font-bold text-slate-700">Email</label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input className="input pl-10" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <label className="mt-4 block text-sm font-bold text-slate-700">Password</label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input className="input pl-10" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">Contact the laboratory administrator for account creation, role assignment, or password reset.</p>
        </form>
      </section>
    </main>
  );
}
