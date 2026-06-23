// ============================================
// TDS Supervisor - Fleet Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { showCallDialog } from '../../components/alerts.js';
import { getStatusInfo, getFuelColor, getRestStatus, getPriorityInfo, formatTime, formatDate, formatHours, getWeatherIcon } from '../../utils/helpers.js';
import { router } from '../../router.js';

export function renderSupervisorFleet(container) {
  const cleanups = [];

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="fleet-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Fleet Management');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#fleet-content');
  renderContent(content, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, cleanups) {
  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Fleet Management</h2>
        <p class="page-subtitle">Manage all drivers and deliveries in one place</p>
      </div>
    </div>

    <div class="tabs" id="fleet-tabs" style="margin-bottom: 24px;">
      <button class="tab active" data-tab="drivers">Drivers</button>
      <button class="tab" data-tab="deliveries">Deliveries</button>
    </div>

    <div id="fleet-tab-content"></div>
  `;

  let currentTab = 'drivers';

  const renderTab = () => {
    const tabContent = content.querySelector('#fleet-tab-content');
    if (currentTab === 'drivers') {
      renderDriversTab(tabContent);
    } else {
      renderDeliveriesTab(tabContent, cleanups);
    }
  };

  content.querySelector('#fleet-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    content.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    renderTab();
  });

  renderTab();
}

function renderDriversTab(container) {
  const drivers = store.getState().drivers;
  const trucks = store.getState().trucks;
  const deliveries = store.getState().deliveries;

  container.innerHTML = `
    <div style="display: flex; gap: 8px; margin-bottom: 16px; justify-content: flex-end;">
      <select class="select" id="filter-status" style="width: auto;">
        <option value="all">All Status</option>
        <option value="driving">On Route</option>
        <option value="resting">Resting</option>
        <option value="idle">Off Duty</option>
      </select>
      <div class="input-icon-wrapper">
        <span class="input-icon">🔍</span>
        <input type="text" class="input" id="search-drivers" placeholder="Search drivers..." style="width: 200px;" />
      </div>
    </div>
    <div class="drivers-grid stagger-children" id="drivers-grid">
      ${renderDriverCards(drivers, trucks, deliveries)}
    </div>
  `;

  const filterSelect = container.querySelector('#filter-status');
  const searchInput = container.querySelector('#search-drivers');

  const applyFilters = () => {
    const status = filterSelect.value;
    const search = searchInput.value.toLowerCase();
    let filtered = store.getState().drivers;

    if (status !== 'all') filtered = filtered.filter(d => d.status === status);
    if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes(search));

    container.querySelector('#drivers-grid').innerHTML = renderDriverCards(
      filtered, store.getState().trucks, store.getState().deliveries
    );
    attachDriverCardHandlers(container);
  };

  filterSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  attachDriverCardHandlers(container);
}

function attachDriverCardHandlers(container) {
  container.querySelectorAll('.driver-card').forEach(card => {
    // Navigate to driver details on card click
    card.addEventListener('click', () => {
      router.navigate('/supervisor/driver/' + card.dataset.driverId);
    });

    // Call button
    card.querySelector('.call-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const driver = store.getDriver(card.dataset.driverId);
      if (driver) showCallDialog(driver);
    });
  });
}

function renderDriverCards(drivers, trucks, deliveries) {
  return drivers.map(driver => {
    const statusInfo = getStatusInfo(driver.status);
    const truck = trucks.find(t => t.id === driver.truckId);
    const fuelPct = truck ? Math.round((truck.currentFuel / truck.fuelTank) * 100) : 0;
    const activeDelivery = deliveries.find(d => d.driverId === driver.id && ['in-progress', 'delayed', 'loading'].includes(d.status));
    const restStatus = getRestStatus(driver.drivingTime, driver.lastRest);

    return `
      <div class="card card-hover driver-card" style="cursor: pointer;" data-driver-id="${driver.id}">
        <div class="driver-card-header">
          <div class="avatar avatar-lg" style="background: ${driver.avatarColor};">
            ${driver.initials}
            <span class="avatar-status ${driver.status === 'driving' ? 'online' : driver.status === 'idle' ? 'offline' : 'away'}"></span>
          </div>
          <div class="driver-card-info">
            <div class="driver-card-name">${driver.name}</div>
            <div class="driver-card-truck">${truck?.model || 'No truck'} · ${truck?.plate || ''}</div>
            <span class="badge badge-dot badge-${statusInfo.color}" style="margin-top: 4px;">${statusInfo.label}</span>
          </div>
          <button class="btn btn-ghost btn-icon btn-sm call-btn" data-tooltip="Call">📞</button>
        </div>

        ${activeDelivery ? `
          <div style="padding: 8px 12px; background: var(--color-primary-glow); border-radius: 8px; margin-bottom: 12px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--color-text-muted);">Current:</span>
              <span style="font-weight: 600; color: var(--color-primary-light);">${activeDelivery.destination.name}</span>
            </div>
            <div class="progress-bar" style="margin-top: 6px; height: 3px;">
              <div class="progress-bar-fill" style="width: ${activeDelivery.progress}%;"></div>
            </div>
          </div>
        ` : ''}

        <div class="divider" style="margin: 12px 0;"></div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="fuel-gauge" style="flex: 1; margin-right: 12px;">
            <span style="font-size: 12px;">⛽</span>
            <div class="fuel-gauge-bar">
              <div class="fuel-gauge-fill" style="width: ${fuelPct}%; background: ${getFuelColor(fuelPct)};"></div>
            </div>
            <span class="fuel-gauge-label">${fuelPct}%</span>
          </div>
          <span class="badge badge-${restStatus.color}" style="font-size: 9px;">${restStatus.label}</span>
        </div>
      </div>
    `;
  }).join('') || '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">No drivers found</div></div>';
}

function renderDeliveriesTab(container, cleanups) {
  const deliveries = store.getState().deliveries;
  const drivers = store.getState().drivers;

  container.innerHTML = `
    <div style="display: flex; gap: 8px; margin-bottom: 16px; justify-content: flex-end;">
      <select class="select" id="filter-priority" style="width: auto;">
        <option value="all">All Priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
      </select>
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
            ${renderDeliveryRows(deliveries, drivers, 'all')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  let currentPriority = 'all';

  container.querySelector('#filter-priority')?.addEventListener('change', (e) => {
    currentPriority = e.target.value;
    updateTable();
  });

  function updateTable() {
    const tbody = container.querySelector('#deliveries-tbody');
    if (tbody) {
      tbody.innerHTML = renderDeliveryRows(store.getState().deliveries, store.getState().drivers, currentPriority);
    }
  }

  // Set up auto-update for deliveries
  const interval = setInterval(updateTable, 5000);
  
  // Store the interval ID on the container so it can be cleared if tabs switch
  container.dataset.intervalId = interval;
}

function renderDeliveryRows(deliveries, drivers, priority) {
  let filtered = [...deliveries];

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
