import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGuardian, unlinkStudent } from '../../api/guardianApi';
import type { GuardianResponse, StudentLinkResponse, Relationship } from '../../types/guardian';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '../../types/guardian';
import GuardianEditModal from '../../components/guardians/GuardianEditModal';
import LinkStudentToGuardianModal from '../../components/guardians/LinkStudentToGuardianModal';
import ConfirmDialog from '../../components/staff/ConfirmDialog';

export default function GuardianProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [guardian, setGuardian] = useState<GuardianResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<StudentLinkResponse | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  const loadGuardian = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getGuardian(id)
      .then(setGuardian)
      .catch(() => setError('No se pudo cargar el perfil del tutor. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGuardian();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUnlink = async () => {
    if (!unlinkTarget || !id) return;
    setUnlinkLoading(true);
    try {
      await unlinkStudent(id, unlinkTarget.linkId);
      setGuardian((prev) =>
        prev
          ? { ...prev, students: prev.students.filter((s) => s.linkId !== unlinkTarget.linkId) }
          : prev
      );
      setUnlinkTarget(null);
    } catch {
      setError('No se pudo desvincular al alumno.');
    } finally {
      setUnlinkLoading(false);
    }
  };

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const getRelationshipBadge = (rel: string) => {
    const label = RELATIONSHIP_LABELS[rel as Relationship] || rel;
    const colors = RELATIONSHIP_COLORS[rel as Relationship] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
        {label}
      </span>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error && !guardian) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          <button
            onClick={() => navigate('/tutores')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Volver a tutores
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={loadGuardian}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guardian) return null;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/tutores')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Volver a tutores
        </button>

        {/* Error banner (for action errors) */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              {getInitials(guardian.firstName, guardian.lastName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">
                {guardian.firstName} {guardian.lastName}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                {guardian.phone && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    {guardian.phone}
                  </span>
                )}
                {guardian.email && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    {guardian.email}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Informacion de contacto
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <span className="text-sm text-gray-700">{guardian.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <span className={`text-sm ${guardian.email ? 'text-gray-700' : 'text-gray-400'}`}>
                  {guardian.email || 'No registrado'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span className="text-sm text-gray-500">
                  Registrado el{' '}
                  {new Date(guardian.createdAt).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Detalles
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Estado</span>
                <span
                  className={`text-sm font-medium ${guardian.status === 'ACTIVE' ? 'text-green-700' : 'text-red-600'}`}
                >
                  {guardian.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Hijos vinculados</span>
                <span className="text-sm font-medium text-gray-900">{guardian.students.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linked students card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Hijos vinculados
            </h2>
            <button
              onClick={() => setShowLinkModal(true)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Vincular hijo
            </button>
          </div>

          {guardian.students.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              </div>
              <p className="text-sm text-gray-500">No tiene hijos vinculados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {guardian.students.map((student) => (
                <div
                  key={student.linkId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/alumnos/${student.studentId}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {student.studentFirstName} {student.studentLastName}
                      </Link>
                      {getRelationshipBadge(student.relationship)}
                    </div>
                    {student.groupName && (
                      <p className="text-xs text-gray-500 mt-0.5">{student.groupName}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {student.isPrimary && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                          Primario
                        </span>
                      )}
                      {student.canPickUp && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Puede recoger
                        </span>
                      )}
                      {student.receivesNotifications && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Notificaciones
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setUnlinkTarget(student)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0 ml-2"
                    title="Desvincular"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <GuardianEditModal
          guardian={guardian}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadGuardian();
          }}
        />
      )}

      {/* Link Student Modal */}
      <LinkStudentToGuardianModal
        guardianId={guardian.id}
        existingStudentIds={guardian.students.map((s) => s.studentId)}
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSuccess={() => {
          setShowLinkModal(false);
          loadGuardian();
        }}
      />

      {/* Unlink confirm dialog */}
      <ConfirmDialog
        isOpen={!!unlinkTarget}
        title="Desvincular alumno"
        description={
          unlinkTarget
            ? `Se desvinculara a ${unlinkTarget.studentFirstName} ${unlinkTarget.studentLastName} de este tutor. Esta accion no se puede deshacer.`
            : ''
        }
        confirmLabel="Desvincular"
        loading={unlinkLoading}
        onConfirm={handleUnlink}
        onCancel={() => setUnlinkTarget(null)}
      />
    </div>
  );
}
