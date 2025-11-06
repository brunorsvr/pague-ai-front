import { Component, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';

type Status = 'Pago' | 'Pendente' | 'Não Pago';
type SortKey = 'valor' | 'data';

interface DebtorRow {
  id: string;
  nome: string;
  loja: string;
  data: string;
  valor: number;
  cpf: string;
  status: Status;
}

const PAGE_SIZE = 10;

@Component({
  selector: 'app-debtors',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, Navbar],
  templateUrl: './debtors.html'
})
export class DebtorsComponent {
  page = signal(1);
  search = signal('');
  sortBy = signal<SortKey | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');

  rows = signal<DebtorRow[]>([
    { id: '#20462', nome: 'Joao', loja: 'SWC', data: '2022-05-13', valor: 94.95,  cpf: '890.232.272-38', status: 'Pago' },
    { id: '#18933', nome: 'Matheus', loja: 'SWC', data: '2022-06-23', valor: 68.95,  cpf: '881.086.077-55', status: 'Pago' },
    { id: '#45169', nome: 'Henrique', loja: 'SWC', data: '2022-06-15', valor: 1149.95, cpf: '591.987.779-00', status: 'Pendente' },
    { id: '#34304', nome: 'Antonio', loja: 'SWC', data: '2022-09-06', valor: 899.95,  cpf: '596.488.058-49', status: 'Pendente' },
    { id: '#17188', nome: 'Eric',    loja: 'SWC', data: '2022-09-25', valor: 522.95,  cpf: '742.617.992-58', status: 'Não Pago' },
    { id: '#73203', nome: 'Caio',    loja: 'SWC', data: '2022-10-04', valor: 546.45,  cpf: '230.127.692-93', status: 'Pago' },
    { id: '#58025', nome: 'Neymar jr', loja: 'SWC', data: '2022-10-17', valor: 574.95, cpf: '858.592.503-55', status: 'Pago' },
    { id: '#44122', nome: 'Messi',     loja: 'SWC', data: '2022-10-24', valor: 524.95, cpf: '693.204.618-05', status: 'Pago' },
    { id: '#89094', nome: 'Cristiano', loja: 'SWC', data: '2022-11-01', valor: 699.95, cpf: '110.647.563-10', status: 'Não Pago' },
    { id: '#85252', nome: 'Vini jr',   loja: 'SWC', data: '2022-11-22', valor: 546.84, cpf: '674.334.640-60', status: 'Pendente' },
    { id: '#89094b', nome: 'Virginia', loja: 'SWC', data: '2022-11-01', valor: 609.95, cpf: '872.291.265-76', status: 'Não Pago' }
  ]);

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.rows();
    return this.rows().filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.nome.toLowerCase().includes(q) ||
      r.loja.toLowerCase().includes(q) ||
      r.cpf.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
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
}
