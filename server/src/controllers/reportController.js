import db from '../db.js';
import { uploadToCloudinary } from '../middleware/upload.js';

function absoluteUrl(req, path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    // upgrade http->https for same host if needed
    if (path.startsWith('http://') && process.env.PUBLIC_URL?.startsWith('https://')) {
      return path.replace(/^http:\/\//i, 'https://');
    }
    return path;
  }
  const base = (process.env.PUBLIC_URL || `https://${req.get('host')}`).replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}

function mapReport(req, r) {
  if (!r) return r;
  return { ...r, scam_image_url: absoluteUrl(req, r.scam_image_url) };
}

export async function listReports(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const isAdmin = !!req.admin;
    const lim = Math.min(50, parseInt(limit, 10) || 20);
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * lim;

    let sql = `
      SELECT r.*, t.display_number as trader_number, t.phone as trader_phone
      FROM scam_reports r
      LEFT JOIN traders t ON r.trader_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (!isAdmin) {
      sql += " AND r.status IN ('verified', 'resolved')";
    } else if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(lim, offset);

    const reports = await db.prepare(sql).all(...params);

    let countSql = 'SELECT COUNT(*)::int as total FROM scam_reports r WHERE 1=1';
    const countParams = [];
    if (!isAdmin) {
      countSql += " AND r.status IN ('verified', 'resolved')";
    } else if (status) {
      countSql += ' AND r.status = ?';
      countParams.push(status);
    }
    const { total } = await db.prepare(countSql).get(...countParams);

    return res.json({
      success: true,
      data: reports.map((r) => mapReport(req, r)),
      pagination: { page: parseInt(page, 10) || 1, limit: lim, total },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function getReport(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const isAdmin = !!req.admin;

    const report = await db
      .prepare(
        `SELECT r.*, t.display_number as trader_number, t.phone as trader_phone
         FROM scam_reports r LEFT JOIN traders t ON r.trader_id = t.id WHERE r.id = ?`
      )
      .get(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }
    if (!isAdmin && !['verified', 'resolved'].includes(report.status)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }

    return res.json({ success: true, data: mapReport(req, report) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function createReport(req, res) {
  try {
    const {
      trader_id,
      scam_facebook_url,
      scam_bank_account,
      scam_amount,
      description,
      reporter_contact,
    } = req.body;

    if (!description || String(description).trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Mô tả phải có ít nhất 10 ký tự' });
    }

    const scam_image_url = req.file ? await uploadToCloudinary(req.file, 'baohiemscam/reports') : null;
    const tid = trader_id ? parseInt(trader_id, 10) : null;
    const amount = parseInt(scam_amount, 10) || 0;

    if (tid) {
      const t = await db.prepare('SELECT id FROM traders WHERE id = ?').get(tid);
      if (!t) {
        return res.status(400).json({ success: false, message: 'Giao dịch viên không tồn tại' });
      }
    }

    const result = await db
      .prepare(
        `INSERT INTO scam_reports
         (trader_id, scam_image_url, scam_facebook_url, scam_bank_account, scam_amount, description, reporter_contact)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        tid,
        scam_image_url,
        scam_facebook_url || null,
        scam_bank_account || null,
        amount,
        String(description).trim(),
        reporter_contact || null
      );

    return res.status(201).json({
      success: true,
      message: 'Báo cáo đã được tiếp nhận và đang chờ kiểm duyệt.',
      data: { id: result.lastInsertRowid },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function updateReportStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!['pending', 'verified', 'rejected', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const existing = await db.prepare('SELECT * FROM scam_reports WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }

    await db
      .prepare(`UPDATE scam_reports SET status = ?, reviewed_at = NOW() WHERE id = ?`)
      .run(status, id);

    try {
      await db
        .prepare('INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)')
        .run(req.admin.id, `report_${status}`, 'report', id);
    } catch (_) {}

    const report = await db.prepare('SELECT * FROM scam_reports WHERE id = ?').get(id);
    return res.json({ success: true, data: mapReport(req, report) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function deleteReport(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await db.prepare('SELECT id FROM scam_reports WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }
    await db.prepare('DELETE FROM scam_reports WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Đã xóa báo cáo' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}
