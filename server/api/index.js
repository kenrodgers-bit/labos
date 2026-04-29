import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let connectionPromise;

export default async function handler(req, res) {
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
