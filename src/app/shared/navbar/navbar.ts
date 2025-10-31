import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  readonly navigationItems = [
    { label: 'Início', link: '/login' },
    { label: 'Devedores', link: '/devedores' },
    { label: 'Relatórios', link: '/relatorios' },
    { label: 'Atividades', link: '/atividades' },
  ];
}
