import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Home } from './home';
import { PartidaService } from '../../services/partida/partida.service';// Importa la interfaz
import { of } from 'rxjs';
import { Partida } from '../../interfaces/partida';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let partidaServiceSpy: jasmine.SpyObj<PartidaService>;

  // Datos de prueba con fecha como string para coincidir con la interfaz Partida
  const mockPartidas: Partida[] = [
    { 
      id: 1, 
      fecha: '2025-07-17T14:30:00', // Fecha en formato string
      eleccion_usuario: 'piedra', 
      eleccion_cpu: 'tijera', 
      resultado: 'Victoria' 
    },
    { 
      id: 2, 
      fecha: '2025-07-17T14:35:00', 
      eleccion_usuario: 'papel', 
      eleccion_cpu: 'piedra', 
      resultado: 'Victoria' 
    },
    { 
      id: 3, 
      fecha: '2025-07-17T14:40:00', 
      eleccion_usuario: 'tijera', 
      eleccion_cpu: 'papel', 
      resultado: 'Victoria' 
    }
  ];

  beforeEach(async () => {
    // Crear un espía para el servicio
    const spy = jasmine.createSpyObj('PartidaService', ['getPartidas']);
    
    await TestBed.configureTestingModule({
      imports: [
        Home, 
        HttpClientTestingModule,
        FormsModule
      ],
      providers: [
        { provide: PartidaService, useValue: spy }
      ]
    })
    .compileComponents();

    partidaServiceSpy = TestBed.inject(PartidaService) as jasmine.SpyObj<PartidaService>;
    
    // Configurar el espía para devolver datos de prueba
    partidaServiceSpy.getPartidas.and.returnValue(of(mockPartidas));

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Esto ejecuta ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar partidas al iniciar', () => {
    expect(partidaServiceSpy.getPartidas).toHaveBeenCalled();
    expect(component.partidas.length).toBe(3);
    expect(component.partidasFiltradas.length).toBe(3);
  });

  it('debería filtrar partidas correctamente', () => {
    // Cambiar filtro a 'Victoria'
    component.filtro = 'Victoria';
    component.filtrarPartidas();
    expect(component.partidasFiltradas.length).toBe(3);

    // Cambiar filtro a 'Derrota'
    component.filtro = 'Derrota';
    component.filtrarPartidas();
    expect(component.partidasFiltradas.length).toBe(0);

    // Cambiar filtro de vuelta a 'Todos'
    component.filtro = 'Todos';
    component.filtrarPartidas();
    expect(component.partidasFiltradas.length).toBe(3);
  });

  it('debería mostrar mensaje cuando no hay partidas filtradas', () => {
    // Configurar un filtro que no tenga resultados
    component.filtro = 'Derrota';
    component.filtrarPartidas();
    fixture.detectChanges();

    // Comprobar que aparece el mensaje "No hay partidas"
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMessage = compiled.querySelector('.historial-vacio');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage?.textContent?.trim()).toContain('No hay partidas que coincidan');
  });
});