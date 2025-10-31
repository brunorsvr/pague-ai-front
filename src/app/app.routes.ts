import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DevedoresComponent } from './pages/devedores/devedores';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'devedores', component: DevedoresComponent },
];
