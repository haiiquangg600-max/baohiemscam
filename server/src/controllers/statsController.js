import db from '../db.js';

export async function getStats(_req, res) {
  try {
    const totalTraders = (await db.prepare('SELECT COUNT(*)::int as c FROM traders').get()).c;
    const totalDeposit = (
      await db.prepare('SELECT COALESCE(SUM(deposit_amount), 0)::int as s FROM traders').get()
    ).s;
    const pendingReports = (
      await db.prepare("SELECT COUNT(*)::int as c FROM scam_reports WHERE status = 'pending'").get()
    ).c;
    const verifiedReports = (
      await db.prepare("SELECT COUNT(*)::int as c FROM scam_reports WHERE status = 'verified'").get()
    ).c;
    const rejectedReports = (
      await db.prepare("SELECT COUNT(*)::int as c FROM scam_reports WHERE status = 'rejected'").get()
    ).c;
    const resolvedReports = (
      await db.prepare("SELECT COUNT(*)::int as c FROM scam_reports WHERE status = 'resolved'").get()
    ).c;
    const searchCount = (await db.prepare('SELECT COUNT(*)::int as c FROM search_logs').get()).c;
    const activeTraders = (
      await db.prepare("SELECT COUNT(*)::int as c FROM traders WHERE status = 'active'").get()
    ).c;

    const recentReports = await db
      .prepare(
        `SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') as date, COUNT(*)::int as count
         FROM scam_reports
         WHERE created_at >= NOW() - INTERVAL '14 days'
         GROUP BY created_at::date
         ORDER BY date ASC`
      )
      .all();

    return res.json({
      success: true,
      data: {
        totalTraders,
        activeTraders,
        totalDeposit,
        pendingReports,
        verifiedReports,
        rejectedReports,
        resolvedReports,
        searchCount,
        recentReports,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

export async function logSearch(req, res) {
  try {
    const { q } = req.body;
    if (q && String(q).trim()) {
      await db.prepare('INSERT INTO search_logs (query) VALUES (?)').run(String(q).trim().slice(0, 200));
    }
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: true });
  }
}
