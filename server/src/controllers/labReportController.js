import { jsPDF } from 'jspdf';
import autoTableModule from 'jspdf-autotable';
import LabReport from '../models/LabReport.js';
import { writeAudit } from '../utils/audit.js';
import { calculateReportTotals, createReportEntries, MOH_REPORT_CATEGORIES, normalizeReportEntries } from '../data/mohLabReportTemplate.js';

const autoTable = autoTableModule.default || autoTableModule;

function cleanPeriodMonth(value) {
  if (/^\d{4}-\d{2}$/.test(value || '')) return value;
  return new Date().toISOString().slice(0, 7);
}

function reportPayload(body, userId, existing) {
  const entries = body.entries?.length
    ? normalizeReportEntries(body.entries)
    : existing?.entries?.length
      ? normalizeReportEntries(existing.entries)
      : createReportEntries({ seedSample: Boolean(body.seedSample) });
  const status = body.status === 'submitted' ? 'submitted' : existing?.status || 'draft';
  return {
    periodMonth: cleanPeriodMonth(body.periodMonth || existing?.periodMonth),
    facility: {
      mflCode: body.facility?.mflCode ?? existing?.facility?.mflCode ?? '',
      facilityName: body.facility?.facilityName ?? existing?.facility?.facilityName ?? '',
      county: body.facility?.county ?? existing?.facility?.county ?? '',
      subCounty: body.facility?.subCounty ?? existing?.facility?.subCounty ?? ''
    },
    entries,
    totals: calculateReportTotals(entries),
    status,
    compiledBy: body.compiledBy ?? existing?.compiledBy ?? '',
    designation: body.designation ?? existing?.designation ?? '',
    signature: body.signature ?? existing?.signature ?? '',
    submittedAt: status === 'submitted' ? existing?.submittedAt || new Date() : undefined,
    lastSavedBy: userId
  };
}

export async function listLabReports(req, res) {
  const { periodMonth, status, limit = 12 } = req.query;
  const query = {
    ...(periodMonth ? { periodMonth: cleanPeriodMonth(periodMonth) } : {}),
    ...(status ? { status } : {})
  };
  const safeLimit = Math.min(Number(limit) || 12, 48);
  const reports = await LabReport.find(query).sort({ periodMonth: -1, updatedAt: -1 }).limit(safeLimit);
  res.json({ reports });
}

export async function labReportTemplate(req, res) {
  res.json({
    categories: MOH_REPORT_CATEGORIES,
    blankEntries: createReportEntries(),
    sampleEntries: createReportEntries({ seedSample: true })
  });
}

export async function createLabReport(req, res) {
  const payload = reportPayload(req.body, req.user._id);
  const report = await LabReport.create({ ...payload, createdBy: req.user._id });
  await writeAudit({
    action: 'lab_report.created',
    performedBy: req.user._id,
    details: `MOH laboratory report created for ${report.periodMonth}`,
    after: { reportId: report._id, periodMonth: report.periodMonth, totals: report.totals },
    req
  });
  res.status(201).json({ report });
}

export async function getLabReport(req, res) {
  const report = await LabReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Laboratory report not found.' });
  res.json({ report });
}

export async function updateLabReport(req, res) {
  const report = await LabReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Laboratory report not found.' });
  const before = report.toObject();
  Object.assign(report, reportPayload(req.body, req.user._id, report));
  await report.save();
  await writeAudit({
    action: report.status === 'submitted' ? 'lab_report.submitted' : 'lab_report.updated',
    performedBy: req.user._id,
    details: `MOH laboratory report saved for ${report.periodMonth}`,
    before: { reportId: report._id, status: before.status, totals: before.totals },
    after: { reportId: report._id, status: report.status, totals: report.totals },
    req
  });
  res.json({ report });
}

export async function labReportAnalytics(req, res) {
  const limit = Math.min(Number(req.query.months) || 6, 24);
  const reports = await LabReport.find().sort({ periodMonth: -1, updatedAt: -1 }).limit(limit);
  const chronological = [...reports].reverse();
  const trends = chronological.map((report) => ({
    month: report.periodMonth,
    workload: report.totals?.workload || 0,
    positives: report.totals?.positives || 0,
    resistant: report.totals?.resistant || 0
  }));
  const latest = chronological[chronological.length - 1];
  const categoryStats = latest?.totals?.categories?.map((category) => ({
    name: category.title,
    workload: category.workload || 0,
    positives: category.positives || 0,
    resistant: category.resistant || 0
  })) || [];
  res.json({ trends, categoryStats, latestPeriod: latest?.periodMonth || null });
}

export async function exportLabReportPdf(req, res) {
  const report = await LabReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Laboratory report not found.' });

  const entries = normalizeReportEntries(report.entries);
  const entryMap = new Map(entries.map((entry) => [`${entry.categoryKey}:${entry.testKey}`, entry]));
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MOH 706 / MOH 705 Laboratory Tests Data Summary Report', 40, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Facility: ${report.facility?.facilityName || '-'} | MFL: ${report.facility?.mflCode || '-'} | County: ${report.facility?.county || '-'} | Sub-county: ${report.facility?.subCounty || '-'} | Period: ${report.periodMonth}`, 40, 52);

  let startY = 72;
  MOH_REPORT_CATEGORIES.forEach((category) => {
    const head = [['Test / indicator', ...category.columns.map((field) => field.label)]];
    const body = category.tests.map(([testKey, testName, group]) => {
      const entry = entryMap.get(`${category.key}:${testKey}`);
      return [`${group} - ${testName}`, ...category.columns.map((field) => entry?.values?.[field.key] || 0)];
    });
    if (startY > 500) {
      doc.addPage('a4', 'landscape');
      startY = 40;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(category.title, 40, startY);
    autoTable(doc, {
      head,
      body,
      startY: startY + 8,
      theme: 'grid',
      styles: { fontSize: 6.8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [15, 118, 110], textColor: 255 },
      margin: { left: 40, right: 40 }
    });
    startY = doc.lastAutoTable.finalY + 20;
  });

  const filename = `labos-moh-lab-report-${report.periodMonth}.pdf`;
  const buffer = Buffer.from(doc.output('arraybuffer'));
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(buffer);
}
