import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tradersApi, reportsApi, statsApi } from '../services/api';
import TraderCard from '../components/TraderCard';
import ReportCard from '../components/ReportCard';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const debouncedQ = useDebounce(q, 400);
  const [traders, setTraders] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQ.trim()) {
      setTraders([]);
      setReports([]);
      return;
    }
    setParams({ q: debouncedQ });
    setLoading(true);
    statsApi.logSearch(debouncedQ).catch(() => {});

    Promise.all([
      tradersApi.list({ q: debouncedQ, limit: 20 }),
      reportsApi.list({ limit: 20 }),
    ])
      .then(([tRes, rRes]) => {
        setTraders(tRes.data.data || []);
        const allReports = rRes.data.data || [];
        const filtered = allReports.filter(
          (r) =>
            r.scam_bank_account?.includes(debouncedQ) ||
            r.scam_facebook_url?.toLowerCase().includes(debouncedQ.toLowerCase()) ||
            r.description?.toLowerCase().includes(debouncedQ.toLowerCase()) ||
            String(r.trader_number) === debouncedQ
        );
        setReports(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tìm kiếm</h1>

      <div className="relative max-w-xl mb-10">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SĐT, Facebook, STK, số GDV..."
          className="input pl-11 py-3"
          autoFocus
        />
      </div>

      {!debouncedQ.trim() ? (
        <p className="text-gray-500 text-center py-12">Nhập từ khóa để tìm kiếm</p>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-32 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Giao dịch viên ({traders.length})
            </h2>
            {traders.length === 0 ? (
              <p className="text-sm text-gray-500">Không tìm thấy GDV phù hợp.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {traders.map((t) => (
                  <TraderCard key={t.id} trader={t} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Báo cáo scam ({reports.length})
            </h2>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-500">Không tìm thấy báo cáo phù hợp.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <ReportCard key={r.id} report={r} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
