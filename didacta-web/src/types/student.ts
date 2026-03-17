// --- Response types ---

export interface StudentResponse {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  status: string;
  groupId: string;
  groupName: string | null;
  enrollmentDate: string;
  createdAt: string;
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  groupId: string;
  groupName: string | null;
  guardianCount: number;
}

// --- Request types ---

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  groupId: string;
  dateOfBirth?: string;
}

export interface UpdateStudentPayload {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
}

// --- Domain types ---

export type StudentStatus = 'ACTIVE' | 'INACTIVE';

// --- Label maps ---

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export const STUDENT_STATUS_COLORS: Record<StudentStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
};
