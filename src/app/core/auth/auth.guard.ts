import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';

const redirectToLogin = (router: Router, url?: string): UrlTree =>
  router.createUrlTree(['/login'], {
    queryParams: url ? { returnUrl: url } : undefined
  });

export const authGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return redirectToLogin(router, state.url);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/debtors']);
  }

  return true;
};
