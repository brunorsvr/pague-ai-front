import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.loginForm.valueChanges.subscribe(() => {
      if (this.loginError) {
        this.loginError = null;
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log("formulario invalido");
      return;
    }

    const { email, password } = this.loginForm.value;
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/debtors';

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loginError = null;
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        console.error('Falha no login', err);
        this.loginError = 'Falha no login. Verifique suas credenciais e tente novamente.';
      }
    });
  }

  shouldShowFieldError(controlName: 'email' | 'password') {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get emailErrorMessage(): string | null {
    if (!this.shouldShowFieldError('email')) {
      return null;
    }

    const errors = this.loginForm.get('email')?.errors;
    if (!errors) {
      return null;
    }

    if (errors['required']) {
      return 'Informe seu email.';
    }

    if (errors['email']) {
      return 'Digite um email válido.';
    }

    return null;
  }

  get passwordErrorMessage(): string | null {
    if (!this.shouldShowFieldError('password')) {
      return null;
    }

    const errors = this.loginForm.get('password')?.errors;
    if (!errors) {
      return null;
    }

    if (errors['required']) {
      return 'Informe sua senha.';
    }

    if (errors['minlength']) {
      return 'A senha precisa ter pelo menos 5 caracteres.';
    }

    return null;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
