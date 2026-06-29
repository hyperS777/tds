// ============================================
// TDS Supervisor - Driver Details Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { showCallDialog } from '../../components/alerts.js';
import { showConfirmDialog } from '../../components/modal.js';
import { showEditDriverModal } from './fleet.js';
import { getStatusInfo, getFuelColor, formatHours } from '../../utils/helpers.js';
import { createDriverDetailsMap } from '../../components/map.js';
import { router } from '../../router.js';
import { showMessageModal } from '../../components/messaging.js';

export function renderSupervisorDriverDetails(container) {
  const cleanups = [];
  
  // Extract driver ID from hash
  const hash = window.location.hash;
  const match = hash.match(/#\/supervisor\/driver\/(.+)/);
  const driverId = match ? match[1] : null;

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="driver-details-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Driver Details', [
    { label: 'Fleet', path: '/supervisor/fleet' }
  ]);
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#driver-details-content');
  
  if (!driverId) {
    content.innerHTML = '<div class="empty-state">Invalid Driver ID</div>';
    return () => cleanups.forEach(fn => fn());
  }

  renderContent(content, driverId, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content, driverId, cleanups) {
  const updateView = () => {
    const driver = store.getDriver(driverId);
    if (!driver) {
      content.innerHTML = '<div class="empty-state">Driver not found</div>';
      return;
    }

    const truck = store.getState().trucks.find(t => t.id === driver.truckId);
    const deliveries = store.getState().deliveries.filter(d => d.driverId === driver.id);
    const activeDelivery = deliveries.find(d => ['in-progress', 'delayed', 'loading'].includes(d.status));
    const completedDelivery = deliveries.find(d => d.status === 'completed'); // Just grab the most recent one if no active

    const currentDelivery = activeDelivery || completedDelivery;
    
    const statusInfo = getStatusInfo(driver.status);
    const fuelPct = truck ? Math.round((truck.currentFuel / truck.fuelTank) * 100) : 0;

    // Build Delivery Timeline
    let timelineHtml = '<div class="empty-state" style="padding: 24px;">No recent delivery data</div>';
    
    if (currentDelivery) {
      const isCompleted = currentDelivery.status === 'completed';
      const isStarted = currentDelivery.departureTime != null;
      
      const startTime = currentDelivery.departureTime ? new Date(currentDelivery.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pending';
      const estEndTime = currentDelivery.eta ? new Date(currentDelivery.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Unknown';
      const actEndTime = currentDelivery.actualTime ? new Date(currentDelivery.actualTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--';

      timelineHtml = `
        <div class="timeline" style="display: flex; justify-content: space-between; position: relative; margin-top: 24px;">
          <!-- Connecting Line -->
          <div style="position: absolute; top: 14px; left: 10%; right: 10%; height: 2px; background: var(--border-color); z-index: 0;">
            <div style="height: 100%; background: var(--color-primary); width: ${isCompleted ? '100' : isStarted ? '50' : '0'}%; transition: width 1s;"></div>
          </div>
          
          <!-- Start Node -->
          <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; width: 80px;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${isStarted ? 'var(--color-primary)' : 'var(--bg-card)'}; border: 2px solid var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 14px; color: ${isStarted ? 'white' : 'var(--color-primary)'}; margin-bottom: 8px;">
              ${isStarted ? '✓' : '1'}
            </div>
            <div style="font-size: 12px; font-weight: 600;">Started</div>
            <div style="font-size: 11px; color: var(--color-text-muted);" class="text-mono">${startTime}</div>
          </div>

          <!-- ETA Node -->
          <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; width: 80px;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--bg-card); border: 2px solid var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--color-primary); margin-bottom: 8px;">
              2
            </div>
            <div style="font-size: 12px; font-weight: 600;">Estimated</div>
            <div style="font-size: 11px; color: var(--color-text-muted);" class="text-mono">${estEndTime}</div>
          </div>

          <!-- Completed Node -->
          <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; width: 80px;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${isCompleted ? 'var(--color-success)' : 'var(--bg-card)'}; border: 2px solid ${isCompleted ? 'var(--color-success)' : 'var(--border-color)'}; display: flex; align-items: center; justify-content: center; font-size: 14px; color: ${isCompleted ? 'white' : 'var(--color-text-muted)'}; margin-bottom: 8px;">
              ${isCompleted ? '✓' : '3'}
            </div>
            <div style="font-size: 12px; font-weight: 600;">Completed</div>
            <div style="font-size: 11px; color: var(--color-text-muted);" class="text-mono">${actEndTime}</div>
          </div>
        </div>
      `;
    }

    // Only set innerHTML if this is the first render, otherwise just update specific elements to avoid map flicker
    if (!content.querySelector('#driver-details-grid')) {
      content.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <button class="btn btn-ghost btn-icon" id="back-btn">←</button>
            <div class="avatar avatar-lg" style="background: ${driver.avatarColor};">
              ${driver.initials}
            </div>
            <div>
              <h2 class="page-title" style="margin-bottom: 4px;" id="dd-driver-name">${driver.name}</h2>
              <span class="badge badge-dot badge-${statusInfo.color}">${statusInfo.label}</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-outline btn-sm" id="edit-driver-btn">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" id="remove-driver-btn">🗑️ Remove</button>
            <button class="btn btn-secondary" id="msg-driver-btn">💬 Message</button>
            <button class="btn btn-primary" id="call-driver-btn">📞 Call Driver</button>
          </div>
        </div>

        <!-- Performance Summary -->
        <div class="kpi-grid" style="margin-bottom: 24px;">
          <div class="card kpi-card">
            <div class="kpi-icon" style="background: var(--color-success-glow); color: var(--color-success-light);">📊</div>
            <div class="kpi-info">
              <div class="kpi-value">${driver.performanceScore}</div>
              <div class="kpi-label">Performance</div>
            </div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-icon" style="background: var(--color-primary-glow); color: var(--color-primary-light);">📦</div>
            <div class="kpi-info">
              <div class="kpi-value">${driver.totalDeliveries}</div>
              <div class="kpi-label">Total Deliveries</div>
            </div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-icon" style="background: var(--color-warning-glow); color: var(--color-warning-light);">⏱️</div>
            <div class="kpi-info">
              <div class="kpi-value">${driver.onTimeRate}%</div>
              <div class="kpi-label">On-Time Rate</div>
            </div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-icon" style="background: rgba(124,109,181,0.15); color: var(--color-info-light);">💤</div>
            <div class="kpi-info">
              <div class="kpi-value">${driver.restCompliance}%</div>
              <div class="kpi-label">Rest Compliance</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid" id="driver-details-grid" style="grid-template-columns: 1fr 1fr;">
          <!-- Driver Info Card -->
          <div class="card" style="display: flex; flex-direction: column; gap: 24px;">
            <div>
              <h3 class="card-title">Driver & Vehicle Info</h3>
              <div class="divider" style="margin: 12px 0;"></div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">Email</div>
                  <div style="font-size: 14px; font-weight: 500;">${driver.email}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">Phone</div>
                  <div style="font-size: 14px; font-weight: 500;">${driver.phone || 'N/A'}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">License</div>
                  <div style="font-size: 14px; font-weight: 500; font-family: var(--font-mono);">${driver.license || 'N/A'}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">Experience</div>
                  <div style="font-size: 14px; font-weight: 500;">${driver.experience} years</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">Truck Model</div>
                  <div style="font-size: 14px; font-weight: 500;">${truck?.model || 'N/A'}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">License Plate</div>
                  <div style="font-size: 14px; font-weight: 500;">${truck?.plate || 'N/A'}</div>
                </div>
                <div style="grid-column: span 2;">
                  <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 8px;">Fuel Level</div>
                  <div class="fuel-gauge" style="width: 100%;">
                    <div class="fuel-gauge-bar" style="height: 12px; border-radius: 6px;">
                      <div class="fuel-gauge-fill" style="width: ${fuelPct}%; background: ${getFuelColor(fuelPct)};"></div>
                    </div>
                    <span class="fuel-gauge-label" id="dd-fuel-label">${fuelPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="card-title">Delivery Timeline</h3>
              <p class="card-subtitle">${currentDelivery ? currentDelivery.package.description : 'No active delivery'}</p>
              <div class="divider" style="margin: 12px 0;"></div>
              <div id="dd-timeline">
                ${timelineHtml}
              </div>
            </div>
          </div>

          <!-- Map Card -->
          <div class="card dashboard-map-card" style="min-height: 400px;">
            <div class="dashboard-map-header">
              <h3 class="card-title">Live Location</h3>
              <span class="badge badge-dot badge-success" style="font-size: 10px;">Live</span>
            </div>
            <div class="dashboard-map-container" id="driver-details-map"></div>
          </div>
        </div>
      `;

      // Back button
      content.querySelector('#back-btn')?.addEventListener('click', () => {
        router.navigate('/supervisor/fleet');
      });

      // Call button
      content.querySelector('#call-driver-btn')?.addEventListener('click', () => {
        showCallDialog(driver);
      });

      // Message button
      content.querySelector('#msg-driver-btn')?.addEventListener('click', () => {
        const currentDriver = store.getDriver(driverId);
        if (currentDriver) {
          showMessageModal(currentDriver);
        }
      });

      // Edit button
      content.querySelector('#edit-driver-btn')?.addEventListener('click', () => {
        const currentDriver = store.getDriver(driverId);
        if (currentDriver) {
          showEditDriverModal(currentDriver, () => {
            // Force re-render the whole page after edit
            const nameEl = content.querySelector('#dd-driver-name');
            const updatedDriver = store.getDriver(driverId);
            if (nameEl && updatedDriver) nameEl.textContent = updatedDriver.name;
          });
        }
      });

      // Remove button
      content.querySelector('#remove-driver-btn')?.addEventListener('click', () => {
        const currentDriver = store.getDriver(driverId);
        if (currentDriver) {
          showConfirmDialog({
            title: 'Remove Driver',
            message: `Are you sure you want to remove <strong>${currentDriver.name}</strong> from the fleet? Any active deliveries will be unassigned.`,
            confirmLabel: 'Remove Driver',
            danger: true,
            onConfirm: () => {
              store.removeDriver(driverId);
              router.navigate('/supervisor/fleet');
            }
          });
        }
      });

      // Initialize Map
      setTimeout(() => {
        const mapResult = createDriverDetailsMap('driver-details-map', driverId);
        if (mapResult) {
          cleanups.push(mapResult.unsub);
        }
      }, 100);

    } else {
      // Just update timeline and fuel to avoid map flickering
      const fuelLabel = content.querySelector('#dd-fuel-label');
      if (fuelLabel) fuelLabel.textContent = `${fuelPct}%`;
      
      const fuelFill = content.querySelector('.fuel-gauge-fill');
      if (fuelFill) {
        fuelFill.style.width = `${fuelPct}%`;
        fuelFill.style.background = getFuelColor(fuelPct);
      }

      const timelineContainer = content.querySelector('#dd-timeline');
      if (timelineContainer) timelineContainer.innerHTML = timelineHtml;
    }
  };

  updateView();
  const interval = setInterval(updateView, 3000);
  cleanups.push(() => clearInterval(interval));
}
