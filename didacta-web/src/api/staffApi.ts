import api from './didactaApi';
import type {
  StaffListParams,
  StaffListResponse,
  StaffMemberResponse,
  CreateStaffMemberPayload,
  UpdateStaffMemberPayload,
  ChangeStatusPayload,
  AssignmentResponse,
  CreateAssignmentPayload,
} from '../types/staff';

const BASE = '/api/staff-members';

export function listStaffMembers(params?: StaffListParams): Promise<StaffListResponse> {
  return api.get<StaffListResponse>(BASE, { params }).then(r => r.data);
}

export function createStaffMember(data: CreateStaffMemberPayload): Promise<StaffMemberResponse> {
  return api.post<StaffMemberResponse>(BASE, data).then(r => r.data);
}

export function getStaffMember(id: string): Promise<StaffMemberResponse> {
  return api.get<StaffMemberResponse>(`${BASE}/${id}`).then(r => r.data);
}

export function updateStaffMember(id: string, data: UpdateStaffMemberPayload): Promise<StaffMemberResponse> {
  return api.put<StaffMemberResponse>(`${BASE}/${id}`, data).then(r => r.data);
}

export function changeStaffStatus(id: string, data: ChangeStatusPayload): Promise<void> {
  return api.patch(`${BASE}/${id}/status`, data).then(() => undefined);
}

export function getAssignments(id: string): Promise<AssignmentResponse[]> {
  return api.get<AssignmentResponse[]>(`${BASE}/${id}/assignments`).then(r => r.data);
}

export function assignToGroup(id: string, data: CreateAssignmentPayload): Promise<AssignmentResponse> {
  return api.post<AssignmentResponse>(`${BASE}/${id}/assignments`, data).then(r => r.data);
}

export function removeAssignment(staffId: string, assignmentId: string): Promise<void> {
  return api.delete(`${BASE}/${staffId}/assignments/${assignmentId}`).then(() => undefined);
}

export function resendInvitation(id: string): Promise<void> {
  return api.post(`${BASE}/${id}/resend-invitation`).then(() => undefined);
}

// Catalog helpers (reuse onboarding endpoints)
export interface CampusOption {
  id: string;
  name: string;
}

export interface GroupOption {
  id: string;
  name: string;
  campusId: string;
  gradeLevel: string;
}

export function fetchCampuses(): Promise<CampusOption[]> {
  return api.get<CampusOption[]>('/api/onboarding/campuses').then(r => r.data);
}

export function fetchGroups(): Promise<GroupOption[]> {
  return api.get<GroupOption[]>('/api/onboarding/groups').then(r => r.data);
}
