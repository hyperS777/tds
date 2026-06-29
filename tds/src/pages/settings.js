// ============================================
// TDS Settings Page
// ============================================
import { store } from '../store.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';
import { icons } from '../components/icons.js';
import { showToast } from '../components/alerts.js';
import { showConfirmDialog } from '../components/modal.js';

export function renderSettings(container) {
  const cleanups = [];
  const auth = store.getState().auth;
  const user = auth.user;

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="settings-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Settings');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#settings-content');
  renderContent(content, auth);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, auth) {
  const user = auth.user;
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const role = auth.role;

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">${icons.settings(24)} Settings</h2>
        <p class="page-subtitle">Manage your profile and preferences</p>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Profile Section -->
      <div class="card settings-section">
        <div class="settings-section-header">
          ${icons.user(20)}
          <h3>Profile</h3>
        </div>
        <div class="settings-profile">
          <div class="settings-avatar-wrap">
            <div class="avatar avatar-xl" style="background: ${user?.avatarColor || '#3b82f6'}; font-size: 24px;">
              ${user?.initials || 'U'}
            </div>
            <button class="settings-avatar-edit" data-tooltip="Change avatar">${icons.camera(14)}</button>
          </div>
          <div class="settings-profile-info">
            <div class="input-group">
              <label class="input-label">Full Name</label>
              <input type="text" class="input" id="settings-name" value="${user?.name || ''}" />
            </div>
            <div class="input-group">
              <label class="input-label">Email</label>
              <input type="email" class="input" id="settings-email" value="${user?.email || ''}" readonly />
            </div>
            ${role === 'driver' ? `
              <div class="input-group">
                <label class="input-label">Phone</label>
                <input type="text" class="input" id="settings-phone" value="${store.getDriver(user?.id)?.phone || ''}" />
              </div>
            ` : ''}
          </div>
        </div>
        <div class="settings-actions">
          <button class="btn btn-primary btn-sm" id="save-profile-btn">${icons.check(16)} Save Changes</button>
        </div>
      </div>

      <!-- Appearance Section -->
      <div class="card settings-section">
        <div class="settings-section-header">
          ${currentTheme === 'dark' ? icons.moon(20) : icons.sun(20)}
          <h3>Appearance</h3>
        </div>
        <div class="settings-option">
          <div class="settings-option-info">
            <div class="settings-option-label">Theme</div>
            <div class="settings-option-desc">Choose your preferred color scheme</div>
          </div>
          <div class="theme-switcher" id="theme-switcher">
            <button class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
              ${icons.moon(16)}
              <span>Dark</span>
            </button>
            <button class="theme-option ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
              ${icons.sun(16)}
              <span>Light</span>
            </button>
          </div>
        </div>
        <div class="settings-option">
          <div class="settings-option-info">
            <div class="settings-option-label">Sidebar</div>
            <div class="settings-option-desc">Toggle sidebar collapse state</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="sidebar-toggle" ${store.getState().ui.sidebarOpen ? 'checked' : ''} />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Notifications Section -->
      <div class="card settings-section">
        <div class="settings-section-header">
          ${icons.bell(20)}
          <h3>Notifications</h3>
        </div>
        <div class="settings-option">
          <div class="settings-option-info">
            <div class="settings-option-label">Toast Notifications</div>
            <div class="settings-option-desc">Show popup notifications for alerts and updates</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="notif-toast" checked />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-option">
          <div class="settings-option-info">
            <div class="settings-option-label">Sound Alerts</div>
            <div class="settings-option-desc">Play sound for critical notifications</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="notif-sound" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-option">
          <div class="settings-option-info">
            <div class="settings-option-label">Auto-dismiss Duration</div>
            <div class="settings-option-desc">How long toasts stay visible</div>
          </div>
          <select class="select" id="notif-duration" style="width: auto;">
            <option value="3000">3 seconds</option>
            <option value="5000" selected>5 seconds</option>
            <option value="8000">8 seconds</option>
            <option value="0">Don't auto-dismiss</option>
          </select>
        </div>
      </div>

      <!-- Keyboard Shortcuts -->
      <div class="card settings-section">
        <div class="settings-section-header">
          ${icons.command(20)}
          <h3>Keyboard Shortcuts</h3>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <span class="shortcut-label">Command Palette</span>
            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd></span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-label">Toggle Sidebar</span>
            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>B</kbd></span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-label">Close Modal / Panel</span>
            <span class="shortcut-keys"><kbd>Esc</kbd></span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-label">Navigate Table</span>
            <span class="shortcut-keys"><kbd>↑</kbd> <kbd>↓</kbd></span>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="card settings-section settings-about">
        <div class="settings-section-header">
          ${icons.info(20)}
          <h3>About TDS</h3>
        </div>
        <div class="settings-about-content">
          <div class="settings-about-row">
            <span>Version</span>
            <span class="text-mono">2.0.0</span>
          </div>
          <div class="settings-about-row">
            <span>Role</span>
            <span class="badge badge-primary" style="text-transform: capitalize;">${role}</span>
          </div>
          <div class="settings-about-row">
            <span>Session Started</span>
            <span class="text-mono">${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="settings-about-row">
            <span>Last Sync</span>
            <span style="display: flex; align-items: center; gap: 6px; color: var(--color-success);">
              ${icons.checkCircle(14)} Just now
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div class="card settings-section" style="margin-top: 24px;">
      <div class="settings-section-header">
        ${icons.command(20)}
        <h3>Data Management</h3>
      </div>
      <div class="settings-option">
        <div class="settings-option-info">
          <div class="settings-option-label">Database Storage</div>
          <div class="settings-option-desc">All fleet data is stored locally in IndexedDB and persists across page reloads</div>
        </div>
        <span class="badge badge-success" style="white-space: nowrap;">● Active</span>
      </div>
      <div class="settings-option">
        <div class="settings-option-info">
          <div class="settings-option-label">Reset to Defaults</div>
          <div class="settings-option-desc">Clear all custom data and restore original demo data. This cannot be undone.</div>
        </div>
        <button class="btn btn-outline btn-sm" id="reset-data-btn" style="border-color: var(--color-warning); color: var(--color-warning);">
          🔄 Reset Data
        </button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card settings-section settings-danger" style="margin-top: 24px;">
      <div class="settings-section-header" style="color: var(--color-danger);">
        ${icons.alert(20)}
        <h3>Session</h3>
      </div>
      <div class="settings-option">
        <div class="settings-option-info">
          <div class="settings-option-label">Sign Out</div>
          <div class="settings-option-desc">End your current session and return to the login screen</div>
        </div>
        <button class="btn btn-outline btn-sm" id="logout-btn" style="border-color: var(--color-danger); color: var(--color-danger);">
          ${icons.logout(16)} Sign Out
        </button>
      </div>
    </div>
  `;

  // Theme switcher
  content.querySelector('#theme-switcher')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-option');
    if (!btn) return;
    const theme = btn.dataset.theme;
    document.documentElement.setAttribute('data-theme', theme);
    store.getState().ui.theme = theme;
    localStorage.setItem('tds-theme', theme);
    content.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showToast('success', 'Theme Updated', `Switched to ${theme} mode`);
  });

  // Save profile
  content.querySelector('#save-profile-btn')?.addEventListener('click', () => {
    const name = content.querySelector('#settings-name')?.value;
    if (name && auth.user) {
      auth.user.name = name;
      showToast('success', 'Profile Saved', 'Your changes have been saved.');
    }
  });

  // Sidebar toggle
  content.querySelector('#sidebar-toggle')?.addEventListener('change', (e) => {
    if (!e.target.checked) {
      store.toggleSidebar();
    } else if (!store.getState().ui.sidebarOpen) {
      store.toggleSidebar();
    }
  });

  // Reset data
  content.querySelector('#reset-data-btn')?.addEventListener('click', () => {
    showConfirmDialog({
      title: 'Reset All Data',
      message: 'This will <strong>permanently delete</strong> all custom drivers, trucks, and changes you\'ve made. The original demo data will be restored. Are you sure?',
      confirmLabel: 'Reset Everything',
      danger: true,
      onConfirm: async () => {
        await store.resetToDefaults();
        showToast('success', 'Data Reset', 'All data has been restored to defaults.');
      }
    });
  });

  // Logout
  content.querySelector('#logout-btn')?.addEventListener('click', () => {
    store.logout();
    import('../router.js').then(({ router }) => router.navigate('/login'));
  });
}
