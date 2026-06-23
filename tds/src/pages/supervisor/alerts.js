// ============================================
// TDS Supervisor - Alerts Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { showCallDialog, showToast } from '../../components/alerts.js';
import { getAlertSeverityInfo, getAlertTypeIcon, formatRelativeTime } from '../../utils/helpers.js';

export function renderSupervisorAlerts(container) {
  const cleanups = [];

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="alerts-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Alert Center');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#alerts-content');
  renderContent(content, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, cleanups) {
  const alerts = store.getActiveAlerts();
  const types = ['all', 'delay', 'fuel', 'rest', 'geofence'];
  const typeLabels = { all: 'All', delay: '⏱️ Delays', fuel: '⛽ Fuel', rest: '💤 Rest', geofence: '📍 Geofence' };

  // Counts by type
  const typeCounts = {};
  types.forEach(t => {
    typeCounts[t] = t === 'all' ? alerts.length : alerts.filter(a => a.type === t).length;
  });

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Alert Center</h2>
        <p class="page-subtitle">${store.getUnreadAlertCount()} unread alerts</p>
      </div>
      <button class="btn btn-ghost btn-sm" id="mark-all-read">✓ Mark All Read</button>
    </div>

    <div class="tabs" style="margin-bottom: 24px;" id="alert-type-tabs">
      ${types.map(t => `
        <button class="tab ${t === 'all' ? 'active' : ''}" data-type="${t}">
          ${typeLabels[t]} (${typeCounts[t]})
        </button>
      `).join('')}
    </div>

    <div id="alerts-list" class="stagger-children">
      ${renderAlertItems(alerts, 'all')}
    </div>
  `;

  let currentType = 'all';

  content.querySelector('#alert-type-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    content.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentType = tab.dataset.type;
    content.querySelector('#alerts-list').innerHTML = renderAlertItems(store.getActiveAlerts(), currentType);
    attachAlertHandlers(content);
  });

  content.querySelector('#mark-all-read')?.addEventListener('click', () => {
    store.getActiveAlerts().forEach(a => store.markAlertRead(a.id));
    showToast('info', 'All Read', 'All alerts marked as read.');
    content.querySelector('#alerts-list').innerHTML = renderAlertItems(store.getActiveAlerts(), currentType);
    attachAlertHandlers(content);
  });

  attachAlertHandlers(content);

  // Live updates
  const unsub = store.subscribe('alerts', () => {
    content.querySelector('#alerts-list').innerHTML = renderAlertItems(store.getActiveAlerts(), currentType);
    attachAlertHandlers(content);
  });
  cleanups.push(unsub);
}

function attachAlertHandlers(content) {
  content.querySelectorAll('.alert-call-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const driver = store.getDriver(btn.dataset.driverId);
      if (driver) showCallDialog(driver);
    });
  });

  content.querySelectorAll('.alert-dismiss-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      store.dismissAlert(btn.dataset.alertId);
      showToast('info', 'Dismissed', 'Alert dismissed.');
    });
  });
}

function renderAlertItems(alerts, type) {
  let filtered = type === 'all' ? alerts : alerts.filter(a => a.type === type);

  if (filtered.length === 0) {
    return '<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-title">No alerts</div><div class="empty-state-text">All caught up! No active alerts in this category.</div></div>';
  }

  return filtered.map(alert => {
    const severity = getAlertSeverityInfo(alert.severity);
    const driver = store.getDriver(alert.driverId);
    const isUnread = !alert.read;

    return `
      <div class="card" style="padding: 16px 20px; margin-bottom: 12px; ${isUnread ? 'border-left: 3px solid var(--color-primary);' : ''} ${alert.severity === 'critical' ? 'border-color: var(--color-danger);' : ''}">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <div style="font-size: 24px; flex-shrink: 0; margin-top: 2px;">${getAlertTypeIcon(alert.type)}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <h4 style="font-size: 14px; font-weight: 600;">${alert.title}</h4>
              <span class="badge badge-${severity.color}" style="font-size: 9px;">${severity.label}</span>
              ${isUnread ? '<span class="badge badge-primary" style="font-size: 9px;">New</span>' : ''}
            </div>
            <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 8px;">
              ${alert.message}
            </p>
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 11px; color: var(--color-text-muted);">${formatRelativeTime(alert.timestamp)}</span>
              ${driver ? `<span style="font-size: 11px; color: var(--color-text-muted);">Driver: ${driver.name}</span>` : ''}
              ${alert.deliveryId ? `<span style="font-size: 11px; color: var(--color-text-muted);">Delivery: ${alert.deliveryId}</span>` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            ${driver ? `<button class="btn btn-outline btn-sm alert-call-btn" data-driver-id="${driver.id}">📞 Call</button>` : ''}
            <button class="btn btn-ghost btn-sm alert-dismiss-btn" data-alert-id="${alert.id}">Dismiss</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
