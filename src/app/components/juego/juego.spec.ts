import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Juego } from './juego';
import { JuegoService, ResultadoJuego, EstadisticasGenerales, DetallePartida } from '../../services/JuegoService/juego.service';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

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

  // Mock de opciones de juego
  const mockOpciones = [
    { id: 1, nombre: 'piedra' },
    { id: 2, nombre: 'papel' },
    { id: 3, nombre: 'tijera' }
  ];

  // Mock del historial de partidas
  const mockHistorial: DetallePartida[] = [
    {
      id: '1',
      fecha: new Date(),
      ganador: 'jugador' as 'jugador' | 'cpu',
      modalidad: 'Mejor 2 de 3',
      puntuacionFinal: '2-1',
      rondasJugadas: 3,
      duracion: 45
    }
  ];

  // Mock de estadísticas
  const mockEstadisticas: EstadisticasGenerales = {
    totalPartidas: 10,
    victoriasJugador: 6,
    victoriasCPU: 4,
    porcentajeExito: 60,
    modalidadFavorita: 'Mejor 2 de 3',
    ultimasPartidas: mockHistorial
  };

  beforeEach(async () => {
    // Crear un spy del servicio con TODOS los métodos necesarios
    const spy = jasmine.createSpyObj('JuegoService', [
      'jugarRonda',
      'obtenerEstadisticasGenerales',
      'obtenerUltimasPartidas',
      'registrarResultadoPartida',
      'iniciarPartida',
      'esOpcionValida',
      'obtenerOpciones',  // Añadido
      'obtenerPartidas',  // Añadido
      'generarEleccionCPU', // Añadido
      'calcularResultado',  // Añadido
      'crearPartida'  // Añadido
    ]);

    await TestBed.configureTestingModule({
      imports: [
        Juego,
        HttpClientTestingModule
      ],
      providers: [
        { provide: JuegoService, useValue: spy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    // Configurar los espías antes de crear el componente
    juegoServiceSpy = TestBed.inject(JuegoService) as jasmine.SpyObj<JuegoService>;
    
    // Configurar respuestas para todos los métodos
    juegoServiceSpy.obtenerEstadisticasGenerales.and.returnValue(mockEstadisticas);
    juegoServiceSpy.obtenerUltimasPartidas.and.returnValue(mockHistorial);
    juegoServiceSpy.esOpcionValida.and.returnValue(true);
    juegoServiceSpy.jugarRonda.and.returnValue(mockResultado);
    juegoServiceSpy.obtenerOpciones.and.returnValue(of(mockOpciones));
    juegoServiceSpy.obtenerPartidas.and.returnValue(of(mockHistorial));
    juegoServiceSpy.generarEleccionCPU.and.returnValue('tijera');
    juegoServiceSpy.calcularResultado.and.returnValue(of({ id: 1 })); // 1 = victoria
    juegoServiceSpy.crearPartida.and.returnValue(of({}));

    fixture = TestBed.createComponent(Juego);
    component = fixture.componentInstance;
    
    // Añadimos manualmente las opciones para evitar dependencia del método obtenerOpciones
    component.opcionesJuego = [
      { nombre: 'piedra', emoji: '🪨', icono: '✊' },
      { nombre: 'papel', emoji: '📄', icono: '✋' },
      { nombre: 'tijera', emoji: '✂️', icono: '✌️' }
    ];
    
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  // El resto de las pruebas sigue igual...
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Modificamos este test para adaptarlo al nuevo flujo
  it('debería cargar estadísticas e historial al inicializar', () => {
    expect(juegoServiceSpy.obtenerOpciones).toHaveBeenCalled();
    expect(juegoServiceSpy.obtenerPartidas).toHaveBeenCalled();
    // Las siguientes expectativas dependen de cómo está implementado tu componente
    // y pueden necesitar ajustes
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
  
  // Configuramos los espías para la nueva implementación
  juegoServiceSpy.generarEleccionCPU.and.returnValue('tijera');
  juegoServiceSpy.calcularResultado.and.returnValue(of({ id: 1 })); // Victoria del jugador
  
  // Seleccionamos piedra
  component.seleccionarOpcion('piedra');
  
  // Verificamos que se llamaron a los métodos correctos
  expect(juegoServiceSpy.generarEleccionCPU).toHaveBeenCalled();
  expect(juegoServiceSpy.calcularResultado).toHaveBeenCalled();
  expect(juegoServiceSpy.crearPartida).toHaveBeenCalled();
  
  // Verificamos que se actualizó la puntuación
  expect(component.puntuacionJugador).toBe(1);
  // Verificamos que el resultado coincide con nuestras configuraciones
  expect(component.resultadoActual?.jugador).toBe('piedra');
  expect(component.resultadoActual?.cpu).toBe('tijera');
  expect(component.resultadoActual?.ganador).toBe('jugador');
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