import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { initDatabase } from './db.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

await initDatabase();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        cb(null, origin || true);
      } else {
        cb(null, allowedOrigins[0] || true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

app.use('/api', routes);

const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Loi may chu noi bo' });
});

app.listen(PORT, () => {
  console.log('BaoHiemScam server running on http://localhost:' + PORT);
});
