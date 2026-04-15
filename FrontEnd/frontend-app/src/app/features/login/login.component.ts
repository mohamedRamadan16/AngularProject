import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { LoginDto } from '../../core/models';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  readonly form = signal<LoginDto>({ email: 'admin@app.com', password: 'Admin@123' });
  readonly loading = signal(false);
  readonly error = signal('');

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  login(): void {
    this.loading.set(true);
    this.error.set('');

    this.api
      .login(this.form())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.auth.setSession(res);
          this.router.navigate([this.auth.defaultRoute()]);
        },
        error: (err: HttpErrorResponse) =>
          this.error.set(
            err.error?.message ??
              'Login failed. Verify backend is running and credentials are correct.',
          ),
      });
  }
}
