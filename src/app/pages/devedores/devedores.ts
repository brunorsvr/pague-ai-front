import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar';

interface Debtor {
  id: string;
  name: string;
  store: string;
  dueDate: string;
  debtValue: string;
  cpf: string;
  status: 'Pago' | 'Parcial' | 'Não Pago' | 'Atrasado';
}

@Component({
  selector: 'app-devedores',
  standalone: true,
  imports: [NavbarComponent, NgFor, NgClass, NgIf, ReactiveFormsModule],
  templateUrl: './devedores.html',
  styleUrl: './devedores.css'
})
export class DevedoresComponent {
  debtors: Debtor[] = [
    { id: '#2042', name: 'João', store: 'SMC', dueDate: '10/02/2024', debtValue: 'R$ 1.245,54', cpf: '985.654.621-45', status: 'Pago' },
    { id: '#2041', name: 'Matheus', store: 'SMC', dueDate: '09/02/2024', debtValue: 'R$ 1.024,18', cpf: '985.654.621-45', status: 'Parcial' },
    { id: '#2040', name: 'Mario', store: 'SMC', dueDate: '08/02/2024', debtValue: 'R$ 845,21', cpf: '985.654.621-45', status: 'Não Pago' },
    { id: '#2039', name: 'Henrique', store: 'SMC', dueDate: '07/02/2024', debtValue: 'R$ 954,32', cpf: '985.654.621-45', status: 'Pago' },
    { id: '#2038', name: 'Erick', store: 'SMC', dueDate: '06/02/2024', debtValue: 'R$ 1.245,54', cpf: '985.654.621-45', status: 'Parcial' },
    { id: '#2037', name: 'João', store: 'SMC', dueDate: '05/02/2024', debtValue: 'R$ 654,87', cpf: '985.654.621-45', status: 'Não Pago' },
    { id: '#2036', name: 'Neymar Jr', store: 'SMC', dueDate: '04/02/2024', debtValue: 'R$ 1.654,00', cpf: '985.654.621-45', status: 'Pago' },
    { id: '#2035', name: 'Messi', store: 'SMC', dueDate: '03/02/2024', debtValue: 'R$ 1.845,22', cpf: '985.654.621-45', status: 'Parcial' },
    { id: '#2034', name: 'Silvio', store: 'SMC', dueDate: '02/02/2024', debtValue: 'R$ 1.245,54', cpf: '985.654.621-45', status: 'Atrasado' },
    { id: '#2033', name: 'Julio', store: 'SMC', dueDate: '01/02/2024', debtValue: 'R$ 845,15', cpf: '985.654.621-45', status: 'Não Pago' },
    { id: '#2032', name: 'Rafael', store: 'SMC', dueDate: '31/01/2024', debtValue: 'R$ 1.456,30', cpf: '985.654.621-45', status: 'Pago' },
    { id: '#2031', name: 'Carla', store: 'SMC', dueDate: '30/01/2024', debtValue: 'R$ 1.245,54', cpf: '985.654.621-45', status: 'Atrasado' },
  ];

  isModalOpen = false;
  readonly debtorForm: FormGroup<{
    name: FormControl<string>;
    cpf: FormControl<string>;
    store: FormControl<string>;
    dueDate: FormControl<string>;
    debtValue: FormControl<string>;
    status: FormControl<Debtor['status']>;
  }>;

  constructor(private readonly formBuilder: FormBuilder) {
    this.debtorForm = this.formBuilder.nonNullable.group({
      name: ['', Validators.required],
      cpf: ['', Validators.required],
      store: ['', Validators.required],
      dueDate: ['', Validators.required],
      debtValue: ['', Validators.required],
      status: ['Não Pago' as Debtor['status'], Validators.required]
    });
  }

  statusClass(status: Debtor['status']): string {
    switch (status) {
      case 'Pago':
        return 'status-badge status-badge--paid';
      case 'Parcial':
        return 'status-badge status-badge--partial';
      case 'Não Pago':
        return 'status-badge status-badge--unpaid';
      case 'Atrasado':
        return 'status-badge status-badge--late';
      default:
        return 'status-badge';
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.debtorForm.reset({
      name: '',
      cpf: '',
      store: '',
      dueDate: '',
      debtValue: '',
      status: 'Não Pago' as Debtor['status']
    });
  }

  addDebtor(): void {
    if (this.debtorForm.invalid) {
      this.debtorForm.markAllAsTouched();
      return;
    }

    const formValue = this.debtorForm.getRawValue();

    const newDebtor: Debtor = {
      id: this.generateNextId(),
      name: formValue.name,
      cpf: formValue.cpf,
      store: formValue.store,
      dueDate: this.formatDate(formValue.dueDate),
      debtValue: this.formatCurrency(formValue.debtValue),
      status: formValue.status
    } as Debtor;

    this.debtors = [...this.debtors, newDebtor];
    this.closeModal();
  }

  private generateNextId(): string {
    const maxId = this.debtors.reduce((max, debtor) => {
      const numeric = Number(debtor.id.replace('#', ''));
      return Number.isNaN(numeric) ? max : Math.max(max, numeric);
    }, 0);

    return `#${(maxId + 1).toString().padStart(4, '0')}`;
  }

  private formatDate(dateInput: string): string {
    if (!dateInput) {
      return '';
    }

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return dateInput;
    }

    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private formatCurrency(value: string): string {
    if (!value) {
      return value;
    }

    const normalized = value
      .replace(/[^0-9,.-]/g, '')
      .replace(/\.(?=.*\.)/g, '')
      .replace(',', '.');

    const numeric = Number(normalized);

    if (Number.isNaN(numeric)) {
      return value;
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numeric);
  }
}
