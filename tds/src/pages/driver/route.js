// ============================================
// TDS Driver - Route Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { createDriverDetailsMap } from '../../components/map.js';
import { formatHours, formatTime, getWeatherIcon } from '../../utils/helpers.js';

export function renderDriverRoute(container) {
  const cleanups = [];
  const auth = store.getState().auth;
  const driverId = auth.user?.id;

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="route-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Active Route');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#route-content');
  renderContent(content, driverId, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, driverId, cleanups) {
  const driver = store.getDriver(driverId);
  const deliveries = store.getDriverDeliveries(driverId);
  const activeDelivery = deliveries.find(d => ['in-progress', 'delayed'].includes(d.status));

  if (!activeDelivery) {
    content.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Active Route</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">🗺️</div>
        <div class="empty-state-title">No Active Route</div>
        <div class="empty-state-text">Start a delivery to see your route here.</div>
      </div>
    `;
    return;
  }

  const etaRemaining = (new Date(activeDelivery.eta).getTime() - Date.now()) / 3600000;
  const distRemaining = Math.round(activeDelivery.estimatedDistance * (1 - activeDelivery.progress / 100));

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Route to ${activeDelivery.destination.name}</h2>
        <p class="page-subtitle">${activeDelivery.id} · ${activeDelivery.package.description}</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <a href="#/driver/scan" class="btn btn-success btn-sm">📷 Scan Receipt</a>
      </div>
    </div>

    <!-- Map -->
    <div class="route-map-fullscreen" style="height: 450px;">
      <div id="driver-route-map" style="height: 100%; width: 100%;"></div>
      <div class="route-info-overlay">
        <div class="route-info-chip glass-strong" style="color: var(--color-text-primary);">
          🕐 ETA: ${etaRemaining > 0 ? formatHours(etaRemaining) : 'Arriving'}
        </div>
        <div class="route-info-chip glass-strong" style="color: var(--color-text-primary);">
          📍 ${distRemaining} km remaining
        </div>
        <div class="route-info-chip glass-strong" style="color: var(--color-text-primary);">
          ${getWeatherIcon(activeDelivery.weather)} ${activeDelivery.weather}
        </div>
      </div>
    </div>

    <!-- Route Progress -->
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="font-size: 14px; font-weight: 600;">Route Progress</span>
        <span class="text-mono" style="font-size: 14px; font-weight: 700; color: var(--color-primary);">${Math.round(activeDelivery.progress)}%</span>
      </div>
      <div class="progress-bar" style="height: 8px;">
        <div class="progress-bar-fill" style="width: ${activeDelivery.progress}%;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 12px;">
        <div>
          <div style="font-size: 11px; color: var(--color-text-muted);">Departed</div>
          <div class="text-mono" style="font-size: 13px; font-weight: 600;">${formatTime(activeDelivery.departureTime)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: var(--color-text-muted);">Est. Total</div>
          <div class="text-mono" style="font-size: 13px; font-weight: 600;">${formatHours(activeDelivery.estimatedTime)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: var(--color-text-muted);">ETA</div>
          <div class="text-mono" style="font-size: 13px; font-weight: 600;">${formatTime(activeDelivery.eta)}</div>
        </div>
      </div>
    </div>

    <!-- Turn-by-turn directions (simulated) -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Turn-by-Turn Directions</h3>
        <span class="badge badge-neutral">Simulated</span>
      </div>
      <div class="turn-list">
        ${generateSimulatedDirections(activeDelivery)}
      </div>
    </div>
  `;

  // Initialize map
  setTimeout(() => {
    const mapResult = createDriverDetailsMap('driver-route-map', driverId);
    if (mapResult) {
      cleanups.push(mapResult.unsub);
    }
  }, 100);
}

function generateSimulatedDirections(delivery) {
  const directions = [
    { icon: '🟢', text: `Depart from ${delivery.origin.name}`, dist: '0 km', active: false },
    { icon: '↗️', text: 'Merge onto Interstate Highway', dist: `${Math.round(delivery.estimatedDistance * 0.1)} km`, active: false },
    { icon: '➡️', text: 'Continue on highway — maintain lane', dist: `${Math.round(delivery.estimatedDistance * 0.3)} km`, active: delivery.progress > 20 && delivery.progress < 50 },
    { icon: '⛽', text: 'Fuel station available — right side', dist: `${Math.round(delivery.estimatedDistance * 0.45)} km`, active: false },
    { icon: '➡️', text: 'Continue straight for next stretch', dist: `${Math.round(delivery.estimatedDistance * 0.6)} km`, active: delivery.progress > 50 && delivery.progress < 75 },
    { icon: '↘️', text: `Take exit toward ${delivery.destination.name.split(' ')[0]}`, dist: `${Math.round(delivery.estimatedDistance * 0.85)} km`, active: delivery.progress > 75 },
    { icon: '🔴', text: `Arrive at ${delivery.destination.name}`, dist: `${delivery.estimatedDistance} km`, active: false },
  ];

  return directions.map(d => `
    <div class="turn-item ${d.active ? 'active' : ''}">
      <div class="turn-item-icon">${d.icon}</div>
      <div class="turn-item-text">${d.text}</div>
      <div class="turn-item-dist">${d.dist}</div>
    </div>
  `).join('');
}
