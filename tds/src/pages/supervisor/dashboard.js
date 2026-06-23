// ============================================
// TDS Supervisor Dashboard
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { createSupervisorMap } from '../../components/map.js';
import { showCallDialog, showToast } from '../../components/alerts.js';
import { getStatusInfo, formatRelativeTime, formatHours, getFuelColor, getAlertTypeIcon } from '../../utils/helpers.js';

export function renderSupervisorDashboard(container) {
  const cleanups = [];

  // Layout
  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="dashboard-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Dashboard');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#dashboard-content');
  renderDashboardContent(content, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderDashboardContent(content, cleanups) {
  const stats = store.getStats();
  const drivers = store.getState().drivers;
  const deliveries = store.getState().deliveries;
  const alerts = store.getActiveAlerts();
  const trucks = store.getState().trucks;

  // Urgent alerts banner
  const urgentAlerts = alerts.filter(a => (a.severity === 'critical' || a.severity === 'high') && !a.read);
  const alertBannerHtml = urgentAlerts.length > 0 ? `
    <div class="alert-banner alert-banner-danger" id="urgent-alert-banner">
      <span class="alert-banner-icon">🚨</span>
      <div class="alert-banner-content">
        <div class="alert-banner-title">${urgentAlerts.length} Urgent Alert${urgentAlerts.length > 1 ? 's' : ''}</div>
        <div class="alert-banner-text">${urgentAlerts[0].message}</div>
      </div>
      <div class="alert-banner-actions">
        <a href="#/supervisor/fleet" class="btn btn-sm btn-danger">View All</a>
        <button class="btn btn-sm btn-ghost" id="dismiss-banner-btn">Dismiss</button>
      </div>
    </div>
  ` : '';

  content.innerHTML = `
    ${alertBannerHtml}

    <!-- Stats Grid -->
    <div class="stats-grid stagger-children">
      <div class="card stat-card-container">
        <div class="stat-card-icon" style="background: var(--color-primary-glow);">🚛</div>
        <div class="stat-card">
          <div class="stat-value" id="stat-active-drivers">${stats.activeDrivers}</div>
          <div class="stat-label">Active Drivers</div>
          <div class="stat-trend up">↑ of ${stats.totalDrivers} total</div>
        </div>
      </div>
      <div class="card stat-card-container">
        <div class="stat-card-icon" style="background: var(--color-success-glow);">📦</div>
        <div class="stat-card">
          <div class="stat-value" id="stat-active-del">${stats.activeDeliveries}</div>
          <div class="stat-label">Active Deliveries</div>
          <div class="stat-trend up">+${stats.completedToday} completed today</div>
        </div>
      </div>
      <div class="card stat-card-container">
        <div class="stat-card-icon" style="background: rgba(16, 185, 129, 0.2);">✅</div>
        <div class="stat-card">
          <div class="stat-value" id="stat-ontime">${stats.onTimeRate}%</div>
          <div class="stat-label">On-Time Rate</div>
          <div class="stat-trend ${stats.onTimeRate >= 90 ? 'up' : 'down'}">${stats.onTimeRate >= 90 ? '↑' : '↓'} target: 95%</div>
        </div>
      </div>
      <div class="card stat-card-container">
        <div class="stat-card-icon" style="background: var(--color-warning-glow);">⛽</div>
        <div class="stat-card">
          <div class="stat-value" id="stat-fuel">${stats.avgFuelLevel}%</div>
          <div class="stat-label">Avg Fleet Fuel</div>
          <div class="stat-trend ${stats.avgFuelLevel >= 50 ? 'up' : 'down'}">
            ${stats.avgFuelLevel >= 50 ? '✓ Healthy' : '⚠ Low'}
          </div>
        </div>
      </div>
    </div>

    <!-- Map + Live Feed -->
    <div class="dashboard-grid">
      <div class="card dashboard-map-card">
        <div class="dashboard-map-header">
          <div>
            <h3 class="card-title">Live Fleet Map</h3>
            <p class="card-subtitle">${drivers.filter(d => d.status === 'driving').length} trucks currently on route</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="badge badge-dot badge-success" style="font-size: 10px;">Live</span>
          </div>
        </div>
        <div class="dashboard-map-container" id="supervisor-map"></div>
      </div>

      <div class="card live-feed">
        <div class="live-feed-header">
          <h3 class="card-title">Activity Feed</h3>
          <span class="badge badge-dot badge-primary" style="font-size: 10px;">Real-time</span>
        </div>
        <div class="live-feed-list" id="live-feed-list">
          ${renderFeedItems(drivers, deliveries, alerts)}
        </div>
      </div>
    </div>

    <!-- Active Deliveries Table -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <div>
          <h3 class="card-title">Active Deliveries</h3>
          <p class="card-subtitle">Real-time delivery tracking</p>
        </div>
        <a href="#/supervisor/fleet" class="btn btn-sm btn-ghost">View All →</a>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Status</th>
              <th>Progress</th>
              <th>ETA</th>
              <th>Fuel</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="active-deliveries-tbody">
            ${renderActiveDeliveryRows(deliveries, drivers, trucks)}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Driver Status Grid -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">Driver Status Overview</h3>
          <p class="card-subtitle">Current status of all fleet drivers</p>
        </div>
        <a href="#/supervisor/fleet" class="btn btn-sm btn-ghost">Manage →</a>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;" id="driver-status-grid">
        ${drivers.map(driver => {
          const statusInfo = getStatusInfo(driver.status);
          const truck = trucks.find(t => t.id === driver.truckId);
          const fuelPct = truck ? Math.round((truck.currentFuel / truck.fuelTank) * 100) : 0;
          return `
            <div class="card card-hover" style="padding: 16px; cursor: pointer;" data-driver-id="${driver.id}">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div class="avatar avatar-sm" style="background: ${driver.avatarColor};">
                  ${driver.initials}
                  <span class="avatar-status ${driver.status === 'driving' ? 'online' : driver.status === 'idle' ? 'offline' : 'away'}"></span>
                </div>
                <div>
                  <div style="font-size: 13px; font-weight: 600;">${driver.name.split(' ')[0]}</div>
                  <span class="badge badge-${statusInfo.color}" style="font-size: 9px; padding: 1px 6px;">${statusInfo.label}</span>
                </div>
              </div>
              <div class="fuel-gauge">
                <span style="font-size: 12px;">⛽</span>
                <div class="fuel-gauge-bar">
                  <div class="fuel-gauge-fill" style="width: ${fuelPct}%; background: ${getFuelColor(fuelPct)};"></div>
                </div>
                <span class="fuel-gauge-label">${fuelPct}%</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Initialize map
  setTimeout(() => {
    const mapResult = createSupervisorMap('supervisor-map');
    if (mapResult) {
      cleanups.push(mapResult.unsub);
    }
  }, 100);

  // Dismiss banner
  content.querySelector('#dismiss-banner-btn')?.addEventListener('click', () => {
    const banner = content.querySelector('#urgent-alert-banner');
    banner?.remove();
    urgentAlerts.forEach(a => store.markAlertRead(a.id));
  });

  // Driver card clicks -> navigate to driver details
  content.querySelectorAll('[data-driver-id]').forEach(el => {
    el.addEventListener('click', () => {
      import('../../router.js').then(({ router }) => {
        router.navigate('/supervisor/driver/' + el.dataset.driverId);
      });
    });
  });

  // Call button in table
  content.querySelectorAll('.call-driver-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const driver = store.getDriver(btn.dataset.driverId);
      if (driver) showCallDialog(driver);
    });
  });

  // Subscribe to updates for live feed and stats
  const updateInterval = setInterval(() => {
    const newStats = store.getStats();
    const el1 = content.querySelector('#stat-active-drivers');
    const el2 = content.querySelector('#stat-active-del');
    const el3 = content.querySelector('#stat-ontime');
    const el4 = content.querySelector('#stat-fuel');
    if (el1) el1.textContent = newStats.activeDrivers;
    if (el2) el2.textContent = newStats.activeDeliveries;
    if (el3) el3.textContent = newStats.onTimeRate + '%';
    if (el4) el4.textContent = newStats.avgFuelLevel + '%';

    // Update delivery rows
    const tbody = content.querySelector('#active-deliveries-tbody');
    if (tbody) {
      tbody.innerHTML = renderActiveDeliveryRows(
        store.getState().deliveries,
        store.getState().drivers,
        store.getState().trucks
      );
      // Re-attach call buttons
      tbody.querySelectorAll('.call-driver-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const driver = store.getDriver(btn.dataset.driverId);
          if (driver) showCallDialog(driver);
        });
      });
    }
  }, 3000);

  cleanups.push(() => clearInterval(updateInterval));
}

