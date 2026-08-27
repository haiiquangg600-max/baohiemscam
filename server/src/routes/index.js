import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { authRequired, optionalAuth } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import * as auth from '../controllers/authController.js';
import * as traders from '../controllers/traderController.js';
import * as reports from '../controllers/reportController.js';
import * as stats from '../controllers/statsController.js';
import db from '../db.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Quá nhiều lần thử đăng nhập. Thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Bạn đã gửi quá nhiều báo cáo. Thử lại sau 1 giờ.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ONE-TIME setup: create/update admin from env — remove after use
router.get('/setup-admin', async (req, res) => {
  try {
    const username = process.env.ADMIN_USERNAME || 'adminbhsc';
    const password = process.env.ADMIN_PASSWORD || 'phanhaiquang';
    const hash = bcrypt.hashSync(password, 12);
    const existing = await db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
    if (!existing) {
      await db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
    } else {
      await db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hash, username);
    }
    res.json({ success: true, message: 'Admin ready', username });
  } catch (e) {
    res.status(500).json({ success: false, message: String(e.message || e) });
  }
});

// Auth
router.post('/admin/login', loginLimiter, auth.login);
router.post('/admin/logout', authRequired, auth.logout);
router.get('/admin/me', authRequired, auth.me);

// Stats (admin)
router.get('/admin/stats', authRequired, stats.getStats);

// Traders public
router.get('/traders', traders.listTraders);
router.get('/traders/:id', traders.getTrader);

// Traders admin
router.post('/traders', authRequired, upload.single('avatar'), handleUploadError, traders.createTrader);
router.put('/traders/:id', authRequired, upload.single('avatar'), handleUploadError, traders.updateTrader);
router.delete('/traders/:id', authRequired, traders.deleteTrader);

// Reports public + create
router.get('/reports', optionalAuth, reports.listReports);
router.get('/reports/:id', optionalAuth, reports.getReport);
router.post('/reports', reportLimiter, upload.single('scam_image'), handleUploadError, reports.createReport);

// Reports admin
router.patch('/reports/:id/status', authRequired, reports.updateReportStatus);
router.delete('/reports/:id', authRequired, reports.deleteReport);

// Search log
router.post('/search-log', stats.logSearch);

export default router;
