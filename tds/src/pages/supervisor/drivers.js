// ============================================
// TDS Supervisor - Drivers Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { showCallDialog } from '../../components/alerts.js';
import { getStatusInfo, getFuelColor, getRestStatus, formatHours } from '../../utils/helpers.js';

export function renderSupervisorDrivers(container) {
  const cleanups = [];

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="drivers-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Driver Management');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#drivers-content');
  renderContent(content, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, cleanups) {
  const drivers = store.getState().drivers;
  const trucks = store.getState().trucks;
  const deliveries = store.getState().deliveries;

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Drivers</h2>
        <p class="page-subtitle">${drivers.length} registered drivers in your fleet</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <select class="select" id="filter-status" style="width: auto;">
          <option value="all">All Status</option>
          <option value="driving">On Route</option>
          <option value="resting">Resting</option>
          <option value="loading">Loading</option>
          <option value="delayed">Delayed</option>
          <option value="idle">Off Duty</option>
        </select>
        <div class="input-icon-wrapper">
          <span class="input-icon">🔍</span>
          <input type="text" class="input" id="search-drivers" placeholder="Search drivers..." style="width: 200px;" />
        </div>
      </div>
    </div>

    <div class="drivers-grid stagger-children" id="drivers-grid">
      ${renderDriverCards(drivers, trucks, deliveries)}
    </div>
  `;

  // Filters
  const filterSelect = content.querySelector('#filter-status');
  const searchInput = content.querySelector('#search-drivers');

  const applyFilters = () => {
    const status = filterSelect.value;
    const search = searchInput.value.toLowerCase();
    let filtered = store.getState().drivers;

    if (status !== 'all') filtered = filtered.filter(d => d.status === status);
    if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes(search));

    content.querySelector('#drivers-grid').innerHTML = renderDriverCards(
      filtered, store.getState().trucks, store.getState().deliveries
    );
    attachCardHandlers(content);
  };

  filterSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  attachCardHandlers(content);
}

function attachCardHandlers(content) {
  content.querySelectorAll('.driver-card').forEach(card => {
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
    const activeDelivery = deliveries.find(d => d.driverId === driver.id && ['in-progress', 'delayed'].includes(d.status));
    const restStatus = getRestStatus(driver.drivingTime, driver.lastRest);

    return `
      <div class="card card-hover driver-card" data-driver-id="${driver.id}">
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

        <div class="driver-card-body">
          <div class="driver-card-stat">
            <span class="driver-card-stat-label">Deliveries</span>
            <span class="driver-card-stat-value">${driver.totalDeliveries}</span>
          </div>
          <div class="driver-card-stat">
            <span class="driver-card-stat-label">On-Time</span>
            <span class="driver-card-stat-value" style="color: ${driver.onTimeRate >= 90 ? 'var(--color-success)' : 'var(--color-warning)'};">${driver.onTimeRate}%</span>
          </div>
          <div class="driver-card-stat">
            <span class="driver-card-stat-label">Rating</span>
            <span class="driver-card-stat-value">⭐ ${driver.rating}</span>
          </div>
          <div class="driver-card-stat">
            <span class="driver-card-stat-label">Score</span>
            <span class="driver-card-stat-value" style="color: ${driver.performanceScore >= 85 ? 'var(--color-success)' : driver.performanceScore >= 70 ? 'var(--color-warning)' : 'var(--color-danger)'};">${driver.performanceScore}</span>
          </div>
        </div>

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

        ${truck ? `
          <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
            ${Object.entries(truck.health).map(([key, val]) => `
              <div style="text-align: center;">
                <div style="font-size: 9px; color: var(--color-text-muted); text-transform: capitalize; margin-bottom: 2px;">${key}</div>
                <div class="progress-bar" style="height: 3px;">
                  <div class="progress-bar-fill" style="width: ${val}%; background: ${val >= 85 ? 'var(--color-success)' : val >= 70 ? 'var(--color-warning)' : 'var(--color-danger)'};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('') || '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">No drivers found</div></div>';
}