function renderFeedItems(drivers, deliveries, alerts) {
  const feedItems = [];

  // Add recent alerts as feed items
  alerts.slice(0, 5).forEach(alert => {
    const driver = drivers.find(d => d.id === alert.driverId);
    feedItems.push({
      icon: getAlertTypeIcon(alert.type),
      iconBg: alert.severity === 'critical' || alert.severity === 'high' ? 'var(--color-danger-glow)' : 'var(--color-warning-glow)',
      text: `<strong>${driver?.name || 'System'}</strong> — ${alert.title}`,
      time: alert.timestamp
    });
  });

  // Add active delivery updates
  deliveries.filter(d => d.status === 'in-progress').slice(0, 3).forEach(del => {
    const driver = drivers.find(d => d.id === del.driverId);
    feedItems.push({
      icon: '🚛',
      iconBg: 'var(--color-success-glow)',
      text: `<strong>${driver?.name || 'Driver'}</strong> en route to ${del.destination.name} (${Math.round(del.progress)}%)`,
      time: del.departureTime
    });
  });

  // Sort by time
  feedItems.sort((a, b) => new Date(b.time) - new Date(a.time));

  return feedItems.slice(0, 8).map(item => `
    <div class="feed-item">
      <div class="feed-item-icon" style="background: ${item.iconBg};">
        ${item.icon}
      </div>
      <div class="feed-item-content">
        <div class="feed-item-text">${item.text}</div>
        <div class="feed-item-time">${formatRelativeTime(item.time)}</div>
      </div>
    </div>
  `).join('');
}

