import api from './didactaApi';
import type {
  StudentResponse,
  StudentListItem,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '../types/student';

const BASE = '/api/students';

export function createStudent(data: CreateStudentPayload): Promise<StudentResponse> {
  return api.post<StudentResponse>(BASE, data).then(r => r.data);
}

export function listStudents(params?: { status?: string; search?: string; groupId?: string }): Promise<StudentListItem[]> {
  return api.get<StudentListItem[]>(BASE, { params }).then(r => r.data);
}

export function getStudent(id: string): Promise<StudentResponse> {
  return api.get<StudentResponse>(`${BASE}/${id}`).then(r => r.data);
}

export function updateStudent(id: string, data: UpdateStudentPayload): Promise<StudentResponse> {
  return api.put<StudentResponse>(`${BASE}/${id}`, data).then(r => r.data);
}

export function changeStudentGroup(id: string, groupId: string): Promise<void> {
  return api.patch(`${BASE}/${id}/group`, { groupId }).then(() => undefined);
}

export function changeStudentStatus(id: string, status: string): Promise<void> {
  return api.patch(`${BASE}/${id}/status`, { status }).then(() => undefined);
}
