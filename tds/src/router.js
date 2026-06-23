// ============================================
// TDS Hash-based SPA Router
// ============================================
import { store } from './store.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentCleanup = null;
    this.beforeEachGuard = null;
  }

  register(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  beforeEach(guard) {
    this.beforeEachGuard = guard;
  }

  start() {
    window.addEventListener('hashchange', () => this._handleRoute());
    this._handleRoute();
  }

  navigate(path) {
    window.location.hash = path;
  }

  _handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '') || '/';

    // Run guard
    if (this.beforeEachGuard) {
      const result = this.beforeEachGuard(path);
      if (result === false) return;
      if (typeof result === 'string') {
        this.navigate(result);
        return;
      }
    }

    // Cleanup previous page
    if (this.currentCleanup) {
      this.currentCleanup();
      this.currentCleanup = null;
    }

    // Find matching route
    let handler = this.routes[path];
    if (!handler) {
      // Try matching with parent paths
      const segments = path.split('/').filter(Boolean);
      while (segments.length > 0 && !handler) {
        const tryPath = '/' + segments.join('/');
        handler = this.routes[tryPath];
        if (!handler) segments.pop();
      }
    }
    if (!handler) handler = this.routes['/'];

    this.currentRoute = path;
    store.setActivePage(path);

    // Render page
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '';
      app.classList.add('page-enter');
      const cleanup = handler(app);
      if (typeof cleanup === 'function') {
        this.currentCleanup = cleanup;
      }
      // Remove animation class after animation
      setTimeout(() => app.classList.remove('page-enter'), 300);
    }
  }
}

export const router = new Router();
