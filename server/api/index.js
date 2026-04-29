import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let connectionPromise;

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function allowedOrigins() {
  return process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()).filter(Boolean) || [];
}

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins().includes(origin) || (process.env.NODE_ENV !== 'production' && localOriginPattern.test(origin));
}

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin)) return false;

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, Authorization');
  return true;
}

export default async function handler(req, res) {
  const corsAllowed = applyCorsHeaders(req, res);

  if (!corsAllowed) {
    return res.status(403).json({ message: 'Origin not allowed by CORS' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.url === '/api/health' || req.url?.startsWith('/api/health?')) {
    return app(req, res);
  }

  try {
    if (!connectionPromise) connectionPromise = connectDB();
    await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    console.error('Database connection failed', error);
    return res.status(503).json({ message: 'Database unavailable. Check MongoDB Atlas network access and credentials.' });
  }
  return app(req, res);
}
