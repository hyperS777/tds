// ============================================
// TDS Main Entry Point (Enhanced)
// ============================================
import './styles/design-system.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/enhancements.css';

import { router } from './router.js';
import { store } from './store.js';
import { startSimulation, stopSimulation } from './data/simulation.js';
import { initToastListener } from './components/alerts.js';
import { initCommandPalette } from './components/command-palette.js';

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
import { renderSettings } from './pages/settings.js';
import { renderMessages } from './pages/messages.js';

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
  .register('/driver/scan', (el) => renderDriverScan(el))
  // Shared routes
  .register('/settings', (el) => renderSettings(el))
  .register('/messages', (el) => renderMessages(el));

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

  // Shared routes accessible by both roles
  if (path === '/settings' || path === '/messages') {
    return true;
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
async function init() {
  // Apply saved theme
  const savedTheme = localStorage.getItem('tds-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  store.getState().ui.theme = savedTheme;

  // Initialize database and load data
  await store.init();

  // Initialize toast listener
  initToastListener();

  // Initialize command palette
  initCommandPalette();

  // Start simulation
  startSimulation();

  // Start router
  router.start();

  console.log('%c🚛 TDS — Truck Delivery System', 'color: #3d8c83; font-size: 16px; font-weight: bold;');
  console.log('%cEnhanced Edition — v2.0.0 (with Database)', 'color: #52a69d; font-size: 12px;');
  console.log('%cData persists across page reloads via IndexedDB.', 'color: #a19f9d;');
  console.log('%cTip: Press Ctrl+K to open the command palette!', 'color: #a19f9d;');
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
