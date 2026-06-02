const { getAppBaseUrl } = require('./appUrl');

/** Lưu DB dạng /uploads/... thay vì URL localhost đầy đủ */
function normalizeStoredMediaPath(value) {
  if (value == null || value === '') return value;

  const trimmed = String(value).trim();
  if (trimmed.startsWith('/uploads/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname;
    }
  } catch {
    if (trimmed.startsWith('uploads/')) {
      return `/${trimmed}`;
    }
  }

  return trimmed;
}

/** URL đầy đủ để client hiển thị (dev: localhost, production: APP_URL hoặc host request) */
function resolveMediaUrl(value, req) {
  const path = normalizeStoredMediaPath(value);
  if (!path || typeof path !== 'string') return null;
  if (!path.startsWith('/uploads/')) return path;

  const base = getAppBaseUrl(req).replace(/\/$/, '');
  return `${base}${path}`;
}

function enrichMediaFields(record, req, fields = ['avatar_url']) {
  if (!record || typeof record !== 'object') return record;
  const out = { ...record };
  for (const field of fields) {
    if (out[field] != null && out[field] !== '') {
      out[field] = resolveMediaUrl(out[field], req);
    }
  }
  return out;
}

function enrichMediaList(list, req, fields = ['avatar_url']) {
  if (!Array.isArray(list)) return list;
  return list.map((row) => enrichMediaFields(row, req, fields));
}

module.exports = {
  normalizeStoredMediaPath,
  resolveMediaUrl,
  enrichMediaFields,
  enrichMediaList,
};
