import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppRole, AuthResponse } from '../models';

interface AuthSession {
  token: string;
  expiresAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionStorageKey = 'auth_session';
  private readonly legacyTokenStorageKey = 'token';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly session = signal<AuthSession | null>(this.loadSession());
  readonly token = computed(() => {
    const session = this.session();
    if (!session || this.isExpired(session.expiresAt)) {
      return null;
    }

    return session.token;
  });
  readonly isLoggedIn = computed(() => !!this.token());
  readonly role = computed<AppRole>(() => this.extractRole(this.token()));
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isStudent = computed(() => this.role() === 'student');

  setSession(response: AuthResponse): void {
    this.persistSession({ token: response.token, expiresAt: response.expiresAt ?? null });
  }

  setToken(token: string, expiresAt: string | null = null): void {
    this.persistSession({ token, expiresAt });
  }

  defaultRoute(): string {
    return this.isAdmin() ? '/students' : '/courses';
  }

  clearToken(): void {
    this.clearPersistedSession();

    this.session.set(null);
  }

  private persistSession(session: AuthSession): void {
    if (this.isBrowser) {
      localStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
      localStorage.setItem(this.legacyTokenStorageKey, session.token);
    }

    this.session.set(session);
  }

  private loadSession(): AuthSession | null {
    if (!this.isBrowser) {
      return null;
    }

    const rawSession = localStorage.getItem(this.sessionStorageKey);
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession) as AuthSession;
        if (!parsed?.token || this.isExpired(parsed.expiresAt)) {
          this.clearPersistedSession();
          return null;
        }

        return parsed;
      } catch {
        this.clearPersistedSession();
        return null;
      }
    }

    const legacyToken = localStorage.getItem(this.legacyTokenStorageKey);
    if (!legacyToken) {
      return null;
    }

    return { token: legacyToken, expiresAt: null };
  }

  private isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) {
      return false;
    }

    const expiry = Date.parse(expiresAt);
    if (Number.isNaN(expiry)) {
      return false;
    }

    return expiry <= Date.now();
  }

  private extractRole(token: string | null): AppRole {
    const payload = this.parseJwtPayload(token);
    if (!payload) {
      return 'guest';
    }

    const roleFromClaim =
      payload['role'] ??
      payload['roles'] ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (Array.isArray(roleFromClaim)) {
      return this.mapRoleValue(String(roleFromClaim[0] ?? ''));
    }

    return this.mapRoleValue(String(roleFromClaim ?? ''));
  }

  private mapRoleValue(rawRole: string): AppRole {
    const role = rawRole.trim().toLowerCase();
    if (role === 'admin') {
      return 'admin';
    }

    if (role === 'student' || role === 'user') {
      return 'student';
    }

    return 'guest';
  }

  private parseJwtPayload(token: string | null): Record<string, unknown> | null {
    if (!token || !this.isBrowser) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = atob(padded);
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private clearPersistedSession(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(this.sessionStorageKey);
    localStorage.removeItem(this.legacyTokenStorageKey);
  }
}
