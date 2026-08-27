import { Link } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">BaoHiemScam</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nền tảng cộng đồng giúp kiểm tra giao dịch viên, tiền cọc và báo cáo dấu hiệu lừa đảo trước khi giao dịch.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/gdv" className="hover:text-white transition">
                  Giao dịch viên
                </Link>
              </li>
              <li>
                <Link to="/bao-cao" className="hover:text-white transition">
                  Báo cáo scam
                </Link>
              </li>
              <li>
                <Link to="/bao-cao-scam" className="hover:text-white transition">
                  Gửi báo cáo
                </Link>
              </li>
              <li>
                <Link to="/gioi-thieu" className="hover:text-white transition">
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Liên hệ</h4>
            <a
              href="mailto:baohiemscam44@gmail.com"
              className="inline-flex items-center gap-2 text-sm hover:text-white transition"
            >
              <Mail className="w-4 h-4" />
              baohiemscam44@gmail.com
            </a>
            <p className="mt-4 text-xs text-gray-500">
              Dữ liệu do cộng đồng đóng góp. Luôn xác minh thêm trước khi giao dịch.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} BaoHiemScam. Chỉ mang tính chất tham khảo.
        </div>
      </div>
    </footer>
  );
}
