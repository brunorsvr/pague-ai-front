import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../core/config/environment';

type Status = 'Pago' | 'Pendente' | 'Não Pago';
type SortKey = 'valor' | 'data';

interface DebtorRow {
  id: string;
  nome: string;
  data: string;
  valor: number;
  cpf: string;
  status: Status;
  contato?: string;
}

const PAGE_SIZE = 10;

type DebtFormModel = {
  nome: string;
  cpf: string;
  telefone: string;
  valor: string;
};

type DebtApiResponse = {
  id?: string;
  debt_value?: string | number;
  debtor_name?: string;
  debtor_contact?: string;
  debtor_cpf?: string;
  debt_status?: boolean | string | number;
  created_at?: string;
  updated_at?: string;
};

@Component({
  selector: 'app-debtors',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, Navbar],
  templateUrl: './debtors.html'
})
export class DebtorsComponent implements OnInit, OnDestroy {
  page = signal(1);
  search = signal('');
  sortBy = signal<SortKey | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');
  showModal = signal(false);
  formModel: DebtFormModel = this.createEmptyForm();
  isSaving = signal(false);
  saveError = signal<string | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  deletingId = signal<string | null>(null);
  toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  formSubmitted = signal(false);
  confirmModal = signal<{ id: string; nome: string } | null>(null);

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly debtsEndpoint = environment.debtsEndpoint;
  private readonly debtsBaseUrl = `${this.apiBaseUrl}${this.debtsEndpoint}`;
  private readonly debtsRegisterUrl = `${this.debtsBaseUrl}/register`;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  rows = signal<DebtorRow[]>([]);

  ngOnInit(): void {
    this.loadDebts();
  }

