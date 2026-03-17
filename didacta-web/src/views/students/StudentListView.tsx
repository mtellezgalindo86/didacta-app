import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStudents } from '../../api/studentApi';
import type { StudentListItem } from '../../types/student';
import { STUDENT_STATUS_COLORS, STUDENT_STATUS_LABELS } from '../../types/student';
import type { StudentStatus } from '../../types/student';
import StudentCreateModal from '../../components/students/StudentCreateModal';
import didactaApi from '../../api/didactaApi';

interface GroupOption {
  id: string;
  name: string;
  gradeLevel: string;
}

type StatusFilter = 'ACTIVE' | 'INACTIVE' | '';

export default function StudentListView() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ACTIVE');

  const [showCreateModal, setShowCreateModal] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Load groups only once on mount
  useEffect(() => {
    didactaApi.get<GroupOption[]>('/api/onboarding/groups')
      .then(res => setGroups(res.data))
      .catch(console.error);
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    const studentParams: { status?: string; search?: string; groupId?: string } = {};
    if (statusFilter) studentParams.status = statusFilter;
    if (debouncedSearch) studentParams.search = debouncedSearch;
    if (groupFilter) studentParams.groupId = groupFilter;

    listStudents(studentParams)
      .then(data => setStudents(data))
      .catch(() => setError('No se pudo cargar los alumnos. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [statusFilter, debouncedSearch, groupFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasFilters = debouncedSearch || groupFilter || statusFilter !== 'ACTIVE';

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const getStatusBadge = (status: string) => {
    const colors = STUDENT_STATUS_COLORS[status as StudentStatus] || 'bg-gray-100 text-gray-500';
    const label = STUDENT_STATUS_LABELS[status as StudentStatus] || status;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
        {label}
      </span>
    );
  };

  const getGuardianLabel = (count: number) => {
    if (count === 0) return <span className="text-gray-400 text-xs">Sin tutores</span>;
    return (
      <span className="text-gray-600 text-sm">
        {count} {count === 1 ? 'tutor' : 'tutores'}
      </span>
    );
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadData();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los alumnos de tu institucion
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 self-start sm:self-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar alumno
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
              <option value="">Todos</option>
            </select>

            {/* Group filter */}
            {groups.length > 0 && (
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos los grupos</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}

            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Counter */}
        {!loading && !error && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {students.length} {students.length === 1 ? 'alumno' : 'alumnos'}
              {hasFilters ? ' encontrados' : ''}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Desktop skeleton */}
            <div className="hidden md:block">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex gap-8">
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="px-6 py-4 border-b border-gray-100 flex gap-8 items-center"
                >
                  <div className="flex items-center gap-3 w-48">
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-4"
                >
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
        {!loading && !error && students.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            {hasFilters ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sin resultados
                </h3>
                <p className="text-gray-500 text-sm">
                  No se encontraron alumnos con los filtros seleccionados.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aun no hay alumnos
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Agrega tu primer alumno para comenzar.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  Agregar primer alumno
                </button>
              </>
            )}
          </div>
        )}

        {/* Data */}
        {!loading && !error && students.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">NOMBRE</th>
                    <th className="px-6 py-3">GRUPO</th>
                    <th className="px-6 py-3">ESTADO</th>
                    <th className="px-6 py-3">TUTORES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => navigate(`/alumnos/${student.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(student.firstName, student.lastName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.groupName && (
                              <div className="text-xs text-gray-500 truncate md:hidden">
                                {student.groupName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.groupName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getGuardianLabel(student.guardianCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => navigate(`/alumnos/${student.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {getInitials(student.firstName, student.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {student.firstName} {student.lastName}
                        </span>
                        {getStatusBadge(student.status)}
                      </div>
                      {student.groupName && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {student.groupName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {student.guardianCount === 0
                          ? 'Sin tutores'
                          : `${student.guardianCount} ${student.guardianCount === 1 ? 'tutor' : 'tutores'}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create modal */}
      <StudentCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
