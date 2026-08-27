import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-gray-200">404</p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-gray-500">Trang bạn truy cập không tồn tại hoặc đã bị xóa.</p>
      <Link to="/" className="btn-primary mt-6">
        <Home className="w-4 h-4" />
        Quay về trang chủ
      </Link>
    </div>
  );
}
