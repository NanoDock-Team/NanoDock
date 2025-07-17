import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JuegoService, ResultadoJuego, OpcionJuego, EstadisticasGenerales, DetallePartida } from '../../services/JuegoService/juego.service';

@Component({
  selector: 'app-juego',
  imports: [CommonModule, FormsModule],
  templateUrl: './juego.html',
  styleUrl: './juego.css'
})
export class Juego implements OnInit {
  
  // Variables del estado del juego
  resultadoActual: ResultadoJuego | null = null;
  puntuacionJugador: number = 0;
  puntuacionCPU: number = 0;
  rondasJugadas: number = 0;
  partidaTerminada: boolean = false;
  ganadorPartida: 'jugador' | 'cpu' | null = null;
  
  // Estadísticas generales
  estadisticasGenerales: EstadisticasGenerales | null = null;
  historialReciente: DetallePartida[] = [];

  // Modalidades de juego
  modalidades = [
    { id: 'mejor2de3', nombre: 'Mejor 2 de 3', rondasParaGanar: 2, descripcion: 'El primero en ganar 2 rondas gana' },
    { id: 'mejor3de5', nombre: 'Mejor 3 de 5', rondasParaGanar: 3, descripcion: 'El primero en ganar 3 rondas gana' },
    { id: 'mejor4de7', nombre: 'Mejor 4 de 7', rondasParaGanar: 4, descripcion: 'El primero en ganar 4 rondas gana' },
    { id: 'mejor5de9', nombre: 'Mejor 5 de 9', rondasParaGanar: 5, descripcion: 'El primero en ganar 5 rondas gana' }
  ];

  // Modalidad seleccionada actualmente
  modalidadSeleccionada = this.modalidades[0];

  // Opciones del juego con sus emojis correspondientes
  opcionesJuego = [
    { nombre: 'piedra' as OpcionJuego, emoji: '🪨', icono: '✊' },
    { nombre: 'papel' as OpcionJuego, emoji: '📄', icono: '✋' },
    { nombre: 'tijera' as OpcionJuego, emoji: '✂️', icono: '✌️' }
  ];

  constructor(private readonly juegoService: JuegoService) {}

  ngOnInit(): void {
    // Cargar estadísticas al iniciar
    this.actualizarEstadisticas();
  }

  /**
   * Actualiza las estadísticas generales y el historial reciente
   */
  actualizarEstadisticas(): void {
    this.estadisticasGenerales = this.juegoService.obtenerEstadisticasGenerales();
    this.historialReciente = this.juegoService.obtenerUltimasPartidas(3);
  }

  /**
   * Cambia la modalidad de juego seleccionada
   * @param modalidadId - El ID de la modalidad seleccionada
   */
  cambiarModalidad(modalidadId: string): void {
    const modalidad = this.modalidades.find(m => m.id === modalidadId);
    if (modalidad) {
      this.modalidadSeleccionada = modalidad;
      this.reiniciarJuego();
      
      // Iniciar temporizador para la nueva partida
      this.juegoService.iniciarPartida();
    }
  }

  /**
   * Maneja la selección del jugador y ejecuta una ronda
   * @param eleccionJugador - La opción elegida por el jugador
   */
  seleccionarOpcion(eleccionJugador: OpcionJuego): void {
    // No permitir selecciones si la partida ya terminó
    if (this.partidaTerminada) {
      return;
    }

    // Validar que la opción sea válida (seguridad adicional)
    if (!this.juegoService.esOpcionValida(eleccionJugador)) {
      console.error('Opción no válida:', eleccionJugador);
      return;
    }

    // Jugar la ronda usando el servicio
    this.resultadoActual = this.juegoService.jugarRonda(eleccionJugador);
    
    // Actualizar puntuaciones
    this.actualizarPuntuacion();
    
    // Incrementar contador de rondas
    this.rondasJugadas++;

    // Verificar si la partida ha terminado
    this.verificarFinPartida();
  }
  