  ngOnDestroy(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.rows();
    return this.rows().filter(r => {
      const contato = (r.contato ?? '').toLowerCase();
      const data = r.data.toLowerCase();
      return r.id.toLowerCase().includes(q) ||
             r.nome.toLowerCase().includes(q) ||
             r.cpf.toLowerCase().includes(q) ||
             r.status.toLowerCase().includes(q) ||
             contato.includes(q) ||
             data.includes(q);
    });
  });

  ordered = computed(() => {
    const arr = [...this.filtered()];
    const by = this.sortBy();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    if (!by) return arr;
    if (by === 'valor') return arr.sort((a, b) => (a.valor - b.valor) * dir);
    if (by === 'data')  return arr.sort((a, b) => (new Date(a.data).getTime() - new Date(b.data).getTime()) * dir);
    return arr;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.ordered().length / PAGE_SIZE)));
  pageList   = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.ordered().slice(start, start + PAGE_SIZE);
  });

  go(p: number) {
    const t = this.totalPages();
    this.page.set(Math.min(Math.max(1, p), t));
  }

  setSort(k: SortKey) {
    if (this.sortBy() === k) this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    else { this.sortBy.set(k); this.sortDir.set('asc'); }
    this.go(1);
  }

  trackByRow = (_: number, r: DebtorRow) => r.id;

  badgeClass(s: Status) {
    if (s === 'Pago') return 'bg-emerald-100 text-emerald-700';
    if (s === 'Pendente') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  }

  openModal() {
    this.formModel = this.createEmptyForm();
    this.saveError.set(null);
    this.formSubmitted.set(false);
    this.showModal.set(true);
  }

  closeModal() {
    if (this.isSaving()) return;
    this.showModal.set(false);
  }

  saveDebt(form: NgForm) {
    if (this.isSaving()) return;
    this.formSubmitted.set(true);
    form.form.markAllAsTouched();
    const amount = this.parseCurrency(this.formModel.valor);
    const phoneValid = this.isPhoneValid(this.formModel.telefone);
    if (form.invalid || amount === null || !isFinite(amount) || amount <= 0 || !phoneValid) return;
    if (!this.isCpfValid(this.formModel.cpf)) return;
    const companyId = this.auth.getCompanyId();
    if (!companyId) {
      this.saveError.set('Não foi possível identificar a empresa do usuário.');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    const payload = {
      company_id: companyId,
      debt_value: amount.toFixed(2),
      debtor_name: this.formModel.nome,
      debtor_contact: this.formatWhatsappNumber(this.formModel.telefone),
      debtor_cpf: this.formModel.cpf
    };

    this.http.post(this.debtsRegisterUrl, payload).subscribe({
      next: () => {
        this.resetForm(form);
        this.isSaving.set(false);
        this.closeModal();
        this.loadDebts();
        this.showToast('success', 'Dívida registrada com sucesso.');
      },
      error: err => {
        console.error('Falha ao registrar dívida', err);
        this.saveError.set('Falha ao registrar a dívida. Tente novamente.');
        this.showToast('error', 'Falha ao registrar a dívida.');
        this.isSaving.set(false);
      }
    });
  }

  private resetForm(form: NgForm) {
    this.formModel = this.createEmptyForm();
    this.saveError.set(null);
    this.formSubmitted.set(false);
    form.resetForm(this.formModel);
  }

  confirmDelete(debt: DebtorRow) {
    if (this.isSaving() || this.deletingId()) return;
    this.confirmModal.set({ id: debt.id, nome: debt.nome });
  }

  cancelDelete() {
    this.confirmModal.set(null);
  }

  deleteDebt(id: string) {
    if (this.deletingId() === id) return;
    this.deletingId.set(id);
    this.http.delete(`${this.debtsBaseUrl}/${id}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.showToast('success', 'Dívida removida com sucesso.');
        this.confirmModal.set(null);
        this.loadDebts();
      },
      error: err => {
        console.error('Falha ao remover dívida', err);
        this.deletingId.set(null);
        this.confirmModal.set(null);
        this.showToast('error', 'Falha ao remover a dívida.');
      }
    });
  }

  private createEmptyForm(): DebtFormModel {
    return { nome: '', cpf: '', telefone: '', valor: '' };
  }

  private generateId() {
    return `#${Date.now().toString(36).toUpperCase()}`;
  }

  formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 9);
    const part4 = digits.slice(9, 11);
    let result = part1;
    if (part2) result += `.${part2}`;
    if (part3) result += `.${part3}`;
    if (part4) result += `-${part4}`;
    return result;
  }

  formatCurrency(value: string) {
    const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    if (!digits) return '';
    const amount = Number(digits) / 100;
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  isCpfValid(value: string) {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    const calc = (len: number) => {
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += Number(digits[i]) * ((len + 1) - i);
      }
      const mod = (sum * 10) % 11;
      return mod === 10 ? 0 : mod;
    };

    const d1 = calc(9);
    const d2 = calc(10);
    return d1 === Number(digits[9]) && d2 === Number(digits[10]);
  }

  private formatWhatsappNumber(phone: string) {
    const digits = phone.replace(/\D/g, '');
    let phoneNumber = digits;
    if (!phoneNumber.startsWith('55')) {
      phoneNumber = `55${phoneNumber}`;
    }
    return phoneNumber;
  }

  private loadDebts() {
    const companyId = this.auth.getCompanyId();
    if (!companyId) {
      this.loadError.set('Não foi possível identificar a empresa para buscar as dívidas.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    this.http.get<DebtApiResponse[]>(`${this.debtsBaseUrl}?company_id=${encodeURIComponent(companyId)}`).subscribe({
      next: debts => {
        const mapped = (debts ?? []).map(d => this.mapDebtResponse(d));
        this.rows.set(mapped);
        this.go(1);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Falha ao buscar dívidas', err);
        this.loadError.set('Não foi possível carregar as dívidas.');
        this.isLoading.set(false);
      }
    });
  }

  private mapDebtResponse(debt: DebtApiResponse): DebtorRow {
    const rawValue = typeof debt.debt_value === 'string' ? Number(debt.debt_value) : Number(debt.debt_value ?? 0);
    const valor = Number.isFinite(rawValue) ? rawValue : 0;
    const data = debt.created_at ?? debt.updated_at ?? new Date().toISOString();
    return {
      id: debt.id ?? this.generateId(),
      nome: debt.debtor_name ?? '—',
      data,
      valor,
      cpf: debt.debtor_cpf ?? '',
      status: this.mapStatus(debt.debt_status),
      contato: this.formatPhoneForDisplay(debt.debtor_contact)
    };
  }

  private mapStatus(value: DebtApiResponse['debt_status']): Status {
    if (typeof value === 'boolean') return value ? 'Pago' : 'Pendente';
    if (typeof value === 'number') {
      if (value === 1) return 'Pago';
      if (value === 0) return 'Pendente';
    }
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (['true', '1', 'pago'].includes(normalized)) return 'Pago';
      if (['false', '0', 'pendente', 'nao pago', 'não pago'].includes(normalized)) return 'Pendente';
    }
    return 'Não Pago';
  }

  private formatPhoneForDisplay(contact?: string) {
    if (!contact) return '';
    const digits = contact.replace(/\D/g, '');
    const local = digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits;
    if (local.length < 10) return contact;
    if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7, 11)}`;
  }

  private parseCurrency(value: string): number | null {
    const digits = value.replace(/\D/g, '');
    if (!digits) return null;
    return Number(digits) / 100;
  }

  private showToast(type: 'success' | 'error', message: string) {
    this.toast.set({ type, message });
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => this.toast.set(null), 4000);
  }

  isPhoneInvalid() {
    return this.formSubmitted() && !this.isPhoneValid(this.formModel.telefone);
  }

  isAmountInvalid() {
    const amount = this.parseCurrency(this.formModel.valor);
    return this.formSubmitted() && (!amount || amount <= 0);
  }

  isPhoneValid(value: string) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }

  isAmountPositive() {
    const amount = this.parseCurrency(this.formModel.valor);
    return !!(amount && amount > 0);
  }

  isCpfInvalid() {
    return this.formSubmitted() && (!this.formModel.cpf || !this.isCpfValid(this.formModel.cpf));
  }

  buildWhatsappMessage(debt: DebtorRow) {
    if (!debt.contato) return null;
    const digits = debt.contato.replace(/\D/g, '');
    const phone = digits.length === 11 ? `55${digits}` : digits.startsWith('55') ? digits : `55${digits}`;
    const text = `Olá ${debt.nome}, estamos entrando em contato sobre sua dívida de ${debt.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Podemos conversar?`;
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  }
}
