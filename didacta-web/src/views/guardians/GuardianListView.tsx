import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGuardians } from '../../api/guardianApi';
import type { GuardianListItem } from '../../types/guardian';

export default function GuardianListView() {
  const navigate = useNavigate();

  const [items, setItems] = useState<GuardianListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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

  const loadGuardians = useCallback(() => {
    setLoading(true);
    setError(null);
    listGuardians({
      search: debouncedSearch || undefined,
    })
      .then(data => setItems(data))
      .catch(() => setError('No se pudo cargar el directorio de tutores. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  useEffect(() => {
    loadGuardians();
  }, [loadGuardians]);

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const renderStudentBadges = (names: string[]) => {
    const visible = names.slice(0, 3);
    const remaining = names.length - 3;
    return (
      <div className="flex flex-wrap gap-1">
        {visible.map((name, i) => (
          <span
            key={i}
            className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium"
          >
            {name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
            +{remaining} mas
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tutores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Directorio de tutores de la institucion
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
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
              placeholder="Buscar por nombre o telefono..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Counter */}
        {!loading && !error && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'tutor' : 'tutores'}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={loadGuardians}
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
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="px-6 py-4 border-b border-gray-100 flex gap-8 items-center">
                  <div className="flex items-center gap-3 w-56">
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2.5 w-36 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="flex gap-1">
                    <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                  </div>
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
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
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
                className="text-pink-600"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            {debouncedSearch ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin resultados</h3>
                <p className="text-gray-500 text-sm">
                  No se encontraron tutores con esa busqueda.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aun no hay tutores registrados
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Los tutores se agregan desde el perfil de cada alumno.
                </p>
                <button
                  onClick={() => navigate('/alumnos')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  Ir a alumnos
                </button>
              </>
            )}
          </div>
        )}

        {/* Data */}
        {!loading && !error && items.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">NOMBRE</th>
                    <th className="px-6 py-3">TELEFONO</th>
                    <th className="px-6 py-3">HIJOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(guardian => (
                    <tr
                      key={guardian.id}
                      onClick={() => navigate(`/tutores/${guardian.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(guardian.firstName, guardian.lastName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {guardian.firstName} {guardian.lastName}
                            </div>
                            {guardian.email && (
                              <div className="text-xs text-gray-500 truncate">
                                {guardian.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{guardian.phone}</td>
                      <td className="px-6 py-4">
                        {guardian.studentNames.length > 0
                          ? renderStudentBadges(guardian.studentNames)
                          : <span className="text-gray-400 text-xs">Sin hijos vinculados</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map(guardian => (
                <div
                  key={guardian.id}
                  onClick={() => navigate(`/tutores/${guardian.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {getInitials(guardian.firstName, guardian.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {guardian.firstName} {guardian.lastName}
                      </div>
                      {guardian.email && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{guardian.email}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{guardian.phone}</p>
                      {guardian.studentNames.length > 0 && (
                        <div className="mt-2">
                          {renderStudentBadges(guardian.studentNames)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
