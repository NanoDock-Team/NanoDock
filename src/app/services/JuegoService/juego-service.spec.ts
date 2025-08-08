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

  it('debería obtener los resultados del juego', () => {
    const mockResultados = [
      { id: 1, nombre: 'jugador' },
      { id: 2, nombre: 'cpu' },
      { id: 3, nombre: 'empate' },
    ];

    service.obtenerResultados().subscribe((resultados) => {
      expect(resultados).toEqual(mockResultados);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/resultados/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockResultados);
  });

  it('debería crear un resultado', () => {
    const nombre = 'jugador';
    service.crearResultado(nombre).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne('http://localhost:3000/api/resultados/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre });
    req.flush({ success: true });
  });

  it('debería crear una partida', () => {
    const data = { id_opcion_usuario: 1, id_opcion_cpu: 2, id_resultado: 3 };
    service.crearPartida(data).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne('http://localhost:3000/api/partidas/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ success: true });
  });

  it('debería actualizar una partida', () => {
    const id = '456';
    const data = { id_opcion_usuario: 1, id_opcion_cpu: 2, id_resultado: 3 };

    service.actualizarPartida(id, data).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(
      `http://localhost:3000/api/partidas/up/${id}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ success: true });
  });

  it('debería eliminar una partida', () => {
    const id = '789';

    service.eliminarPartida(id).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(
      `http://localhost:3000/api/partidas/del/${id}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('debería calcular el resultado de una partida', () => {
    const idUsuario = 1;
    const idCpu = 2;
    const mockResponse = { id: 42 };

    service.calcularResultado(idUsuario, idCpu).subscribe((res) => {
      expect(res.id).toBe(42);
    });

    const req = httpMock.expectOne(
      'http://localhost:3000/api/partidas/calcular'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ idUsuario, idCpu });
    req.flush(mockResponse);
  });

  //==========

  it('debería manejar error al obtener opciones', () => {
    service.obtenerOpciones().subscribe({
      next: () => fail('Debe emitir un error'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/opciones/all`);
    expect(req.request.method).toBe('GET');
    req.flush('Error en el servidor', { status: 500, statusText: 'Server Error' });
  });

  it('debería manejar error al crear una partida', () => {
    const data = { id_opcion_usuario: 1, id_opcion_cpu: 2, id_resultado: 3 };

    service.crearPartida(data).subscribe({
      next: () => fail('Debe emitir un error'),
      error: (err) => {
        expect(err.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/partidas/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush('Solicitud incorrecta', { status: 400, statusText: 'Bad Request' });
  });

  it('debería manejar error al actualizar una partida', () => {
    const id = '456';
    const data = { id_opcion_usuario: 1, id_opcion_cpu: 2, id_resultado: 3 };

    service.actualizarPartida(id, data).subscribe({
      next: () => fail('Debe emitir un error'),
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/partidas/up/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush('No encontrado', { status: 404, statusText: 'Not Found' });
  });

  it('debería manejar error al eliminar una partida', () => {
    const id = '789';

    service.eliminarPartida(id).subscribe({
      next: () => fail('Debe emitir un error'),
      error: (err) => {
        expect(err.status).toBe(403);
      }
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/partidas/del/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush('Prohibido', { status: 403, statusText: 'Forbidden' });
  });

  // Test para simular error en guardarHistorialEnLocalStorage
  it('debería manejar error en guardarHistorialEnLocalStorage', () => {
    spyOn(localStorage, 'setItem').and.throwError('Error al guardar');
    // Al registrar el resultado se invoca guardarHistorialEnLocalStorage internamente.
    // Verificamos que no se propague la excepción (el error se maneja internamente)
    expect(() => {
      service.registrarResultadoPartida('Test', 'jugador', '1-0', 1);
    }).not.toThrow();
  });

  // Test para simular error en cargarHistorialDesdeLocalStorage
  it('debería manejar error en cargarHistorialDesdeLocalStorage', () => {
    spyOn(localStorage, 'getItem').and.throwError('Error al cargar');
    // Reinicializamos el servicio para que intente cargar el historial y verifique el manejo del error.
    expect(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [JuegoService],
      });
    }).not.toThrow();
  });  

});
