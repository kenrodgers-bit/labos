import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, '0.0.0.0', () => console.log(`LabOS API running on port ${port}`));
});
