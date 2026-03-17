import { useState, useCallback, useEffect, useRef } from 'react';
import { createGuardian, listGuardians, linkStudentToGuardian } from '../../api/guardianApi';
import type {
  GuardianListItem,
  Relationship,
  CreateGuardianPayload,
  LinkStudentPayload,
} from '../../types/guardian';
import { RELATIONSHIP_LABELS } from '../../types/guardian';
import InlineError from '../InlineError';

interface GuardianLinkModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GuardianLinkModal({ studentId, isOpen, onClose, onSuccess }: GuardianLinkModalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GuardianListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected existing guardian
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianListItem | null>(null);

  // New guardian form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Relationship fields (always visible)
  const [relationship, setRelationship] = useState<Relationship | ''>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [canPickUp, setCanPickUp] = useState(true);
  const [receivesNotifications, setReceivesNotifications] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedGuardian(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await listGuardians({ search: value.trim() });
        setSearchResults(results);
        setHasSearched(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSelectGuardian = (guardian: GuardianListItem) => {
    setSelectedGuardian(guardian);
    setValidationErrors({});
  };

  const handleDeselectGuardian = () => {
    setSelectedGuardian(null);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedGuardian) {
      if (!firstName.trim()) errors.firstName = 'El nombre es requerido';
      if (!lastName.trim()) errors.lastName = 'El apellido es requerido';
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Correo electronico invalido';
      }
    }

    if (!relationship) errors.relationship = 'El parentesco es requerido';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (selectedGuardian) {
        // Flow A: Link existing guardian
        const payload: LinkStudentPayload = {
          studentId,
          relationship: relationship as string,
          isPrimary,
          canPickUp,
          receivesNotifications,
        };
        await linkStudentToGuardian(selectedGuardian.id, payload);
      } else {
        // Flow B: Create new guardian (creates + links in one call)
        const payload: CreateGuardianPayload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          studentId,
          relationship: relationship as string,
          isPrimary,
          canPickUp,
          receivesNotifications,
        };
        const result = await createGuardian(payload);
        if (result.alreadyExisted) {
          setInfoMessage('Se vinculo un tutor existente con el mismo telefono.');
        }
      }
      onSuccess();
    } catch {
      setError('No se pudo vincular al tutor. Intenta de nuevo.');
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
          <h2 className="text-lg font-semibold text-gray-900">Agregar tutor</h2>
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

          {/* Search existing guardian */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Buscar tutor existente
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Buscar por telefono o nombre..."
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Search results */}
          {hasSearched && searchResults.length > 0 && !selectedGuardian && (
            <div className="space-y-2">
              {searchResults.map((guardian) => (
                <div
                  key={guardian.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {guardian.firstName} {guardian.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{guardian.phone}</p>
                      {guardian.studentNames.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Hijos: {guardian.studentNames.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleSelectGuardian(guardian)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex-shrink-0 ml-3"
                    >
                      Vincular
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasSearched && searchResults.length === 0 && !searching && (
            <p className="text-xs text-gray-500 text-center py-2">
              No se encontraron tutores. Puedes crear uno nuevo abajo.
            </p>
          )}

          {/* Selected guardian banner */}
          {selectedGuardian && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Vinculando a {selectedGuardian.firstName} {selectedGuardian.lastName}
                </p>
                <p className="text-xs text-blue-700">{selectedGuardian.phone}</p>
              </div>
              <button
                onClick={handleDeselectGuardian}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                Cambiar
              </button>
            </div>
          )}

          {/* Separator + New guardian form (only if no guardian selected) */}
          {!selectedGuardian && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">O crear nuevo tutor</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Ej. Lopez"
                  />
                  {validationErrors.lastName && <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>}
                </div>
              </div>

              {/* Contact row */}
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="correo@ejemplo.com"
                  />
                  {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
                </div>
              </div>
            </>
          )}

          {/* Relationship section (always visible) */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Relacion con el alumno</h4>

            {/* Relationship select */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parentesco *</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship | '')}
                className={`w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none ${validationErrors.relationship ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar parentesco</option>
                {(Object.entries(RELATIONSHIP_LABELS) as [Relationship, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {validationErrors.relationship && <p className="text-xs text-red-500 mt-1">{validationErrors.relationship}</p>}
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

          {/* Info message for already existed */}
          {infoMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              {infoMessage}
            </div>
          )}
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
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar y vincular'}
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
