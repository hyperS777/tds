// ============================================
// TDS Messages Page
// ============================================
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderMessagesPage } from '../components/messaging.js';

export function renderMessages(container) {
  const cleanups = [];

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="messages-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Messages');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#messages-content');
  renderMessagesPage(content);

  return () => cleanups.forEach(fn => fn());
}
