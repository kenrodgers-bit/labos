export function currentPeriodMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function formatPeriodMonth(periodMonth) {
  if (!periodMonth) return '-';
  const [year, month] = periodMonth.split('-').map(Number);
  return new Intl.DateTimeFormat('en-KE', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

export function normalizeEntriesWithTemplate(entries = [], categories = []) {
  const incoming = new Map(entries.map((entry) => [`${entry.categoryKey}:${entry.testKey}`, entry]));
  return categories.flatMap((category) => category.tests.map(([testKey, testName, group]) => {
    const current = incoming.get(`${category.key}:${testKey}`);
    const values = Object.fromEntries(category.columns.map((field) => {
      const parsed = Number(current?.values?.[field.key] || 0);
      return [field.key, Number.isFinite(parsed) && parsed >= 0 ? parsed : 0];
    }));
    return { categoryKey: category.key, testKey, testName, group, values };
  }));
}

export function calculateTotalsWithTemplate(entries = [], categories = []) {
  const entryMap = new Map(entries.map((entry) => [`${entry.categoryKey}:${entry.testKey}`, entry]));
  const categoryTotals = categories.map((category) => {
    let workload = 0;
    let positives = 0;
    let resistant = 0;
    const totals = Object.fromEntries(category.columns.map((field) => [field.key, 0]));

    category.tests.forEach(([testKey]) => {
      const entry = entryMap.get(`${category.key}:${testKey}`);
      category.columns.forEach((field) => {
        const value = Number(entry?.values?.[field.key] || 0);
        totals[field.key] += value;
        if (field.role === 'workload') workload += value;
        if (field.role === 'positive') positives += value;
        if (field.role === 'resistant') resistant += value;
      });
    });

    return { key: category.key, title: category.title, workload, positives, resistant, totals };
  });

  return {
    categories: categoryTotals,
    workload: categoryTotals.reduce((sum, category) => sum + category.workload, 0),
    positives: categoryTotals.reduce((sum, category) => sum + category.positives, 0),
    resistant: categoryTotals.reduce((sum, category) => sum + category.resistant, 0)
  };
}

export function createDraftReport({ periodMonth = currentPeriodMonth(), facility = {}, entries = [] } = {}) {
  return {
    periodMonth,
    facility: {
      mflCode: facility.mflCode || '12345',
      facilityName: facility.facilityName || 'County Referral Laboratory',
      county: facility.county || 'Nairobi',
      subCounty: facility.subCounty || 'Westlands'
    },
    status: 'draft',
    compiledBy: '',
    designation: 'Lab Technologist',
    signature: '',
    entries
  };
}

export function visibleEntriesForCategory(entries, category, searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  return entries.filter((entry) => {
    if (entry.categoryKey !== category.key) return false;
    if (!term) return true;
    return `${entry.testName} ${entry.group}`.toLowerCase().includes(term);
  });
}
