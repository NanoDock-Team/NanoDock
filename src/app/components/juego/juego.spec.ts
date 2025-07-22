import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Juego } from './juego';
import { JuegoService, ResultadoJuego, EstadisticasGenerales, DetallePartida } from '../../services/JuegoService/juego.service';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

describe('Juego', () => {
  let component: Juego;
  let fixture: ComponentFixture<Juego>;
  let juegoServiceSpy: jasmine.SpyObj<JuegoService>;
  let el: DebugElement;

  // Mock del resultado de una ronda
  const mockResultado: ResultadoJuego = {
    jugador: 'piedra',
    cpu: 'tijera',
    ganador: 'jugador'
  };

  // Mock del historial de partidas corregido (añadido el id)
  const mockHistorial: DetallePartida[] = [
    {
      id: '1', // Añadido el id
      fecha: new Date(),
      ganador: 'jugador' as 'jugador' | 'cpu', // Tipo específico
      modalidad: 'Mejor 2 de 3',
      puntuacionFinal: '2-1',
      rondasJugadas: 3,
      duracion: 45
    }
  ];

  // Mock de estadísticas corregido (añadida la propiedad ultimasPartidas)
  const mockEstadisticas: EstadisticasGenerales = {
    totalPartidas: 10,
    victoriasJugador: 6,
    victoriasCPU: 4,
    porcentajeExito: 60,
    modalidadFavorita: 'Mejor 2 de 3',
    ultimasPartidas: mockHistorial // Corregido: ahora es un array de DetallePartida
  };

  beforeEach(async () => {
    // Crear un spy del servicio
    const spy = jasmine.createSpyObj('JuegoService', [
      'jugarRonda',
      'obtenerEstadisticasGenerales',
      'obtenerUltimasPartidas',
      'registrarResultadoPartida',
      'iniciarPartida',
      'esOpcionValida'
    ]);

    await TestBed.configureTestingModule({
      imports: [Juego],
      providers: [
        { provide: JuegoService, useValue: spy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Para ignorar errores de componentes internos
    }).compileComponents();

    // Configurar los espías antes de crear el componente
    juegoServiceSpy = TestBed.inject(JuegoService) as jasmine.SpyObj<JuegoService>;
    juegoServiceSpy.obtenerEstadisticasGenerales.and.returnValue(mockEstadisticas);
    juegoServiceSpy.obtenerUltimasPartidas.and.returnValue(mockHistorial);
    juegoServiceSpy.esOpcionValida.and.returnValue(true);
    juegoServiceSpy.jugarRonda.and.returnValue(mockResultado);

    fixture = TestBed.createComponent(Juego);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  // El resto del código sigue igual...
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar estadísticas e historial al inicializar', () => {
    expect(juegoServiceSpy.obtenerEstadisticasGenerales).toHaveBeenCalled();
    expect(juegoServiceSpy.obtenerUltimasPartidas).toHaveBeenCalledWith(3);
    expect(component.estadisticasGenerales).toEqual(mockEstadisticas);
    expect(component.historialReciente).toEqual(mockHistorial);
  });

  it('debería cambiar la modalidad de juego', () => {
    // Espiar el método reiniciarJuego
    spyOn(component, 'reiniciarJuego');
    
    // Cambiar a modalidad "Mejor 3 de 5"
    component.cambiarModalidad('mejor3de5');
    
    // Verificar que la modalidad ha cambiado
    expect(component.modalidadSeleccionada.id).toBe('mejor3de5');
    expect(component.modalidadSeleccionada.rondasParaGanar).toBe(3);
    
    // Verificar que el juego se reinició
    expect(component.reiniciarJuego).toHaveBeenCalled();
    
    // Verificar que se inició una nueva partida
    expect(juegoServiceSpy.iniciarPartida).toHaveBeenCalled();
  });

  it('debería seleccionar una opción y procesar el resultado', () => {
    // Verificamos estado inicial
    expect(component.puntuacionJugador).toBe(0);
    
    // Seleccionamos piedra
    component.seleccionarOpcion('piedra');
    
    // Verificamos que se llamó al servicio
    expect(juegoServiceSpy.jugarRonda).toHaveBeenCalledWith('piedra');
    
    // Verificamos que se actualizó la puntuación (dado que el mock devuelve ganador='jugador')
    expect(component.puntuacionJugador).toBe(1);
    expect(component.resultadoActual).toEqual(mockResultado);
    expect(component.rondasJugadas).toBe(1);
  });

  it('debería reiniciar el juego correctamente', () => {
    // Primero modificamos algunos valores
    component.puntuacionJugador = 2;
    component.puntuacionCPU = 1;
    component.rondasJugadas = 3;
    component.resultadoActual = mockResultado;
    component.partidaTerminada = true;
    
    // Llamamos a reiniciarJuego
    component.reiniciarJuego();
    
    // Verificamos que todos los valores volvieron a su estado inicial
    expect(component.puntuacionJugador).toBe(0);
    expect(component.puntuacionCPU).toBe(0);
    expect(component.rondasJugadas).toBe(0);
    expect(component.resultadoActual).toBeNull();
    expect(component.partidaTerminada).toBeFalse();
    expect(component.ganadorPartida).toBeNull();
    expect(juegoServiceSpy.iniciarPartida).toHaveBeenCalled();
  });

  it('debería finalizar la partida cuando un jugador alcanza las victorias necesarias', () => {
    // Configuramos una modalidad de "Mejor 2 de 3"
    component.modalidadSeleccionada = component.modalidades[0]; // mejor2de3
    
    // Simulamos que el jugador gana dos veces
    component.seleccionarOpcion('piedra'); // Primera victoria
    component.seleccionarOpcion('piedra'); // Segunda victoria
    
    // Verificamos que la partida terminó y el jugador ganó
    expect(component.partidaTerminada).toBeTrue();
    expect(component.ganadorPartida).toBe('jugador');
    
    // Verificamos que se registró el resultado
    expect(juegoServiceSpy.registrarResultadoPartida).toHaveBeenCalled();
  });

  it('debería mostrar el mensaje correcto según el resultado', () => {
    // Caso: resultado de ronda (no partida terminada)
    component.resultadoActual = mockResultado;
    component.partidaTerminada = false;
    
    // El mensaje debe ser uno de los mensajes de victoria
    const mensaje = component.obtenerMensajeResultado();
    expect(['¡Felicidades! ¡Ganaste esta ronda!', '¡Excelente jugada!', '¡Bien hecho!']).toContain(mensaje);
    
    // Caso: partida terminada con victoria del jugador
    component.partidaTerminada = true;
    component.ganadorPartida = 'jugador';
    expect(component.obtenerMensajeResultado()).toBe('¡VICTORIA! Has ganado la partida 🏆');
  });

  it('debería calcular correctamente las rondas restantes', () => {
    // Configuramos modalidad "Mejor 3 de 5"
    component.modalidadSeleccionada = component.modalidades[1]; // mejor3de5
    component.puntuacionJugador = 1;
    component.puntuacionCPU = 2;
    
    // Al jugador le faltan 2 victorias y a la CPU 1
    expect(component.obtenerRondasRestantes()).toBe(1);
  });

  it('debería formatear fechas correctamente', () => {
    const fecha = new Date(2025, 6, 17, 15, 30); // 17/Jul/2025 15:30
    const formatoEsperado = fecha.toLocaleDateString('es-ES', {
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    expect(component.formatearFecha(fecha)).toBe(formatoEsperado);
  });
  
  it('debería mostrar los iconos correctos para las opciones de juego', () => {
    expect(component.obtenerDatosOpcion('piedra')?.icono).toBe('✊');
    expect(component.obtenerDatosOpcion('papel')?.icono).toBe('✋');
    expect(component.obtenerDatosOpcion('tijera')?.icono).toBe('✌️');
  });

  // Pruebas de UI
  it('debería mostrar las opciones de juego en la interfaz', () => {
    const opcionesBotones = el.queryAll(By.css('button[class*="bg-gradient-to-br from-cyan-600"]'));
    expect(opcionesBotones.length).toBe(3);
  });

  it('debería deshabilitar los botones cuando la partida ha terminado', () => {
    // Marcar la partida como terminada
    component.partidaTerminada = true;
    fixture.detectChanges();
    
    // Verificar que los botones tienen la clase de deshabilitado
    const botonesOpcion = el.queryAll(By.css('button[class*="opacity-60 cursor-not-allowed"]'));
    expect(botonesOpcion.length).toBe(3);
  });
});