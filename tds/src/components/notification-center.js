// ============================================
// TDS Notification Center (Bell Dropdown)
// ============================================
import { store } from '../store.js';
import { icons } from './icons.js';
import { formatRelativeTime, getAlertTypeIcon } from '../utils/helpers.js';

let isOpen = false;
let panelEl = null;

const SEVERITY_COLORS = {
  critical: 'var(--color-danger)',
  high: 'var(--color-warning)',
  medium: 'var(--color-info)',
  low: 'var(--color-text-muted)'
};

const SEVERITY_BG = {
  critical: 'var(--color-danger-glow)',
  high: 'var(--color-warning-glow)',
  medium: 'rgba(124, 109, 181, 0.15)',
  low: 'rgba(255,255,255,0.05)'
};

function getTypeIcon(type) {
  switch (type) {
    case 'delay': return icons.clock(16);
    case 'fuel': return icons.fuel(16);
    case 'rest': return icons.timer(16);
    case 'geofence': return icons.mapPin(16);
    case 'success': return icons.checkCircle(16);
    default: return icons.bell(16);
  }
}

export function renderNotificationBell(container) {
  const count = store.getUnreadAlertCount();

  const bellWrap = document.createElement('div');
  bellWrap.className = 'notif-bell-wrap';
  bellWrap.id = 'notif-bell-wrap';
  bellWrap.innerHTML = `
    <button class="notif-bell-btn" id="notif-bell-btn" aria-label="Notifications" data-tooltip="Notifications">
      ${count > 0 ? icons.bellRing(20) : icons.bell(20)}
      ${count > 0 ? `<span class="notif-bell-badge">${count > 9 ? '9+' : count}</span>` : ''}
    </button>
  `;
  container.appendChild(bellWrap);

  const btn = bellWrap.querySelector('#notif-bell-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel(bellWrap);
  });

  // Close when clicking outside
  const closeOnOutsideClick = (e) => {
    if (isOpen && panelEl && !bellWrap.contains(e.target)) {
      closePanel();
    }
  };
  document.addEventListener('click', closeOnOutsideClick);

  // Subscribe to alert changes
  const unsub = store.subscribe('alerts', () => {
    const newCount = store.getUnreadAlertCount();
    const badge = bellWrap.querySelector('.notif-bell-badge');
    const bellIcon = bellWrap.querySelector('#notif-bell-btn');
    if (newCount > 0) {
      bellIcon.innerHTML = `${icons.bellRing(20)}<span class="notif-bell-badge">${newCount > 9 ? '9+' : newCount}</span>`;
    } else {
      bellIcon.innerHTML = icons.bell(20);
    }
    // Update panel if open
    if (isOpen && panelEl) {
      renderPanelContent();
    }
  });

  return () => {
    document.removeEventListener('click', closeOnOutsideClick);
    unsub();
  };
}

function togglePanel(anchorEl) {
  if (isOpen) {
    closePanel();
  } else {
    openPanel(anchorEl);
  }
}

function openPanel(anchorEl) {
  isOpen = true;

  if (!panelEl) {
    panelEl = document.createElement('div');
    panelEl.className = 'notif-panel';
    panelEl.id = 'notif-panel';
    anchorEl.appendChild(panelEl);
  }

  renderPanelContent();
  panelEl.classList.add('active');
}

function closePanel() {
  isOpen = false;
  if (panelEl) {
    panelEl.classList.remove('active');
  }
}

function renderPanelContent() {
  if (!panelEl) return;

  const alerts = store.getActiveAlerts();
  const unreadCount = store.getUnreadAlertCount();

  panelEl.innerHTML = `
    <div class="notif-panel-header">
      <div class="notif-panel-title">
        <span>Notifications</span>
        ${unreadCount > 0 ? `<span class="notif-panel-count">${unreadCount}</span>` : ''}
      </div>
      ${unreadCount > 0 ? `<button class="btn btn-ghost btn-sm notif-mark-all" id="notif-mark-all">Mark all read</button>` : ''}
    </div>
    <div class="notif-panel-list" id="notif-panel-list">
      ${alerts.length === 0 ? `
        <div class="notif-panel-empty">
          ${icons.bell(28)}
          <p>All caught up!</p>
          <span>No active notifications</span>
        </div>
      ` : alerts.slice(0, 15).map(alert => {
        const driver = store.getState().drivers.find(d => d.id === alert.driverId);
        return `
          <div class="notif-item ${alert.read ? '' : 'unread'}" data-alert-id="${alert.id}">
            <div class="notif-item-icon" style="background: ${SEVERITY_BG[alert.severity]}; color: ${SEVERITY_COLORS[alert.severity]};">
              ${getTypeIcon(alert.type)}
            </div>
            <div class="notif-item-content">
              <div class="notif-item-title">${alert.title}</div>
              <div class="notif-item-message">${alert.message.substring(0, 100)}${alert.message.length > 100 ? '…' : ''}</div>
              <div class="notif-item-meta">
                ${driver ? `<span class="notif-item-driver">${driver.name}</span>` : ''}
                <span class="notif-item-time">${formatRelativeTime(alert.timestamp)}</span>
              </div>
            </div>
            <div class="notif-item-actions">
              <button class="notif-dismiss-btn" data-dismiss="${alert.id}" data-tooltip="Dismiss">${icons.x(14)}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach event handlers
  panelEl.querySelector('#notif-mark-all')?.addEventListener('click', () => {
    alerts.filter(a => !a.read).forEach(a => store.markAlertRead(a.id));
  });

  panelEl.querySelectorAll('.notif-item').forEach(el => {
    // Mark as read on click
    el.addEventListener('click', () => {
      const alertId = el.dataset.alertId;
      store.markAlertRead(alertId);
      el.classList.remove('unread');
    });
  });

  panelEl.querySelectorAll('.notif-dismiss-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const alertId = btn.dataset.dismiss;
      store.dismissAlert(alertId);
    });
  });
}
