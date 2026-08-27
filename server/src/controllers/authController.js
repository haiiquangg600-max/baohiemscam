import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const admin = await db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    await db.prepare('UPDATE admins SET last_login = NOW() WHERE id = ?').run(admin.id);

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    try {
      await db.prepare(
        'INSERT INTO admin_logs (admin_id, action, target_type) VALUES (?, ?, ?)'
      ).run(admin.id, 'login', 'auth');
    } catch (_) {}

    return res.json({
      success: true,
      data: { id: admin.id, username: admin.username, token },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function logout(req, res) {
  return res.json({ success: true, message: 'Đã đăng xuất' });
}

export async function me(req, res) {
  try {
    const admin = await db
      .prepare('SELECT id, username, created_at, last_login FROM admins WHERE id = ?')
      .get(req.admin.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin không tồn tại' });
    }
    return res.json({ success: true, data: admin });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}
