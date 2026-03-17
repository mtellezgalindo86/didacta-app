import { useState, useEffect } from 'react';
import didactaApi from '../../api/didactaApi';
import InlineError from '../InlineError';

interface ChangeGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    groupId: string;
    groupName: string | null;
  };
}

interface GroupOption {
  id: string;
  name: string;
}

export default function ChangeGroupModal({ isOpen, onClose, onSuccess, student }: ChangeGroupModalProps) {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedGroupId('');
    setError(null);
    setLoadingGroups(true);

    didactaApi.get('/api/onboarding/groups')
      .then(res => setGroups(res.data))
      .catch(() => setError('No se pudieron cargar los grupos.'))
      .finally(() => setLoadingGroups(false));
  }, [isOpen]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const handleSubmit = async () => {
    if (!selectedGroupId) return;

    setLoading(true);
    setError(null);

    try {
      await didactaApi.patch(`/api/students/${student.id}/group`, { groupId: selectedGroupId });
      onSuccess();
    } catch {
      setError('No se pudo cambiar el grupo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cambiar de grupo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <InlineError message={error} />

          {/* Student info */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alumno</label>
            <p className="text-sm text-gray-900 font-medium">{student.firstName} {student.lastName}</p>
          </div>

          {/* Current group */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grupo actual</label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
              {student.groupName || 'Sin grupo'}
            </span>
          </div>

          {/* New group select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nuevo grupo *</label>
            {loadingGroups ? (
              <div className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-400">
                Cargando grupos...
              </div>
            ) : (
              <select
                value={selectedGroupId}
                onChange={(e) => { setSelectedGroupId(e.target.value); setError(null); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Selecciona un grupo</option>
                {groups.map(group => (
                  <option
                    key={group.id}
                    value={group.id}
                    disabled={group.id === student.groupId}
                  >
                    {group.name}{group.id === student.groupId ? ' (actual)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Confirmation text */}
          {selectedGroupId && selectedGroup && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Vas a mover a <span className="font-medium">{student.firstName} {student.lastName}</span> de{' '}
              <span className="font-medium">{student.groupName || 'Sin grupo'}</span> a{' '}
              <span className="font-medium">{selectedGroup.name}</span>.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedGroupId}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Cambiando...' : 'Cambiar grupo'}
          </button>
        </div>
      </div>
    </div>
  );
}
