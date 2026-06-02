function getAppBaseUrl(req) {
  const fromEnv = process.env.APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (req) {
    const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
    const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
    if (host) {
      return `${proto}://${host}`;
    }
  }

  return 'http://localhost:5000';
}

module.exports = { getAppBaseUrl };
