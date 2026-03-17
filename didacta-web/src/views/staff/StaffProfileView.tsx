import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getStaffMember,
  changeStaffStatus,
  removeAssignment,
  resendInvitation,
  fetchCampuses,
  fetchGroups,
} from '../../api/staffApi';
import type { CampusOption, GroupOption } from '../../api/staffApi';
import type { StaffMemberResponse, AssignmentResponse } from '../../types/staff';
import { CATEGORY_LABELS, ASSIGNMENT_ROLE_LABELS, ACADEMIC_CATEGORIES } from '../../types/staff';
import CategoryBadge from '../../components/staff/CategoryBadge';
import AccessBadge from '../../components/staff/AccessBadge';
import ConfirmDialog from '../../components/staff/ConfirmDialog';
import StaffEditModal from '../../components/staff/StaffEditModal';
import GroupAssignmentModal from '../../components/staff/GroupAssignmentModal';

export default function StaffProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<StaffMemberResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showRemoveAssignmentDialog, setShowRemoveAssignmentDialog] = useState<AssignmentResponse | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getStaffMember(id)
      .then(setMember)
      .catch(() => setError('No se pudo cargar el perfil. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    Promise.all([fetchCampuses(), fetchGroups()])
      .then(([c, g]) => {
        setCampuses(c);
        setGroups(g);
      })
      .catch(console.error);
  }, []);

  const isAcademic = member ? ACADEMIC_CATEGORIES.includes(member.category) : false;

  const filteredGroups = member?.campusId
    ? groups.filter(g => g.campusId === member.campusId)
    : groups;

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const handleDeactivate = async () => {
    if (!member || !id) return;
    setActionLoading(true);
    try {
      const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await changeStaffStatus(id, { status: newStatus });
      setMember(prev => prev ? { ...prev, status: newStatus } : prev);
      setShowDeactivateDialog(false);
    } catch {
      setActionMessage('No se pudo cambiar el estado.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!showRemoveAssignmentDialog || !id) return;
    setActionLoading(true);
    try {
      await removeAssignment(id, showRemoveAssignmentDialog.id);
      setMember(prev =>
        prev
          ? { ...prev, assignments: prev.assignments.filter(a => a.id !== showRemoveAssignmentDialog.id) }
          : prev
      );
      setShowRemoveAssignmentDialog(null);
    } catch {
      setActionMessage('No se pudo eliminar la asignacion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendInvitation = async () => {
    if (!id) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await resendInvitation(id);
      setActionMessage('Invitacion reenviada exitosamente.');
    } catch {
      setActionMessage('No se pudo reenviar la invitacion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssigned = (assignment: AssignmentResponse) => {
    setMember(prev =>
      prev ? { ...prev, assignments: [...prev.assignments, assignment] } : prev
    );
    setShowAssignModal(false);
  };

  const handleUpdated = (updated: StaffMemberResponse) => {
    setMember(updated);
    setShowEditModal(false);
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
  if (error || !member) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          <button
            onClick={() => navigate('/equipo')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Volver al equipo
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-red-600 mb-4 text-sm">{error || 'No se encontro el miembro.'}</p>
            <button
              onClick={() => id && getStaffMember(id).then(setMember).catch(() => setError('Error al cargar.'))}
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
          onClick={() => navigate('/equipo')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Volver al equipo
        </button>

        {/* Action message */}
        {actionMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            actionMessage.includes('exitosamente')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {actionMessage}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              {getInitials(member.firstName, member.lastName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {member.firstName} {member.lastName}
                </h1>
                <div className="flex items-center gap-2">
                  <CategoryBadge category={member.category} />
                  <AccessBadge member={member} />
                </div>
              </div>
              {member.jobTitle && (
                <p className="text-gray-600 text-sm">{member.jobTitle}</p>
              )}
              {member.campusName && (
                <p className="text-gray-500 text-xs mt-1">
                  <span className="inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {member.campusName}
                  </span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Editar
              </button>
              {member.requiresAccess && (member.invitationStatus === 'PENDING' || member.invitationStatus === 'EXPIRED') && (
                <button
                  onClick={handleResendInvitation}
                  disabled={actionLoading}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Reenviar invitacion
                </button>
              )}
              <button
                onClick={() => setShowDeactivateDialog(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  member.status === 'ACTIVE'
                    ? 'border border-red-300 text-red-600 hover:bg-red-50'
                    : 'border border-green-300 text-green-600 hover:bg-green-50'
                }`}
              >
                {member.status === 'ACTIVE' ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Informacion de contacto</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <span className="text-sm text-gray-700">{member.email || 'Sin correo registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <span className="text-sm text-gray-700">{member.phone || 'Sin telefono registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span className="text-sm text-gray-500">
                  Registrado el {new Date(member.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Category info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Detalles</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Categoria</span>
                <span className="text-sm font-medium text-gray-900">{CATEGORY_LABELS[member.category] || member.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Campus</span>
                <span className="text-sm font-medium text-gray-900">{member.campusName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Acceso al sistema</span>
                <span className="text-sm font-medium text-gray-900">{member.requiresAccess ? 'Si' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Estado</span>
                <span className={`text-sm font-medium ${member.status === 'ACTIVE' ? 'text-green-700' : 'text-red-600'}`}>
                  {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Groups section - only for academic categories */}
        {isAcademic && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Grupos asignados</h2>
              <button
                onClick={() => setShowAssignModal(true)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Asignar
              </button>
            </div>

            {member.assignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                </div>
                <p className="text-sm text-gray-500">No tiene grupos asignados</p>
                <p className="text-xs text-gray-400 mt-1">Asigna a un grupo para que pueda registrar sesiones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {member.assignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{assignment.groupName}</span>
                      {assignment.gradeLevel && (
                        <span className="text-xs text-gray-500 ml-2">{assignment.gradeLevel}</span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ml-2">
                        {ASSIGNMENT_ROLE_LABELS[assignment.assignmentRole] || assignment.assignmentRole}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowRemoveAssignmentDialog(assignment)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Quitar asignacion"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <StaffEditModal
          member={member}
          campuses={campuses}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleUpdated}
        />
      )}

      {showAssignModal && (
        <GroupAssignmentModal
          staffId={member.id}
          groups={filteredGroups}
          existingAssignments={member.assignments}
          onClose={() => setShowAssignModal(false)}
          onAssigned={handleAssigned}
        />
      )}

      <ConfirmDialog
        isOpen={showDeactivateDialog}
        title={member.status === 'ACTIVE' ? 'Desactivar miembro' : 'Reactivar miembro'}
        description={
          member.status === 'ACTIVE'
            ? `Se desactivara a ${member.firstName} ${member.lastName}. No podra acceder al sistema hasta que se reactive.`
            : `Se reactivara a ${member.firstName} ${member.lastName}. Podra acceder al sistema nuevamente.`
        }
        confirmLabel={member.status === 'ACTIVE' ? 'Desactivar' : 'Reactivar'}
        loading={actionLoading}
        onConfirm={handleDeactivate}
        onCancel={() => setShowDeactivateDialog(false)}
      />

      <ConfirmDialog
        isOpen={!!showRemoveAssignmentDialog}
        title="Quitar asignacion"
        description={
          showRemoveAssignmentDialog
            ? `Se eliminara la asignacion al grupo "${showRemoveAssignmentDialog.groupName}". Esta accion no se puede deshacer.`
            : ''
        }
        confirmLabel="Quitar"
        loading={actionLoading}
        onConfirm={handleRemoveAssignment}
        onCancel={() => setShowRemoveAssignmentDialog(null)}
      />
    </div>
  );
}
