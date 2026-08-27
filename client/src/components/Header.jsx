import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Search, AlertTriangle } from 'lucide-react';

const nav = [
  { to: '/', label: 'Trang chủ' },
  { to: '/gdv', label: 'Giao dịch viên' },
  { to: '/bao-cao', label: 'Báo cáo scam' },
  { to: '/gioi-thieu', label: 'Giới thiệu' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              BaoHiem<span className="text-brand-600">Scam</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="SĐT, STK, GDV..."
                className="pl-9 pr-3 py-2 w-48 lg:w-56 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </form>
            <Link to="/bao-cao-scam" className="btn-primary text-sm">
              <AlertTriangle className="w-4 h-4" />
              Báo cáo scam
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm SĐT, STK, GDV..."
              className="input pl-9"
            />
          </form>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/bao-cao-scam"
            onClick={() => setOpen(false)}
            className="btn-primary w-full"
          >
            <AlertTriangle className="w-4 h-4" />
            Báo cáo scam
          </Link>
        </div>
      )}
    </header>
  );
}
