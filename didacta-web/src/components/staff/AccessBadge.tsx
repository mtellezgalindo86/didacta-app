import type { StaffMemberResponse } from '../../types/staff';

interface AccessBadgeProps {
  member: Pick<StaffMemberResponse, 'requiresAccess' | 'invitationStatus' | 'status'>;
}

export default function AccessBadge({ member }: AccessBadgeProps) {
  if (member.status === 'INACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Inactivo
      </span>
    );
  }

  if (!member.requiresAccess) {
    return (
      <span className="text-xs text-gray-400 font-medium">Sin acceso</span>
    );
  }

  if (member.invitationStatus === 'ACCEPTED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Activo
      </span>
    );
  }

  if (member.invitationStatus === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Invitacion pendiente
      </span>
    );
  }

  if (member.invitationStatus === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Invitacion expirada
      </span>
    );
  }

  // requiresAccess but no invitation sent yet
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      Pendiente de invitacion
    </span>
  );
}
