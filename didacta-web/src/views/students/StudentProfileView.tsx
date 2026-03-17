import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, changeStudentStatus } from '../../api/studentApi';
import { getGuardiansOfStudent, unlinkStudent } from '../../api/guardianApi';
import type { StudentResponse } from '../../types/student';
import { STUDENT_STATUS_LABELS, STUDENT_STATUS_COLORS } from '../../types/student';
import type { StudentStatus } from '../../types/student';
import type { GuardianOfStudentResponse, Relationship } from '../../types/guardian';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '../../types/guardian';
import GuardianLinkModal from '../../components/guardians/GuardianLinkModal';
import StudentEditModal from '../../components/students/StudentEditModal';
import ChangeGroupModal from '../../components/students/ChangeGroupModal';
import ConfirmDialog from '../../components/staff/ConfirmDialog';

function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function StudentProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [guardians, setGuardians] = useState<GuardianOfStudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeGroupModal, setShowChangeGroupModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const loadStudent = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getStudent(id),
      getGuardiansOfStudent(id),
    ])
      .then(([studentData, guardiansData]) => {
        setStudent(studentData);
        setGuardians(guardiansData);
      })
      .catch(() => setError('No se pudo cargar el perfil. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadGuardians = useCallback(() => {
    if (!id) return;
    getGuardiansOfStudent(id)
      .then(setGuardians)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const handleUnlink = async (guardian: GuardianOfStudentResponse) => {
    const confirmed = window.confirm(
      `Se desvinculara a ${guardian.firstName} ${guardian.lastName} de este alumno. Esta accion no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      await unlinkStudent(guardian.guardianId, guardian.linkId);
      setGuardians(prev => prev.filter(g => g.linkId !== guardian.linkId));
    } catch {
      alert('No se pudo desvincular al tutor. Intenta de nuevo.');
    }
  };

  const handleLinkSuccess = () => {
    setShowLinkModal(false);
    loadGuardians();
  };

  const handleToggleStatus = async () => {
    if (!student || !id) return;

    const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // If deactivating, show confirm dialog
    if (newStatus === 'INACTIVE') {
      setShowStatusConfirm(true);
      return;
    }

    // Reactivating - no confirmation needed
    setStatusLoading(true);
    try {
      await changeStudentStatus(id, newStatus);
      loadStudent();
    } catch {
      setError('No se pudo cambiar el estado del alumno.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!id) return;
    setStatusLoading(true);
    try {
      await changeStudentStatus(id, 'INACTIVE');
      setShowStatusConfirm(false);
      loadStudent();
    } catch {
      setError('No se pudo desactivar al alumno.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    loadStudent();
  };

  const handleChangeGroupSuccess = () => {
    setShowChangeGroupModal(false);
    loadStudent();
  };

  const isInactive = student?.status === 'INACTIVE';

  // Loading skeleton
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
  if (error && !student) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          <button
            onClick={() => navigate('/alumnos')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Volver a alumnos
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={loadStudent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/alumnos')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Volver a alumnos
        </button>

        {/* Error banner (for action errors) */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Inactive banner */}
        {isInactive && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Este alumno esta inactivo
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              {getInitials(student.firstName, student.lastName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STUDENT_STATUS_COLORS[student.status as StudentStatus] || 'bg-gray-100 text-gray-700'}`}>
                  {STUDENT_STATUS_LABELS[student.status as StudentStatus] || student.status}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {student.groupName && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    Grupo: {student.groupName}
                  </p>
                )}
                {student.dateOfBirth && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Fecha de nacimiento: {formatDateLong(student.dateOfBirth)}
                  </p>
                )}
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  Fecha de inscripcion: {formatDateLong(student.enrollmentDate)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button
                onClick={() => setShowEditModal(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Editar
              </button>
              <button
                onClick={() => setShowChangeGroupModal(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><line x1="4" y1="20" x2="21" y2="3" /><path d="M21 16v5h-5" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>
                Cambiar grupo
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={statusLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  isInactive
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'border border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                {statusLoading
                  ? 'Procesando...'
                  : isInactive
                    ? 'Reactivar'
                    : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>

        {/* Guardians card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Tutores vinculados
            </h2>
            <button
              onClick={() => setShowLinkModal(true)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Agregar tutor
            </button>
          </div>

          {guardians.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <p className="text-sm text-gray-500">No tiene tutores vinculados</p>
              <p className="text-xs text-gray-400 mt-1">Agrega un tutor para registrar datos de contacto y permisos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {guardians.map(guardian => (
                <div
                  key={guardian.linkId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-3"
                >
                  <div className="min-w-0 flex-1">
                    {/* Name + relationship badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        {guardian.firstName} {guardian.lastName}
                      </span>
                      <span className={`${RELATIONSHIP_COLORS[guardian.relationship as Relationship] || 'bg-gray-100 text-gray-700'} text-xs font-medium px-2 py-0.5 rounded-full`}>
                        {RELATIONSHIP_LABELS[guardian.relationship as Relationship] || guardian.relationship}
                      </span>
                    </div>

                    {/* Contact info */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {guardian.phone && (
                        <span className="text-xs text-gray-500">{guardian.phone}</span>
                      )}
                      {guardian.email && (
                        <span className="text-xs text-gray-500">{guardian.email}</span>
                      )}
                    </div>

                    {/* Permission badges */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {guardian.isPrimary && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                          Contacto primario
                        </span>
                      )}
                      {guardian.canPickUp && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Aut. recoger
                        </span>
                      )}
                      {guardian.receivesNotifications && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Recibe notif.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleUnlink(guardian)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0 self-start sm:self-center"
                    title="Desvincular tutor"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guardian Link Modal */}
      {id && (
        <GuardianLinkModal
          studentId={id}
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          onSuccess={handleLinkSuccess}
        />
      )}

      {/* Student Edit Modal */}
      {showEditModal && student && (
        <StudentEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          student={student}
        />
      )}

      {/* Change Group Modal */}
      {showChangeGroupModal && student && (
        <ChangeGroupModal
          isOpen={showChangeGroupModal}
          onClose={() => setShowChangeGroupModal(false)}
          onSuccess={handleChangeGroupSuccess}
          student={student}
        />
      )}

      {/* Deactivate Confirm Dialog */}
      <ConfirmDialog
        isOpen={showStatusConfirm}
        title="Desactivar alumno"
        description={`El alumno ${student.firstName} ${student.lastName} dejara de aparecer en listas activas. Puedes reactivarlo despues.`}
        confirmLabel="Desactivar"
        loading={statusLoading}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setShowStatusConfirm(false)}
      />
    </div>
  );
}
