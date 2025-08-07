import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PartidaService } from './partida.service';
import { Partida } from '../../interfaces/partida';

describe('PartidaService', () => {
  let service: PartidaService;
  let httpMock: HttpTestingController;

  // Mock adaptado a la interfaz Partida
  const mockPartidas: Partida[] = [
    {
      id: 1,
      fecha: '2025-07-22T10:00:00Z',
      eleccion_usuario: 'Piedra',
      eleccion_cpu: 'Papel',
      resultado: 'Derrota',
    },
    {
      id: 2,
      fecha: '2025-07-22T11:00:00Z',
      eleccion_usuario: 'Tijera',
      eleccion_cpu: 'Papel',
      resultado: 'Victoria',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PartidaService],
    });
    service = TestBed.inject(PartidaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPartidas() debe devolver un Observable<Partida[]> y hacer GET al endpoint', () => {
    service.getPartidas().subscribe((partidas) => {
      expect(partidas).toEqual(mockPartidas);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/partidas/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockPartidas);
  });
});
