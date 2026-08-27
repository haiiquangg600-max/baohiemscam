import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { tradersApi } from '../services/api';
import TraderCard from '../components/TraderCard';

export default function Home() {
  const [q, setQ] = useState('');
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    tradersApi
      .list({ limit: 6 })
      .then((res) => setTraders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#ef4444_0%,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6 animate-fade-down">
              <Shield className="w-4 h-4 text-brand-300" />
              <span>Bảo vệ giao dịch của bạn</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight animate-fade-up">
              Kiểm tra giao dịch viên
              <br />
              <span className="text-brand-300">trước khi giao dịch</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto animate-fade-up stagger-2">
              Tra cứu thông tin giao dịch viên, tiền cọc và các báo cáo cộng đồng trước khi thực hiện giao dịch.
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto animate-fade-up stagger-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Số điện thoại, Facebook, STK, số GDV..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <button type="submit" className="btn-primary px-8 py-3.5 text-base whitespace-nowrap">
                  Tìm kiếm
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3 animate-fade-up stagger-4">
              <Link to="/gdv" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-transform hover:scale-105">
                <Users className="w-4 h-4" />
                Xem GDV
              </Link>
              <Link to="/bao-cao-scam" className="btn bg-brand-600 hover:bg-brand-500 text-white transition-transform hover:scale-105">
                <AlertTriangle className="w-4 h-4" />
                Báo cáo scam
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured traders */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Giao dịch viên</h2>
            <p className="text-sm text-gray-500 mt-1">Danh sách GDV có thông tin tiền cọc</p>
          </div>
          <Link to="/gdv" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 h-48 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : traders.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Chưa có giao dịch viên nào.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {traders.map((t, i) => (
              <TraderCard key={t.id} trader={t} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-brand-50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gặp dấu hiệu lừa đảo?</h2>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Gửi báo cáo kèm bằng chứng để cộng đồng cùng cảnh báo.
          </p>
          <Link to="/bao-cao-scam" className="btn-primary mt-6 inline-flex">
            <AlertTriangle className="w-4 h-4" />
            Gửi báo cáo ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
