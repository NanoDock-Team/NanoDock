import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Nabvar } from './nabvar';

describe('Nabvar', () => {
  let component: Nabvar;
  let fixture: ComponentFixture<Nabvar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nabvar],
      providers: [
        provideRouter([]) // Usa provideRouter en lugar de RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nabvar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener dos enlaces de navegación', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('a.nav-button');
    expect(navLinks.length).toBe(2);
  });

  it('debería tener un enlace a inicio', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const homeLink = compiled.querySelector('a[routerLink="/"]');
    expect(homeLink).toBeTruthy();
    expect(homeLink?.textContent).toContain('INICIO');
  });

  it('debería tener un enlace al juego', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const gameLink = compiled.querySelector('a[routerLink="/juego"]');
    expect(gameLink).toBeTruthy();
    expect(gameLink?.textContent).toContain('JUGAR');
  });

  it('debería mostrar el título NanoDock', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent?.trim()).toBe('NanoDock');
  });

  it('debería mostrar el subtítulo del juego', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('p.text-cyan-300');
    expect(subtitle?.textContent).toContain('Piedra • Papel • Tijera');
  });

  it('debería tener un indicador ONLINE', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const onlineIndicator = compiled.querySelector('span.text-green-400');
    expect(onlineIndicator?.textContent).toBe('ONLINE');
  });
});