import { useState } from 'react';
import { assignToGroup } from '../../api/staffApi';
import type { GroupOption } from '../../api/staffApi';
import type { AssignmentResponse, AssignmentRole } from '../../types/staff';
import { ASSIGNMENT_ROLE_LABELS } from '../../types/staff';
import InlineError from '../InlineError';

interface GroupAssignmentModalProps {
  staffId: string;
  groups: GroupOption[];
  existingAssignments: AssignmentResponse[];
  onClose: () => void;
  onAssigned: (assignment: AssignmentResponse) => void;
}

export default function GroupAssignmentModal({
  staffId,
  groups,
  existingAssignments,
  onClose,
  onAssigned,
}: GroupAssignmentModalProps) {
  const [groupId, setGroupId] = useState('');
  const [assignmentRole, setAssignmentRole] = useState<AssignmentRole>('HEAD_TEACHER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedGroupIds = new Set(existingAssignments.map(a => a.groupId));
  const availableGroups = groups.filter(g => !assignedGroupIds.has(g.id));

  const handleSubmit = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await assignToGroup(staffId, { groupId, assignmentRole });
      onAssigned(result);
    } catch {
      setError('No se pudo asignar al grupo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignar a grupo</h3>

        <InlineError message={error} />

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grupo *</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Seleccionar grupo</option>
              {availableGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {availableGroups.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No hay grupos disponibles para asignar.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rol *</label>
            <select
              value={assignmentRole}
              onChange={(e) => setAssignmentRole(e.target.value as AssignmentRole)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(ASSIGNMENT_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !groupId}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
}
