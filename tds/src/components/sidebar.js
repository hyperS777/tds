// ============================================
// TDS Sidebar Component (Enhanced)
// ============================================
import { store } from '../store.js';
import { router } from '../router.js';
import { logoSVG } from './logo.js';
import { icons } from './icons.js';
import { getTotalUnread } from './messaging.js';

const supervisorLinks = [
  { path: '/supervisor', icon: () => icons.dashboard(18), label: 'Dashboard' },
  { path: '/supervisor/fleet', icon: () => icons.fleet(18), label: 'Fleet' },
  { path: '/supervisor/analytics', icon: () => icons.analytics(18), label: 'Analytics' },
  { path: '/messages', icon: () => icons.messages(18), label: 'Messages', badgeKey: 'messages' },
];

const driverLinks = [
  { path: '/driver', icon: () => icons.dashboard(18), label: 'Dashboard' },
  { path: '/driver/deliveries', icon: () => icons.deliveries(18), label: 'My Deliveries' },
  { path: '/driver/route', icon: () => icons.route(18), label: 'Active Route' },
  { path: '/driver/scan', icon: () => icons.camera(18), label: 'Scan Receipt' },
];

const bottomLinks = [
  { path: '/settings', icon: () => icons.settings(18), label: 'Settings' },
];

export function renderSidebar(container) {
  const auth = store.getState().auth;
  const links = auth.role === 'supervisor' ? supervisorLinks : driverLinks;
  const currentPath = window.location.hash.replace('#', '') || '/';
  const stats = store.getStats();
  const msgCount = getTotalUnread();

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <a href="#/" class="sidebar-logo" style="text-decoration: none;" aria-label="Go to home">
        <div class="sidebar-logo-icon">${logoSVG(18)}</div>
        <span>TDS</span>
      </a>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">${auth.role === 'supervisor' ? 'Command Center' : 'Driver Portal'}</div>
      ${links.map(link => {
        const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path + '/'));
        let badge = null;
        if (link.badgeKey === 'messages') badge = msgCount > 0 ? msgCount : null;
        return `
          <a class="sidebar-link ${isActive ? 'active' : ''}" data-path="${link.path}" href="#${link.path}">
            <span class="sidebar-link-icon">${link.icon()}</span>
            <span>${link.label}</span>
            ${badge ? `<span class="sidebar-link-badge">${badge}</span>` : ''}
          </a>
        `;
      }).join('')}

      <div class="sidebar-section-label" style="margin-top: var(--space-4);">Quick Info</div>
      <div class="sidebar-quick-stats">
        <div class="sidebar-quick-stat">
          <span class="sidebar-quick-stat-label">Active Drivers</span>
          <span class="sidebar-quick-stat-value">${stats.activeDrivers}/${stats.totalDrivers}</span>
        </div>
        <div class="sidebar-quick-stat">
          <span class="sidebar-quick-stat-label">On-Time Rate</span>
          <span class="sidebar-quick-stat-value" style="color: var(--color-success);">${stats.onTimeRate}%</span>
        </div>
        <div class="sidebar-quick-stat">
          <span class="sidebar-quick-stat-label">Avg Fuel</span>
          <span class="sidebar-quick-stat-value">${stats.avgFuelLevel}%</span>
        </div>
      </div>

      <div class="sidebar-bottom-links">
        ${bottomLinks.map(link => {
          const isActive = currentPath === link.path;
          return `
            <a class="sidebar-link ${isActive ? 'active' : ''}" data-path="${link.path}" href="#${link.path}">
              <span class="sidebar-link-icon">${link.icon()}</span>
              <span>${link.label}</span>
            </a>
          `;
        }).join('')}
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="avatar avatar-sm" style="background: ${auth.user?.avatarColor || 'var(--color-primary)'};">
          ${auth.user?.initials || '??'}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${auth.user?.name || 'User'}</div>
          <div class="sidebar-user-role">${auth.role || ''}</div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm sidebar-logout-btn" id="sidebar-logout" data-tooltip="Sign out">
          ${icons.logout(16)}
        </button>
      </div>
    </div>
  `;

  container.appendChild(sidebar);

  // Click handlers for links
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.dataset.path;
      router.navigate(path);
    });
  });

  // Logout button
  sidebar.querySelector('#sidebar-logout')?.addEventListener('click', () => {
    store.logout();
    router.navigate('/login');
  });

  return sidebar;
}
