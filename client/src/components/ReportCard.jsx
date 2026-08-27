import { Link } from 'react-router-dom';
import { formatMoney, formatDate, statusLabel, statusBadgeClass } from '../utils/format';
import { Image as ImageIcon } from 'lucide-react';

export default function ReportCard({ report }) {
  return (
    <div className="card p-5">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
          {report.scam_image_url ? (
            <img
              src={report.scam_image_url}
              alt="Bằng chứng"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={statusBadgeClass(report.status)}>{statusLabel(report.status)}</span>
            <span className="text-xs text-gray-500">{formatDate(report.created_at)}</span>
          </div>
          {report.trader_number && (
            <p className="text-sm font-medium text-gray-800 mb-1">
              Liên quan GDV số {report.trader_number}
            </p>
          )}
          <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            {report.scam_amount > 0 && (
              <span className="font-semibold text-brand-600">{formatMoney(report.scam_amount)}</span>
            )}
            {report.scam_bank_account && <span>STK: {report.scam_bank_account}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
