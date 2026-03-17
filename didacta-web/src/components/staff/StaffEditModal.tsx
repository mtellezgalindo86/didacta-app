import { useState } from 'react';
import { updateStaffMember } from '../../api/staffApi';
import type { CampusOption } from '../../api/staffApi';
import type { StaffMemberResponse, StaffCategory } from '../../types/staff';
import { CATEGORY_OPTIONS } from '../../types/staff';
import InlineError from '../InlineError';

interface StaffEditModalProps {
  member: StaffMemberResponse;
  campuses: CampusOption[];
  onClose: () => void;
  onUpdated: (updated: StaffMemberResponse) => void;
}

export default function StaffEditModal({ member, campuses, onClose, onUpdated }: StaffEditModalProps) {
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [jobTitle, setJobTitle] = useState(member.jobTitle || '');
  const [category, setCategory] = useState<StaffCategory>(member.category);
  const [campusId, setCampusId] = useState(member.campusId || '');
  const [email, setEmail] = useState(member.email || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [requiresAccess, setRequiresAccess] = useState(member.requiresAccess);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'El nombre es requerido';
    if (!lastName.trim()) errors.lastName = 'El apellido es requerido';
    if (!category) errors.category = 'La categoria es requerida';
    if (requiresAccess && !email.trim()) errors.email = 'El correo es requerido para dar acceso';
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
      const updated = await updateStaffMember(member.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jobTitle: jobTitle.trim() || undefined,
        category,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        campusId: campusId || undefined,
        requiresAccess,
      });
      onUpdated(updated);
    } catch {
      setError('No se pudo actualizar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Editar miembro del equipo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <InlineError message={error} />

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.firstName ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.firstName && <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.lastName && <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>}
            </div>
          </div>

          {/* Job title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Puesto</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej. Maestra de grupo, Cocinera..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoria *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StaffCategory)}
              className={`w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.category ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">Seleccionar categoria</option>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}{opt.description ? ` - ${opt.description}` : ''}
                </option>
              ))}
            </select>
            {validationErrors.category && <p className="text-xs text-red-500 mt-1">{validationErrors.category}</p>}
          </div>

          {/* Campus */}
          {campuses.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Campus</label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Seleccionar campus</option>
                {campuses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Contact row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Correo {requiresAccess && '*'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="correo@ejemplo.com"
              />
              {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Telefono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="55 1234 5678"
              />
            </div>
          </div>

          {/* Access toggle */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Acceso al sistema</h4>
                <p className="text-xs text-gray-500 mt-0.5">Permite acceder a la plataforma</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={requiresAccess}
                  onChange={(e) => setRequiresAccess(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
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
