import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Course, StudentCourseStatus } from '../../core/models';

@Component({
  selector: 'app-courses',
  imports: [FormsModule],
  templateUrl: './courses.component.html',
})
export class CoursesComponent implements OnInit {
  readonly courses = signal<Course[]>([]);
  readonly studentCourses = signal<StudentCourseStatus[]>([]);
  readonly form = signal({ name: '', creditHours: 3 });
  readonly editCourseId = signal<number | null>(null);
  readonly editForm = signal({ name: '', creditHours: 3 });
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly isAdmin = computed(() => this.auth.isAdmin());

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error.set('');
    this.loading.set(true);

    if (this.isAdmin()) {
      this.loadAdminCourses();
      return;
    }

    this.loadStudentCourseStatuses();
  }

  private loadAdminCourses(): void {
    this.api
      .getCourses()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.courses.set(data),
        error: () => this.error.set('Could not load courses.'),
      });
  }

  private loadStudentCourseStatuses(): void {
    this.api
      .getMyCourseStatuses()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.studentCourses.set(data),
        error: () => this.error.set('Could not load your course enrollment.'),
      });
  }

  create(): void {
    if (!this.isAdmin()) {
      return;
    }

    const form = this.form();
    if (!form.name.trim() || form.creditHours <= 0) return;

    this.loading.set(true);
    this.api
      .createCourse({ name: form.name.trim(), creditHours: form.creditHours })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.form.set({ name: '', creditHours: 3 });
          this.message.set('Course created.');
          this.error.set('');
          this.load();
        },
        error: () => this.error.set('Could not create course.'),
      });
  }

  beginEdit(course: Course): void {
    this.editCourseId.set(course.id);
    this.editForm.set({ name: course.name, creditHours: course.creditHours });
  }

  cancelEdit(): void {
    this.editCourseId.set(null);
    this.editForm.set({ name: '', creditHours: 3 });
  }

  saveEdit(courseId: number): void {
    const form = this.editForm();
    if (!form.name.trim() || form.creditHours <= 0) {
      return;
    }

    this.loading.set(true);
    this.api
      .updateCourse(courseId, { name: form.name.trim(), creditHours: form.creditHours })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Course updated.');
          this.error.set('');
          this.cancelEdit();
          this.load();
        },
        error: () => this.error.set('Could not update course.'),
      });
  }

  remove(courseId: number): void {
    if (!this.isAdmin()) {
      return;
    }

    this.loading.set(true);
    this.api
      .deleteCourse(courseId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Course deleted.');
          this.error.set('');
          this.load();
        },
        error: () => this.error.set('Could not delete course.'),
      });
  }
}
