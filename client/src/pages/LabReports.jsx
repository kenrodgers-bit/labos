import {
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  Moon,
  Printer,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Sun
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import MohAnalytics from '../components/labReports/MohAnalytics.jsx';
import MohDataGrid from '../components/labReports/MohDataGrid.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import {
  calculateTotalsWithTemplate,
  createDraftReport,
  currentPeriodMonth,
  formatPeriodMonth,
  normalizeEntriesWithTemplate,
  visibleEntriesForCategory
} from '../utils/labReports.js';

function SkeletonPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
      <div className="mt-5 h-64 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-clinic-ink dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

export default function LabReports({ user }) {
  const toast = useToast();
  const saveTimer = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [template, setTemplate] = useState(null);
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [periodMonth, setPeriodMonth] = useState(currentPeriodMonth());
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const categories = template?.categories || [];
  const active = categories.find((category) => category.key === activeCategory) || categories[0];
  const totals = useMemo(() => calculateTotalsWithTemplate(report?.entries || [], categories), [report?.entries, categories]);
  const categoryTotals = totals.categories.map((item) => ({ ...item, title: item.title }));
  const visibleEntries = active ? visibleEntriesForCategory(report?.entries || [], active, search) : [];

  async function load(month = periodMonth) {
    setLoading(true);
    try {
      const [templateResponse, reportsResponse, analyticsResponse] = await Promise.all([
        api.get('/lab-reports/template'),
        api.get('/lab-reports', { params: { periodMonth: month, limit: 6 } }),
        api.get('/lab-reports/analytics', { params: { months: 8 } })
      ]);
      const nextTemplate = templateResponse.data;
      setTemplate(nextTemplate);
      setActiveCategory((current) => current || nextTemplate.categories[0]?.key || '');
      setAnalytics(analyticsResponse.data);
      const existing = reportsResponse.data.reports?.[0];
      if (existing) {
        setReport({
          ...existing,
          entries: normalizeEntriesWithTemplate(existing.entries || [], nextTemplate.categories)
        });
      } else {
        setReport(createDraftReport({
          periodMonth: month,
          facility: { facilityName: 'County Referral Laboratory', county: 'Nairobi', subCounty: 'Westlands' },
          entries: normalizeEntriesWithTemplate(nextTemplate.sampleEntries || [], nextTemplate.categories)
        }));
      }
      setDirty(false);
    } catch (err) {
      toast?.pushToast(apiErrorMessage(err, 'MOH laboratory report could not be loaded.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(periodMonth); }, [periodMonth]);

  async function saveReport(nextStatus = report?.status || 'draft') {
    if (!report || !template) return null;
    setSaving(true);
    const payload = {
      ...report,
      status: nextStatus,
      totals: calculateTotalsWithTemplate(report.entries, template.categories)
    };
    try {
      const { data } = report._id
        ? await api.put(`/lab-reports/${report._id}`, payload)
        : await api.post('/lab-reports', payload);
      setReport({
        ...data.report,
        entries: normalizeEntriesWithTemplate(data.report.entries || [], template.categories)
      });
      setDirty(false);
      setLastSavedAt(new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }));
      return data.report;
    } catch (err) {
      toast?.pushToast(apiErrorMessage(err, 'Report could not be saved.'), 'error');
      return null;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!dirty || !report) return undefined;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveReport(), 900);
    return () => clearTimeout(saveTimer.current);
  }, [dirty, report]);

  function updateFacility(field, value) {
    setReport((current) => ({ ...current, facility: { ...current.facility, [field]: value } }));
    setDirty(true);
  }

  function updateSignoff(field, value) {
    setReport((current) => ({ ...current, [field]: value }));
    setDirty(true);
  }

  function updateCell(entry, fieldKey, rawValue) {
    const errorKey = `${entry.categoryKey}:${entry.testKey}:${fieldKey}`;
    const numeric = Number(rawValue);
    setValidationErrors((current) => {
      const next = { ...current };
      if (rawValue === '' || !Number.isFinite(numeric) || numeric < 0) next[errorKey] = 'Enter a non-negative number.';
      else delete next[errorKey];
      return next;
    });
    if (rawValue === '' || !Number.isFinite(numeric) || numeric < 0) return;
    setReport((current) => ({
      ...current,
      entries: current.entries.map((row) => (
        row.categoryKey === entry.categoryKey && row.testKey === entry.testKey
          ? { ...row, values: { ...row.values, [fieldKey]: numeric } }
          : row
      ))
    }));
    setDirty(true);
  }

  function handleCellKeyDown(event) {
    const index = Number(event.currentTarget.dataset.cellIndex);
    const direction = event.key === 'Enter' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!direction) return;
    const next = document.querySelector(`[data-cell-index="${index + direction}"]`);
    if (next) {
      event.preventDefault();
      next.focus();
      next.select?.();
    }
  }

  async function exportPdf() {
    const saved = report?._id ? report : await saveReport();
    if (!saved?._id && !report?._id) return;
    const reportId = saved?._id || report._id;
    const { data, headers } = await api.get(`/lab-reports/${reportId}/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([data], { type: headers['content-type'] || 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `labos-moh-lab-report-${report.periodMonth}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function submitReport() {
    const saved = await saveReport('submitted');
    if (saved) toast?.pushToast('MOH laboratory report submitted.');
  }

  if (loading || !report || !template) {
    return (
      <div className="space-y-5">
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  return (
    <div className={`moh-report-module ${darkMode ? 'dark' : ''}`}>
      <div className="space-y-5 rounded-[28px] bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white print:bg-white">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_48%,#ecfdf5_100%)] p-5 shadow-soft dark:border-slate-800 dark:bg-none dark:bg-slate-900 print:border-0 print:shadow-none">
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-blue-700 dark:text-blue-300">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-slate-950"><ShieldCheck size={16} /> MOH 706 / MOH 705 digital summary</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-slate-950"><CalendarDays size={16} /> {formatPeriodMonth(report.periodMonth)}</span>
              </div>
              <h2 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-clinic-ink dark:text-white lg:text-5xl">Laboratory Tests Data Summary Report</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                A structured hospital-grade reporting workspace for monthly urine analysis, blood chemistry, parasitology, haematology, bacteriology, histology, serology, specimen referral, and drug susceptibility testing.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <MetricCard label="Monthly workload" value={totals.workload} hint="Tests and specimens" />
              <MetricCard label="Positive / abnormal" value={totals.positives} hint="Clinical positives" />
              <MetricCard label="Resistant isolates" value={totals.resistant} hint="DST resistance" />
            </div>
          </div>
        </section>

        <section className="sticky top-16 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 print:static print:hidden">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-[160px_1fr_1fr_1fr_1fr]">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Month
                <input className="input mt-1 dark:border-slate-700 dark:bg-slate-950 dark:text-white" type="month" value={periodMonth} onChange={(event) => setPeriodMonth(event.target.value)} />
              </label>
              {[
                ['mflCode', 'MFL code'],
                ['facilityName', 'Facility name'],
                ['county', 'County'],
                ['subCounty', 'Sub county']
              ].map(([field, label]) => (
                <label key={field} className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}
                  <input className="input mt-1 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={report.facility?.[field] || ''} onChange={(event) => updateFacility(field, event.target.value)} />
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" onClick={() => setDarkMode((value) => !value)}>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? 'Light' : 'Dark'}
              </button>
              <button className="btn-secondary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" onClick={() => window.print()}><Printer size={16} /> Print</button>
              <button className="btn-secondary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" onClick={exportPdf}><Download size={16} /> PDF</button>
              <button className="btn-primary" onClick={() => saveReport()} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {dirty ? 'Save now' : lastSavedAt ? `Saved ${lastSavedAt}` : 'Save draft'}
              </button>
              <button className="btn-primary bg-blue-600 hover:bg-blue-700" onClick={submitReport}><Sparkles size={16} /> Submit</button>
            </div>
          </div>
        </section>

        <MohAnalytics analytics={analytics} categoryTotals={categoryTotals} />

        <section className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900 print:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} />
              <input className="input pl-9 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search test fields" />
            </div>
            <div className="mt-3 space-y-1">
              {categories.map((category) => {
                const itemTotal = categoryTotals.find((item) => item.key === category.key);
                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setActiveCategory(category.key)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${activeCategory === category.key ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/60 dark:text-blue-200 dark:ring-blue-900' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">{category.title}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-300">{itemTotal?.workload || 0}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Editable medical data grid</p>
                <h3 className="mt-1 text-2xl font-black text-clinic-ink dark:text-white">{active?.title}</h3>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <BarChart3 size={16} /> {visibleEntries.length} visible indicators
              </div>
            </div>

            {active && (
              <MohDataGrid
                category={active}
                entries={visibleEntries}
                validationErrors={validationErrors}
                onCellChange={updateCell}
                onCellKeyDown={handleCellKeyDown}
              />
            )}
          </main>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Report compiled by
              <input className="input mt-1 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={report.compiledBy || ''} onChange={(event) => updateSignoff('compiledBy', event.target.value)} placeholder={user?.name || 'Lab technologist'} />
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Designation
              <input className="input mt-1 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={report.designation || ''} onChange={(event) => updateSignoff('designation', event.target.value)} />
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Signature / approval note
              <input className="input mt-1 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={report.signature || ''} onChange={(event) => updateSignoff('signature', event.target.value)} />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
            <FileText size={16} /> Numeric fields are validated, totals calculate automatically, and edits auto-save after a short pause.
          </div>
        </section>
      </div>
    </div>
  );
}
