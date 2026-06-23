// ============================================
// TDS Main Entry Point
// ============================================
import './styles/design-system.css';
import './styles/components.css';
import './styles/pages.css';

import { router } from './router.js';
import { store } from './store.js';
import { startSimulation, stopSimulation } from './data/simulation.js';
import { initToastListener } from './components/alerts.js';

// Pages
import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderSupervisorDashboard } from './pages/supervisor/dashboard.js';
import { renderSupervisorFleet } from './pages/supervisor/fleet.js';
import { renderSupervisorDriverDetails } from './pages/supervisor/driver-details.js';
import { renderSupervisorAnalytics } from './pages/supervisor/analytics.js';
import { renderDriverDashboard } from './pages/driver/dashboard.js';
import { renderDriverDeliveries } from './pages/driver/deliveries.js';
import { renderDriverRoute } from './pages/driver/route.js';
import { renderDriverScan } from './pages/driver/scan.js';

// ---- Register Routes ----
router
  .register('/', (el) => renderLanding(el))
  .register('/login', (el) => renderLogin(el))
  // Supervisor routes
  .register('/supervisor', (el) => renderSupervisorDashboard(el))
  .register('/supervisor/fleet', (el) => renderSupervisorFleet(el))
  .register('/supervisor/driver', (el) => renderSupervisorDriverDetails(el))
  .register('/supervisor/analytics', (el) => renderSupervisorAnalytics(el))
  // Driver routes
  .register('/driver', (el) => renderDriverDashboard(el))
  .register('/driver/deliveries', (el) => renderDriverDeliveries(el))
  .register('/driver/route', (el) => renderDriverRoute(el))
  .register('/driver/scan', (el) => renderDriverScan(el));

// ---- Route Guard ----
router.beforeEach((path) => {
  const auth = store.getState().auth;
  const publicPaths = ['/', '/login'];

  if (publicPaths.includes(path)) {
    // If already logged in and going to login, redirect to dashboard
    if (path === '/login' && auth.isAuthenticated) {
      return auth.role === 'supervisor' ? '/supervisor' : '/driver';
    }
    return true;
  }

  // Protected routes
  if (!auth.isAuthenticated) {
    return '/login';
  }

  // Role-based access
  if (path.startsWith('/supervisor') && auth.role !== 'supervisor') {
    return '/driver';
  }
  if (path.startsWith('/driver') && auth.role !== 'driver') {
    return '/supervisor';
  }

  return true;
});

// ---- Initialize ----
function init() {
  // Initialize toast listener
  initToastListener();

  // Start simulation
  startSimulation();

  // Start router
  router.start();

  console.log('%c🚛 TDS — Truck Delivery System', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
  console.log('%cDemo loaded. Navigate to #/login to get started.', 'color: #94a3b8;');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopSimulation();
});
