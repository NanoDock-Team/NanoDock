// src/app/app.routes.spec.ts
import { routes } from './app.routes';
import { Home } from './components/home/home';
import { Juego } from './components/juego/juego';

describe('App Routes', () => {
  it('debe contener la ruta para la página principal', () => {
    // Verificamos la ruta para la página principal
    const homeRoute = routes.find(route => route.path === '');
    expect(homeRoute).toBeTruthy();
    expect(homeRoute?.component).toBe(Home);
  });

  it('debe contener la ruta para el juego', () => {
    // Verificamos la ruta del juego
    const gameRoute = routes.find(route => route.path === 'juego');
    expect(gameRoute).toBeTruthy();
    expect(gameRoute?.component).toBe(Juego);
  });

  it('debe contener una ruta para redireccionar rutas no encontradas', () => {
    // Verificamos la ruta para redireccionar rutas no encontradas
    const redirectRoute = routes.find(route => route.path === '**');
    expect(redirectRoute).toBeTruthy();
    expect(redirectRoute?.redirectTo).toBe('');
  });

  it('debe contener exactamente 3 rutas', () => {
    // Verificamos que el array de rutas contenga exactamente 3 elementos
    expect(routes.length).toBe(3);
  });
});