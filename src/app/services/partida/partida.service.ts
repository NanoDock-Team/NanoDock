import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Partida } from '../../interfaces/partida';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class PartidaService {
  private readonly apiUrl = 'https://nanodockbackend-abc5ctb4hsepb7ff.canadacentral-01.azurewebsites.net/api/partidas/all';

  constructor(private readonly http: HttpClient) {}

  getPartidas(): Observable<Partida[]> {
    return this.http.get<Partida[]>(this.apiUrl);
  }
}
