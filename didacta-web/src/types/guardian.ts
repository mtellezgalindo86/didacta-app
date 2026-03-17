// --- Response types ---

export interface GuardianCreated {
  id: string;
  alreadyExisted: boolean;
}

export interface GuardianResponse {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  status: string;
  students: StudentLinkResponse[];
  createdAt: string;
}

export interface GuardianListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  status: string;
  studentCount: number;
  studentNames: string[];
}

export interface StudentLinkResponse {
  linkId: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  groupName: string | null;
  relationship: string;
  isPrimary: boolean;
  canPickUp: boolean;
  receivesNotifications: boolean;
  notes: string | null;
}

export interface GuardianOfStudentResponse {
  guardianId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  linkId: string;
  relationship: string;
  isPrimary: boolean;
  canPickUp: boolean;
  receivesNotifications: boolean;
  notes: string | null;
}

// --- Request types ---

export interface CreateGuardianPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  studentId: string;
  relationship: string;
  isPrimary?: boolean;
  canPickUp?: boolean;
  receivesNotifications?: boolean;
}

export interface UpdateGuardianPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export interface LinkStudentPayload {
  studentId: string;
  relationship: string;
  isPrimary?: boolean;
  canPickUp?: boolean;
  receivesNotifications?: boolean;
  notes?: string;
}

export interface UpdateLinkPayload {
  relationship?: string;
  isPrimary?: boolean;
  canPickUp?: boolean;
  receivesNotifications?: boolean;
  notes?: string;
}

// --- Domain types ---

export type Relationship =
  | 'MOTHER'
  | 'FATHER'
  | 'GRANDFATHER'
  | 'GRANDMOTHER'
  | 'UNCLE'
  | 'AUNT'
  | 'SIBLING'
  | 'TUTOR'
  | 'OTHER';

// --- Label maps ---

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  MOTHER: 'Madre',
  FATHER: 'Padre',
  GRANDFATHER: 'Abuelo',
  GRANDMOTHER: 'Abuela',
  UNCLE: 'Tio',
  AUNT: 'Tia',
  SIBLING: 'Hermano/a',
  TUTOR: 'Tutor legal',
  OTHER: 'Otro',
};

export const RELATIONSHIP_COLORS: Record<Relationship, string> = {
  MOTHER: 'bg-pink-50 text-pink-700',
  FATHER: 'bg-blue-50 text-blue-700',
  GRANDFATHER: 'bg-amber-50 text-amber-700',
  GRANDMOTHER: 'bg-amber-50 text-amber-700',
  UNCLE: 'bg-purple-50 text-purple-700',
  AUNT: 'bg-purple-50 text-purple-700',
  SIBLING: 'bg-teal-50 text-teal-700',
  TUTOR: 'bg-green-50 text-green-700',
  OTHER: 'bg-gray-100 text-gray-700',
};
