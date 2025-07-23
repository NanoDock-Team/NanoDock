import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { JuegoService } from './juego.service';
import { HttpClient } from '@angular/common/http';

describe('JuegoService', () => {
  let service: JuegoService;
  let httpMock: HttpTestingController;

  beforeAll(() => {
    localStorage.removeItem('nanodock_historial_partidas');
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JuegoService],
    });

    // Limpiar el historial antes de cada prueba
    localStorage.removeItem('nanodock_historial_partidas');

    service = TestBed.inject(JuegoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Pruebas para métodos que no requieren peticiones HTTP
  it('debería validar si una opción es válida', () => {
    expect(service.esOpcionValida('piedra')).toBeTrue();
    expect(service.esOpcionValida('papel')).toBeTrue();
    expect(service.esOpcionValida('tijera')).toBeTrue();
    expect(service.esOpcionValida('invalido')).toBeFalse();
  });

  it('debería determinar correctamente al ganador', () => {
    expect(service.determinarGanador('piedra', 'tijera')).toBe('jugador');
    expect(service.determinarGanador('papel', 'piedra')).toBe('jugador');
    expect(service.determinarGanador('tijera', 'papel')).toBe('jugador');

    expect(service.determinarGanador('tijera', 'piedra')).toBe('cpu');
    expect(service.determinarGanador('piedra', 'papel')).toBe('cpu');
    expect(service.determinarGanador('papel', 'tijera')).toBe('cpu');

    expect(service.determinarGanador('piedra', 'piedra')).toBe('empate');
    expect(service.determinarGanador('papel', 'papel')).toBe('empate');
    expect(service.determinarGanador('tijera', 'tijera')).toBe('empate');
  });

  it('debería jugar una ronda completa', () => {
    const resultado = service.jugarRonda('piedra');
    expect(resultado).toBeDefined();
    expect(resultado.jugador).toBe('piedra');
    expect(['piedra', 'papel', 'tijera']).toContain(resultado.cpu);
    expect(['jugador', 'cpu', 'empate']).toContain(resultado.ganador);
  });

  // Prueba para métodos HTTP
  it('debería obtener las opciones del juego', () => {
    const mockOpciones = [
      { id: 1, nombre: 'piedra' },
      { id: 2, nombre: 'papel' },
      { id: 3, nombre: 'tijera' },
    ];

    service.obtenerOpciones().subscribe((opciones) => {
      expect(opciones).toEqual(mockOpciones);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/opciones/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockOpciones);
  });

  it('debería registrar y obtener resultados de partidas', () => {
    // Registramos una partida
    service.registrarResultadoPartida('Mejor 2 de 3', 'jugador', '2-1', 3);

    // Obtenemos las últimas partidas
    const ultimasPartidas = service.obtenerUltimasPartidas(1);

    expect(ultimasPartidas.length).toBe(1);
    expect(ultimasPartidas[0].modalidad).toBe('Mejor 2 de 3');
    expect(ultimasPartidas[0].ganador).toBe('jugador');
    expect(ultimasPartidas[0].puntuacionFinal).toBe('2-1');
    expect(ultimasPartidas[0].rondasJugadas).toBe(3);
  });

  it('debería calcular estadísticas generales correctamente', () => {
    // Asegurarnos que el historial esté limpio
    expect(service.obtenerHistorialPartidas().length).toBe(0);

    // Registramos varias partidas
    service.registrarResultadoPartida('Mejor 2 de 3', 'jugador', '2-1', 3);
    service.registrarResultadoPartida('Mejor 2 de 3', 'cpu', '1-2', 3);
    service.registrarResultadoPartida('Mejor 3 de 5', 'jugador', '3-2', 5);

    const estadisticas = service.obtenerEstadisticasGenerales();

    expect(estadisticas.totalPartidas).toBe(3);
    expect(estadisticas.victoriasJugador).toBe(2);
    expect(estadisticas.victoriasCPU).toBe(1);
    expect(estadisticas.porcentajeExito).toBeCloseTo(66.67, 1);
    expect(estadisticas.modalidadFavorita).toBe('Mejor 2 de 3');
  });

  it('debería tener HttpClient inyectado', () => {
    // Verificar que HttpClient está inyectado
    const httpClient = (service as any).http;
    expect(httpClient).toBeTruthy();
    expect(httpClient instanceof HttpClient).toBe(true);
  });
});
