// ============================================
// TDS Supervisor - Fleet Management (Full CRUD)
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { showCallDialog } from '../../components/alerts.js';
import { showFormModal, showConfirmDialog } from '../../components/modal.js';
import { renderActivityLog } from '../../components/activity-log.js';
import { exportDriversCSV, exportFleetCSV, exportDeliveriesCSV } from '../../utils/export.js';
import { getStatusInfo, getFuelColor, getRestStatus, getPriorityInfo, formatHours, getWeatherIcon, getTruckHealthColor } from '../../utils/helpers.js';
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

// ============================================
// SELECTED ITEMS (Bulk Actions)
// ============================================
const selectedDrivers = new Set();
const selectedTrucks = new Set();

function renderContent(content, cleanups) {
  const stats = store.getStats();
  const trucks = store.getState().trucks;
  const drivers = store.getState().drivers;
  const assignedTrucks = drivers.filter(d => d.truckId).length;

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Fleet Management</h2>
        <p class="page-subtitle">Manage drivers, trucks, and deliveries</p>
      </div>
    </div>

    <!-- KPI Overview -->
    <div class="kpi-grid" id="kpi-grid">
      <div class="card kpi-card">
        <div class="kpi-icon" style="background: var(--color-primary-glow); color: var(--color-primary-light);">👥</div>
        <div class="kpi-info">
          <div class="kpi-value">${stats.totalDrivers}</div>
          <div class="kpi-label">Drivers</div>
          <div class="kpi-sub">${stats.activeDrivers} active</div>
        </div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-icon" style="background: var(--color-warning-glow); color: var(--color-warning-light);">🚛</div>
        <div class="kpi-info">
          <div class="kpi-value">${trucks.length}</div>
          <div class="kpi-label">Trucks</div>
          <div class="kpi-sub">${assignedTrucks} assigned</div>
        </div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-icon" style="background: var(--color-success-glow); color: var(--color-success-light);">⛽</div>
        <div class="kpi-info">
          <div class="kpi-value">${stats.avgFuelLevel}%</div>
          <div class="kpi-label">Avg Fuel</div>
          <div class="kpi-sub">fleet average</div>
        </div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-icon" style="background: rgba(124,109,181,0.15); color: var(--color-info-light);">📦</div>
        <div class="kpi-info">
          <div class="kpi-value">${stats.activeDeliveries}</div>
          <div class="kpi-label">Active Deliveries</div>
          <div class="kpi-sub">${stats.delayedCount} delayed</div>
        </div>
      </div>
    </div>

    <div class="tabs" id="fleet-tabs" style="margin-bottom: 24px;">
      <button class="tab active" data-tab="drivers">Drivers</button>
      <button class="tab" data-tab="trucks">Trucks</button>
      <button class="tab" data-tab="deliveries">Deliveries</button>
      <button class="tab" data-tab="activity">Activity</button>
    </div>

    <div id="fleet-tab-content"></div>
    <div id="bulk-bar-mount"></div>
  `;

  let currentTab = 'drivers';

  const renderTab = () => {
    const tabContent = content.querySelector('#fleet-tab-content');
    selectedDrivers.clear();
    selectedTrucks.clear();
    removeBulkBar(content);

    if (currentTab === 'drivers') renderDriversTab(tabContent, content, cleanups);
    else if (currentTab === 'trucks') renderTrucksTab(tabContent, content, cleanups);
    else if (currentTab === 'deliveries') renderDeliveriesTab(tabContent, cleanups);
    else renderActivityTab(tabContent);
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

  // Close action menus on outside click
  const outsideClickHandler = (e) => {
    if (!e.target.closest('.action-menu')) {
      document.querySelectorAll('.action-menu-dropdown.open').forEach(m => m.classList.remove('open'));
    }
  };
  document.addEventListener('click', outsideClickHandler);
  cleanups.push(() => document.removeEventListener('click', outsideClickHandler));
}

// ============================================
// BULK ACTION BAR
// ============================================
function renderBulkBar(content, type) {
  removeBulkBar(content);
  const count = type === 'drivers' ? selectedDrivers.size : selectedTrucks.size;
  if (count === 0) return;

  const bar = document.createElement('div');
  bar.className = 'bulk-action-bar';
  bar.id = 'bulk-action-bar';
  bar.innerHTML = `
    <div class="bulk-action-count"><span>${count}</span> selected</div>
    <button class="btn btn-outline btn-sm" id="bulk-deselect">Deselect All</button>
    <button class="btn btn-danger btn-sm" id="bulk-remove">🗑️ Remove Selected</button>
  `;
  content.querySelector('#bulk-bar-mount').appendChild(bar);

  bar.querySelector('#bulk-deselect').addEventListener('click', () => {
    if (type === 'drivers') selectedDrivers.clear();
    else selectedTrucks.clear();
    removeBulkBar(content);
    // Re-render checkboxes
    content.querySelectorAll('.checkbox-card-check').forEach(c => c.classList.remove('checked'));
  });

  bar.querySelector('#bulk-remove').addEventListener('click', () => {
    const items = type === 'drivers' ? [...selectedDrivers] : [...selectedTrucks];
    const label = type === 'drivers' ? 'driver(s)' : 'truck(s)';
    showConfirmDialog({
      title: `Remove ${items.length} ${label}`,
      message: `Are you sure you want to remove <strong>${items.length} ${label}</strong>? This action cannot be undone.`,
      confirmLabel: `Remove ${items.length} ${label}`,
      danger: true,
      onConfirm: () => {
        if (type === 'drivers') {
          items.forEach(id => store.removeDriver(id));
          selectedDrivers.clear();
        } else {
          items.forEach(id => store.removeTruck(id));
          selectedTrucks.clear();
        }
        removeBulkBar(content);
        // Re-render the tab
        const tabContent = content.querySelector('#fleet-tab-content');
        if (type === 'drivers') renderDriversTab(tabContent, content, []);
        else renderTrucksTab(tabContent, content, []);
      }
    });
  });
}

function removeBulkBar(content) {
  const mount = content.querySelector('#bulk-bar-mount');
  if (mount) mount.innerHTML = '';
}

// ============================================
// DRIVERS TAB
// ============================================
function renderDriversTab(container, fleetContent, cleanups) {
  const drivers = store.getState().drivers;
  const trucks = store.getState().trucks;
  const deliveries = store.getState().deliveries;

  container.innerHTML = `
    <div class="management-header">
      <div style="display: flex; gap: 8px; align-items: center;">
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
      <div class="management-header-actions">
        <button class="btn btn-outline btn-sm" id="export-drivers-btn">⬇ Export</button>
        <button class="btn btn-primary" id="add-driver-btn">+ Add Driver</button>
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
    attachDriverCardHandlers(container, fleetContent);
  };

  filterSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  container.querySelector('#add-driver-btn')?.addEventListener('click', () => {
    showAddDriverModal(() => applyFilters());
  });

  container.querySelector('#export-drivers-btn')?.addEventListener('click', () => {
    exportDriversCSV();
    store.addNotification({ type: 'success', title: 'Export Complete', message: 'Drivers CSV downloaded.' });
  });

  attachDriverCardHandlers(container, fleetContent);
}

