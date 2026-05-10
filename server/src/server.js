import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(port, '0.0.0.0', () => console.log(`LabOS API running on port ${port}`));
} catch (error) {
  console.error(`Failed to start LabOS API: ${error.message}`);
  process.exit(1);
}
