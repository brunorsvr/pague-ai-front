import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

type LoginPayload = { email: string; password: string };
type LoginResponse = {
  acess_token: string;
  company_id: string | number;
  user_name: string;
  token_type?: unknown;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly tokenKey = 'auth_token';
  private readonly companyKey = 'company_id';
  private readonly userNameKey = 'user_name';
  private readonly baseUrl = 'http://localhost:8000';

  login(payload: LoginPayload): Observable<void> {
    console.log("chegou aqui")
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap(res => this.setSession(res)),
      map(() => void 0)
    );
  }

  register(payload: { name: string; email: string; password: string }): Observable<void> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap(res => this.setSession(res)),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.companyKey);
    localStorage.removeItem(this.userNameKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeJwt(token);
    if (!payload?.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp > nowSec;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCompanyId(): string | null {
    return localStorage.getItem(this.companyKey);
  }

  getUserName(): string | null {
    return localStorage.getItem(this.userNameKey);
  }

  private setSession(response: LoginResponse): void {
    this.setToken(response.acess_token);
    localStorage.setItem(this.companyKey, String(response.company_id));
    localStorage.setItem(this.userNameKey, response.user_name);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private decodeJwt(token: string): any | null {
    try {
      const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
      if (!base64) return null;
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
