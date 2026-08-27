import { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import ReportCard from '../components/ReportCard';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    reportsApi
      .list({ page, limit })
      .then((res) => {
        setReports(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Báo cáo scam</h1>
          <p className="text-gray-500 mt-1 text-sm">Các báo cáo đã được kiểm duyệt và công khai</p>
        </div>
        <Link to="/bao-cao-scam" className="btn-primary">
          <AlertTriangle className="w-4 h-4" />
          Gửi báo cáo mới
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-500 py-16">Chưa có báo cáo công khai.</p>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary">
                Trước
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary">
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
