// ============================================
// TDS Driver Dashboard
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { router } from '../../router.js';
import { getStatusInfo, formatHours, getRestStatus, getFuelColor, formatTime, getWeatherIcon } from '../../utils/helpers.js';

export function renderDriverDashboard(container) {
  const cleanups = [];
  const auth = store.getState().auth;
  const driverId = auth.user?.id;

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="driver-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'My Dashboard');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#driver-content');
  renderContent(content, driverId, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, driverId, cleanups) {
  const driver = store.getDriver(driverId);
  if (!driver) {
    content.innerHTML = '<div class="empty-state"><div class="empty-state-title">Driver not found</div></div>';
    return;
  }

  const truck = store.getTruck(driver.truckId);
  const deliveries = store.getDriverDeliveries(driverId);
  const activeDelivery = deliveries.find(d => ['in-progress', 'delayed'].includes(d.status));
  const scheduledDeliveries = deliveries.filter(d => d.status === 'scheduled');
  const completedToday = deliveries.filter(d => d.status === 'completed').length;
  const fuelPct = truck ? Math.round((truck.currentFuel / truck.fuelTank) * 100) : 0;
  const restStatus = getRestStatus(driver.drivingTime, driver.lastRest);
  const statusInfo = getStatusInfo(driver.status);

  content.innerHTML = `
    <!-- Status Bar -->
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
      <span class="badge badge-dot badge-${statusInfo.color}" style="font-size: 12px; padding: 6px 16px;">${statusInfo.icon} ${statusInfo.label}</span>
      <span style="font-size: 13px; color: var(--color-text-muted);">Shift started ${driver.shiftStart ? formatTime(driver.shiftStart) : 'Not started'}</span>
      <span style="font-size: 13px; color: var(--color-text-muted);">· ${formatHours(driver.drivingTime)} driving</span>
    </div>

    <!-- Current Delivery Card -->
    ${activeDelivery ? `
      <div class="card driver-current-delivery card-glow" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 1;">
          <div>
            <span class="badge badge-dot badge-${getStatusInfo(activeDelivery.status).color}" style="margin-bottom: 8px;">${getStatusInfo(activeDelivery.status).label}</span>
            <h3 style="font-size: 20px; font-weight: 700;">Current Delivery</h3>
            <p style="color: var(--color-text-muted); font-size: 13px; margin-top: 4px;">${activeDelivery.id} · ${activeDelivery.package.description}</p>
          </div>
          <span style="font-size: 14px;">${getWeatherIcon(activeDelivery.weather)}</span>
        </div>

        <div class="delivery-route-visual">
          <div class="route-point">
            <div class="route-point-dot" style="background: var(--color-success);"></div>
            <div class="route-point-label">From</div>
            <div class="route-point-name">${activeDelivery.origin.name.split(' ').slice(0, 2).join(' ')}</div>
          </div>
          <div class="route-line">
            <div class="route-line-progress" style="width: ${activeDelivery.progress}%;"></div>
            <span class="route-truck-icon" style="left: ${activeDelivery.progress}%;">🚛</span>
          </div>
          <div class="route-point">
            <div class="route-point-dot" style="background: var(--color-primary);"></div>
            <div class="route-point-label">To</div>
            <div class="route-point-name">${activeDelivery.destination.name.split(' ').slice(0, 2).join(' ')}</div>
          </div>
        </div>

        <div class="delivery-details-grid">
          <div class="delivery-detail">
            <span class="delivery-detail-label">Progress</span>
            <span class="delivery-detail-value">${Math.round(activeDelivery.progress)}%</span>
          </div>
          <div class="delivery-detail">
            <span class="delivery-detail-label">ETA</span>
            <span class="delivery-detail-value">${formatTime(activeDelivery.eta)}</span>
          </div>
          <div class="delivery-detail">
            <span class="delivery-detail-label">Distance</span>
            <span class="delivery-detail-value">${activeDelivery.estimatedDistance} mi</span>
          </div>
          <div class="delivery-detail">
            <span class="delivery-detail-label">Load</span>
            <span class="delivery-detail-value">${(activeDelivery.package.weight / 1000).toFixed(1)}t</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 20px; position: relative; z-index: 1;">
          <a href="#/driver/route" class="btn btn-primary" style="flex: 1;">🗺️ View Route</a>
          <a href="#/driver/scan" class="btn btn-success" style="flex: 1;">📷 Scan Receipt</a>
        </div>
      </div>
    ` : `
      <div class="card" style="padding: 32px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Active Delivery</h3>
        <p style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 16px;">
          ${scheduledDeliveries.length > 0 ? `You have ${scheduledDeliveries.length} scheduled delivery(ies) coming up.` : 'No deliveries assigned at the moment.'}
        </p>
      </div>
    `}

    <!-- Quick Stats & Rest Timer Row -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px;">
      <!-- Today's Stats -->
      <div class="card" style="padding: 20px;">
        <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-muted); margin-bottom: 16px;">Today's Stats</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: 13px; color: var(--color-text-secondary);">Completed</span>
            <span class="text-mono" style="font-size: 14px; font-weight: 600;">${completedToday}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: 13px; color: var(--color-text-secondary);">Driving Time</span>
            <span class="text-mono" style="font-size: 14px; font-weight: 600;">${formatHours(driver.drivingTime)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: 13px; color: var(--color-text-secondary);">Performance</span>
            <span class="text-mono" style="font-size: 14px; font-weight: 600; color: ${driver.performanceScore >= 85 ? 'var(--color-success)' : 'var(--color-warning)'};">${driver.performanceScore}/100</span>
          </div>
        </div>
      </div>

      <!-- Rest Timer -->
      <div class="card rest-timer-card" style="padding: 20px;">
        <div class="rest-timer-circle">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="58" stroke="var(--color-border)" />
            <circle cx="64" cy="64" r="58"
              stroke="${restStatus.color === 'success' ? 'var(--color-success)' : restStatus.color === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)'}"
              stroke-dasharray="${2 * Math.PI * 58}"
              stroke-dashoffset="${2 * Math.PI * 58 * (1 - Math.min(driver.drivingTime / 4, 1))}" />
          </svg>
          <div>
            <div class="rest-timer-value">${formatHours(Math.max(0, 4 - driver.drivingTime))}</div>
            <div style="font-size: 10px; color: var(--color-text-muted);">until rest</div>
          </div>
        </div>
        <div class="rest-timer-status" style="color: var(--color-${restStatus.color});">
          ${restStatus.label}
        </div>
      </div>

      <!-- Truck & Fuel -->
      <div class="card" style="padding: 20px;">
        <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-muted); margin-bottom: 16px;">${truck?.model || 'Truck'}</h4>
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 36px; margin-bottom: 8px;">⛽</div>
          <div class="text-mono" style="font-size: 24px; font-weight: 700; color: ${getFuelColor(fuelPct)};">${fuelPct}%</div>
          <div style="font-size: 11px; color: var(--color-text-muted);">${truck ? Math.round(truck.currentFuel) : 0}L / ${truck?.fuelTank || 0}L</div>
        </div>
        <div class="progress-bar ${fuelPct < 25 ? 'progress-bar-danger' : fuelPct < 50 ? 'progress-bar-warning' : ''}">
          <div class="progress-bar-fill" style="width: ${fuelPct}%;"></div>
        </div>
      </div>
    </div>

    <!-- Upcoming Deliveries -->
    ${scheduledDeliveries.length > 0 ? `
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <h3 class="card-title">Upcoming Deliveries</h3>
          <a href="#/driver/deliveries" class="btn btn-ghost btn-sm">View All →</a>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${scheduledDeliveries.map(del => `
            <div style="display: flex; align-items: center; gap: 16px; padding: 12px; border: 1px solid var(--color-border); border-radius: 12px;">
              <div style="font-size: 24px;">📦</div>
              <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 600;">${del.destination.name}</div>
                <div style="font-size: 12px; color: var(--color-text-muted);">${del.package.description} · ${del.estimatedDistance} mi</div>
              </div>
              <div style="text-align: right;">
                <div class="text-mono" style="font-size: 13px; font-weight: 600;">${formatHours(del.estimatedTime)}</div>
                <div style="font-size: 11px; color: var(--color-text-muted);">est. time</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Truck Health -->
    ${truck ? `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Truck Health</h3>
          <span class="badge badge-neutral">${truck.plate}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          ${Object.entries(truck.health).map(([key, val]) => `
            <div style="text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">
                ${{ tires: '🛞', oil: '🛢️', brakes: '🔴', engine: '⚙️' }[key] || '🔧'}
              </div>
              <div class="text-mono" style="font-size: 18px; font-weight: 700; color: ${val >= 85 ? 'var(--color-success)' : val >= 70 ? 'var(--color-warning)' : 'var(--color-danger)'};">${val}%</div>
              <div style="font-size: 12px; color: var(--color-text-muted); text-transform: capitalize; margin-top: 4px;">${key}</div>
              <div class="progress-bar" style="margin-top: 8px; height: 4px;">
                <div class="progress-bar-fill" style="width: ${val}%; background: ${val >= 85 ? 'var(--color-success)' : val >= 70 ? 'var(--color-warning)' : 'var(--color-danger)'};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  // Live updates
  const interval = setInterval(() => {
    renderContent(content, driverId, cleanups);
  }, 10000);
  cleanups.push(() => clearInterval(interval));
}
