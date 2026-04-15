import { Component, OnInit, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Course, Department, Student, StudentCourseStatus } from '../../core/models';

type RelationMode = 'courseDepartment' | 'studentDepartment' | 'studentCourse' | 'courseGrade';

@Component({
  selector: 'app-relations',
  imports: [FormsModule],
  templateUrl: './relations.component.html',
})
export class RelationsComponent implements OnInit {
  readonly students = signal<Student[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly studentCourseStatuses = signal<StudentCourseStatus[]>([]);
  readonly selectedStudentCourseStatuses = signal<StudentCourseStatus[]>([]);
  readonly relationMode = signal<RelationMode>('studentCourse');
  readonly studentCourseAction = signal<'assign' | 'remove'>('assign');

  readonly addCourseDepartmentForm = signal({ departmentId: '', courseId: '' });
  readonly studentDepartmentForm = signal({ studentId: '', departmentId: '' });
  readonly studentCourseForm = signal({ studentId: '', courseId: '' });
  readonly gradeForm = signal<{
    studentId: string;
    courseId: string;
    grade: string | number | null;
  }>({
    studentId: '',
    courseId: '',
    grade: '',
  });

  readonly loading = signal(false);
  readonly loadingStudentCourseOptions = signal(false);
  readonly loadingStudentCourses = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly assignableCourses = computed(() =>
    this.studentCourseStatuses().filter((status) => !status.isEnrolled),
  );
  readonly removableCourses = computed(() =>
    this.studentCourseStatuses().filter((status) => status.isEnrolled),
  );
  readonly enrolledCourses = computed(() =>
    this.selectedStudentCourseStatuses().filter((status) => status.isEnrolled),
  );

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadLookups();
  }

  setStudentCourseAction(action: 'assign' | 'remove'): void {
    this.studentCourseAction.set(action);
    this.studentCourseForm.set({ ...this.studentCourseForm(), courseId: '' });
  }

  setRelationMode(mode: RelationMode): void {
    this.relationMode.set(mode);
    this.message.set('');
    this.error.set('');
  }

  loadLookups(): void {
    this.loading.set(true);
    forkJoin({
      students: this.api.getStudents(),
      departments: this.api.getDepartments(),
      courses: this.api.getCourses(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          this.students.set(result.students);
          this.departments.set(result.departments);
          this.courses.set(result.courses);
        },
        error: () => this.error.set('Could not load lookup lists.'),
      });
  }

  onGradeStudentChange(studentId: string): void {
    this.gradeForm.set({ ...this.gradeForm(), studentId, courseId: '', grade: '' });
    this.selectedStudentCourseStatuses.set([]);

    if (!studentId) {
      return;
    }

    this.loadStudentCourseStatuses(+studentId);
  }

  onStudentCourseStudentChange(studentId: string): void {
    this.studentCourseForm.set({ ...this.studentCourseForm(), studentId, courseId: '' });
    this.studentCourseStatuses.set([]);

    if (!studentId) {
      return;
    }

    this.loadStudentCourseOptions(+studentId);
  }

  loadStudentCourseOptions(studentId: number): void {
    this.loadingStudentCourseOptions.set(true);
    this.api
      .getStudentCourseStatuses(studentId)
      .pipe(finalize(() => this.loadingStudentCourseOptions.set(false)))
      .subscribe({
        next: (statuses) => {
          this.studentCourseStatuses.set(statuses);
          const selectedCourseId = +this.studentCourseForm().courseId;
          if (!selectedCourseId) {
            return;
          }

          const allowedInCurrentAction =
            this.studentCourseAction() === 'assign'
              ? statuses.some((item) => !item.isEnrolled && item.courseId === selectedCourseId)
              : statuses.some((item) => item.isEnrolled && item.courseId === selectedCourseId);

          if (!allowedInCurrentAction) {
            this.studentCourseForm.set({ ...this.studentCourseForm(), courseId: '' });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.studentCourseStatuses.set([]);
          this.error.set(err.error?.message ?? 'Could not load student course options.');
        },
      });
  }

  loadStudentCourseStatuses(studentId: number): void {
    this.loadingStudentCourses.set(true);
    this.api
      .getStudentCourseStatuses(studentId)
      .pipe(finalize(() => this.loadingStudentCourses.set(false)))
      .subscribe({
        next: (statuses) => {
          this.selectedStudentCourseStatuses.set(statuses);
          const currentCourseId = +this.gradeForm().courseId;
          if (
            currentCourseId &&
            !statuses.some((status) => status.isEnrolled && status.courseId === currentCourseId)
          ) {
            this.gradeForm.set({ ...this.gradeForm(), courseId: '', grade: '' });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.selectedStudentCourseStatuses.set([]);
          this.error.set(err.error?.message ?? 'Could not load student course enrollments.');
        },
      });
  }

  onGradeCourseChange(courseId: string): void {
    const selected = this.enrolledCourses().find((item) => item.courseId === +courseId);
    this.gradeForm.set({
      ...this.gradeForm(),
      courseId,
      grade: selected?.grade ?? '',
    });
  }

  addCourseToDepartment(): void {
    const form = this.addCourseDepartmentForm();
    if (!form.departmentId || !form.courseId) return;

    this.loading.set(true);
    this.api
      .addCourseToDepartment(+form.departmentId, +form.courseId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Course added to department.');
          this.error.set('');
          this.loadLookups();
        },
        error: (err: HttpErrorResponse) =>
          this.handleApiError(err, 'Could not add course to department.'),
      });
  }

