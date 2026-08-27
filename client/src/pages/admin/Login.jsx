import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import { authApi } from '../../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ username: username.trim(), password });
      if (res.data?.success) {
        navigate('/admin');
      } else {
        setError(res.data?.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      setError(msg);
      console.error('Login error:', err.response?.status, err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-brand-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,#ef4444_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#dc2626_0%,transparent_35%)]" />

      <div className="w-full max-w-sm relative z-10 animate-scale-in">
        <div className="text-center mb-8 animate-fade-down">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Đăng nhập</h1>
          <p className="text-sm text-gray-400 mt-1.5">BaoHiemScam Management</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-up"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 animate-fade-in">
              {error}
            </div>
          )}

          <div className="animate-fade-up stagger-1">
            <label className="label">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="adminbhsc"
                className="input pl-10"
              />
            </div>
          </div>

          <div className="animate-fade-up stagger-2">
            <label className="label">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 animate-fade-up stagger-3"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