  private actualizarPuntuacion(): void {
    if (this.resultadoActual) {
      switch (this.resultadoActual.ganador) {
        case 'jugador':
          this.puntuacionJugador++;
          break;
        case 'cpu':
          this.puntuacionCPU++;
          break;
      }
    }
  }

  /**
   * Verifica si algún jugador ha alcanzado el número de victorias necesarias
   * para ganar según la modalidad seleccionada
   */
  private verificarFinPartida(): void {
    const rondasNecesarias = this.modalidadSeleccionada.rondasParaGanar;
    
    if (this.puntuacionJugador >= rondasNecesarias) {
      this.partidaTerminada = true;
      this.ganadorPartida = 'jugador';
      this.registrarResultadoPartida();
    } else if (this.puntuacionCPU >= rondasNecesarias) {
      this.partidaTerminada = true;
      this.ganadorPartida = 'cpu';
      this.registrarResultadoPartida();
    }
  }
  
  /**
   * Registra el resultado final de la partida en el historial
   */
  private registrarResultadoPartida(): void {
    if (this.ganadorPartida) {
      const puntuacionFinal = `${this.puntuacionJugador}-${this.puntuacionCPU}`;
      this.juegoService.registrarResultadoPartida(
        this.modalidadSeleccionada.nombre,
        this.ganadorPartida,
        puntuacionFinal,
        this.rondasJugadas
      );
      
      // Actualizar estadísticas después de registrar una partida
      setTimeout(() => this.actualizarEstadisticas(), 500);
    }
  }

  reiniciarJuego(): void {
    this.resultadoActual = null;
    this.puntuacionJugador = 0;
    this.puntuacionCPU = 0;
    this.rondasJugadas = 0;
    this.partidaTerminada = false;
    this.ganadorPartida = null;
    
    // Iniciar temporizador para la nueva partida
    this.juegoService.iniciarPartida();
  }

  obtenerDatosOpcion(nombreOpcion: string) {
    return this.opcionesJuego.find(opcion => opcion.nombre === nombreOpcion);
  }

  obtenerMensajeResultado(): string {
    if (!this.resultadoActual) return '';

    // Si la partida ha terminado, mostrar un mensaje de victoria/derrota de la partida completa
    if (this.partidaTerminada) {
      return this.ganadorPartida === 'jugador' 
        ? '¡VICTORIA! Has ganado la partida 🏆' 
        : '¡DERROTA! La CPU ha ganado la partida 🤖';
    }

    // Mensajes para resultados de rondas individuales
    const mensajes = {
      'jugador': ['¡Felicidades! ¡Ganaste esta ronda!', '¡Excelente jugada!', '¡Bien hecho!'],
      'cpu': ['La CPU gana esta ronda', 'Mejor suerte la próxima vez', '¡Inténtalo de nuevo!'],
      'empate': ['¡Es un empate!', '¡Misma elección!', '¡Empate técnico!']
    };

    const arrayMensajes = mensajes[this.resultadoActual.ganador];
    const indiceAleatorio = Math.floor(Math.random() * arrayMensajes.length);
    return arrayMensajes[indiceAleatorio];
  }

  calcularPorcentajeVictorias(): string {
    if (this.rondasJugadas === 0) return '0';
    return ((this.puntuacionJugador / this.rondasJugadas) * 100).toFixed(1);
  }

  obtenerProgresoPartida(): string {
    return `${this.puntuacionJugador} - ${this.puntuacionCPU}`;
  }

  obtenerRondasRestantes(): number {
    const rondasNecesarias = this.modalidadSeleccionada.rondasParaGanar;
    const rondasRestantesJugador = rondasNecesarias - this.puntuacionJugador;
    const rondasRestantesCPU = rondasNecesarias - this.puntuacionCPU;
    
    return Math.min(rondasRestantesJugador, rondasRestantesCPU);
  }
  
  /**
   * Formatea una fecha para mostrarla en formato amigable
   */
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
}