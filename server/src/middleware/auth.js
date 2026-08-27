import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

export function optionalAuth(req, res, next) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.headers['x-access-token'];
  if (token) {
    try {
      req.admin = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // ignore
    }
  }
  next();
}
