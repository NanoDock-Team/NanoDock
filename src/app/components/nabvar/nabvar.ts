import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nabvar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nabvar.html',
  styleUrl: './nabvar.css',
})
export class Nabvar {
  menuAbierto: boolean = false;

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }
}
