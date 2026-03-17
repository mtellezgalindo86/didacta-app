import api from './didactaApi';
import type {
  GuardianCreated,
  GuardianResponse,
  GuardianListItem,
  CreateGuardianPayload,
  UpdateGuardianPayload,
  LinkStudentPayload,
  UpdateLinkPayload,
  StudentLinkResponse,
  GuardianOfStudentResponse,
} from '../types/guardian';

const BASE = '/api/guardians';

export function createGuardian(data: CreateGuardianPayload): Promise<GuardianCreated> {
  return api.post<GuardianCreated>(BASE, data).then(r => r.data);
}

export function listGuardians(params?: { status?: string; search?: string }): Promise<GuardianListItem[]> {
  return api.get<GuardianListItem[]>(BASE, { params }).then(r => r.data);
}

export function getGuardian(id: string): Promise<GuardianResponse> {
  return api.get<GuardianResponse>(`${BASE}/${id}`).then(r => r.data);
}

export function updateGuardian(id: string, data: UpdateGuardianPayload): Promise<GuardianResponse> {
  return api.put<GuardianResponse>(`${BASE}/${id}`, data).then(r => r.data);
}

export function changeGuardianStatus(id: string, status: string): Promise<void> {
  return api.patch(`${BASE}/${id}/status`, { status }).then(() => undefined);
}

export function linkStudentToGuardian(guardianId: string, data: LinkStudentPayload): Promise<StudentLinkResponse> {
  return api.post<StudentLinkResponse>(`${BASE}/${guardianId}/students`, data).then(r => r.data);
}

export function updateStudentLink(guardianId: string, linkId: string, data: UpdateLinkPayload): Promise<void> {
  return api.put(`${BASE}/${guardianId}/students/${linkId}`, data).then(() => undefined);
}

export function unlinkStudent(guardianId: string, linkId: string): Promise<void> {
  return api.delete(`${BASE}/${guardianId}/students/${linkId}`).then(() => undefined);
}

export function getGuardiansOfStudent(studentId: string): Promise<GuardianOfStudentResponse[]> {
  return api.get<GuardianOfStudentResponse[]>(`${BASE}/by-student/${studentId}`).then(r => r.data);
}
