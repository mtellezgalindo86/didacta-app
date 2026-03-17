import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStaffMembers, fetchCampuses } from '../../api/staffApi';
import type { CampusOption } from '../../api/staffApi';
import type { StaffMemberResponse, StaffCategory } from '../../types/staff';
import { CATEGORY_OPTIONS } from '../../types/staff';
import CategoryBadge from '../../components/staff/CategoryBadge';
import AccessBadge from '../../components/staff/AccessBadge';
import StaffCreateModal from '../../components/staff/StaffCreateModal';

export default function StaffListView() {
  const navigate = useNavigate();

  const [items, setItems] = useState<StaffMemberResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');

  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCampuses()
      .then(setCampuses)
      .catch(console.error);
  }, []);

  const loadStaff = useCallback(() => {
    setLoading(true);
    setError(null);
    listStaffMembers({
      search: search || undefined,
      category: (categoryFilter as StaffCategory) || undefined,
      status: statusFilter || undefined,
      campusId: campusFilter || undefined,
    })
      .then(data => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => setError('No se pudo cargar el equipo. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [search, categoryFilter, statusFilter, campusFilter]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const hasFilters = search || categoryFilter || statusFilter || campusFilter;

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const handleCreated = () => {
    setShowCreateModal(false);
    loadStaff();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona el personal de tu institucion</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Agregar
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Todas las categorias</option>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Campus filter (only if >1) */}
            {campuses.length > 1 && (
              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos los campus</option>
                {campuses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Counter */}
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            {hasFilters ? `${items.length} resultados` : `${total} miembros`}
          </span>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={loadStaff}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Skeleton */}
            <div className="hidden md:block">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex gap-8">
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="px-6 py-4 border-b border-gray-100 flex gap-8 items-center">
                  <div className="flex items-center gap-3 w-48">
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3 p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
            </div>
            {hasFilters ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin resultados</h3>
                <p className="text-gray-500 text-sm">No se encontraron miembros con los filtros seleccionados.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aun no hay miembros</h3>
                <p className="text-gray-500 text-sm mb-4">Agrega al personal de tu institucion para comenzar.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  Agregar primer miembro
                </button>
              </>
            )}
          </div>
        )}

        {/* Desktop table */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">NOMBRE</th>
                    <th className="px-6 py-3">PUESTO</th>
                    <th className="px-6 py-3">CATEGORIA</th>
                    <th className="px-6 py-3">CAMPUS</th>
                    <th className="px-6 py-3">ACCESO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(member => (
                    <tr
                      key={member.id}
                      onClick={() => navigate(`/equipo/${member.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(member.firstName, member.lastName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {member.firstName} {member.lastName}
                            </div>
                            {member.assignments.length > 0 && (
                              <div className="text-xs text-gray-500 truncate">
                                {member.assignments.map(a => a.groupName).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{member.jobTitle || '-'}</td>
                      <td className="px-6 py-4">
                        <CategoryBadge category={member.category} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">{member.campusName || '-'}</td>
                      <td className="px-6 py-4">
                        <AccessBadge member={member} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map(member => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/equipo/${member.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {member.firstName} {member.lastName}
                        </span>
                        <AccessBadge member={member} />
                      </div>
                      {member.jobTitle && (
                        <p className="text-xs text-gray-500 mt-0.5">{member.jobTitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <CategoryBadge category={member.category} />
                        {member.campusName && (
                          <span className="text-xs text-gray-400">{member.campusName}</span>
                        )}
                      </div>
                      {member.assignments.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1.5">
                          {member.assignments.map(a => a.groupName).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <StaffCreateModal
          campuses={campuses}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
