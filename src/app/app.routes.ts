import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DebtorsComponent } from './pages/debtors/debtors';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent, canActivate: [guestGuard]},
  {path: 'debtors', component: DebtorsComponent, canActivate: [authGuard]}
];
