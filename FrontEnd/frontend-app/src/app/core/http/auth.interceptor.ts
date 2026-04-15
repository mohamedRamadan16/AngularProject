import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

const API_PREFIX = '/api/';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes(API_PREFIX) || req.headers.has('Authorization')) {
    return next(req);
  }

  const token = inject(AuthService).token();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
