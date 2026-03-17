import { useState, useEffect } from 'react';
import { updateStudent } from '../../api/studentApi';
import InlineError from '../InlineError';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
  };
}

export default function StudentEditModal({ isOpen, onClose, onSuccess, student }: StudentEditModalProps) {
  const [firstName, setFirstName] = useState(student.firstName);
  const [lastName, setLastName] = useState(student.lastName);
  const [dateOfBirth, setDateOfBirth] = useState(student.dateOfBirth || '');

  useEffect(() => {
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setDateOfBirth(student.dateOfBirth || '');
  }, [student.id, student.firstName, student.lastName, student.dateOfBirth]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'El nombre es requerido';
    if (!lastName.trim()) errors.lastName = 'El apellido es requerido';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      await updateStudent(student.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth || null,
      });
      onSuccess();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response === 'object' &&
        (err as { response: { status: number } }).response.status === 400
      ) {
        const data = (err as { response: { data?: { message?: string } } }).response.data;
        setError(data?.message || 'Datos invalidos. Revisa los campos e intenta de nuevo.');
      } else {
        setError('No se pudo actualizar el alumno. Intenta de nuevo.');
      }
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
          <h2 className="text-lg font-semibold text-gray-900">Editar alumno</h2>
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

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setValidationErrors(prev => { const { firstName: _, ...rest } = prev; return rest; }); }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Ej. Sofia"
              />
              {validationErrors.firstName && <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setValidationErrors(prev => { const { lastName: _, ...rest } = prev; return rest; }); }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Ej. Martinez"
              />
              {validationErrors.lastName && <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>}
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
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
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
