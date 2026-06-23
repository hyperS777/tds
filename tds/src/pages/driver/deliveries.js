// ============================================
// TDS Driver - Deliveries Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { getStatusInfo, getPriorityInfo, formatHours, formatDate, formatTime, getWeatherIcon } from '../../utils/helpers.js';

export function renderDriverDeliveries(container) {
  const cleanups = [];
  const auth = store.getState().auth;
  const driverId = auth.user?.id;

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="del-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'My Deliveries');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#del-content');
  renderContent(content, driverId);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, driverId) {
  const deliveries = store.getDriverDeliveries(driverId);

  const active = deliveries.filter(d => ['in-progress', 'delayed', 'loading'].includes(d.status));
  const scheduled = deliveries.filter(d => d.status === 'scheduled');
  const completed = deliveries.filter(d => d.status === 'completed');

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">My Deliveries</h2>
        <p class="page-subtitle">${deliveries.length} total deliveries</p>
      </div>
    </div>

    <div class="tabs" id="del-tabs" style="margin-bottom: 24px;">
      <button class="tab active" data-tab="active">Active (${active.length})</button>
      <button class="tab" data-tab="scheduled">Scheduled (${scheduled.length})</button>
      <button class="tab" data-tab="completed">History (${completed.length})</button>
    </div>

    <div id="del-list" class="stagger-children">
      ${renderDeliveryCards(active, 'active')}
    </div>
  `;

  let currentTab = 'active';

  content.querySelector('#del-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    content.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;

    const list = currentTab === 'active' ? active : currentTab === 'scheduled' ? scheduled : completed;
    content.querySelector('#del-list').innerHTML = renderDeliveryCards(list, currentTab);
  });
}

function renderDeliveryCards(deliveries, type) {
  if (deliveries.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${type === 'completed' ? '✅' : '📦'}</div>
        <div class="empty-state-title">No ${type} deliveries</div>
        <div class="empty-state-text">${type === 'completed' ? 'Your completed deliveries will appear here.' : 'No deliveries in this category right now.'}</div>
      </div>
    `;
  }

  return deliveries.map(del => {
    const statusInfo = getStatusInfo(del.status);
    const priorityInfo = getPriorityInfo(del.priority);
    const isOnTime = del.actualTime ? del.actualTime <= del.estimatedTime * 1.1 : true;

    return `
      <div class="card card-hover" style="padding: 20px; margin-bottom: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <div style="font-size: 28px; padding-top: 4px;">${statusInfo.icon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <span class="text-mono" style="font-size: 13px; font-weight: 700; color: var(--color-primary-light);">${del.id}</span>
              <span class="badge badge-dot badge-${statusInfo.color}">${statusInfo.label}</span>
              <span class="badge badge-${priorityInfo.color}">${priorityInfo.label}</span>
              ${del.status === 'completed' ? `
                <span class="badge badge-${isOnTime ? 'success' : 'danger'}">${isOnTime ? '✓ On Time' : '✗ Delayed'}</span>
              ` : ''}
            </div>

            <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${del.destination.name}</h4>
            <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 12px;">
              ${del.package.description} · ${del.package.weight.toLocaleString()} kg · ${del.package.units} units
            </p>

            <div style="display: flex; gap: 24px; flex-wrap: wrap; font-size: 12px;">
              <div>
                <span style="color: var(--color-text-muted);">From: </span>
                <span style="color: var(--color-text-secondary);">${del.origin.name}</span>
              </div>
              <div>
                <span style="color: var(--color-text-muted);">Distance: </span>
                <span class="text-mono" style="font-weight: 600;">${del.estimatedDistance} km</span>
              </div>
              <div>
                <span style="color: var(--color-text-muted);">Est. Time: </span>
                <span class="text-mono" style="font-weight: 600;">${formatHours(del.estimatedTime)}</span>
              </div>
              ${del.actualTime ? `
                <div>
                  <span style="color: var(--color-text-muted);">Actual: </span>
                  <span class="text-mono" style="font-weight: 600; color: ${isOnTime ? 'var(--color-success)' : 'var(--color-danger)'};">${formatHours(del.actualTime)}</span>
                </div>
              ` : ''}
              <div>
                <span style="font-size: 14px;">${getWeatherIcon(del.weather)}</span>
              </div>
            </div>

            ${del.status !== 'completed' && del.status !== 'scheduled' ? `
              <div style="margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-size: 11px; color: var(--color-text-muted);">Progress</span>
                  <span class="text-mono" style="font-size: 11px;">${Math.round(del.progress)}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${del.progress}%;"></div>
                </div>
              </div>
            ` : ''}

            ${del.status === 'completed' ? `
              <div style="margin-top: 8px; font-size: 11px; color: var(--color-text-muted);">
                Completed: ${formatDate(del.completedTime)} at ${formatTime(del.completedTime)}
                ${del.receiptScanned ? ' · ✅ Receipt verified' : ''}
              </div>
            ` : ''}
          </div>

          ${del.status === 'in-progress' || del.status === 'delayed' ? `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <a href="#/driver/route" class="btn btn-outline btn-sm">🗺️ Route</a>
              <a href="#/driver/scan" class="btn btn-success btn-sm">📷 Scan</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}
