import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileWarning,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { authApi } from '../services/api';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/gdv', label: 'Giao dịch viên', icon: Users },
  { to: '/admin/bao-cao', label: 'Báo cáo scam', icon: FileWarning },
];

export default function AdminLayout() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authApi
      .me()
      .then((res) => setAdmin(res.data.data))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 text-gray-300 fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">BaoHiemScam</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 px-3 mb-2">{admin.username}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full hover:bg-gray-800 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-gray-900 text-white flex items-center px-4 z-30">
        <button type="button" onClick={() => setSidebarOpen(true)} className="p-1">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 font-semibold text-sm">Admin</span>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-gray-300 flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-gray-800">
              <span className="font-bold text-white text-sm">BaoHiemScam</span>
              <button type="button" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-brand-600 text-white' : 'hover:bg-gray-800'
                    }`
                  }
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
