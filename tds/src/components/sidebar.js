// ============================================
// TDS Sidebar Component
// ============================================
import { store } from '../store.js';
import { router } from '../router.js';

const supervisorLinks = [
  { path: '/supervisor', icon: '📊', label: 'Dashboard' },
  { path: '/supervisor/fleet', icon: '🚛', label: 'Fleet' },
  { path: '/supervisor/analytics', icon: '📈', label: 'Analytics' },
];

const driverLinks = [
  { path: '/driver', icon: '🏠', label: 'Dashboard' },
  { path: '/driver/deliveries', icon: '📦', label: 'My Deliveries' },
  { path: '/driver/route', icon: '🗺️', label: 'Active Route' },
  { path: '/driver/scan', icon: '📷', label: 'Scan Receipt' },
];

export function renderSidebar(container) {
  const auth = store.getState().auth;
  const links = auth.role === 'supervisor' ? supervisorLinks : driverLinks;
  const currentPath = window.location.hash.replace('#', '') || '/';
  const stats = store.getStats();

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">🚛</div>
        <span>TDS</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">${auth.role === 'supervisor' ? 'Command Center' : 'Driver Portal'}</div>
      ${links.map(link => {
        const isActive = currentPath === link.path;
        const badge = link.badgeKey ? stats[link.badgeKey] : null;
        return `
          <a class="sidebar-link ${isActive ? 'active' : ''}" data-path="${link.path}" href="#${link.path}">
            <span class="sidebar-link-icon">${link.icon}</span>
            <span>${link.label}</span>
            ${badge ? `<span class="sidebar-link-badge">${badge}</span>` : ''}
          </a>
        `;
      }).join('')}
      <div class="sidebar-section-label" style="margin-top: var(--space-4);">Quick Info</div>
      <div style="padding: 8px 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 11px; color: var(--color-text-muted);">Active Drivers</span>
          <span style="font-size: 11px; font-weight: 600; font-family: var(--font-mono);">${stats.activeDrivers}/${stats.totalDrivers}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 11px; color: var(--color-text-muted);">On-Time Rate</span>
          <span style="font-size: 11px; font-weight: 600; font-family: var(--font-mono); color: var(--color-success);">${stats.onTimeRate}%</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 11px; color: var(--color-text-muted);">Avg Fuel</span>
          <span style="font-size: 11px; font-weight: 600; font-family: var(--font-mono);">${stats.avgFuelLevel}%</span>
        </div>
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

  return sidebar;
}
