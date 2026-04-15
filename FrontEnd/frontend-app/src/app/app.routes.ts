import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { CoursesComponent } from './features/courses/courses.component';
import { DepartmentsComponent } from './features/departments/departments.component';
import { LoginComponent } from './features/login/login.component';
import { RelationsComponent } from './features/relations/relations.component';
import { StudentsComponent } from './features/students/students.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'students', component: StudentsComponent, canActivate: [adminGuard] },
  { path: 'departments', component: DepartmentsComponent, canActivate: [adminGuard] },
  { path: 'courses', component: CoursesComponent, canActivate: [authGuard] },
  { path: 'relations', component: RelationsComponent, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'courses' },
  { path: '**', redirectTo: 'courses' },
];
