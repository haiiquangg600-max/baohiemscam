import { Shield, Users, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Giới thiệu BaoHiemScam</h1>
      <p className="text-gray-600 leading-relaxed mb-8">
        BaoHiemScam là nền tảng cộng đồng giúp người dùng tra cứu thông tin giao dịch viên,
        mức tiền cọc và các báo cáo dấu hiệu lừa đảo trước khi thực hiện giao dịch online.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        {[
          { icon: Users, title: 'Danh sách GDV', desc: 'Thông tin số điện thoại, Facebook và tiền cọc của giao dịch viên.' },
          { icon: AlertTriangle, title: 'Báo cáo scam', desc: 'Cộng đồng gửi bằng chứng, admin kiểm duyệt trước khi công khai.' },
          { icon: Eye, title: 'Tra cứu nhanh', desc: 'Tìm theo SĐT, STK, link Facebook hoặc số GDV trong vài giây.' },
          { icon: Shield, title: 'Tham khảo', desc: 'Dữ liệu mang tính tham khảo. Luôn xác minh thêm trước khi giao dịch.' },
        ].map((item) => (
          <div key={item.title} className="card p-5">
            <item.icon className="w-8 h-8 text-brand-600 mb-3" />
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 bg-amber-50 border-amber-100">
        <h2 className="font-semibold text-gray-900 mb-2">Lưu ý quan trọng</h2>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
          <li>Dữ liệu do cộng đồng đóng góp, có thể chưa đầy đủ hoặc chưa cập nhật.</li>
          <li>Một báo cáo chưa được xác minh không đủ để kết luận cá nhân là scammer.</li>
          <li>Admin chỉ duyệt nội dung, không can thiệp tranh chấp giữa các bên.</li>
          <li>Liên hệ: baohiemscam44@gmail.com</li>
        </ul>
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/gdv" className="btn-primary">Xem GDV</Link>
        <Link to="/bao-cao-scam" className="btn-secondary">Gửi báo cáo</Link>
      </div>
    </div>
  );
}
