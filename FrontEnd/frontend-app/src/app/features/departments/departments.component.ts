import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { Department } from '../../core/models';

@Component({
  selector: 'app-departments',
  imports: [FormsModule],
  templateUrl: './departments.component.html',
})
export class DepartmentsComponent implements OnInit {
  readonly departments = signal<Department[]>([]);
  readonly form = signal({ name: '' });
  readonly editDepartmentId = signal<number | null>(null);
  readonly editName = signal('');
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .getDepartments()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.departments.set(data),
        error: () => this.error.set('Could not load departments.'),
      });
  }

  create(): void {
    const name = this.form().name.trim();
    if (!name) return;

    this.loading.set(true);
    this.api
      .createDepartment({ name })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.form.set({ name: '' });
          this.message.set('Department created.');
          this.error.set('');
          this.load();
        },
        error: () => this.error.set('Could not create department.'),
      });
  }

  beginEdit(department: Department): void {
    this.editDepartmentId.set(department.id);
    this.editName.set(department.name);
  }

  cancelEdit(): void {
    this.editDepartmentId.set(null);
    this.editName.set('');
  }

  saveEdit(departmentId: number): void {
    const name = this.editName().trim();
    if (!name) {
      return;
    }

    this.loading.set(true);
    this.api
      .updateDepartment(departmentId, { name })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Department updated.');
          this.error.set('');
          this.cancelEdit();
          this.load();
        },
        error: () => this.error.set('Could not update department.'),
      });
  }

  remove(departmentId: number): void {
    this.loading.set(true);
    this.api
      .deleteDepartment(departmentId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Department deleted.');
          this.error.set('');
          this.load();
        },
        error: () => this.error.set('Could not delete department.'),
      });
  }
}
