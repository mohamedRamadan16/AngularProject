import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Department, Student } from '../../core/models';

@Component({
  selector: 'app-students',
  imports: [FormsModule],
  templateUrl: './students.component.html',
})
export class StudentsComponent implements OnInit {
  readonly students = signal<Student[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly form = signal({ fullName: '', email: '', departmentId: '' });
  readonly editStudentId = signal<number | null>(null);
  readonly editForm = signal({ fullName: '', email: '', departmentId: '' });
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      students: this.api.getStudents(),
      departments: this.api.getDepartments(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          this.students.set(result.students);
          this.departments.set(result.departments);
        },
        error: () => this.error.set('Could not load students.'),
      });
  }

  create(): void {
    const form = this.form();
    if (!form.fullName.trim() || !form.email.trim()) return;

    this.loading.set(true);
    this.api
      .createStudent({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        departmentId: form.departmentId ? Number(form.departmentId) : null,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.form.set({ fullName: '', email: '', departmentId: '' });
          this.message.set('Student created.');
          this.error.set('');
          this.load();
        },
        error: () => this.error.set('Could not create student.'),
      });
  }

  beginEdit(student: Student): void {
    this.editStudentId.set(student.id);
    this.editForm.set({
      fullName: student.fullName,
      email: student.email,
      departmentId: student.departmentId ? String(student.departmentId) : '',
    });
  }

  cancelEdit(): void {
    this.editStudentId.set(null);
    this.editForm.set({ fullName: '', email: '', departmentId: '' });
  }

  saveEdit(studentId: number): void {
    const form = this.editForm();
    if (!form.fullName.trim() || !form.email.trim()) {
      return;
    }

    this.loading.set(true);
    this.api
      .updateStudent(studentId, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        departmentId: form.departmentId ? Number(form.departmentId) : null,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Student updated.');
          this.error.set('');
          this.cancelEdit();
          this.load();
        },
        error: () => this.error.set('Could not update student.'),
      });
  }

  remove(studentId: number): void {
    this.loading.set(true);
    this.api
      .deleteStudent(studentId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Student deleted.');
          this.error.set('');
          this.load();
        },
        error: () => this.error.set('Could not delete student.'),
      });
  }
}
