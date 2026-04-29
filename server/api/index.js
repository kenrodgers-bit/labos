import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let connectionPromise;

export default async function handler(req, res) {
  try {
    if (!connectionPromise) connectionPromise = connectDB();
    await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    throw error;
  }
  return app(req, res);
}
