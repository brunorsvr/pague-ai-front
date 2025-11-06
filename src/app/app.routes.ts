import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DebtorsComponent } from './pages/debtors/debtors';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent },
  {path: 'debtors', component: DebtorsComponent}
];
