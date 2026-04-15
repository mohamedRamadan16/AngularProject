import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());
  readonly isAdmin = computed(() => this.auth.isAdmin());
  readonly isStudent = computed(() => this.auth.isStudent());
  readonly homeRoute = computed(() => this.auth.defaultRoute());

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.auth.clearToken();
    this.router.navigate(['/login']);
  }
}
