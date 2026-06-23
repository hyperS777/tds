// ============================================
// TDS Driver - Scan Receipt Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { renderReceiptScanner } from '../../components/receipt-scanner.js';

export function renderDriverScan(container) {
  const cleanups = [];
  const auth = store.getState().auth;
  const driverId = auth.user?.id;

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="scan-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Scan Receipt');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#scan-content');
  renderReceiptScanner(content, driverId);

  return () => cleanups.forEach(fn => fn());
}