function attachDriverCardHandlers(container, fleetContent) {
  container.querySelectorAll('.driver-card').forEach(card => {
    const driverId = card.dataset.driverId;

    // Checkbox
    card.querySelector('.checkbox-card-check')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const cb = e.currentTarget;
      if (selectedDrivers.has(driverId)) {
        selectedDrivers.delete(driverId);
        cb.classList.remove('checked');
      } else {
        selectedDrivers.add(driverId);
        cb.classList.add('checked');
      }
      renderBulkBar(fleetContent, 'drivers');
    });

    // Navigate to driver details
    card.addEventListener('click', (e) => {
      if (e.target.closest('.action-menu') || e.target.closest('.call-btn') || e.target.closest('.checkbox-card-check')) return;
      router.navigate('/supervisor/driver/' + driverId);
    });

    card.querySelector('.call-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const driver = store.getDriver(driverId);
      if (driver) showCallDialog(driver);
    });

    // Action menu toggle
    card.querySelector('.action-menu-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = card.querySelector('.action-menu-dropdown');
      document.querySelectorAll('.action-menu-dropdown.open').forEach(m => {
        if (m !== dropdown) m.classList.remove('open');
      });
      dropdown?.classList.toggle('open');
    });

    card.querySelector('.action-edit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.querySelector('.action-menu-dropdown')?.classList.remove('open');
      const driver = store.getDriver(driverId);
      if (driver) showEditDriverModal(driver, () => {
        const tabContent = container.closest('#fleet-tab-content') || container;
        renderDriversTab(tabContent, fleetContent, []);
      });
    });

    card.querySelector('.action-remove')?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.querySelector('.action-menu-dropdown')?.classList.remove('open');
      const driver = store.getDriver(driverId);
      if (driver) {
        showConfirmDialog({
          title: 'Remove Driver',
          message: `Are you sure you want to remove <strong>${driver.name}</strong> from the fleet? Any active deliveries will be unassigned.`,
          confirmLabel: 'Remove Driver',
          danger: true,
          onConfirm: () => {
            store.removeDriver(driverId);
            const tabContent = container.closest('#fleet-tab-content') || container;
            renderDriversTab(tabContent, fleetContent, []);
          }
        });
      }
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
    const isChecked = selectedDrivers.has(driver.id);

    return `
      <div class="card card-hover driver-card" style="cursor: pointer; position: relative;" data-driver-id="${driver.id}">
        <div class="checkbox-card-check ${isChecked ? 'checked' : ''}" data-tooltip="Select"></div>
        <div class="driver-card-header" style="padding-left: 24px;">
          <div class="avatar avatar-lg" style="background: ${driver.avatarColor};">
            ${driver.initials}
            <span class="avatar-status ${driver.status === 'driving' ? 'online' : driver.status === 'idle' ? 'offline' : 'away'}"></span>
          </div>
          <div class="driver-card-info">
            <div class="driver-card-name">${driver.name}</div>
            <div class="driver-card-truck">${truck?.model || 'No truck assigned'} ${truck ? '· ' + truck.plate : ''}</div>
            <span class="badge badge-dot badge-${statusInfo.color}" style="margin-top: 4px;">${statusInfo.label}</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            <div class="action-menu">
              <button class="action-menu-btn" data-tooltip="Actions">⋮</button>
              <div class="action-menu-dropdown">
                <div class="action-menu-item action-edit">✏️ Edit Driver</div>
                <div class="action-menu-divider"></div>
                <div class="action-menu-item danger action-remove">🗑️ Remove</div>
              </div>
            </div>
            <button class="btn btn-ghost btn-icon btn-sm call-btn" data-tooltip="Call">📞</button>
          </div>
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
  }).join('') || '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">No drivers found</div><div class="empty-state-text">Add your first driver to get started.</div></div>';
}

// ============================================
// ADD/EDIT DRIVER MODALS
// ============================================
function showAddDriverModal(onDone) {
  const trucks = store.getState().trucks;
  const assignedTruckIds = new Set(store.getState().drivers.map(d => d.truckId).filter(Boolean));
  const availableTrucks = trucks.filter(t => !assignedTruckIds.has(t.id));

  showFormModal({
    title: 'Add New Driver',
    submitLabel: 'Add Driver',
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Ahmad bin Ali', half: true },
      { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'driver@tds.com', half: true },
      { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+60 12-345 6789', half: true },
      { key: 'license', label: 'License Number', type: 'text', placeholder: 'GDL XXXXXXX', half: true },
      { key: 'experience', label: 'Years of Experience', type: 'number', min: 0, max: 50, placeholder: '0', half: true },
      { key: 'truckId', label: 'Assign Truck', type: 'select', half: true,
        options: availableTrucks.map(t => ({ value: t.id, label: `${t.model} (${t.plate})` })),
        info: availableTrucks.length === 0 ? 'No unassigned trucks available' : `${availableTrucks.length} truck(s) available`
      },
      { key: 'avatarColor', label: 'Avatar Color', type: 'color' }
    ],
    onSubmit: (data) => {
      if (!data.name || !data.email) return false;
      store.addDriver(data);
      if (onDone) onDone();
    }
  });
}

function showEditDriverModal(driver, onDone) {
  const trucks = store.getState().trucks;
  const assignedTruckIds = new Set(
    store.getState().drivers.filter(d => d.id !== driver.id).map(d => d.truckId).filter(Boolean)
  );
  const availableTrucks = trucks.filter(t => !assignedTruckIds.has(t.id));

  showFormModal({
    title: 'Edit Driver',
    submitLabel: 'Save Changes',
    initialData: {
      name: driver.name, email: driver.email, phone: driver.phone,
      license: driver.license, experience: driver.experience,
      truckId: driver.truckId || '', avatarColor: driver.avatarColor
    },
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', required: true, half: true },
      { key: 'email', label: 'Email Address', type: 'email', required: true, half: true },
      { key: 'phone', label: 'Phone Number', type: 'tel', half: true },
      { key: 'license', label: 'License Number', type: 'text', half: true },
      { key: 'experience', label: 'Years of Experience', type: 'number', min: 0, max: 50, half: true },
      { key: 'truckId', label: 'Assign Truck', type: 'select', half: true,
        options: availableTrucks.map(t => ({ value: t.id, label: `${t.model} (${t.plate})` }))
      },
      { key: 'avatarColor', label: 'Avatar Color', type: 'color' }
    ],
    onSubmit: (data) => {
      if (!data.name || !data.email) return false;
      store.updateDriver(driver.id, data);
      if (onDone) onDone();
    }
  });
}

// Make these available for driver-details page
export { showEditDriverModal, showAddDriverModal };

// ============================================
// TRUCKS TAB
// ============================================
function renderTrucksTab(container, fleetContent, cleanups) {
  const trucks = store.getState().trucks;
  const drivers = store.getState().drivers;

  container.innerHTML = `
    <div class="management-header">
      <div style="display: flex; gap: 8px; align-items: center;">
        <div class="input-icon-wrapper">
          <span class="input-icon">🔍</span>
          <input type="text" class="input" id="search-trucks" placeholder="Search trucks..." style="width: 200px;" />
        </div>
      </div>
      <div class="management-header-actions">
        <button class="btn btn-outline btn-sm" id="export-trucks-btn">⬇ Export</button>
        <button class="btn btn-primary" id="add-truck-btn">+ Add Truck</button>
      </div>
    </div>

    <div class="card" style="padding: 0;">
      <div class="table-container" style="border: none;">
        <table class="table" id="trucks-table">
          <thead>
            <tr>
              <th style="width: 32px;"><div class="checkbox-card-check" id="select-all-trucks" data-tooltip="Select All" style="position: static;"></div></th>
              <th>Truck</th>
              <th>Plate</th>
              <th>Year</th>
              <th>Capacity</th>
              <th>Fuel</th>
              <th>Health</th>
              <th>Assigned To</th>
              <th style="width: 60px;"></th>
            </tr>
          </thead>
          <tbody id="trucks-tbody">
            ${renderTruckRows(trucks, drivers)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#search-trucks');

  const applyFilters = () => {
    const search = searchInput.value.toLowerCase();
    let filtered = store.getState().trucks;
    if (search) {
      filtered = filtered.filter(t =>
        t.model.toLowerCase().includes(search) ||
        t.plate.toLowerCase().includes(search) ||
        t.id.toLowerCase().includes(search)
      );
    }
    container.querySelector('#trucks-tbody').innerHTML = renderTruckRows(filtered, store.getState().drivers);
    attachTruckRowHandlers(container, fleetContent);
  };

  searchInput?.addEventListener('input', applyFilters);

  container.querySelector('#add-truck-btn')?.addEventListener('click', () => {
    showAddTruckModal(() => applyFilters());
  });

  container.querySelector('#export-trucks-btn')?.addEventListener('click', () => {
    exportFleetCSV();
    store.addNotification({ type: 'success', title: 'Export Complete', message: 'Fleet CSV downloaded.' });
  });

  // Select all checkbox
  container.querySelector('#select-all-trucks')?.addEventListener('click', (e) => {
    const cb = e.currentTarget;
    const allTruckIds = store.getState().trucks.map(t => t.id);
    if (selectedTrucks.size === allTruckIds.length) {
      selectedTrucks.clear();
      cb.classList.remove('checked');
      container.querySelectorAll('.truck-row-check').forEach(c => c.classList.remove('checked'));
    } else {
      allTruckIds.forEach(id => selectedTrucks.add(id));
      cb.classList.add('checked');
      container.querySelectorAll('.truck-row-check').forEach(c => c.classList.add('checked'));
    }
    renderBulkBar(fleetContent, 'trucks');
  });

  attachTruckRowHandlers(container, fleetContent);
}

