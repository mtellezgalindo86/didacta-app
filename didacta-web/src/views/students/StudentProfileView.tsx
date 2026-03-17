import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import didactaApi from '../../api/didactaApi';
import { getGuardiansOfStudent, unlinkStudent } from '../../api/guardianApi';
import GuardianLinkModal from '../../components/guardians/GuardianLinkModal';
import type { GuardianOfStudentResponse, Relationship } from '../../types/guardian';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '../../types/guardian';

interface StudentDto {
  id: string;
  firstName: string;
  lastName: string;
  groupId: string | null;
  groupName: string | null;
}

interface GroupOption {
  id: string;
  name: string;
  gradeLevel: string;
}

export default function StudentProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentDto | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<GuardianOfStudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const loadGuardians = useCallback(() => {
    if (!id) return;
    getGuardiansOfStudent(id)
      .then(setGuardians)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      didactaApi.get<StudentDto[]>('/api/onboarding/students'),
      didactaApi.get<GroupOption[]>('/api/onboarding/groups'),
      getGuardiansOfStudent(id),
    ])
      .then(([studentsRes, groupsRes, guardiansRes]) => {
        const found = studentsRes.data.find(s => s.id === id);
        if (!found) {
          setError('No se encontro el alumno.');
          return;
        }
        setStudent(found);
        setGuardians(guardiansRes);

        if (found.groupId) {
          const group = groupsRes.data.find(g => g.id === found.groupId);
          if (group) setGradeLevel(group.gradeLevel);
        }
      })
      .catch(() => setError('No se pudo cargar el perfil. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [id]);

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
  if (error || !student) {
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
            <p className="text-red-600 mb-4 text-sm">{error || 'No se encontro el alumno.'}</p>
            <button
              onClick={() => navigate(0)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              {getInitials(student.firstName, student.lastName)}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              {(student.groupName || gradeLevel) && (
                <p className="text-sm text-gray-500">
                  {[student.groupName, gradeLevel].filter(Boolean).join(' - ')}
                </p>
              )}
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
    </div>
  );
}
