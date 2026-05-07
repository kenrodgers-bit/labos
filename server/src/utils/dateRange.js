const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseDateInput(value) {
  if (!value) return null;
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildDateRange({ from, to } = {}) {
  const range = {};
  const start = parseDateInput(from);
  const end = parseDateInput(to);

  if (start) range.$gte = start;
  if (end) {
    if (DATE_ONLY.test(to)) {
      const exclusiveEnd = new Date(end);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      range.$lt = exclusiveEnd;
    } else {
      range.$lte = end;
    }
  }

  return Object.keys(range).length ? range : null;
}