function attachTruckRowHandlers(container, fleetContent) {
  container.querySelectorAll('.truck-row').forEach(row => {
    const truckId = row.dataset.truckId;

    // Checkbox
    row.querySelector('.truck-row-check')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const cb = e.currentTarget;
      if (selectedTrucks.has(truckId)) {
        selectedTrucks.delete(truckId);
        cb.classList.remove('checked');
      } else {
        selectedTrucks.add(truckId);
        cb.classList.add('checked');
      }
      renderBulkBar(fleetContent, 'trucks');
    });

    row.querySelector('.action-menu-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = row.querySelector('.action-menu-dropdown');
      document.querySelectorAll('.action-menu-dropdown.open').forEach(m => {
        if (m !== dropdown) m.classList.remove('open');
      });
      dropdown?.classList.toggle('open');
    });

    row.querySelector('.action-edit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      row.querySelector('.action-menu-dropdown')?.classList.remove('open');
      const truck = store.getTruck(truckId);
      if (truck) showEditTruckModal(truck, () => {
        const tabContent = container.closest('#fleet-tab-content') || container;
        renderTrucksTab(tabContent, fleetContent, []);
      });
    });

    row.querySelector('.action-remove')?.addEventListener('click', (e) => {
      e.stopPropagation();
      row.querySelector('.action-menu-dropdown')?.classList.remove('open');
      const truck = store.getTruck(truckId);
      if (truck) {
        const assignedDriver = store.getState().drivers.find(d => d.truckId === truckId);
        showConfirmDialog({
          title: 'Remove Truck',
          message: `Are you sure you want to remove <strong>${truck.model}</strong> (${truck.plate})?${assignedDriver ? ` This will unassign <strong>${assignedDriver.name}</strong>.` : ''}`,
          confirmLabel: 'Remove Truck',
          danger: true,
          onConfirm: () => {
            store.removeTruck(truckId);
            const tabContent = container.closest('#fleet-tab-content') || container;
            renderTrucksTab(tabContent, fleetContent, []);
          }
        });
      }
    });
  });
}

