// --- Domain types ---

export type StaffCategory =
  | 'DOCENTE'
  | 'COORDINACION'
  | 'DIRECCION'
  | 'ADMINISTRATIVO'
  | 'ESPECIALISTA'
  | 'APOYO';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export type StaffStatus = 'ACTIVE' | 'INACTIVE';

export type AssignmentRole = 'HEAD_TEACHER' | 'ASSISTANT' | 'SPECIALIST' | 'SUPERVISOR';

// --- Response types ---

export interface AssignmentResponse {
  id: string;
  groupId: string;
  groupName: string;
  gradeLevel: string;
  assignmentRole: AssignmentRole;
  active: boolean;
}

export interface StaffMemberResponse {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  category: StaffCategory;
  email: string | null;
  phone: string | null;
  campusId: string | null;
  campusName: string | null;
  requiresAccess: boolean;
  invitationStatus: InvitationStatus | null;
  status: StaffStatus;
  assignments: AssignmentResponse[];
  createdAt: string;
}

export interface StaffListResponse {
  items: StaffMemberResponse[];
  total: number;
}

// --- Request types ---

export interface StaffListParams {
  campusId?: string;
  category?: StaffCategory;
  status?: StaffStatus;
  search?: string;
}

export interface CreateStaffMemberPayload {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  category: StaffCategory;
  email?: string;
  phone?: string;
  campusId?: string;
  requiresAccess: boolean;
  systemRole?: string;
  assignments?: CreateAssignmentPayload[];
}

export interface UpdateStaffMemberPayload {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  category: StaffCategory;
  email?: string;
  phone?: string;
  campusId?: string;
  requiresAccess: boolean;
  systemRole?: string;
}

export interface CreateAssignmentPayload {
  groupId: string;
  assignmentRole: AssignmentRole;
}

export interface ChangeStatusPayload {
  status: StaffStatus;
}

// --- Label maps ---

export const CATEGORY_LABELS: Record<StaffCategory, string> = {
  DOCENTE: 'Docente',
  COORDINACION: 'Coordinacion',
  DIRECCION: 'Direccion',
  ADMINISTRATIVO: 'Administrativo',
  ESPECIALISTA: 'Especialista',
  APOYO: 'Apoyo',
};

export const CATEGORY_OPTIONS: { value: StaffCategory; label: string; description?: string }[] = [
  { value: 'DOCENTE', label: 'Docente' },
  { value: 'COORDINACION', label: 'Coordinacion' },
  { value: 'DIRECCION', label: 'Direccion' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'ESPECIALISTA', label: 'Especialista', description: 'Psicologia, terapia de lenguaje, etc.' },
  { value: 'APOYO', label: 'Apoyo', description: 'Intendencia, cocina, mantenimiento, etc.' },
];

export const ASSIGNMENT_ROLE_LABELS: Record<AssignmentRole, string> = {
  HEAD_TEACHER: 'Titular',
  ASSISTANT: 'Asistente',
  SPECIALIST: 'Especialista',
  SUPERVISOR: 'Supervisor',
};

export const SYSTEM_ROLE_OPTIONS = [
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'COORDINATOR', label: 'Coordinador' },
  { value: 'TEACHER', label: 'Maestro' },
];

export const ACADEMIC_CATEGORIES: StaffCategory[] = ['DOCENTE', 'COORDINACION'];
