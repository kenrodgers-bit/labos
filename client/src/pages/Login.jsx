import { useState } from 'react';
import { FlaskConical, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@labos.local');
  const [password, setPassword] = useState('LabOS@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { name, email, password });
      }
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
          <p className="text-sm font-bold uppercase tracking-widest text-teal-100">LAN-ready · role-based · audit tracked</p>
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
          <h2 className="text-2xl font-black text-clinic-ink">{mode === 'login' ? 'Secure sign in' : 'Register lab staff'}</h2>
          <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Use seeded demo accounts after running `npm run seed`.' : 'New public registrations are limited to Lab Staff access.'}</p>
          {error && <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}
          {mode === 'register' && (
            <>
              <label className="mt-5 block text-sm font-bold text-slate-700">Full name</label>
              <input className="input mt-2" value={name} onChange={(event) => setName(event.target.value)} required />
            </>
          )}
          <label className="mt-5 block text-sm font-bold text-slate-700">Email</label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input className="input pl-10" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <label className="mt-4 block text-sm font-bold text-slate-700">Password</label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input className="input pl-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          <button type="button" className="mt-3 w-full text-sm font-bold text-teal-700" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register a lab staff account' : 'Back to sign in'}
          </button>
          <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            Admin: admin@labos.local<br />
            Manager: manager@labos.local<br />
            Staff: haem.staff@labos.local<br />
            Password: LabOS@12345
          </div>
        </form>
      </section>
    </main>
  );
}
