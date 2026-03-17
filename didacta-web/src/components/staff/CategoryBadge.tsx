import type { StaffCategory } from '../../types/staff';
import { CATEGORY_LABELS } from '../../types/staff';

const CATEGORY_COLORS: Record<StaffCategory, string> = {
  DOCENTE: 'bg-blue-50 text-blue-700',
  COORDINACION: 'bg-purple-50 text-purple-700',
  DIRECCION: 'bg-indigo-50 text-indigo-700',
  ADMINISTRATIVO: 'bg-gray-100 text-gray-700',
  ESPECIALISTA: 'bg-teal-50 text-teal-700',
  APOYO: 'bg-orange-50 text-orange-700',
};

interface CategoryBadgeProps {
  category: StaffCategory;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700';
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
