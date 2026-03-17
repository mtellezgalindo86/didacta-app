import { useState, useEffect } from 'react';
import didactaApi from '../../api/didactaApi';
import { linkStudentToGuardian } from '../../api/guardianApi';
import type { Relationship } from '../../types/guardian';
import { RELATIONSHIP_LABELS } from '../../types/guardian';
import InlineError from '../InlineError';

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  groupName: string | null;
}

interface LinkStudentToGuardianModalProps {
  guardianId: string;
  existingStudentIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LinkStudentToGuardianModal({
  guardianId,
  existingStudentIds,
  isOpen,
  onClose,
  onSuccess,
}: LinkStudentToGuardianModalProps) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [relationship, setRelationship] = useState<Relationship | ''>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [canPickUp, setCanPickUp] = useState(true);
  const [receivesNotifications, setReceivesNotifications] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setLoadingStudents(true);
    didactaApi
      .get<StudentOption[]>('/api/onboarding/students')
      .then((res) => setStudents(res.data.filter((s) => !existingStudentIds.includes(s.id))))
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [isOpen, existingStudentIds]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!selectedStudentId) errors.studentId = 'Selecciona un alumno';
    if (!relationship) errors.relationship = 'El parentesco es requerido';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      await linkStudentToGuardian(guardianId, {
        studentId: selectedStudentId,
        relationship: relationship as string,
        isPrimary,
        canPickUp,
        receivesNotifications,
      });
      onSuccess();
    } catch {
      setError('No se pudo vincular al alumno. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Vincular hijo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <InlineError message={error} />

          {/* Student select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alumno *</label>
            {loadingStudents ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : students.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                Todos los alumnos ya estan vinculados a este tutor.
              </p>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setValidationErrors((prev) => {
                    const { studentId: _, ...rest } = prev;
                    return rest;
                  });
                }}
                className={`w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.studentId ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar alumno</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                    {s.groupName ? ` - ${s.groupName}` : ''}
                  </option>
                ))}
              </select>
            )}
            {validationErrors.studentId && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.studentId}</p>
            )}
          </div>

          {/* Relationship section */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Relacion con el alumno</h4>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parentesco *</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship | '')}
                className={`w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.relationship ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar parentesco</option>
                {(Object.entries(RELATIONSHIP_LABELS) as [Relationship, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
              {validationErrors.relationship && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.relationship}</p>
              )}
            </div>

            {/* Permission toggles */}
            <div className="space-y-3">
              <ToggleField
                label="Contacto primario"
                description="Se mostrara como el contacto principal del alumno"
                checked={isPrimary}
                onChange={setIsPrimary}
              />
              <ToggleField
                label="Autorizado para recoger"
                description="Puede recoger al alumno de la institucion"
                checked={canPickUp}
                onChange={setCanPickUp}
              />
              <ToggleField
                label="Recibe notificaciones"
                description="Recibira avisos y comunicados"
                checked={receivesNotifications}
                onChange={setReceivesNotifications}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || students.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Vincular'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Toggle subcomponent ---

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
      </label>
    </div>
  );
}
