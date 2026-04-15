import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, Course, Department, LoginDto, Student, StudentCourseStatus } from './models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:5228/api';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginDto) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  getStudents() {
    return this.http.get<Student[]>(`${this.baseUrl}/students`);
  }

  createStudent(payload: { fullName: string; email: string; departmentId?: number | null }) {
    return this.http.post<Student>(`${this.baseUrl}/students`, payload);
  }

  updateStudent(
    studentId: number,
    payload: { fullName: string; email: string; departmentId?: number | null },
  ) {
    return this.http.put<void>(`${this.baseUrl}/students/${studentId}`, payload);
  }

  deleteStudent(studentId: number) {
    return this.http.delete<void>(`${this.baseUrl}/students/${studentId}`);
  }

  getMyCourseStatuses() {
    return this.http.get<StudentCourseStatus[]>(`${this.baseUrl}/students/me/courses`);
  }

  getStudentCourseStatuses(studentId: number) {
    return this.http.get<StudentCourseStatus[]>(`${this.baseUrl}/students/${studentId}/courses`);
  }

  getDepartments() {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`);
  }

  createDepartment(payload: { name: string }) {
    return this.http.post<Department>(`${this.baseUrl}/departments`, payload);
  }

  updateDepartment(departmentId: number, payload: { name: string }) {
    return this.http.put<void>(`${this.baseUrl}/departments/${departmentId}`, payload);
  }

  deleteDepartment(departmentId: number) {
    return this.http.delete<void>(`${this.baseUrl}/departments/${departmentId}`);
  }

  getCourses() {
    return this.http.get<Course[]>(`${this.baseUrl}/courses`);
  }

  createCourse(payload: { name: string; creditHours: number }) {
    return this.http.post<Course>(`${this.baseUrl}/courses`, payload);
  }

  updateCourse(courseId: number, payload: { name: string; creditHours: number }) {
    return this.http.put<void>(`${this.baseUrl}/courses/${courseId}`, payload);
  }

  deleteCourse(courseId: number) {
    return this.http.delete<void>(`${this.baseUrl}/courses/${courseId}`);
  }

  addCourseToDepartment(departmentId: number, courseId: number) {
    return this.http.post<void>(
      `${this.baseUrl}/departments/${departmentId}/courses/${courseId}`,
      {},
    );
  }

  removeCourseFromDepartment(departmentId: number, courseId: number) {
    return this.http.delete<void>(
      `${this.baseUrl}/departments/${departmentId}/courses/${courseId}`,
    );
  }

  assignStudentToDepartment(studentId: number, departmentId: number) {
    return this.http.post<void>(
      `${this.baseUrl}/students/${studentId}/department/${departmentId}`,
      {},
    );
  }

  removeStudentFromDepartment(studentId: number) {
    return this.http.delete<void>(`${this.baseUrl}/students/${studentId}/department`);
  }

  assignStudentToCourse(studentId: number, courseId: number) {
    return this.http.post<void>(`${this.baseUrl}/students/${studentId}/courses/${courseId}`, {});
  }

  removeStudentFromCourse(studentId: number, courseId: number) {
    return this.http.delete<void>(`${this.baseUrl}/students/${studentId}/courses/${courseId}`);
  }

  updateStudentCourseGrade(studentId: number, courseId: number, grade: number | null) {
    return this.http.put<void>(`${this.baseUrl}/students/${studentId}/courses/${courseId}/grade`, {
      grade,
    });
  }
}
