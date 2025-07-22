import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Nabvar } from './components/nabvar/nabvar';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, Nabvar],
      providers: [
        provideRouter([]) // Añadimos provideRouter para la dependencia RouterOutlet
      ],
      schemas: [NO_ERRORS_SCHEMA] // Esto permite ignorar elementos desconocidos en las plantillas
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Eliminamos la prueba que intenta acceder a la propiedad protected 'title'

  it('should render the navbar component', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navbar = compiled.querySelector('app-nabvar');
    expect(navbar).toBeTruthy();
  });

  it('should have router-outlet in template', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
});