import { Component } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
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
  imports: [NavbarComponent, NgFor, NgClass],
  templateUrl: './devedores.html',
  styleUrl: './devedores.css'
})
export class DevedoresComponent {
  readonly debtors: Debtor[] = [
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
}
