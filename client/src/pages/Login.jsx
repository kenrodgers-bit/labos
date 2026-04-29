import { useState } from 'react';
import { FlaskConical, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col justify-between bg-clinic-teal p-8 text-white lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-clinic-teal"><FlaskConical /></div>
          <div>
            <h1 className="text-3xl font-black">LabOS</h1>
            <p className="text-sm text-teal-50">Hospital laboratory inventory</p>
          </div>
        </div>
        <div className="my-16 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-100">LAN-ready | role-based | audit tracked</p>
          <h2 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Clean stock control for busy Kenyan laboratories.</h2>
          <p className="mt-5 max-w-xl text-lg text-teal-50">Track commodities, approvals, expiry risk, stock movement, and MOH-style reporting from one secure workspace.</p>
        </div>
        <div className="grid gap-3 text-sm text-teal-50 sm:grid-cols-3">
          <span>Admin oversight</span>
          <span>Partial approvals</span>
          <span>PDF and Excel exports</span>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="panel w-full max-w-md p-6">
          <h2 className="text-2xl font-black text-clinic-ink">Secure sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use the account issued by the laboratory administrator.</p>
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