function renderActiveDeliveryRows(deliveries, drivers, trucks) {
  return deliveries
    .filter(d => ['in-progress', 'delayed', 'loading'].includes(d.status))
    .map(del => {
      const driver = drivers.find(d => d.id === del.driverId);
      const truck = trucks.find(t => t.id === del.truckId);
      const statusInfo = getStatusInfo(del.status);
      const fuelPct = truck ? Math.round((truck.currentFuel / truck.fuelTank) * 100) : 0;
      const etaRemaining = del.eta ? (new Date(del.eta).getTime() - Date.now()) / 3600000 : null;

      return `
        <tr>
          <td><span class="text-mono" style="font-size: 12px; font-weight: 600; color: var(--color-primary-light);">${del.id}</span></td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="avatar avatar-sm" style="background: ${driver?.avatarColor || '#666'}; font-size: 10px; width: 28px; height: 28px;">${driver?.initials || '??'}</div>
              <div>
                <div style="font-size: 13px; font-weight: 500; color: var(--color-text-primary);">${driver?.name || 'Unknown'}</div>
                <div style="font-size: 11px; color: var(--color-text-muted);">${truck?.model || ''}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size: 12px; color: var(--color-text-primary);">${del.destination.name}</div>
            <div style="font-size: 11px; color: var(--color-text-muted);">${del.estimatedDistance} mi</div>
          </td>
          <td><span class="badge badge-dot badge-${statusInfo.color}">${statusInfo.label}</span></td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px; min-width: 120px;">
              <div class="progress-bar" style="flex: 1;">
                <div class="progress-bar-fill" style="width: ${del.progress}%;"></div>
              </div>
              <span class="text-mono" style="font-size: 11px; color: var(--color-text-muted);">${Math.round(del.progress)}%</span>
            </div>
          </td>
          <td>
            <span class="text-mono" style="font-size: 12px;">
              ${etaRemaining != null && etaRemaining > 0 ? formatHours(etaRemaining) : etaRemaining != null ? 'Arriving' : '--'}
            </span>
          </td>
          <td>
            <div class="fuel-gauge" style="min-width: 80px;">
              <div class="fuel-gauge-bar">
                <div class="fuel-gauge-fill" style="width: ${fuelPct}%; background: ${getFuelColor(fuelPct)};"></div>
              </div>
              <span class="fuel-gauge-label">${fuelPct}%</span>
            </div>
          </td>
          <td>
            <button class="btn btn-ghost btn-sm call-driver-btn" data-driver-id="${del.driverId}" data-tooltip="Call Driver">📞</button>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="8"><div class="empty-state" style="padding: 24px;"><div class="empty-state-text">No active deliveries</div></div></td></tr>';
}
