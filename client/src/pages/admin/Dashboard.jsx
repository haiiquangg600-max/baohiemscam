import { useState, useEffect } from 'react';
import { statsApi } from '../../services/api';
import { Users, Wallet, FileWarning, Search, CheckCircle, XCircle } from 'lucide-react';
import { formatMoney } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi
      .get()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded-2xl" />;
  }

  if (!stats) {
    return <p className="text-gray-500">Không tải được thống kê.</p>;
  }

  const cards = [
    { label: 'Tổng GDV', value: stats.totalTraders, icon: Users, color: 'bg-blue-500' },
    { label: 'GDV đang hoạt động', value: stats.activeTraders, icon: Users, color: 'bg-trust-500' },
    { label: 'Tổng tiền cọc', value: formatMoney(stats.totalDeposit), icon: Wallet, color: 'bg-emerald-500' },
    { label: 'Chờ duyệt', value: stats.pendingReports, icon: FileWarning, color: 'bg-amber-500' },
    { label: 'Đã xác minh', value: stats.verifiedReports, icon: CheckCircle, color: 'bg-trust-600' },
    { label: 'Từ chối', value: stats.rejectedReports, icon: XCircle, color: 'bg-red-500' },
    { label: 'Lượt tìm kiếm', value: stats.searchCount, icon: Search, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-lg font-bold text-gray-900">{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.recentReports?.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-4">Báo cáo 14 ngày gần đây</h2>
          <div className="flex items-end gap-2 h-32">
            {stats.recentReports.map((d) => {
              const max = Math.max(...stats.recentReports.map((x) => x.count), 1);
              const h = (d.count / max) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">{d.count}</span>
                  <div
                    className="w-full bg-brand-500 rounded-t"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  />
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
