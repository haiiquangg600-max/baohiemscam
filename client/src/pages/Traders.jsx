import { useState, useEffect } from 'react';
import { tradersApi } from '../services/api';
import TraderCard from '../components/TraderCard';
import { useDebounce } from '../hooks/useDebounce';
import { Search } from 'lucide-react';

export default function Traders() {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const debouncedQ = useDebounce(q, 400);
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    tradersApi
      .list({ q: debouncedQ || undefined, page, limit })
      .then((res) => {
        setTraders(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(() => setTraders([]))
      .finally(() => setLoading(false));
  }, [debouncedQ, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Giao dịch viên</h1>
        <p className="text-gray-500 mt-1 text-sm">Bấm vào ảnh để xem số điện thoại, Facebook, tiền cọc và báo cáo</p>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo tên, SĐT, Facebook, số GDV..."
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-52 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : traders.length === 0 ? (
        <p className="text-center text-gray-500 py-16">Không tìm thấy giao dịch viên.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {traders.map((t, i) => (
              <TraderCard key={t.id} trader={t} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary"
              >
                Trước
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
