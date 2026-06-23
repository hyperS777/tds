// ============================================
// TDS Navbar Component
// ============================================
import { store } from '../store.js';
import { router } from '../router.js';
import { formatRelativeTime, getAlertTypeIcon } from '../utils/helpers.js';

export function renderNavbar(container, title = 'Dashboard') {
  const auth = store.getState().auth;
  const user = auth.user;
  const unreadCount = store.getUnreadAlertCount();

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="navbar-left">
      <button class="btn btn-ghost btn-icon sidebar-toggle-btn" id="sidebar-toggle" aria-label="Toggle sidebar">☰</button>
      <h1 class="navbar-title">${title}</h1>
    </div>
    <div class="navbar-right">
      <div class="dropdown" id="notifications-dropdown">
        <button class="btn btn-ghost btn-icon navbar-notification-btn" id="notification-bell" aria-label="Notifications">
          🔔
          ${unreadCount > 0 ? `<span class="navbar-notification-count">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
        </button>
        <div class="dropdown-menu" id="notifications-menu" style="min-width: 340px; max-height: 400px; overflow-y: auto;">
          <div style="padding: 8px 12px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 13px;">Notifications</span>
            <span style="font-size: 11px; color: var(--color-text-muted);">${unreadCount} unread</span>
          </div>
          ${renderNotificationItems()}
        </div>
      </div>
      <div style="width: 1px; height: 24px; background: var(--color-border); margin: 0 4px;"></div>
      <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" id="user-menu-trigger">
        <div class="avatar avatar-sm" style="background: ${user?.avatarColor || 'var(--color-primary)'};">
          ${user?.initials || '??'}
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 13px; font-weight: 600;">${user?.name || 'User'}</span>
          <span style="font-size: 11px; color: var(--color-text-muted); text-transform: capitalize;">${auth.role || ''}</span>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" id="logout-btn" style="color: var(--color-text-muted); font-size: 12px;">
        ↗ Logout
      </button>
    </div>
  `;

  container.appendChild(nav);

  // Event listeners
  const bellBtn = nav.querySelector('#notification-bell');
  const notifMenu = nav.querySelector('#notifications-menu');
  bellBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifMenu.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    notifMenu?.classList.remove('open');
  });

  nav.querySelector('#sidebar-toggle')?.addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('open');
  });

  nav.querySelector('#logout-btn')?.addEventListener('click', () => {
    store.logout();
    router.navigate('/login');
  });

  // Subscribe to alert changes
  const unsub = store.subscribe('alerts', () => {
    const count = store.getUnreadAlertCount();
    const badge = nav.querySelector('.navbar-notification-count');
    if (badge) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  });

  return unsub;
}

function renderNotificationItems() {
  const alerts = store.getState().alerts.filter(a => !a.dismissed).slice(0, 8);
  if (alerts.length === 0) {
    return '<div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 13px;">No notifications</div>';
  }

  return alerts.map(alert => `
    <div class="dropdown-item" style="align-items: flex-start; padding: 10px 12px; ${!alert.read ? 'background: rgba(59,130,246,0.05);' : ''}" data-alert-id="${alert.id}">
      <span style="font-size: 16px;">${getAlertTypeIcon(alert.type)}</span>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 12px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px;">${alert.title}</div>
        <div style="font-size: 11px; color: var(--color-text-muted); line-height: 1.4;" class="truncate">${alert.message}</div>
        <div style="font-size: 10px; color: var(--color-text-muted); margin-top: 4px;">${formatRelativeTime(alert.timestamp)}</div>
      </div>
    </div>
  `).join('');
}
