import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export default function TraderCard({ trader, index = 0 }) {
  const stagger = `stagger-${Math.min((index % 6) + 1, 6)}`;
  const label = trader.name
    ? `${trader.display_number}. ${trader.name}`
    : `GDV số ${trader.display_number}`;

  return (
    <Link
      to={`/gdv/${trader.id}`}
      className={`group block text-center animate-fade-up ${stagger}`}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-brand-400/40">
        {trader.avatar_url ? (
          <img
            src={trader.avatar_url}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <p className="mt-2.5 text-sm sm:text-base font-semibold text-gray-800 group-hover:text-brand-600 transition-colors line-clamp-2 px-1">
        {label}
      </p>
    </Link>
  );
}
