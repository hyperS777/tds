// ============================================
// TDS Supervisor - Analytics Page
// ============================================
import { store } from '../../store.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import {
  createPerformanceChart, createOnTimeChart,
  createFuelChart, createDistanceChart, createRestComplianceChart
} from '../../components/charts.js';

export function renderSupervisorAnalytics(container) {
  const cleanups = [];

  container.innerHTML = '<div class="dashboard-layout"><div id="sidebar-mount"></div><div class="main-content"><div id="navbar-mount"></div><div class="page-content" id="analytics-content"></div></div></div>';

  renderSidebar(container.querySelector('#sidebar-mount'));
  const navCleanup = renderNavbar(container.querySelector('#navbar-mount'), 'Analytics');
  if (navCleanup) cleanups.push(navCleanup);

  const content = container.querySelector('#analytics-content');
  renderContent(content, cleanups);

  return () => cleanups.forEach(fn => fn());
}

function renderContent(content) {
  const drivers = store.getState().drivers;
  const deliveries = store.getState().deliveries;
  const stats = store.getStats();

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Fleet Analytics</h2>
        <p class="page-subtitle">Performance insights and operational metrics</p>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid" style="margin-bottom: 32px;">
      <div class="card stat-card-container">
        <div class="stat-card">
          <div class="stat-value gradient-text">${deliveries.filter(d => d.status === 'completed').length}</div>
          <div class="stat-label">Total Completed</div>
        </div>
      </div>
      <div class="card stat-card-container">
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-success);">${stats.onTimeRate}%</div>
          <div class="stat-label">On-Time Rate</div>
        </div>
      </div>
      <div class="card stat-card-container">
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-warning);">${stats.avgFuelLevel}%</div>
          <div class="stat-label">Avg Fleet Fuel</div>
        </div>
      </div>
      <div class="card stat-card-container">
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-info-light);">${Math.round(drivers.reduce((s, d) => s + d.performanceScore, 0) / drivers.length)}</div>
          <div class="stat-label">Avg Driver Score</div>
        </div>
      </div>
    </div>

    <div class="analytics-grid">
      <!-- Performance Chart -->
      <div class="card analytics-chart-card">
        <div class="card-header">
          <h3 class="card-title">Delivery Performance</h3>
          <span class="badge badge-neutral">Last 7 Deliveries</span>
        </div>
        <div class="chart-container">
          <canvas id="performance-chart"></canvas>
        </div>
      </div>

      <!-- On-Time Rate -->
      <div class="card analytics-chart-card">
        <div class="card-header">
          <h3 class="card-title">On-Time Delivery Rate</h3>
          <span class="badge badge-success">Overall</span>
        </div>
        <div class="chart-container">
          <canvas id="ontime-chart"></canvas>
        </div>
      </div>

      <!-- Fuel Efficiency -->
      <div class="card analytics-chart-card">
        <div class="card-header">
          <h3 class="card-title">Fleet Fuel Levels</h3>
          <span class="badge badge-warning">This Week</span>
        </div>
        <div class="chart-container">
          <canvas id="fuel-chart"></canvas>
        </div>
      </div>

      <!-- Rest Compliance -->
      <div class="card analytics-chart-card">
        <div class="card-header">
          <h3 class="card-title">Rest Compliance by Driver</h3>
          <span class="badge badge-primary">Current</span>
        </div>
        <div class="chart-container">
          <canvas id="rest-chart"></canvas>
        </div>
      </div>

      <!-- Distance Covered -->
      <div class="card analytics-chart-card analytics-full-width">
        <div class="card-header">
          <h3 class="card-title">Distance Covered (Weekly)</h3>
          <span class="badge badge-info">Last 8 Weeks</span>
        </div>
        <div class="chart-container">
          <canvas id="distance-chart"></canvas>
        </div>
      </div>
    </div>
  `;

  // Initialize charts after DOM is ready
  setTimeout(() => {
    // Performance data from completed deliveries
    const completedDels = deliveries.filter(d => d.status === 'completed').slice(0, 7);
    const perfData = completedDels.map(d => {
      const driver = drivers.find(dr => dr.id === d.driverId);
      return { name: driver?.name || d.driverId, estimated: d.estimatedTime, actual: d.actualTime };
    });
    if (perfData.length > 0) createPerformanceChart('performance-chart', perfData);

    // On-time rate
    createOnTimeChart('ontime-chart', stats.onTimeRate);

    // Fuel data (simulated weekly data)
    createFuelChart('fuel-chart', {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [78, 72, 68, 75, 80, 65, stats.avgFuelLevel]
    });

    // Rest compliance per driver
    createRestComplianceChart('rest-chart', drivers.map(d => ({
      name: d.name,
      compliance: d.restCompliance
    })));

    // Distance data (simulated)
    createDistanceChart('distance-chart', {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      values: [4200, 3800, 5100, 4600, 4900, 5300, 4800, 5500]
    });
  }, 100);
}
