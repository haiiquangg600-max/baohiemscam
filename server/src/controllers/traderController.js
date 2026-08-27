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

function mapTrader(req, row) {
  if (!row) return row;
  return { ...row, avatar_url: absoluteUrl(req, row.avatar_url) };
}

function isValidUrl(u) {
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
}

async function getNextDisplayNumber() {
  const row = await db.prepare('SELECT MAX(display_number) as max_num FROM traders').get();
  return (row?.max_num || 0) + 1;
}

export async function listTraders(req, res) {
  try {
    const { q, status, page = 1, limit = 20 } = req.query;
    const lim = Math.min(50, parseInt(limit, 10) || 20);
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * lim;

    let sql =
      "SELECT t.*, (SELECT COUNT(*) FROM scam_reports r WHERE r.trader_id = t.id AND r.status = 'verified')::int as report_count FROM traders t WHERE 1=1";
    const params = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (q) {
      const term = `%${q}%`;
      sql +=
        ' AND (t.name ILIKE ? OR t.phone LIKE ? OR t.facebook_url ILIKE ? OR CAST(t.display_number AS TEXT) LIKE ?)';
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY t.display_number ASC LIMIT ? OFFSET ?';
    params.push(lim, offset);

    const traders = await db.prepare(sql).all(...params);

    let countSql = 'SELECT COUNT(*)::int as total FROM traders t WHERE 1=1';
    const countParams = [];
    if (status) {
      countSql += ' AND t.status = ?';
      countParams.push(status);
    }
    if (q) {
      const term = `%${q}%`;
      countSql +=
        ' AND (t.name ILIKE ? OR t.phone LIKE ? OR t.facebook_url ILIKE ? OR CAST(t.display_number AS TEXT) LIKE ?)';
      countParams.push(term, term, term, term);
    }
    const { total } = await db.prepare(countSql).get(...countParams);

    return res.json({
      success: true,
      data: traders.map((r) => mapTrader(req, r)),
      pagination: { page: parseInt(page, 10) || 1, limit: lim, total },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function getTrader(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const trader = await db
      .prepare(
        `SELECT t.*, (SELECT COUNT(*) FROM scam_reports r WHERE r.trader_id = t.id AND r.status = 'verified')::int as report_count
         FROM traders t WHERE t.id = ?`
      )
      .get(id);

    if (!trader) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch viên' });
    }

    const reports = await db
      .prepare(
        `SELECT id, scam_image_url, scam_facebook_url, scam_bank_account, scam_amount, description, status, created_at
         FROM scam_reports WHERE trader_id = ? AND status = 'verified' ORDER BY created_at DESC`
      )
      .all(id);

    return res.json({
      success: true,
      data: {
        ...mapTrader(req, trader),
        reports: reports.map((r) => ({
          ...r,
          scam_image_url: absoluteUrl(req, r.scam_image_url),
        })),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function createTrader(req, res) {
  try {
    const { name, phone, facebook_url, deposit_amount, status } = req.body;

    if (!phone || !/^[0-9+\-\s]{8,15}$/.test(String(phone).replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
    }
    if (facebook_url && !isValidUrl(facebook_url)) {
      return res.status(400).json({ success: false, message: 'Link Facebook không hợp lệ' });
    }

    const amount = parseInt(deposit_amount, 10) || 0;
    if (amount < 0) {
      return res.status(400).json({ success: false, message: 'Số tiền cọc không được âm' });
    }

    const display_number = await getNextDisplayNumber();
    const avatar_url = req.file ? await uploadToCloudinary(req.file, 'baohiemscam/avatars') : null;
    const st = ['active', 'inactive', 'suspended'].includes(status) ? status : 'active';

    const result = await db
      .prepare(
        `INSERT INTO traders (display_number, name, avatar_url, phone, facebook_url, deposit_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        display_number,
        (name || '').trim() || null,
        avatar_url,
        String(phone).trim(),
        facebook_url || null,
        amount,
        st
      );

    try {
      await db
        .prepare('INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)')
        .run(req.admin.id, 'create_trader', 'trader', result.lastInsertRowid);
    } catch (_) {}

    const trader = await db.prepare('SELECT * FROM traders WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, data: mapTrader(req, trader) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function updateTrader(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await db.prepare('SELECT * FROM traders WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch viên' });
    }

    const { name, phone, facebook_url, deposit_amount, status } = req.body;

    if (phone && !/^[0-9+\-\s]{8,15}$/.test(String(phone).replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
    }
    if (facebook_url && !isValidUrl(facebook_url)) {
      return res.status(400).json({ success: false, message: 'Link Facebook không hợp lệ' });
    }

    const amount =
      deposit_amount !== undefined ? parseInt(deposit_amount, 10) : existing.deposit_amount;
    if (amount < 0) {
      return res.status(400).json({ success: false, message: 'Số tiền cọc không được âm' });
    }

    const avatar_url = req.file ? await uploadToCloudinary(req.file, 'baohiemscam/avatars') : existing.avatar_url;
    const st =
      status && ['active', 'inactive', 'suspended'].includes(status) ? status : existing.status;

    await db
      .prepare(
        `UPDATE traders SET name = ?, phone = ?, facebook_url = ?, deposit_amount = ?, status = ?, avatar_url = ?,
         updated_at = NOW() WHERE id = ?`
      )
      .run(
        name !== undefined ? (String(name || '').trim() || null) : existing.name,
        phone ? String(phone).trim() : existing.phone,
        facebook_url !== undefined ? facebook_url || null : existing.facebook_url,
        amount,
        st,
        avatar_url,
        id
      );

    try {
      await db
        .prepare('INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)')
        .run(req.admin.id, 'update_trader', 'trader', id);
    } catch (_) {}

    const trader = await db.prepare('SELECT * FROM traders WHERE id = ?').get(id);
    return res.json({ success: true, data: mapTrader(req, trader) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function deleteTrader(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await db.prepare('SELECT * FROM traders WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch viên' });
    }

    await db.prepare('DELETE FROM traders WHERE id = ?').run(id);
    try {
      await db
        .prepare('INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)')
        .run(req.admin.id, 'delete_trader', 'trader', id);
    } catch (_) {}

    return res.json({ success: true, message: 'Đã xóa giao dịch viên' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}
