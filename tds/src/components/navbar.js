// ============================================
// TDS Navbar Component (Enhanced)
// ============================================
import { store } from '../store.js';
import { router } from '../router.js';
import { icons } from './icons.js';
import { renderBreadcrumb } from './breadcrumb.js';
import { renderNotificationBell } from './notification-center.js';
import { toggle as toggleCommandPalette } from './command-palette.js';

export function renderNavbar(container, title = 'Dashboard') {
  const auth = store.getState().auth;
  const user = auth.user;
  const currentPath = window.location.hash.replace('#', '') || '/';

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="navbar-left">
      <button class="btn btn-ghost btn-icon sidebar-toggle-btn" id="sidebar-toggle" aria-label="Toggle sidebar" data-tooltip="Toggle sidebar">
        ${icons.menu(20)}
      </button>
      <div class="navbar-title-group">
        ${renderBreadcrumb(currentPath)}
        <h1 class="navbar-title">${title}</h1>
      </div>
    </div>
    <div class="navbar-right">
      <button class="btn btn-ghost btn-icon navbar-cmd-btn" id="cmd-palette-btn" aria-label="Command palette" data-tooltip="Search (Ctrl+K)">
        ${icons.search(18)}
      </button>
      <div id="notif-bell-mount"></div>
      <div class="navbar-separator"></div>
      <div class="navbar-user" id="user-menu-trigger">
        <div class="avatar avatar-sm" style="background: ${user?.avatarColor || 'var(--color-primary)'};">
          ${user?.initials || '??'}
        </div>
        <div class="navbar-user-info">
          <span class="navbar-user-name">${user?.name || 'User'}</span>
          <span class="navbar-user-role">${auth.role || ''}</span>
        </div>
      </div>
    </div>
  `;

  container.appendChild(nav);

  // Mount notification bell
  const bellMount = nav.querySelector('#notif-bell-mount');
  const bellCleanup = renderNotificationBell(bellMount);

  // Command palette trigger
  nav.querySelector('#cmd-palette-btn')?.addEventListener('click', () => {
    toggleCommandPalette();
  });

  // Sidebar toggle
  nav.querySelector('#sidebar-toggle')?.addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('open');
  });

  // Keyboard shortcut for sidebar
  const handleKeyboard = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      const sidebar = document.querySelector('.sidebar');
      sidebar?.classList.toggle('open');
    }
  };
  document.addEventListener('keydown', handleKeyboard);

  return () => {
    bellCleanup?.();
    document.removeEventListener('keydown', handleKeyboard);
  };
}
