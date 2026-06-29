// ============================================
// TDS Data Export Utility
// ============================================
import { store } from '../store.js';
import { formatDate, formatTime, formatHours } from './helpers.js';

/**
 * Export deliveries data as CSV.
 * @param {string} filter - 'all' | 'active' | 'completed' | 'scheduled'
 */
export function exportDeliveriesCSV(filter = 'all') {
  const deliveries = store.getState().deliveries;
  const drivers = store.getState().drivers;
  const trucks = store.getState().trucks;

  let filtered = [...deliveries];
  if (filter === 'active') filtered = filtered.filter(d => ['in-progress', 'delayed', 'loading'].includes(d.status));
  else if (filter === 'completed') filtered = filtered.filter(d => d.status === 'completed');
  else if (filter === 'scheduled') filtered = filtered.filter(d => d.status === 'scheduled');

  const headers = ['Delivery ID', 'Status', 'Priority', 'Driver', 'Truck', 'Origin', 'Destination', 'Distance (km)', 'Est. Time (h)', 'Actual Time (h)', 'Progress (%)', 'Departure', 'ETA', 'Completed', 'Package', 'Weight (kg)', 'Units', 'Weather', 'Receipt Scanned'];

  const rows = filtered.map(del => {
    const driver = drivers.find(d => d.id === del.driverId);
    const truck = trucks.find(t => t.id === del.truckId);
    return [
      del.id,
      del.status,
      del.priority,
      driver?.name || 'Unknown',
      truck?.model || 'Unknown',
      del.origin.name,
      del.destination.name,
      del.estimatedDistance,
      del.estimatedTime,
      del.actualTime || '',
      Math.round(del.progress),
      del.departureTime ? `${formatDate(del.departureTime)} ${formatTime(del.departureTime)}` : '',
      del.eta ? `${formatDate(del.eta)} ${formatTime(del.eta)}` : '',
      del.completedTime ? `${formatDate(del.completedTime)} ${formatTime(del.completedTime)}` : '',
      del.package.description,
      del.package.weight,
      del.package.units,
      del.weather,
      del.receiptScanned ? 'Yes' : 'No'
    ];
  });

  downloadCSV(headers, rows, `tds-deliveries-${filter}-${formatDate(new Date().toISOString())}.csv`);
}

/**
 * Export drivers data as CSV.
 */
export function exportDriversCSV() {
  const drivers = store.getState().drivers;
  const trucks = store.getState().trucks;

  const headers = ['Driver ID', 'Name', 'Email', 'Phone', 'License', 'Experience (yrs)', 'Rating', 'Status', 'Truck', 'Total Deliveries', 'On-Time Rate (%)', 'Rest Compliance (%)', 'Performance Score', 'Driving Time (h)'];

  const rows = drivers.map(d => {
    const truck = trucks.find(t => t.id === d.truckId);
    return [
      d.id, d.name, d.email, d.phone, d.license, d.experience, d.rating, d.status,
      truck ? `${truck.model} (${truck.plate})` : '',
      d.totalDeliveries, d.onTimeRate, d.restCompliance, d.performanceScore,
      d.drivingTime.toFixed(1)
    ];
  });

  downloadCSV(headers, rows, `tds-drivers-${formatDate(new Date().toISOString())}.csv`);
}

/**
 * Export fleet/trucks data as CSV.
 */
export function exportFleetCSV() {
  const trucks = store.getState().trucks;
  const drivers = store.getState().drivers;

  const headers = ['Truck ID', 'Model', 'Plate', 'Year', 'Capacity (kg)', 'Weight (kg)', 'Fuel Tank (L)', 'Current Fuel (L)', 'Fuel %', 'Mileage (km/L)', 'Assigned Driver', 'Tires Health', 'Oil Health', 'Brakes Health', 'Engine Health'];

  const rows = trucks.map(t => {
    const driver = drivers.find(d => d.truckId === t.id);
    const fuelPct = Math.round((t.currentFuel / t.fuelTank) * 100);
    return [
      t.id, t.model, t.plate, t.year, t.capacity, t.weight,
      t.fuelTank, Math.round(t.currentFuel), fuelPct, t.mileage,
      driver?.name || 'Unassigned',
      t.health.tires, t.health.oil, t.health.brakes, t.health.engine
    ];
  });

  downloadCSV(headers, rows, `tds-fleet-${formatDate(new Date().toISOString())}.csv`);
}

/**
 * Export analytics summary as CSV.
 */
export function exportAnalyticsCSV() {
  const stats = store.getStats();
  const drivers = store.getState().drivers;

  const headers = ['Metric', 'Value'];
  const rows = [
    ['Active Drivers', stats.activeDrivers],
    ['Total Drivers', stats.totalDrivers],
    ['Active Deliveries', stats.activeDeliveries],
    ['Completed Today', stats.completedToday],
    ['On-Time Rate', stats.onTimeRate + '%'],
    ['Delayed Count', stats.delayedCount],
    ['Urgent Alerts', stats.urgentAlerts],
    ['Avg Fleet Fuel Level', stats.avgFuelLevel + '%'],
    ['Avg Driver Score', Math.round(drivers.reduce((s, d) => s + d.performanceScore, 0) / drivers.length)],
    ['---', '---'],
    ['Driver Performance Breakdown', ''],
    ...drivers.map(d => [`  ${d.name}`, `Score: ${d.performanceScore} | On-Time: ${d.onTimeRate}% | Deliveries: ${d.totalDeliveries}`])
  ];

  downloadCSV(headers, rows, `tds-analytics-${formatDate(new Date().toISOString())}.csv`);
}

function downloadCSV(headers, rows, filename) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
