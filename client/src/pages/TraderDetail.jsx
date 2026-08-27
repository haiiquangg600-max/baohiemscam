import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Phone, Facebook, Wallet, AlertTriangle, ArrowLeft, FileWarning } from 'lucide-react';
import { tradersApi } from '../services/api';
import { formatMoney, formatDate, formatDateTime, statusLabel, statusBadgeClass } from '../utils/format';
import ReportCard from '../components/ReportCard';

export default function TraderDetail() {
  const { id } = useParams();
  const [trader, setTrader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    tradersApi
      .get(id)
      .then((res) => setTrader(res.data.data))
      .catch(() => setError('Không tìm thấy giao dịch viên'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="card p-8 animate-pulse h-64 bg-gray-100" />
      </div>
    );
  }

  if (error || !trader) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">{error || 'Không tìm thấy'}</p>
        <Link to="/gdv" className="btn-secondary">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/gdv" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-gray-200 mx-auto sm:mx-0">
            {trader.avatar_url ? (
              <img src={trader.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">GDV số {trader.display_number}{trader.name ? ` — ${trader.name}` : ''}</h1>
              <span className={statusBadgeClass(trader.status)}>{statusLabel(trader.status)}</span>
            </div>
            <p className="text-sm text-gray-500">Tham gia: {formatDate(trader.created_at)}</p>
            {trader.updated_at !== trader.created_at && (
              <p className="text-xs text-gray-400 mt-0.5">Cập nhật: {formatDateTime(trader.updated_at)}</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Số điện thoại</p>
              <p className="font-semibold text-gray-900">{trader.phone}</p>
            </div>
          </div>
          {trader.facebook_url && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
              <Facebook className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Facebook</p>
                <a
                  href={trader.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 hover:underline truncate block max-w-[200px]"
                >
                  Xem trang
                </a>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-trust-50">
            <Wallet className="w-5 h-5 text-trust-600" />
            <div>
              <p className="text-xs text-gray-500">Tiền cọc</p>
              <p className="font-bold text-trust-700 text-lg">{formatMoney(trader.deposit_amount)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50">
            <FileWarning className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs text-gray-500">Báo cáo đã xác minh</p>
              <p className="font-bold text-amber-700 text-lg">{trader.report_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to={`/bao-cao-scam?trader_id=${trader.id}`}
            className="btn-primary"
          >
            <AlertTriangle className="w-4 h-4" />
            Tố cáo giao dịch viên này
          </Link>
        </div>
      </div>

      {trader.reports && trader.reports.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Báo cáo liên quan</h2>
          <div className="space-y-4">
            {trader.reports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
