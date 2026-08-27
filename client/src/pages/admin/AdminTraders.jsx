import { useState, useEffect } from 'react';
import { tradersApi } from '../../services/api';
import { Plus, Pencil, Trash2, X, User } from 'lucide-react';
import { formatMoney, statusLabel, statusBadgeClass } from '../../utils/format';

const emptyForm = { name: '', phone: '', facebook_url: '', deposit_amount: '', status: 'active' };

export default function AdminTraders() {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | trader object
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    setLoading(true);
    tradersApi
      .list({ limit: 100 })
      .then((res) => setTraders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFile(null);
    setError('');
    setModal('create');
  };

  const openEdit = (t) => {
    setForm({
      name: t.name || '',
      phone: t.phone,
      facebook_url: t.facebook_url || '',
      deposit_amount: t.deposit_amount,
      status: t.status,
    });
    setFile(null);
    setError('');
    setModal(t);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('avatar', file);

    try {
      if (modal === 'create') {
        await tradersApi.create(fd);
      } else {
        await tradersApi.update(modal.id, fd);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await tradersApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Giao dịch viên</h1>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Thêm GDV
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse h-40 bg-gray-200 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {traders.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">GDV số {t.display_number}</span>
                    <span className={statusBadgeClass(t.status)}>{statusLabel(t.status)}</span>
                  </div>
                  {t.name && <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{t.name}</p>}
                  <p className="text-sm text-gray-600 mt-0.5">{t.phone}</p>
                  <p className="text-sm font-semibold text-trust-700">{formatMoney(t.deposit_amount)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => openEdit(t)} className="btn-secondary flex-1 text-xs">
                  <Pencil className="w-3.5 h-3.5" /> Sửa
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(t.id)}
                  className="btn-danger flex-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <form
            onSubmit={handleSave}
            className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {modal === 'create' ? 'Thêm giao dịch viên' : `Sửa GDV số ${modal.display_number}`}
              </h2>
              <button type="button" onClick={() => setModal(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {error && <div className="p-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
            <div>
              <label className="label">Tên GDV</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nguyễn Văn A"
                className="input"
              />
            </div>
            <div>
              <label className="label">Số điện thoại *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Link Facebook</label>
              <input
                type="url"
                value={form.facebook_url}
                onChange={(e) => setForm((f) => ({ ...f, facebook_url: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Tiền cọc (VNĐ)</label>
              <input
                type="number"
                min="0"
                value={form.deposit_amount}
                onChange={(e) => setForm((f) => ({ ...f, deposit_amount: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="input"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
            <div>
              <label className="label">Avatar</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </form>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="font-semibold text-gray-900 mb-2">Xác nhận xóa</p>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn xóa giao dịch viên này?
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="btn-secondary flex-1">
                Hủy
              </button>
              <button type="button" onClick={handleDelete} className="btn-danger flex-1">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
