// ============================================
// TDS Supervisor - Deliveries Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { getStatusInfo, getPriorityInfo, formatTime, formatDate, formatHours, getWeatherIcon } from '../../utils/helpers.js';

export function renderSupervisorDeliveries(container) {
  const cleanups = [];

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="deliveries-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Delivery Management');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#deliveries-content');
  renderContent(content, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, cleanups) {
  const deliveries = store.getState().deliveries;
  const drivers = store.getState().drivers;

  // Tab counts
  const counts = {
    all: deliveries.length,
    active: deliveries.filter(d => ['in-progress', 'delayed', 'loading'].includes(d.status)).length,
    completed: deliveries.filter(d => d.status === 'completed').length,
    scheduled: deliveries.filter(d => d.status === 'scheduled').length,
  };

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Deliveries</h2>
        <p class="page-subtitle">${counts.all} total deliveries tracked</p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select class="select" id="filter-priority" style="width: auto;">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
        </select>
      </div>
    </div>

    <div class="tabs" id="delivery-tabs" style="margin-bottom: 24px;">
      <button class="tab active" data-tab="all">All (${counts.all})</button>
      <button class="tab" data-tab="active">Active (${counts.active})</button>
      <button class="tab" data-tab="completed">Completed (${counts.completed})</button>
      <button class="tab" data-tab="scheduled">Scheduled (${counts.scheduled})</button>
    </div>

    <div class="card" style="padding: 0;">
      <div class="table-container" style="border: none;">
        <table class="table" id="deliveries-table">
          <thead>
            <tr>
              <th>Delivery</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Est. Time</th>
              <th>Act. Time</th>
              <th>Weather</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody id="deliveries-tbody">
            ${renderDeliveryRows(deliveries, drivers, 'all', 'all')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  let currentTab = 'all';
  let currentPriority = 'all';

  // Tab handlers
  content.querySelector('#delivery-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    content.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    updateTable();
  });

  content.querySelector('#filter-priority')?.addEventListener('change', (e) => {
    currentPriority = e.target.value;
    updateTable();
  });

  function updateTable() {
    content.querySelector('#deliveries-tbody').innerHTML = renderDeliveryRows(
      store.getState().deliveries, store.getState().drivers, currentTab, currentPriority
    );
  }

  // Auto-update active deliveries
  const interval = setInterval(updateTable, 5000);
  cleanups.push(() => clearInterval(interval));
}

function renderDeliveryRows(deliveries, drivers, tab, priority) {
  let filtered = [...deliveries];

  if (tab === 'active') filtered = filtered.filter(d => ['in-progress', 'delayed', 'loading'].includes(d.status));
  else if (tab === 'completed') filtered = filtered.filter(d => d.status === 'completed');
  else if (tab === 'scheduled') filtered = filtered.filter(d => d.status === 'scheduled');

  if (priority !== 'all') filtered = filtered.filter(d => d.priority === priority);

  // Sort: active first, then by departure time
  filtered.sort((a, b) => {
    const order = { 'delayed': 0, 'in-progress': 1, 'loading': 2, 'scheduled': 3, 'completed': 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  return filtered.map(del => {
    const driver = drivers.find(d => d.id === del.driverId);
    const statusInfo = getStatusInfo(del.status);
    const priorityInfo = getPriorityInfo(del.priority);
    const isOnTime = del.actualTime ? del.actualTime <= del.estimatedTime * 1.1 : true;

    return `
      <tr style="${del.status === 'delayed' ? 'border-left: 3px solid var(--color-danger);' : del.status === 'completed' && isOnTime ? 'border-left: 3px solid var(--color-success);' : ''}">
        <td>
          <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary-light);">${del.id}</div>
          <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;" class="truncate" title="${del.package.description}">
            ${del.package.description}
          </div>
          <div style="font-size: 10px; color: var(--color-text-muted);">${del.package.weight.toLocaleString()} kg · ${del.package.units} units</div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="avatar avatar-sm" style="background: ${driver?.avatarColor || '#666'}; font-size: 10px; width: 24px; height: 24px;">${driver?.initials || '?'}</div>
            <span style="font-size: 13px;">${driver?.name || 'Unassigned'}</span>
          </div>
        </td>
        <td>
          <div style="font-size: 12px;">
            <div style="color: var(--color-text-muted);">${del.origin.name}</div>
            <div style="color: var(--color-text-muted); font-size: 10px;">↓ ${del.estimatedDistance} mi</div>
            <div style="color: var(--color-text-primary); font-weight: 500;">${del.destination.name}</div>
          </div>
        </td>
        <td><span class="badge badge-${priorityInfo.color}">${priorityInfo.icon} ${priorityInfo.label}</span></td>
        <td><span class="badge badge-dot badge-${statusInfo.color}">${statusInfo.label}</span></td>
        <td><span class="text-mono" style="font-size: 12px;">${formatHours(del.estimatedTime)}</span></td>
        <td>
          <span class="text-mono" style="font-size: 12px; color: ${del.actualTime ? (isOnTime ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-text-muted)'};">
            ${del.actualTime ? formatHours(del.actualTime) : del.status === 'completed' ? '--' : '...'}
          </span>
        </td>
        <td><span style="font-size: 14px;">${getWeatherIcon(del.weather)}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px; min-width: 100px;">
            <div class="progress-bar" style="flex: 1; height: 4px;">
              <div class="progress-bar-fill ${del.status === 'delayed' ? 'progress-bar-danger' : ''}" style="width: ${del.progress}%;"></div>
            </div>
            <span class="text-mono" style="font-size: 10px; color: var(--color-text-muted);">${Math.round(del.progress)}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="9"><div class="empty-state" style="padding: 32px;"><div class="empty-state-title">No deliveries found</div></div></td></tr>';
}
