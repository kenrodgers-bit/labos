import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { dashboard } from './controllers/dashboardController.js';
import { asyncHandler } from './middleware/asyncHandler.js';
import { protect } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import auditRoutes from './routes/auditRoutes.js';
import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()).filter(Boolean) || [];
const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && localOriginPattern.test(origin))) {
    callback(null, true);
    return;
  }
  callback(new Error('Origin not allowed by CORS'));
}

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'LabOS API' }));
app.get('/api/dashboard', protect, asyncHandler(dashboard));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
