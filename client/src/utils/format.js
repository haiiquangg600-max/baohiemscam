export function formatMoney(amount) {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr.includes('T') || dateStr.includes('Z') ? dateStr : dateStr + 'Z');
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr.includes('T') || dateStr.includes('Z') ? dateStr : dateStr + 'Z');
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(status) {
  const map = {
    active: 'Đang hoạt động',
    inactive: 'Không hoạt động',
    suspended: 'Tạm khóa',
    pending: 'Đang xem xét',
    verified: 'Đã xác minh',
    rejected: 'Không đủ bằng chứng',
    resolved: 'Đã xử lý',
  };
  return map[status] || status;
}

export function statusBadgeClass(status) {
  const map = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    suspended: 'badge-suspended',
    pending: 'badge-pending',
    verified: 'badge-verified',
    rejected: 'badge-rejected',
    resolved: 'badge-resolved',
  };
  return map[status] || 'badge-inactive';
}
