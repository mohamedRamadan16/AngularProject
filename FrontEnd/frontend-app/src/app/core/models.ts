export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
}

export type AppRole = 'admin' | 'student' | 'guest';

export interface Department {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  name: string;
  creditHours: number;
}

export interface Student {
  id: number;
  fullName: string;
  email: string;
  departmentId?: number | null;
  departmentName?: string | null;
}

export interface StudentCourseStatus {
  courseId: number;
  courseName: string;
  creditHours: number;
  isEnrolled: boolean;
  grade?: number | null;
}
