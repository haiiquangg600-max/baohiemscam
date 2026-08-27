import { useState, useEffect } from 'react';
import { reportsApi } from '../../services/api';
import { formatMoney, formatDate, statusLabel, statusBadgeClass } from '../../utils/format';
import { Check, X, Trash2, Eye } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState(null);

  const load = () => {
    setLoading(true);
    reportsApi
      .list({ status: filter || undefined, limit: 100 })
      .then((res) => setReports(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await reportsApi.updateStatus(id, status);
      load();
      setView(null);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa báo cáo này?')) return;
    try {
      await reportsApi.remove(id);
      load();
      setView(null);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo scam</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
          <option value="">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="verified">Đã xác minh</option>
          <option value="rejected">Từ chối</option>
          <option value="resolved">Đã xử lý</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse h-40 bg-gray-200 rounded-2xl" />
      ) : reports.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Không có báo cáo.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">GDV</th>
                <th className="px-4 py-3 font-medium">Số tiền</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Ngày</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">#{r.id}</td>
                  <td className="px-4 py-3">
                    {r.trader_number ? `GDV ${r.trader_number}` : '—'}
                  </td>
                  <td className="px-4 py-3">{formatMoney(r.scam_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setView(r)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                        title="Xem"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateStatus(r.id, 'verified')}
                            className="p-1.5 rounded-lg hover:bg-trust-50 text-trust-600"
                            title="Duyệt"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(r.id, 'rejected')}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                            title="Từ chối"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setView(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-bold text-lg">Báo cáo #{view.id}</h2>
              <button type="button" onClick={() => setView(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {view.scam_image_url && (
              <img
                src={view.scam_image_url}
                alt="Bằng chứng"
                className="w-full max-h-48 object-contain rounded-xl mb-4 bg-gray-50"
              />
            )}
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Mô tả</dt>
                <dd className="text-gray-900">{view.description}</dd>
              </div>
              {view.scam_facebook_url && (
                <div>
                  <dt className="text-gray-500">Facebook</dt>
                  <dd>
                    <a href={view.scam_facebook_url} target="_blank" rel="noreferrer" className="text-brand-600">
                      {view.scam_facebook_url}
                    </a>
                  </dd>
                </div>
              )}
              {view.scam_bank_account && (
                <div>
                  <dt className="text-gray-500">STK</dt>
                  <dd>{view.scam_bank_account}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Số tiền</dt>
                <dd className="font-semibold">{formatMoney(view.scam_amount)}</dd>
              </div>
              {view.reporter_contact && (
                <div>
                  <dt className="text-gray-500">Liên hệ người báo</dt>
                  <dd>{view.reporter_contact}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Trạng thái</dt>
                <dd>
                  <span className={statusBadgeClass(view.status)}>{statusLabel(view.status)}</span>
                </dd>
              </div>
            </dl>
            {view.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => updateStatus(view.id, 'verified')}
                  className="btn-success flex-1"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(view.id, 'rejected')}
                  className="btn-danger flex-1"
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