function renderTruckRows(trucks, drivers) {
  return trucks.map(truck => {
    const fuelPct = Math.round((truck.currentFuel / truck.fuelTank) * 100);
    const assignedDriver = drivers.find(d => d.truckId === truck.id);
    const avgHealth = Math.round(
      ((truck.health?.tires || 0) + (truck.health?.oil || 0) +
       (truck.health?.brakes || 0) + (truck.health?.engine || 0)) / 4
    );
    const isChecked = selectedTrucks.has(truck.id);

    return `
      <tr class="truck-row" data-truck-id="${truck.id}">
        <td><div class="checkbox-card-check truck-row-check ${isChecked ? 'checked' : ''}" style="position: static;"></div></td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-lg); background: var(--color-primary-glow); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">🚛</div>
            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--color-text-primary);">${truck.model}</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted);">${truck.id}</div>
            </div>
          </div>
        </td>
        <td><span class="text-mono" style="font-size: 12px;">${truck.plate}</span></td>
        <td><span style="font-size: 13px;">${truck.year}</span></td>
        <td><span class="text-mono" style="font-size: 12px;">${(truck.capacity / 1000).toFixed(0)}t</span></td>
        <td>
          <div class="fuel-gauge" style="min-width: 100px;">
            <div class="fuel-gauge-bar">
              <div class="fuel-gauge-fill" style="width: ${fuelPct}%; background: ${getFuelColor(fuelPct)};"></div>
            </div>
            <span class="fuel-gauge-label">${fuelPct}%</span>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 60px;">
              <div class="health-bar-track">
                <div class="health-bar-fill" style="width: ${avgHealth}%; background: ${getTruckHealthColor(avgHealth)};"></div>
              </div>
            </div>
            <span class="text-mono" style="font-size: 11px; color: ${getTruckHealthColor(avgHealth)};">${avgHealth}%</span>
          </div>
        </td>
        <td>
          ${assignedDriver ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="avatar avatar-sm" style="background: ${assignedDriver.avatarColor}; font-size: 10px; width: 24px; height: 24px;">${assignedDriver.initials}</div>
              <span style="font-size: 13px;">${assignedDriver.name}</span>
            </div>
          ` : '<span style="font-size: 12px; color: var(--color-text-muted);">Unassigned</span>'}
        </td>
        <td>
          <div class="action-menu">
            <button class="action-menu-btn">⋮</button>
            <div class="action-menu-dropdown">
              <div class="action-menu-item action-edit">✏️ Edit Truck</div>
              <div class="action-menu-divider"></div>
              <div class="action-menu-item danger action-remove">🗑️ Remove</div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="9"><div class="empty-state" style="padding: 32px;"><div class="empty-state-icon">🚛</div><div class="empty-state-title">No trucks found</div><div class="empty-state-text">Add your first truck to get started.</div></div></td></tr>';
}

// ============================================
// ADD/EDIT TRUCK MODALS
// ============================================
function showAddTruckModal(onDone) {
  showFormModal({
    title: 'Add New Truck',
    submitLabel: 'Add Truck',
    fields: [
      { key: 'model', label: 'Truck Model', type: 'text', required: true, placeholder: 'e.g. Volvo FH16', half: true },
      { key: 'plate', label: 'License Plate', type: 'text', required: true, placeholder: 'e.g. TX-1234-AB', half: true },
      { key: 'year', label: 'Year', type: 'number', min: 2000, max: 2030, value: new Date().getFullYear(), half: true },
      { key: 'mileage', label: 'Mileage (km/L)', type: 'number', min: 0.1, max: 20, step: 0.1, value: 3.0, half: true },
      { key: 'capacity', label: 'Capacity (kg)', type: 'number', min: 1000, max: 100000, value: 20000, half: true },
      { key: 'weight', label: 'Empty Weight (kg)', type: 'number', min: 1000, max: 50000, value: 8000, half: true },
      { key: 'fuelTank', label: 'Fuel Tank (L)', type: 'number', min: 50, max: 2000, value: 400, half: true },
    ],
    onSubmit: (data) => {
      if (!data.model || !data.plate) return false;
      store.addTruck(data);
      if (onDone) onDone();
    }
  });
}

function showEditTruckModal(truck, onDone) {
  showFormModal({
    title: 'Edit Truck',
    submitLabel: 'Save Changes',
    initialData: {
      model: truck.model, plate: truck.plate, year: truck.year,
      mileage: truck.mileage, capacity: truck.capacity, weight: truck.weight,
      fuelTank: truck.fuelTank,
      healthTires: truck.health?.tires || 95, healthOil: truck.health?.oil || 95,
      healthBrakes: truck.health?.brakes || 95, healthEngine: truck.health?.engine || 95
    },
    fields: [
      { key: 'model', label: 'Truck Model', type: 'text', required: true, half: true },
      { key: 'plate', label: 'License Plate', type: 'text', required: true, half: true },
      { key: 'year', label: 'Year', type: 'number', min: 2000, max: 2030, half: true },
      { key: 'mileage', label: 'Mileage (km/L)', type: 'number', min: 0.1, max: 20, step: 0.1, half: true },
      { key: 'capacity', label: 'Capacity (kg)', type: 'number', min: 1000, max: 100000, half: true },
      { key: 'weight', label: 'Empty Weight (kg)', type: 'number', min: 1000, max: 50000, half: true },
      { key: 'fuelTank', label: 'Fuel Tank (L)', type: 'number', min: 50, max: 2000, half: true },
      { key: 'healthTires', label: 'Tire Health (%)', type: 'number', min: 0, max: 100, half: true },
      { key: 'healthOil', label: 'Oil Health (%)', type: 'number', min: 0, max: 100, half: true },
      { key: 'healthBrakes', label: 'Brake Health (%)', type: 'number', min: 0, max: 100, half: true },
      { key: 'healthEngine', label: 'Engine Health (%)', type: 'number', min: 0, max: 100, half: true },
    ],
    onSubmit: (data) => {
      if (!data.model || !data.plate) return false;
      store.updateTruck(truck.id, data);
      if (onDone) onDone();
    }
  });
}

// ============================================
// DELIVERIES TAB (with Create + Cancel)
// ============================================
function renderDeliveriesTab(container, cleanups) {
  const deliveries = store.getState().deliveries;
  const drivers = store.getState().drivers;

  container.innerHTML = `
    <div class="management-header">
      <div style="display: flex; gap: 8px; align-items: center;">
        <select class="select" id="filter-del-status" style="width: auto;">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select class="select" id="filter-priority" style="width: auto;">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
        </select>
      </div>
      <div class="management-header-actions">
        <button class="btn btn-outline btn-sm" id="export-del-btn">⬇ Export</button>
        <button class="btn btn-primary" id="add-delivery-btn">+ Create Delivery</button>
      </div>
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
              <th>Progress</th>
              <th style="width: 60px;"></th>
            </tr>
          </thead>
          <tbody id="deliveries-tbody">
            ${renderDeliveryRows(deliveries, drivers, 'all', 'all')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  let currentStatus = 'all';
  let currentPriority = 'all';

  const updateTable = () => {
    const tbody = container.querySelector('#deliveries-tbody');
    if (tbody) {
      tbody.innerHTML = renderDeliveryRows(store.getState().deliveries, store.getState().drivers, currentStatus, currentPriority);
      attachDeliveryRowHandlers(container);
    }
  };

  container.querySelector('#filter-del-status')?.addEventListener('change', (e) => {
    currentStatus = e.target.value;
    updateTable();
  });

  container.querySelector('#filter-priority')?.addEventListener('change', (e) => {
    currentPriority = e.target.value;
    updateTable();
  });

  container.querySelector('#add-delivery-btn')?.addEventListener('click', () => {
    showAddDeliveryModal(() => updateTable());
  });

  container.querySelector('#export-del-btn')?.addEventListener('click', () => {
    exportDeliveriesCSV();
    store.addNotification({ type: 'success', title: 'Export Complete', message: 'Deliveries CSV downloaded.' });
  });

  attachDeliveryRowHandlers(container);

  const interval = setInterval(updateTable, 5000);
  cleanups.push(() => clearInterval(interval));
}

function attachDeliveryRowHandlers(container) {
  container.querySelectorAll('.delivery-row').forEach(row => {
    const delId = row.dataset.deliveryId;

    row.querySelector('.action-menu-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = row.querySelector('.action-menu-dropdown');
      document.querySelectorAll('.action-menu-dropdown.open').forEach(m => {
        if (m !== dropdown) m.classList.remove('open');
      });
      dropdown?.classList.toggle('open');
    });

    row.querySelector('.action-cancel')?.addEventListener('click', (e) => {
      e.stopPropagation();
      row.querySelector('.action-menu-dropdown')?.classList.remove('open');
      showConfirmDialog({
        title: 'Cancel Delivery',
        message: `Are you sure you want to cancel delivery <strong>${delId}</strong>? The assigned driver will be unlinked.`,
        confirmLabel: 'Cancel Delivery',
        danger: true,
        onConfirm: () => {
          store.cancelDelivery(delId);
          container.querySelector('#deliveries-tbody').innerHTML = renderDeliveryRows(
            store.getState().deliveries, store.getState().drivers, 'all', 'all'
          );
          attachDeliveryRowHandlers(container);
        }
      });
    });
  });
}

function renderDeliveryRows(deliveries, drivers, statusFilter, priority) {
  let filtered = [...deliveries];

  if (statusFilter === 'active') filtered = filtered.filter(d => ['in-progress', 'delayed', 'loading'].includes(d.status));
  else if (statusFilter !== 'all') filtered = filtered.filter(d => d.status === statusFilter);
  if (priority !== 'all') filtered = filtered.filter(d => d.priority === priority);

  // Sort: active first
  filtered.sort((a, b) => {
    const order = { 'delayed': 0, 'in-progress': 1, 'loading': 2, 'scheduled': 3, 'completed': 4, 'cancelled': 5 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  return filtered.map(del => {
    const driver = drivers.find(d => d.id === del.driverId);
    const statusInfo = getStatusInfo(del.status);
    const priorityInfo = getPriorityInfo(del.priority);
    const isOnTime = del.actualTime ? del.actualTime <= del.estimatedTime * 1.1 : true;
    const canCancel = !['completed', 'cancelled'].includes(del.status);

    return `
      <tr class="delivery-row" data-delivery-id="${del.id}" style="${del.status === 'delayed' ? 'border-left: 3px solid var(--color-danger);' : del.status === 'cancelled' ? 'opacity: 0.5;' : ''}">
        <td>
          <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary-light);">${del.id}</div>
          <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;" class="truncate" title="${del.package.description}">
            ${del.package.description}
          </div>
        </td>
        <td>
          ${driver ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="avatar avatar-sm" style="background: ${driver.avatarColor}; font-size: 10px; width: 24px; height: 24px;">${driver.initials}</div>
              <span style="font-size: 13px;">${driver.name}</span>
            </div>
          ` : '<span style="font-size: 12px; color: var(--color-text-muted);">Unassigned</span>'}
        </td>
        <td>
          <div style="font-size: 12px;">
            <div style="color: var(--color-text-muted);">${del.origin.name}</div>
            <div style="color: var(--color-text-primary); font-weight: 500;">→ ${del.destination.name}</div>
          </div>
        </td>
        <td><span class="badge badge-${priorityInfo.color}">${priorityInfo.icon} ${priorityInfo.label}</span></td>
        <td><span class="badge badge-dot badge-${statusInfo.color}">${statusInfo.label}</span></td>
        <td><span class="text-mono" style="font-size: 12px;">${formatHours(del.estimatedTime)}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px; min-width: 100px;">
            <div class="progress-bar" style="flex: 1; height: 4px;">
              <div class="progress-bar-fill ${del.status === 'delayed' ? 'progress-bar-danger' : ''}" style="width: ${del.progress}%;"></div>
            </div>
            <span class="text-mono" style="font-size: 10px; color: var(--color-text-muted);">${Math.round(del.progress)}%</span>
          </div>
        </td>
        <td>
          ${canCancel ? `
            <div class="action-menu">
              <button class="action-menu-btn">⋮</button>
              <div class="action-menu-dropdown">
                <div class="action-menu-item danger action-cancel">❌ Cancel</div>
              </div>
            </div>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="8"><div class="empty-state" style="padding: 32px;"><div class="empty-state-title">No deliveries found</div></div></td></tr>';
}

// ============================================
// ADD DELIVERY MODAL
// ============================================
function showAddDeliveryModal(onDone) {
  const drivers = store.getState().drivers;
  const availableDrivers = drivers.filter(d => d.status === 'idle');

  showFormModal({
    title: 'Create New Delivery',
    submitLabel: 'Create Delivery',
    fields: [
      { key: 'originName', label: 'Origin', type: 'text', required: true, placeholder: 'e.g. KL Distribution Center', half: true },
      { key: 'destName', label: 'Destination', type: 'text', required: true, placeholder: 'e.g. Penang Warehouse', half: true },
      { key: 'packageDesc', label: 'Package Description', type: 'text', required: true, placeholder: 'e.g. Electronics - Server Equipment' },
      { key: 'packageWeight', label: 'Weight (kg)', type: 'number', min: 1, value: 1000, half: true },
      { key: 'packageUnits', label: 'Units', type: 'number', min: 1, value: 1, half: true },
      { key: 'estimatedTime', label: 'Est. Time (hours)', type: 'number', min: 0.5, max: 48, step: 0.5, value: 4, half: true },
      { key: 'estimatedDistance', label: 'Est. Distance (km)', type: 'number', min: 1, value: 200, half: true },
      { key: 'priority', label: 'Priority', type: 'select', half: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'High' },
          { value: 'critical', label: 'Critical' }
        ]
      },
      { key: 'weather', label: 'Weather', type: 'select', half: true,
        options: [
          { value: 'clear', label: '☀️ Clear' },
          { value: 'partly-cloudy', label: '⛅ Partly Cloudy' },
          { value: 'rain', label: '🌧️ Rain' },
          { value: 'storm', label: '⛈️ Storm' }
        ]
      },
      { key: 'driverId', label: 'Assign Driver', type: 'select',
        options: availableDrivers.map(d => ({ value: d.id, label: `${d.name} (${d.status})` })),
        info: availableDrivers.length === 0 ? 'No idle drivers — delivery will be unassigned' : `${availableDrivers.length} driver(s) available`
      },
      { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Special instructions...' }
    ],
    onSubmit: (data) => {
      if (!data.originName || !data.destName || !data.packageDesc) return false;
      store.addDelivery(data);
      if (onDone) onDone();
    }
  });
}

// ============================================
// ACTIVITY TAB
// ============================================
function renderActivityTab(container) {
  container.innerHTML = `
    <div class="management-header">
      <div style="display: flex; gap: 8px; align-items: center;">
        <select class="select" id="filter-activity" style="width: auto;">
          <option value="all">All Activity</option>
          <option value="driver">Drivers</option>
          <option value="truck">Trucks</option>
          <option value="delivery">Deliveries</option>
        </select>
      </div>
      <div class="management-header-actions">
        <span style="font-size: 12px; color: var(--color-text-muted);">${store.getActivityLog().length} events logged</span>
      </div>
    </div>
    <div class="card" style="max-height: 600px; overflow-y: auto;">
      <div id="activity-log-container"></div>
    </div>
  `;

  const logContainer = container.querySelector('#activity-log-container');
  renderActivityLog(logContainer, 'all');

  container.querySelector('#filter-activity')?.addEventListener('change', (e) => {
    renderActivityLog(logContainer, e.target.value);
  });
}
