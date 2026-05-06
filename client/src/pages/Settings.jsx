import { useEffect, useState } from 'react';
import { KeyRound, LogOut, Save, Settings as SettingsIcon, UserRound } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { roleLabel } from '../utils/format.js';

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const emptySettings = {
  hospitalName: '',
  facilityCode: '',
  county: '',
  subCounty: '',
  contactEmail: '',
  contactPhone: '',
  logoUrl: '',
  lowStockAlertMode: 'threshold'
};

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user.name, email: user.email });
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [systemSettings, setSystemSettings] = useState(emptySettings);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    setProfile({ name: user.name, email: user.email });
  }, [user.name, user.email]);

  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      setLoadingSettings(true);
      try {
        const { data } = await api.get('/system-settings');
        if (mounted) setSystemSettings({ ...emptySettings, ...data });
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err, 'System settings could not be loaded.'));
      } finally {
        if (mounted) setLoadingSettings(false);
      }
    }
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  async function submitProfile(event) {
    event.preventDefault();
    setError('');
    setSavingProfile(true);
    try {
      const payload = { name: profile.name };
      if (isAdmin) payload.email = profile.email;
      const { data } = await api.patch('/auth/me/profile', payload);
      updateUser(data.user);
      toast?.pushToast('Profile updated.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Profile could not be updated.'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    setError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    } // LabOS fix: frontend enforces the required minimum before calling the API.

    setSavingPassword(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }); // LabOS fix: password changes use the required all-users endpoint.
      setPasswordForm(emptyPasswordForm);
      toast?.pushToast('Password changed.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Password could not be changed.'));
    } finally {
      setSavingPassword(false);
    }
  }

  async function submitSystemSettings(event) {
    event.preventDefault();
    setError('');
    setSavingSettings(true);
    try {
      const { data } = await api.put('/system-settings', systemSettings);
      setSystemSettings({ ...emptySettings, ...data });
      toast?.pushToast('System settings updated.');
    } catch (err) {
      setError(apiErrorMessage(err, 'System settings could not be saved.'));
    } finally {
      setSavingSettings(false);
    }
  }

  function updatePasswordField(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  }

  function updateSystemField(field, value) {
    setSystemSettings((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-clinic-teal">
              <UserRound size={20} />
            </div>
            <h2 className="text-lg font-black text-clinic-ink">Profile</h2>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Role</dt><dd className="text-right text-slate-700">{roleLabel(user.role)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Department</dt><dd className="text-right text-slate-700">{isAdmin ? '-' : user.departmentId?.name || 'Unassigned'}</dd></div>
            {/* LabOS fix: admin profiles do not display a department assignment. */}
          </dl>

          <form onSubmit={submitProfile} className="mt-6 border-t border-slate-100 pt-5">
            <label className="block text-sm font-bold text-slate-700">Full name</label>
            <input className="input mt-2" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} minLength={2} maxLength={80} required />

            <label className="mt-4 block text-sm font-bold text-slate-700">Email</label>
            <input className="input mt-2" type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} disabled={!isAdmin} required />
            {!isAdmin && <p className="mt-2 text-xs font-semibold text-slate-500">Ask an administrator to change account email addresses.</p>}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary" disabled={savingProfile}><Save size={16} /> {savingProfile ? 'Saving...' : 'Save profile'}</button>
              <button type="button" className="btn-secondary" onClick={logout}><LogOut size={16} /> Sign out</button>
            </div>
          </form>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-clinic-blue">
              <KeyRound size={20} />
            </div>
            <h2 className="text-lg font-black text-clinic-ink">Password</h2>
          </div>

          <form onSubmit={submitPassword} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700 sm:col-span-2">Current password
              <input className="input mt-2" type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => updatePasswordField('currentPassword', event.target.value)} required />
            </label>
            <label className="block text-sm font-bold text-slate-700">New password
              <input className="input mt-2" type="password" autoComplete="new-password" minLength={8} value={passwordForm.newPassword} onChange={(event) => updatePasswordField('newPassword', event.target.value)} required />
            </label>
            <label className="block text-sm font-bold text-slate-700">Confirm password
              <input className="input mt-2" type="password" autoComplete="new-password" minLength={8} value={passwordForm.confirmPassword} onChange={(event) => updatePasswordField('confirmPassword', event.target.value)} required />
            </label>
            <div className="sm:col-span-2">
              <button className="btn-primary w-full sm:w-auto" disabled={savingPassword}><KeyRound size={16} /> {savingPassword ? 'Changing...' : 'Change password'}</button>
            </div>
          </form>
        </section>
      </div>

      {isAdmin && (
        <section className="panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <SettingsIcon size={20} />
            </div>
            <h2 className="text-lg font-black text-clinic-ink">System settings</h2>
          </div>
          {loadingSettings ? <LoadingSpinner label="Loading system settings" /> : (
            <form onSubmit={submitSystemSettings} className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ['hospitalName', 'Hospital name'],
                ['facilityCode', 'Facility code'],
                ['county', 'County'],
                ['subCounty', 'Sub-county'],
                ['contactEmail', 'Contact email'],
                ['contactPhone', 'Contact phone'],
                ['logoUrl', 'Logo URL']
              ].map(([field, label]) => (
                <label key={field} className="block text-sm font-bold text-slate-700">{label}
                  <input className="input mt-2" type={field === 'contactEmail' ? 'email' : 'text'} value={systemSettings[field] || ''} onChange={(event) => updateSystemField(field, event.target.value)} />
                </label>
              ))}
              <label className="block text-sm font-bold text-slate-700">Low stock alert behavior
                <select className="input mt-2" value={systemSettings.lowStockAlertMode} onChange={(event) => updateSystemField('lowStockAlertMode', event.target.value)}>
                  <option value="threshold">Threshold only</option>
                  <option value="threshold_or_zero">Threshold and zero stock</option>
                </select>
              </label>
              <div className="md:col-span-2">
                <button className="btn-primary" disabled={savingSettings}><Save size={16} /> {savingSettings ? 'Saving...' : 'Save system settings'}</button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
