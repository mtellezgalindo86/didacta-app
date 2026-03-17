import { useState } from 'react';
import { updateGuardian } from '../../api/guardianApi';
import type { GuardianResponse } from '../../types/guardian';
import InlineError from '../InlineError';

interface GuardianEditModalProps {
  guardian: GuardianResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GuardianEditModal({ guardian, isOpen, onClose, onSuccess }: GuardianEditModalProps) {
  const [firstName, setFirstName] = useState(guardian.firstName);
  const [lastName, setLastName] = useState(guardian.lastName);
  const [phone, setPhone] = useState(guardian.phone);
  const [email, setEmail] = useState(guardian.email || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'El nombre es requerido';
    if (!lastName.trim()) errors.lastName = 'El apellido es requerido';
    if (!phone.trim()) errors.phone = 'El telefono es requerido';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Correo electronico invalido';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      await updateGuardian(guardian.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response === 'object' &&
        (err as { response: { status: number } }).response.status === 409
      ) {
        setValidationErrors(prev => ({ ...prev, phone: 'Ya existe un tutor con este telefono' }));
      } else {
        setError('No se pudo actualizar el tutor. Intenta de nuevo.');
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
          <h2 className="text-lg font-semibold text-gray-900">Editar tutor</h2>
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
                placeholder="Ej. Maria"
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
                placeholder="Ej. Lopez"
              />
              {validationErrors.lastName && <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>}
            </div>
          </div>

          {/* Contact row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Telefono *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setValidationErrors(prev => { const { phone: _, ...rest } = prev; return rest; }); }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="55 1234 5678"
              />
              {validationErrors.phone && <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setValidationErrors(prev => { const { email: _, ...rest } = prev; return rest; }); }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="correo@ejemplo.com"
              />
              {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
            </div>
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
