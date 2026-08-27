import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertTriangle, Upload, CheckCircle } from 'lucide-react';
import { reportsApi } from '../services/api';

export default function ReportForm() {
  const [searchParams] = useSearchParams();
  const traderId = searchParams.get('trader_id') || '';

  const [form, setForm] = useState({
    trader_id: traderId,
    scam_facebook_url: '',
    scam_bank_account: '',
    scam_amount: '',
    description: '',
    reporter_contact: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('File tối đa 5MB');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    if (file) fd.append('scam_image', file);

    try {
      await reportsApi.create(fd);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi báo cáo thất bại. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-trust-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo đã được tiếp nhận</h1>
        <p className="mt-2 text-gray-600 text-sm">
          Báo cáo của bạn đang chờ kiểm duyệt. Cảm ơn bạn đã đóng góp cho cộng đồng.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-brand-600" />
          Báo cáo scam
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Cung cấp thông tin và bằng chứng. Báo cáo sẽ được admin kiểm duyệt trước khi công khai.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
            {error}
          </div>
        )}

        {traderId && (
          <div>
            <label className="label">GDV được tố cáo</label>
            <input type="text" value={`GDV ID: ${traderId}`} disabled className="input bg-gray-50" />
            <input type="hidden" name="trader_id" value={traderId} />
          </div>
        )}

        <div>
          <label className="label">Ảnh bằng chứng *</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 transition">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-3" />
            ) : (
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — tối đa 5MB</p>
          </div>
        </div>

        <div>
          <label className="label">Link Facebook scam</label>
          <input
            type="url"
            name="scam_facebook_url"
            value={form.scam_facebook_url}
            onChange={handleChange}
            placeholder="https://facebook.com/..."
            className="input"
          />
        </div>

        <div>
          <label className="label">Số tài khoản ngân hàng</label>
          <input
            type="text"
            name="scam_bank_account"
            value={form.scam_bank_account}
            onChange={handleChange}
            placeholder="STK bị scam"
            className="input"
          />
        </div>

        <div>
          <label className="label">Số tiền bị scam (VNĐ)</label>
          <input
            type="number"
            name="scam_amount"
            value={form.scam_amount}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className="input"
          />
        </div>

        <div>
          <label className="label">Mô tả vụ việc *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            minLength={10}
            placeholder="Mô tả chi tiết sự việc (ít nhất 10 ký tự)..."
            className="input resize-y"
          />
        </div>

        <div>
          <label className="label">Thông tin liên hệ của bạn (tuỳ chọn)</label>
          <input
            type="text"
            name="reporter_contact"
            value={form.reporter_contact}
            onChange={handleChange}
            placeholder="SĐT / Zalo / Email"
            className="input"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
      </form>
    </div>
  );
}
