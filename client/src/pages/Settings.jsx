import { useEffect, useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { roleLabel } from '../utils/format.js';

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  async function submitProfile(event) {
    event.preventDefault();
    setProfileStatus({ type: '', message: '' });
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/auth/me/profile', { name });
      updateUser(data.user);
      setProfileStatus({ type: 'success', message: 'Name updated successfully.' });
    } catch (error) {
      setProfileStatus({ type: 'error', message: apiErrorMessage(error, 'Name could not be updated.') });
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    setPasswordStatus({ type: '', message: '' });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await api.patch('/auth/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm(emptyPasswordForm);
      setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
    } catch (error) {
      setPasswordStatus({ type: 'error', message: apiErrorMessage(error, 'Password could not be changed.') });
    } finally {
      setSavingPassword(false);
    }
  }

  function updatePasswordField(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-clinic-teal">
            <UserRound size={20} />
          </div>
          <h2 className="text-lg font-black text-clinic-ink">Profile</h2>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Name</dt><dd className="text-right font-semibold text-slate-800">{user.name}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Email</dt><dd className="text-right text-slate-700">{user.email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Role</dt><dd className="text-right text-slate-700">{roleLabel(user.role)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Department</dt><dd className="text-right text-slate-700">{user.departmentId?.name || 'Central Store'}</dd></div>
        </dl>

        {isAdmin && (
          <form onSubmit={submitProfile} className="mt-6 border-t border-slate-100 pt-5">
            <label className="block text-sm font-bold text-slate-700">Display name</label>
            <input
              className="input mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={80}
              required
            />
            {profileStatus.message && (
              <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${profileStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {profileStatus.message}
              </div>
            )}
            <button className="btn-primary mt-4 w-full sm:w-auto" disabled={savingProfile || name.trim() === user.name}>
              <Save size={16} /> {savingProfile ? 'Saving...' : 'Save name'}
            </button>
          </form>
        )}
      </section>

      <section className="panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-clinic-blue">
            <KeyRound size={20} />
          </div>
          <h2 className="text-lg font-black text-clinic-ink">Password</h2>
        </div>

        <form onSubmit={submitPassword} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
            Current password
            <input
              className="input mt-2"
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            New password
            <input
              className="input mt-2"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwordForm.newPassword}
              onChange={(event) => updatePasswordField('newPassword', event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Confirm password
            <input
              className="input mt-2"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
              required
            />
          </label>
          {passwordStatus.message && (
            <div className={`rounded-lg px-3 py-2 text-sm font-semibold sm:col-span-2 ${passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {passwordStatus.message}
            </div>
          )}
          <div className="sm:col-span-2">
            <button className="btn-primary w-full sm:w-auto" disabled={savingPassword}>
              <KeyRound size={16} /> {savingPassword ? 'Changing...' : 'Change password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