  removeCourseFromDepartment(): void {
    const form = this.addCourseDepartmentForm();
    if (!form.departmentId || !form.courseId) return;

    this.loading.set(true);
    this.api
      .removeCourseFromDepartment(+form.departmentId, +form.courseId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Course removed from department.');
          this.error.set('');
          this.loadLookups();
        },
        error: (err: HttpErrorResponse) =>
          this.handleApiError(err, 'Could not remove course from department.'),
      });
  }

  assignStudentToDepartment(): void {
    const form = this.studentDepartmentForm();
    if (!form.studentId || !form.departmentId) return;

    this.loading.set(true);
    this.api
      .assignStudentToDepartment(+form.studentId, +form.departmentId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Student assigned to department.');
          this.error.set('');
          this.loadLookups();
        },
        error: (err: HttpErrorResponse) =>
          this.handleApiError(err, 'Could not assign student to department.'),
      });
  }

  removeStudentFromDepartment(): void {
    const form = this.studentDepartmentForm();
    if (!form.studentId) return;

    this.loading.set(true);
    this.api
      .removeStudentFromDepartment(+form.studentId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Student removed from department.');
          this.error.set('');
          this.loadLookups();
        },
        error: (err: HttpErrorResponse) =>
          this.handleApiError(err, 'Could not remove student from department.'),
      });
  }

  assignStudentToCourse(): void {
    const form = this.studentCourseForm();
    if (!form.studentId || !form.courseId) return;

    const isAssignable = this.assignableCourses().some(
      (course) => course.courseId === +form.courseId,
    );
    if (!isAssignable) {
      this.error.set('Select a course the student is not currently enrolled in.');
      return;
    }

    this.loading.set(true);
    this.api
      .assignStudentToCourse(+form.studentId, +form.courseId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Student assigned to course.');
          this.error.set('');
          this.loadStudentCourseOptions(+form.studentId);
          this.loadLookups();
        },
        error: (err: HttpErrorResponse) =>
          this.handleApiError(err, 'Could not assign student to course.'),
      });
  }

  removeStudentFromCourse(): void {
    const form = this.studentCourseForm();
    if (!form.studentId || !form.courseId) return;

    const isRemovable = this.removableCourses().some(
      (course) => course.courseId === +form.courseId,
    );
    if (!isRemovable) {
      this.error.set('Select a course where the student is currently enrolled.');
      return;
    }

    this.loading.set(true);
    this.api
      .removeStudentFromCourse(+form.studentId, +form.courseId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Student removed from course.');
          this.error.set('');
          this.loadStudentCourseOptions(+form.studentId);
          this.loadLookups();
        },
        error: (err: HttpErrorResponse) =>
          this.handleApiError(err, 'Could not remove student from course.'),
      });
  }

  updateStudentCourseGrade(): void {
    const form = this.gradeForm();
    if (!form.studentId || !form.courseId) return;

    const isEnrolledPair = this.enrolledCourses().some(
      (course) => course.courseId === +form.courseId,
    );
    if (!isEnrolledPair) {
      this.error.set('Select a course where this student is already enrolled.');
      return;
    }

    const rawGrade = form.grade;
    const gradeText = String(rawGrade ?? '').trim();
    const parsedGrade = gradeText === '' ? null : Number(gradeText);

    if (parsedGrade !== null && (Number.isNaN(parsedGrade) || !Number.isFinite(parsedGrade))) {
      this.error.set('Grade must be a valid number or left empty.');
      return;
    }

    if (parsedGrade !== null && (parsedGrade < 0 || parsedGrade > 100)) {
      this.error.set('Grade must be between 0 and 100.');
      return;
    }

    this.loading.set(true);
    this.api
      .updateStudentCourseGrade(+form.studentId, +form.courseId, parsedGrade)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Student grade updated.');
          this.error.set('');
          this.loadStudentCourseStatuses(+form.studentId);
        },
        error: (err: HttpErrorResponse) =>
          this.handleApiError(err, 'Could not update student grade.'),
      });
  }

  private handleApiError(err: HttpErrorResponse, fallbackMessage: string): void {
    this.message.set('');
    this.error.set(err.error?.message ?? fallbackMessage);
  }
}
